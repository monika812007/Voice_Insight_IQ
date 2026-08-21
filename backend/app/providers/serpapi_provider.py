import hashlib
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


def _stable_id(source: str, source_product_id: Any, link: str, title: str) -> str:
    identity = str(source_product_id or link or title).strip().lower()
    digest = hashlib.sha256(f"{source}:{identity}".encode('utf-8')).hexdigest()[:24]
    return f"external_{digest}"


def _source_name(item: Dict[str, Any]) -> str:
    return str(item.get('source') or item.get('seller') or urlparse(item.get('link', '')).netloc or 'Unknown store').strip()


def _direct_url(value: Any) -> str | None:
    if not value:
        return None
    parsed = urlparse(str(value).strip())
    if parsed.scheme not in {'http', 'https'}:
        return None
    hostname = parsed.hostname.lower() if parsed.hostname else ''
    if hostname == 'google.com' or hostname.endswith('.google.com') or hostname.startswith('google.') or hostname.startswith('www.google.'):
        return None
    if not parsed.path or parsed.path == '/':
        return None
    return str(value).strip()


class SerpApiProvider:
    name = "SerpApi Google Shopping"

    @property
    def configured(self) -> bool:
        return bool(settings.SERPAPI_API_KEY or settings.SHOPPING_API_KEY)

    async def search_products(self, query: str, page: int = 1) -> Dict[str, Any]:
        if not self.configured:
            raise RuntimeError('External shopping provider is not configured.')

        params = {
            'engine': 'google_shopping',
            'q': query,
            'api_key': settings.SERPAPI_API_KEY or settings.SHOPPING_API_KEY,
            'location': settings.SHOPPING_LOCATION,
            'gl': settings.SHOPPING_COUNTRY,
            'hl': settings.SHOPPING_LANGUAGE,
            'start': max(0, (page - 1) * settings.SHOPPING_PAGE_SIZE),
            'num': settings.SHOPPING_PAGE_SIZE,
        }
        try:
            async with httpx.AsyncClient(timeout=settings.SHOPPING_PROVIDER_TIMEOUT_SECONDS) as client:
                response = await client.get('https://serpapi.com/search.json', params=params)
                response.raise_for_status()
                payload = response.json()
        except httpx.HTTPStatusError as error:
            raise RuntimeError(f'External shopping provider returned HTTP {error.response.status_code}.') from None
        except (httpx.TimeoutException, httpx.RequestError):
            raise RuntimeError('External shopping provider could not be reached.') from None

        if payload.get('error'):
            raise RuntimeError('External shopping provider returned an error.')

        retrieved_at = datetime.now(timezone.utc).isoformat()
        products = [self.normalize_item(item, retrieved_at) for item in payload.get('shopping_results', [])]
        products = [
            item for item in products
            if item.get('price') is not None
            and (item.get('product_url') or item.get('provider_product_token'))
            and item.get('image')
        ]
        products = self.dedupe(products)
        return {
            'products': products,
            'page': page,
            'has_more': bool(payload.get('serpapi_pagination', {}).get('next')),
            'source': self.name,
            'retrieved_at': retrieved_at,
        }

    async def suggestions(self, query: str) -> List[str]:
        if not self.configured:
            return []
        params = {
            'engine': 'google_autocomplete',
            'q': query,
            'api_key': settings.SERPAPI_API_KEY or settings.SHOPPING_API_KEY,
            'hl': settings.SHOPPING_LANGUAGE,
            'gl': settings.SHOPPING_COUNTRY,
        }
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get('https://serpapi.com/search.json', params=params)
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError):
            return []
        suggestions = payload.get('suggestions', [])
        return [str(item.get('value') or item.get('suggestion')).strip() for item in suggestions if isinstance(item, dict) and (item.get('value') or item.get('suggestion'))][:8]

    async def resolve_product_url(self, page_token: str, merchant: str) -> str | None:
        if not self.configured or not page_token or not merchant:
            return None
        params = {
            'engine': 'google_immersive_product',
            'page_token': page_token,
            'api_key': settings.SERPAPI_API_KEY or settings.SHOPPING_API_KEY,
        }
        try:
            async with httpx.AsyncClient(timeout=settings.SHOPPING_PROVIDER_TIMEOUT_SECONDS) as client:
                response = await client.get('https://serpapi.com/search.json', params=params)
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError):
            return None

        merchant_key = merchant.casefold().strip()
        stores = payload.get('product_results', {}).get('stores', [])
        for store in stores:
            store_name = str(store.get('name') or '').casefold().strip()
            if store_name == merchant_key or merchant_key in store_name or store_name in merchant_key:
                return _direct_url(store.get('link'))
        return None

    def normalize_item(self, item: Dict[str, Any], retrieved_at: str) -> Dict[str, Any]:
        title = str(item.get('title') or item.get('name') or item.get('product_name') or '').strip()
        source = _source_name(item)
        raw_link = item.get('link') or item.get('product_link')
        link = _direct_url(raw_link)
        current_price = item.get('extracted_price')
        if current_price is None:
            current_price = _number(item.get('price'))
        original_price = item.get('extracted_old_price')
        if original_price is None:
            original_price = _number(item.get('old_price'))
        source_product_id = item.get('product_id') or item.get('shopping_results_id')
        product_id = _stable_id(source, source_product_id, link or '', title)
        brand = item.get('brand')
        model = item.get('model') or item.get('model_number')
        description = item.get('description') or item.get('snippet')
        return {
            'id': product_id,
            'provider': 'serpapi',
            'source': source,
            'source_product_id': source_product_id,
            'product_identifier': item.get('gtin') or item.get('ean') or item.get('upc') or item.get('asin'),
            'provider_product_token': item.get('immersive_product_page_token'),
            'provider_product_link': raw_link,
            'title': title,
            'brand': brand,
            'model': model,
            'category': None,
            'description': description,
            'price': current_price,
            'original_price': original_price,
            'currency': settings.CURRENCY_CODE,
            'rating': item.get('rating'),
            'review_count': _number(item.get('reviews')),
            'image': item.get('thumbnail') or item.get('serpapi_thumbnail'),
            'additional_images': [],
            'availability': item.get('availability') or item.get('delivery'),
            'product_url': link,
            'seller': item.get('seller'),
            'shipping': item.get('delivery'),
            'last_updated': retrieved_at,
        }

    @staticmethod
    def dedupe(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen = set()
        deduped = []
        for product in products:
            identity = product.get('source_product_id') or product.get('product_url') or '|'.join([
                str(product.get('brand') or '').lower(),
                re.sub(r'\s+', ' ', str(product.get('title') or '').lower()).strip(),
            ])
            if identity in seen:
                continue
            seen.add(identity)
            deduped.append(product)
        return deduped


serpapi_provider = SerpApiProvider()
