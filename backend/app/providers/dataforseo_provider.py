import hashlib
import asyncio
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List
from urllib.parse import urlparse

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def _number(value: Any):
    if isinstance(value, (int, float)):
        return float(value)
    if not value:
        return None
    match = re.search(r"[-+]?\d[\d,]*(?:\.\d+)?", str(value))
    if not match:
        return None
    return float(match.group(0).replace(',', ''))


def _direct_url(value: Any) -> str | None:
    if not value:
        return None
    parsed = urlparse(str(value).strip())
    if parsed.scheme not in {'http', 'https'} or not parsed.netloc:
        return None
    hostname = parsed.hostname.lower() if parsed.hostname else ''
    if hostname == 'google.com' or hostname.endswith('.google.com') or hostname.startswith('google.') or hostname.startswith('www.google.'):
        return None
    if not parsed.path or parsed.path == '/':
        return None
    return str(value).strip()


def _merchant_name(item: Dict[str, Any]) -> str:
    seller = item.get('seller')
    if isinstance(seller, dict):
        seller = seller.get('name') or seller.get('title') or seller.get('domain')
    return str(seller or item.get('merchant') or item.get('source') or item.get('domain') or 'Unknown store').strip()


def _seller_name(seller: Any) -> str | None:
    if isinstance(seller, dict):
        value = seller.get('name') or seller.get('title') or seller.get('domain')
    else:
        value = seller
    return str(value).strip() if value else None


def _stable_id(source: str, source_product_id: Any, link: str, title: str) -> str:
    identity = str(source_product_id or link or title).strip().lower()
    digest = hashlib.sha256(f"{source}:{identity}".encode('utf-8')).hexdigest()[:24]
    return f"external_{digest}"


