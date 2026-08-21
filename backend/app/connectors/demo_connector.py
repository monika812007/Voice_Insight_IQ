import json
import os
import re
import asyncio
from typing import List, Dict, Any, Optional
from app.connectors.base import BaseConnector

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def _load_json(filename: str) -> Any:
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        # Fallback to app/data if present
        filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", filename)
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

class DemoConnector(BaseConnector):
    def __init__(self):
        self._products = _load_json("products.json")
        self._listings = _load_json("listings.json")
        self._reviews = _load_json("reviews.json")
        self._price_history = _load_json("price_history.json")

    @property
    def platform_name(self) -> str:
        return "Demo Aggregator Connector"

    @property
    def is_demo_mode(self) -> bool:
        return True

    async def search_products(self, query: str) -> List[Dict[str, Any]]:
        await asyncio.sleep(0.01) # Simulate brief async lookup
        q = query.lower().strip()
        q = re.sub(r'(\d+)\s*(gb|tb|inch|mp|hz)', r'\1 \2', q)
        matched = []
        for p in self._products:
            searchable_text = f"{p['canonical_name']} {p['brand']} {p['model']} {p['category']} {json.dumps(p.get('specs', {}))}".lower()
            searchable_text = re.sub(r'(\d+)\s*(gb|tb|inch|mp|hz)', r'\1 \2', searchable_text)
            
            keywords = [k for k in q.split() if len(k) > 1 and k not in ["for", "the", "and", "under", "best", "cheapest", "find", "me", "in", "with"]]
            if not keywords or any(kw in searchable_text for kw in keywords):
                matched.append(p)
        return matched if matched else self._products

    async def get_product_listing(self, product_id: str) -> Optional[Dict[str, Any]]:
        listings = [l for l in self._listings if l["product_id"] == product_id]
        return listings if listings else None

    async def get_reviews(self, product_id: str) -> Dict[str, Any]:
        return self._reviews.get(product_id, {
            "summary": "No specific review data collected yet for this listing.",
            "sentiment_breakdown": {"positive_percent": 80, "neutral_percent": 15, "negative_percent": 5},
            "positives": ["Good value for money", "Authentic item"],
            "negatives": ["Standard shipping timeline"],
            "neutrals": ["Package packaging standard"],
            "sample_reviews": []
        })

    def get_price_history(self, product_id: str) -> List[Dict[str, Any]]:
        return self._price_history.get(product_id, [])

    def normalize_listing(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": raw_data.get("id"),
            "product_id": raw_data.get("product_id"),
            "platform_name": raw_data.get("platform_name"),
            "platform_logo": raw_data.get("platform_logo"),
            "product_url": raw_data.get("product_url"),
            "seller_name": raw_data.get("seller_name", "Verified Seller"),
            "seller_rating": float(raw_data.get("seller_rating", 4.5)),
            "price": float(raw_data.get("price", 0.0)),
            "original_price": float(raw_data.get("original_price")) if raw_data.get("original_price") else None,
            "offer_price": float(raw_data.get("offer_price")) if raw_data.get("offer_price") else None,
            "discount": raw_data.get("discount"),
            "currency": raw_data.get("currency", "₹"),
            "rating": float(raw_data.get("rating", 4.0)),
            "review_count": int(raw_data.get("review_count", 0)),
            "availability": bool(raw_data.get("availability", True)),
            "checked_at": raw_data.get("checked_at", "Just now"),
            "is_demo_source": True,
            "is_affiliate_link": bool(raw_data.get("is_affiliate_link", True))
        }

    async def health_check(self) -> Dict[str, Any]:
        return {
            "platform": "Demo Aggregator",
            "status": "healthy",
            "latency_ms": 12,
            "demo_mode": True,
            "total_products": len(self._products),
            "total_listings": len(self._listings)
        }
