import logging
import re
import uuid
import asyncio
import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.ai.sentiment_analyzer import sentiment_analyzer
from app.ai.vision_matcher import vision_matcher
from app.core.config import settings
from app.models import ExternalOffer, Listing, Platform, Product, SearchCache
from app.providers.dataforseo_provider import dataforseo_provider
from app.providers.serpapi_provider import serpapi_provider
from app.services.product_matcher import product_matcher
from app.services.product_service import normalize_listing_for_response, normalize_product_for_response
from app.services.recommendation_engine import recommendation_engine

logger = logging.getLogger(__name__)

ALLOWED_ECOMMERCE_DOMAINS = [
    "amazon.in", "amazon.com", "flipkart.com", "croma.com",
    "reliancedigital.in", "tata-cliq.com", "myntra.com", "ajio.com"
]


class SearchService:
    @staticmethod
    def _normalized_title(title: Any) -> str:
        return re.sub(r'[^a-z0-9]+', ' ', str(title or '').casefold()).strip()

    @classmethod
    def _brand_model_from_title(cls, item: Dict[str, Any]) -> tuple[Optional[str], Optional[str]]:
        title = str(item.get('title') or '')
        brand = item.get('brand')
        if not brand:
            known_brand = re.search(r'\b(apple|samsung|sony|hp|dell|lenovo|lg|asus|oneplus|xiaomi|nike)\b', title, re.IGNORECASE)
            brand = known_brand.group(1).title() if known_brand else None
        model = item.get('model')
        if not model:
            model_match = re.search(r'\b([A-Z]{1,5}[- ]?\d{2,}[A-Z0-9-]*)\b', title, re.IGNORECASE)
            model = model_match.group(1) if model_match else None
        return brand, model

    @classmethod
    def _identity_key(cls, item: Dict[str, Any]) -> str:
        identifier = item.get('product_identifier')
        if identifier:
            return f"identifier:{str(identifier).casefold().strip()}"
        title = str(item.get('title') or '')
        derived_brand, derived_model = cls._brand_model_from_title(item)
        brand = cls._normalized_title(derived_brand)
        model = re.sub(r'[^a-z0-9]', '', cls._normalized_title(derived_model))
        normalized_title = cls._normalized_title(title)
        variants = ' '.join(re.findall(r'\b\d+\s?(?:gb|tb|mb)\b', normalized_title))
        accessory_terms = sorted(set(re.findall(
            r'\b(?:replacement|earpads?|pads?|skins?|covers?|cases?|cushions?|wraps?|protective|compatible)\b',
            normalized_title,
        )))
        accessory_key = ' '.join(accessory_terms)
        if brand and model:
            return f"model:{brand}:{model}:{variants}:{accessory_key}"
        return f"title:{normalized_title}"

    @staticmethod
    def _source_api(item: Dict[str, Any]) -> str:
        return str(item.get('provider') or ('dataforseo' if item.get('source') == dataforseo_provider.name else 'serpapi')).casefold()

    @staticmethod
    def _cache_key(query: str, page: int) -> str:
        return hashlib.sha256(f"v2:{query.casefold().strip()}:{page}".encode('utf-8')).hexdigest()

    def _get_cached_search(self, db: Optional[Session], query: str, page: int) -> Optional[Dict[str, Any]]:
        if not db:
            return None
        cached = db.query(SearchCache).filter(SearchCache.cache_key == self._cache_key(query, page)).first()
        if not cached or not cached.expires_at:
            return None
        expires_at = cached.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= datetime.now(timezone.utc):
            return None
        return cached.payload

    def _store_search_cache(self, db: Optional[Session], query: str, page: int, payload: Dict[str, Any]) -> None:
        if not db:
            return
        now = datetime.now(timezone.utc)
        key = self._cache_key(query, page)
        cached = db.query(SearchCache).filter(SearchCache.cache_key == key).first()
        if not cached:
            cached = SearchCache(id=f"cache_{key[:24]}", cache_key=key, query=query, page=page)
            db.add(cached)
        cached.payload = payload
        cached.fetched_at = now
        cached.expires_at = now + __import__('datetime').timedelta(seconds=settings.SHOPPING_CACHE_TTL_SECONDS)
        db.commit()

    @staticmethod
    def _public_external_product(item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": item["id"],
            "title": item["title"],
            "canonical_name": item["title"],
            "price": item.get("price"),
            "oldPrice": item.get("original_price"),
            "currency": item.get("currency"),
            "extractedPrice": item.get("price"),
            "store": item.get("source"),
            "rating": item.get("rating"),
            "reviews": item.get("review_count"),
            "review_count": item.get("review_count"),
            "image": item.get("image"),
            "image_url": item.get("image"),
            "productUrl": item.get("product_url"),
            "product_url": item.get("product_url"),
            "providerProductToken": item.get("provider_product_token"),
            "provider_product_token": item.get("provider_product_token"),
            "provider": item.get("provider"),
            "source": item.get("source"),
            "product_id": item.get("persisted_product_id"),
            "direct_product_url_available": bool(item.get("product_url")),
            "sourceProductId": item.get("source_product_id"),
            "availability": item.get("availability"),
            "seller": item.get("seller"),
            "shipping": item.get("shipping"),
            "lastUpdated": item.get("last_updated"),
        }

    def _get_or_create_platform(self, db: Session, name: str, domain: Optional[str] = None) -> Platform:
        platform = db.query(Platform).filter(Platform.name == name).first()
        if platform:
            if domain and not platform.domain:
                platform.domain = domain
            return platform
        platform = Platform(
            id=f"platform_external_{uuid.uuid4().hex[:12]}",
            name=name,
            logo_url="",
            base_url="",
            status="active",
            is_demo_source=False,
            domain=domain,
        )
        db.add(platform)
        db.flush()
        return platform

    def cache_external_products(self, db: Session, products: List[Dict[str, Any]]) -> Dict[str, str]:
        persisted_ids = {}
        products_by_identity = {}
        for item in products:
            identity_key = self._identity_key(item)
            product = products_by_identity.get(identity_key)
            if item.get('product_identifier'):
                product = product or db.query(Product).filter(Product.product_identifier == str(item['product_identifier'])).first()
            derived_brand, derived_model = self._brand_model_from_title(item)
            if not product and derived_brand and derived_model:
                product = db.query(Product).filter(Product.brand == derived_brand, Product.model == derived_model).first()
            if not product:
                product = db.query(Product).filter(Product.normalized_title == self._normalized_title(item['title'])).first()
            if not product:
                digest = hashlib.sha256(identity_key.encode('utf-8')).hexdigest()[:24]
                product = Product(id=f"product_{digest}", canonical_name=item["title"] or "Untitled product")
                db.add(product)
            products_by_identity[identity_key] = product
            product.canonical_name = item["title"] or product.canonical_name
            product.normalized_title = self._normalized_title(item.get('title'))
            product.product_identifier = item.get('product_identifier') or product.product_identifier
            product.brand = derived_brand or item.get("brand") or product.brand
            product.model = derived_model or item.get("model") or product.model
            product.category = item.get("category")
            product.description = item.get("description")
            product.image_url = item.get("image")
            product.specs = {
                **{
                    key: value
                    for key, value in {
                        "brand": item.get("brand"),
                        "model": item.get("model"),
                        "availability": item.get("availability"),
                        "shipping": item.get("shipping"),
                    }.items()
                    if value not in (None, "", [])
                },
            }
            product.updated_at = datetime.now(timezone.utc)
            persisted_ids[item['id']] = product.id

            domain = urlparse(str(item.get('product_url') or '')).netloc.lower() or None
            platform = self._get_or_create_platform(db, item["source"], domain)
            offer_identity = str(item.get('source_product_id') or item.get('product_url') or item.get('title') or item['id']).casefold()
            offer_key = hashlib.sha256(f"{product.id}:{platform.id}:{self._source_api(item)}:{offer_identity}".encode('utf-8')).hexdigest()
            offer = db.query(ExternalOffer).filter(ExternalOffer.offer_key == offer_key).first()
            if not offer:
                offer = ExternalOffer(id=f"offer_{offer_key[:24]}", offer_key=offer_key, product_id=product.id, merchant_id=platform.id, source_api=self._source_api(item))
                db.add(offer)
            offer.price = item.get('price')
            offer.currency = item.get('currency')
            offer.rating = item.get('rating')
            offer.review_count = item.get('review_count')
            offer.availability = str(item.get('availability')) if item.get('availability') is not None else None
            offer.image_url = item.get('image')
            offer.product_url = item.get('product_url')
            offer.seller_url = item.get('seller_url')
            offer.external_product_id = item.get('source_product_id')
            offer.provider_product_token = item.get('provider_product_token')
            offer.last_updated = datetime.fromisoformat(item['last_updated'].replace('Z', '+00:00'))
            offer.updated_at = datetime.now(timezone.utc)
        db.commit()
        return persisted_ids

    def _comparison_from_db(self, db: Session, product: Product, priority: str) -> Dict[str, Any]:
        rows = db.query(Listing, Platform).join(Platform, Platform.id == Listing.platform_id).filter(Listing.product_id == product.id).all()
        listings = [normalize_listing_for_response(listing, platform) for listing, platform in rows]
        best_option = recommendation_engine.select_best_option(listings, priority)
        prices = [float(item.get("offer_price") or item.get("price")) for item in listings if item.get("price") is not None]
        history = [{"date": row.checked_at.strftime("%b %d") if row.checked_at else "Unknown", "price": float(row.offer_price or row.price)} for row, _ in rows]
        related = []
        if product.category or product.brand:
            related_query = db.query(Product).filter(Product.id != product.id)
            if product.category:
                related_query = related_query.filter(Product.category == product.category)
            else:
                related_query = related_query.filter(Product.brand == product.brand)
            related = [normalize_product_for_response(item) for item in related_query.limit(8).all()]
        return {
            "product": normalize_product_for_response(product),
            "best_option": best_option,
            "listings": listings,
            "review_analysis": {"summary": "No review analysis was returned by the shopping provider.", "sentiment_breakdown": {}, "positives": [], "negatives": [], "neutrals": [], "sample_reviews": []},
            "price_history": history,
            "lowest_observed_price": min(prices) if prices else 0,
            "highest_observed_price": max(prices) if prices else 0,
            "related_products": related,
        }

    def _comparison_from_external_products(self, products: List[Dict[str, Any]], priority: str) -> Dict[str, Any]:
        """Generate comparison/recommendation from external API products without database."""
        if not products:
            return None
        
        # Convert external products to listing-like format for recommendation engine
        listings = []
        for item in products:
            listings.append({
                "id": item["id"],
                "title": item.get("title"),
                "image": item.get("image"),
                "platform_name": item["source"],
                "platform_logo": "",
                "product_url": item.get("product_url"),
                "provider_product_token": item.get("provider_product_token"),
                "price": item.get("price"),
                "offer_price": item.get("price"),
                "original_price": item.get("original_price"),
                "rating": item.get("rating"),
                "review_count": item.get("review_count"),
                "seller_name": item.get("seller"),
                "seller_rating": item.get("seller_rating"),
                "availability": item.get("availability"),
                "is_demo_source": False,
                "is_affiliate_link": False,
            })
        
        best_option = recommendation_engine.select_best_option(listings, priority)
        prices = [float(item.get("price")) for item in products if item.get("price") is not None]
        related_products = []
        for item in products[1:5]:
            related_products.append({
                "id": item.get("persisted_product_id") or item["id"],
                "product_id": item.get("persisted_product_id") or item["id"],
                "canonical_name": item["title"],
                "brand": item.get("brand"),
                "category": item.get("category"),
                "image_url": item.get("image"),
                "price": item.get("price"),
                "currency": item.get("currency"),
                "source": item.get("source"),
                "rating": item.get("rating"),
                "review_count": item.get("review_count"),
                "availability": item.get("availability"),
                "product_url": item.get("product_url"),
                "providerProductToken": item.get("provider_product_token"),
                "provider_product_token": item.get("provider_product_token"),
            })
        
        return {
            "product": {
                "id": products[0]["id"],
                "canonical_name": products[0]["title"],
                "brand": products[0].get("brand"),
                "category": products[0].get("category"),
                "description": products[0].get("description"),
                "image_url": products[0].get("image"),
                "specs": {},
            },
            "best_option": best_option,
            "listings": listings,
            "review_analysis": {"summary": "No review analysis was returned by the shopping provider.", "sentiment_breakdown": {}, "positives": [], "negatives": [], "neutrals": [], "sample_reviews": []},
            "price_history": [],
            "lowest_observed_price": min(prices) if prices else 0,
            "highest_observed_price": max(prices) if prices else 0,
            "related_products": related_products,
        }

    @staticmethod
    def _dedupe_provider_products(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen = set()
        deduped = []
        for item in products:
            source = re.sub(r'\s+', ' ', str(item.get('source') or '').casefold()).strip()
            url = str(item.get('product_url') or '').split('#', 1)[0].split('?', 1)[0].casefold().rstrip('/')
            title = re.sub(r'\s+', ' ', str(item.get('title') or '').casefold()).strip()
            identity = (source, url) if url else (source, str(item.get('brand') or '').casefold(), str(item.get('model') or '').casefold(), title)
            if identity in seen:
                continue
            seen.add(identity)
            deduped.append(item)
        return deduped

    async def process_text_search(
        self,
        query: str,
        db: Optional[Session] = None,
        page: int = 1,
        requested_domain: Optional[str] = None,
        submitted_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        clean_query = query.strip()
        cached = None if submitted_url else self._get_cached_search(db, clean_query, page)
        if cached:
            return cached
        intent = product_matcher.extract_specs_from_query(clean_query)
        provider_calls = []
        provider_names = []
        if serpapi_provider.configured:
            provider_calls.append(serpapi_provider.search_products(clean_query, page))
            provider_names.append(serpapi_provider.name)
        if dataforseo_provider.configured and not serpapi_provider.configured:
            provider_calls.append(dataforseo_provider.search_products(clean_query, page))
            provider_names.append(dataforseo_provider.name)

        provider_errors = []
        provider_results = []
        if provider_calls:
            responses = await asyncio.gather(*provider_calls, return_exceptions=True)
            for provider_name, response in zip(provider_names, responses):
                if isinstance(response, Exception):
                    logger.warning("%s failed: %s", provider_name, response)
                    provider_errors.append(provider_name)
                else:
                    provider_results.append(response)

        external_products = self._dedupe_provider_products([
            product
            for result in provider_results
            for product in result.get("products", [])
        ])
        if requested_domain:
            merchant_key = requested_domain.removeprefix('www.').split('.', 1)[0].casefold()
            external_products = [
                item for item in external_products
                if merchant_key in str(item.get('source') or '').casefold()
                or merchant_key in urlparse(str(item.get('product_url') or '')).netloc.casefold()
            ]
            if submitted_url and external_products:
                external_products = external_products[:1]
                external_products[0]['product_url'] = submitted_url
        has_more = any(result.get("has_more") for result in provider_results)
        retrieved_at = max((result.get("retrieved_at", "") for result in provider_results), default=datetime.now(timezone.utc).isoformat())

        if external_products:
            if db:
                persisted_ids = self.cache_external_products(db, external_products)
                for item in external_products:
                    item['persisted_product_id'] = persisted_ids.get(item['id'])

            # Keep the live provider item as the source of truth so each
            # merchant's title, price, image, rating, reviews, and URL stay paired.
            candidate_products = [self._public_external_product(item) for item in external_products]
            matched_product = candidate_products[0]
            comparison = self._comparison_from_external_products(
                external_products, intent.get("priority", "balanced")
            )
            logger.info("[Search] Query: %s | Results: %d | Normalized: %d | Providers: %s", clean_query, len(external_products), len(candidate_products), ", ".join(provider_names))
            response = {
                "query": clean_query,
                "count": len(external_products),
                "matched_product": matched_product if isinstance(matched_product, dict) else normalize_product_for_response(matched_product),
                "parsed_intent": intent,
                "candidate_products": candidate_products,
                "comparison": comparison,
                "products": [self._public_external_product(item) for item in external_products],
                "totalResults": len(external_products),
                "page": page,
                "hasMore": has_more,
                "sources": sorted({item["source"] for item in external_products}),
                "providers": sorted({item.get("provider") or result.get("source") for result in provider_results for item in result.get("products", [])}),
                "providerErrors": provider_errors,
                "providerNotice": f"Some live providers were unavailable: {', '.join(provider_errors)}." if provider_errors else None,
                "lastUpdated": retrieved_at,
            }
            self._store_search_cache(db, clean_query, page, response)
            return response

        logger.info("[Search] Query: %s | Results: 0 | Normalized: 0", clean_query)
        return {
            "query": clean_query,
            "count": 0,
            "matched_product": None,
            "parsed_intent": intent,
            "candidate_products": [],
            "comparison": None,
            "products": [],
            "totalResults": 0,
            "page": page,
            "hasMore": False,
            "sources": [],
            "providerNotice": "All live shopping providers failed." if provider_errors else "No products found for this query.",
            "providerErrors": provider_errors,
        }

    async def get_suggestions(self, query: str) -> List[str]:
        clean_query = query.strip()
        if len(clean_query) < 2:
            return []
        return await serpapi_provider.suggestions(clean_query)

    async def resolve_external_product_url(self, provider_product_token: str, merchant: str, db: Optional[Session] = None) -> Optional[str]:
        product_url = await serpapi_provider.resolve_product_url(provider_product_token, merchant)
        if product_url and db:
            offers = (
                db.query(ExternalOffer, Platform)
                .join(Platform, Platform.id == ExternalOffer.merchant_id)
                .filter(ExternalOffer.provider_product_token == provider_product_token)
                .all()
            )
            merchant_key = merchant.casefold().strip()
            for offer, platform in offers:
                platform_key = platform.name.casefold().strip()
                if platform_key == merchant_key or merchant_key in platform_key or platform_key in merchant_key:
                    offer.product_url = product_url
                    offer.updated_at = datetime.now(timezone.utc)
            db.commit()
        return product_url

    @staticmethod
    def _external_product_response(item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": item["id"],
            "canonical_name": item["title"],
            "brand": item.get("brand"),
            "model": None,
            "category": item.get("category"),
            "description": item.get("description"),
            "image_url": item.get("image"),
            "specs": {},
            "created_at": item.get("last_updated"),
        }

    async def process_voice_search(self, query: str, db: Optional[Session] = None) -> Dict[str, Any]:
        return await self.process_text_search(query, db=db)

    async def process_url_search(self, url: str, db: Optional[Session] = None) -> Dict[str, Any]:
        url_clean = url.strip()
        parsed = urlparse(url_clean)
        if not parsed.scheme or not parsed.netloc:
            return {"error": "Invalid URL format. Please provide a valid product HTTP/HTTPS web address."}
        domain = parsed.netloc.lower()
        if not any(allowed in domain for allowed in ALLOWED_ECOMMERCE_DOMAINS):
            return {"error": f"Domain '{domain}' is not in the supported authorized platform list."}
        path_text = parsed.path.replace("/", " ").replace("-", " ").replace("_", " ").strip()
        asin_match = re.search(r"\b[A-Z0-9]{10}\b", url_clean, re.IGNORECASE)
        identifier = asin_match.group(0).upper() if asin_match else ""
        query = " ".join(part for part in (identifier, path_text) if part) or parsed.netloc
        result = await self.process_text_search(
            query,
            db=db,
            requested_domain=parsed.netloc,
            submitted_url=url_clean,
        )
        result["source_url"] = url_clean
        result["domain_verified"] = True
        return result

    async def process_image_search(self, filename: str, image_bytes: bytes, db: Optional[Session] = None) -> Dict[str, Any]:
        vision_res = vision_matcher.identify_product_from_image(filename, image_bytes)
        if not vision_res.get("success"):
            return {"error": vision_res.get("error", "Failed to process uploaded product image.")}
        result = await self.process_text_search(vision_res.get("predicted_name", ""), db=db)
        result["parsed_intent"] = {"type": "image_recognition", "confidence": vision_res["confidence"], "category": vision_res.get("category"), "low_confidence_flag": vision_res.get("low_confidence_flag", False)}
        return result


search_service = SearchService()