class DataForSEOProvider:
    name = "DataForSEO Google Shopping"
    endpoint = "https://api.dataforseo.com/v3/merchant/google/products"

    @property
    def configured(self) -> bool:
        return bool(settings.DATAFORSEO_LOGIN and settings.DATAFORSEO_PASSWORD)

    def _auth(self) -> tuple[str, str]:
        return settings.DATAFORSEO_LOGIN, settings.DATAFORSEO_PASSWORD

    @staticmethod
    def _status_message(payload: Dict[str, Any]) -> str | None:
        return payload.get('status_message') or ((payload.get('tasks') or [{}])[0] or {}).get('status_message')

    async def search_products(self, query: str, page: int = 1) -> Dict[str, Any]:
        if not self.configured:
            raise RuntimeError('DataForSEO shopping provider is not configured.')

        task = {
            'language_code': settings.DATAFORSEO_LANGUAGE_CODE,
            'location_code': settings.DATAFORSEO_LOCATION_CODE,
            'keyword': query,
            'depth': min(settings.DATAFORSEO_PAGE_SIZE, 40),
        }
        try:
            async with httpx.AsyncClient(timeout=settings.DATAFORSEO_PROVIDER_TIMEOUT_SECONDS) as client:
                posted = await client.post(f'{self.endpoint}/task_post', auth=self._auth(), json=[task])
                logger.info('DataForSEO task_post HTTP status: %s', posted.status_code)
                posted.raise_for_status()
                posted_payload = posted.json()
                task_info = (posted_payload.get('tasks') or [None])[0] or {}
                if posted_payload.get('status_code') not in (None, 20000) or task_info.get('status_code') not in (None, 20000, 20100):
                    message = self._status_message(posted_payload) or 'DataForSEO task creation failed.'
                    logger.warning('DataForSEO task_post API status=%s message=%s', posted_payload.get('status_code'), message)
                    raise RuntimeError(message)
                task_id = task_info.get('id')
                if not task_id:
                    raise RuntimeError('DataForSEO did not return a task ID.')
                logger.info('DataForSEO task created: task_id=%s', task_id)

                payload = None
                poll_attempts = max(10, int(settings.DATAFORSEO_PROVIDER_TIMEOUT_SECONDS))
                for attempt in range(poll_attempts):
                    result_response = await client.get(f'{self.endpoint}/task_get/{task_id}', auth=self._auth())
                    logger.info('DataForSEO task_get HTTP status: %s task_id=%s attempt=%s', result_response.status_code, task_id, attempt + 1)
                    if result_response.status_code < 400:
                        candidate = result_response.json()
                        candidate_task = (candidate.get('tasks') or [None])[0] or {}
                        if candidate_task.get('status_code') not in (None, 20000):
                            message = self._status_message(candidate) or 'DataForSEO task failed.'
                            logger.warning('DataForSEO task_get API status=%s message=%s task_id=%s', candidate_task.get('status_code'), message, task_id)
                            raise RuntimeError(message)
                        if candidate_task.get('result') is not None:
                            payload = candidate
                            break
                    elif result_response.status_code == 404:
                        ready_response = await client.get(f'{self.endpoint}/tasks_ready', auth=self._auth())
                        if ready_response.status_code < 400:
                            ready_payload = ready_response.json()
                            ready_task = next(
                                (task for task in (ready_payload.get('tasks') or []) if task.get('id') == task_id),
                                None,
                            )
                            if ready_task and ready_task.get('result') is not None:
                                payload = {'tasks': [ready_task]}
                                break
                    elif result_response.status_code not in (408, 425):
                        result_response.raise_for_status()
                    if attempt < poll_attempts - 1:
                        await asyncio.sleep(1)
                if payload is None:
                    logger.warning('DataForSEO task status=timeout task_id=%s result_count=0', task_id)
                    raise RuntimeError('DataForSEO result was not ready within the provider timeout.')
        except httpx.HTTPStatusError as error:
            status = error.response.status_code
            try:
                detail = self._status_message(error.response.json())
            except ValueError:
                detail = None
            logger.warning(
                'DataForSEO HTTP status=%s message=%s task_status=not_created result_count=0',
                status,
                detail or 'request failed',
            )
            raise RuntimeError(detail or f'DataForSEO returned HTTP {status}.') from None
        except httpx.TimeoutException:
            raise RuntimeError('DataForSEO shopping provider timed out.') from None
        except httpx.RequestError:
            raise RuntimeError('DataForSEO shopping provider could not be reached.') from None

        task_result = (payload.get('tasks') or [None])[0] or {}
        if task_result.get('status_code') not in (None, 20000):
            raise RuntimeError(task_result.get('status_message') or 'DataForSEO returned an error.')
        result = (task_result.get('result') or [None])[0] or {}
        retrieved_at = datetime.now(timezone.utc).isoformat()
        products = [self.normalize_item(item, retrieved_at) for item in result.get('items', [])]
        products = [item for item in products if item.get('title') and item.get('price') is not None]
        logger.info('DataForSEO task status=completed task_id=%s result_count=%s', task_result.get('id'), len(products))
        return {
            'products': self.dedupe(products),
            'page': page,
            'has_more': False,
            'source': self.name,
            'retrieved_at': retrieved_at,
        }

    def normalize_item(self, item: Dict[str, Any], retrieved_at: str) -> Dict[str, Any]:
        title = str(item.get('title') or item.get('name') or '').strip()
        source = _merchant_name(item)
        seller = item.get('seller')
        seller_name = _seller_name(seller)
        seller_url = seller.get('url') or seller.get('link') if isinstance(seller, dict) else None
        link = _direct_url(
            item.get('product_url') or item.get('link') or seller_url
            or (item.get('url') if urlparse(str(item.get('url') or '')).netloc.lower() not in {'google.com', 'www.google.com'} else None)
        )
        source_product_id = item.get('product_id') or item.get('id') or item.get('sku')
        product_id = _stable_id(source, source_product_id, link or '', title)
        rating = item.get('rating')
        if isinstance(rating, dict):
            review_count = rating.get('votes') or rating.get('reviews')
            rating = rating.get('value') or rating.get('score')
        else:
            review_count = item.get('reviews') or item.get('review_count') or item.get('votes')
        return {
            'id': product_id,
            'provider': 'dataforseo',
            'source': source,
            'source_product_id': source_product_id,
            'product_identifier': item.get('gtin') or item.get('ean') or item.get('upc') or item.get('asin'),
            'title': title,
            'brand': item.get('brand'),
            'model': item.get('model') or item.get('model_number'),
            'category': item.get('category'),
            'description': item.get('description') or item.get('snippet'),
            'price': item.get('price') if isinstance(item.get('price'), (int, float)) else _number(item.get('price')),
            'original_price': item.get('old_price') if isinstance(item.get('old_price'), (int, float)) else _number(item.get('old_price')),
            'currency': item.get('currency') or settings.CURRENCY_CODE,
            'rating': _number(rating),
            'review_count': _number(review_count),
            'image': item.get('image_url') or item.get('image') or item.get('thumbnail') or item.get('thumbnail_url'),
            'additional_images': item.get('images') or [],
            'availability': item.get('availability') or item.get('delivery_info'),
            'seller': seller_name,
            'seller_details': seller,
            'shipping': item.get('shipping') or item.get('delivery_info'),
            'product_url': link,
            'direct_product_url_available': bool(link),
            'last_updated': retrieved_at,
        }

    @staticmethod
    def dedupe(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen = set()
        deduped = []
        for product in products:
            identity = product.get('source_product_id') or product.get('product_url') or '|'.join([
                str(product.get('source') or '').lower(),
                str(product.get('brand') or '').lower(),
                re.sub(r'\s+', ' ', str(product.get('title') or '').lower()).strip(),
            ])
            if identity in seen:
                continue
            seen.add(identity)
            deduped.append(product)
        return deduped


dataforseo_provider = DataForSEOProvider()
