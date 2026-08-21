import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.models import ExternalOffer, Listing, Platform, Product

DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def _load_json(filename: str) -> List[Dict[str, Any]]:
    file_path = DATA_DIR / filename
    if not file_path.exists():
        return []
    with file_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def build_paginated_response(data: List[Dict[str, Any]], page: int, limit: int) -> Dict[str, Any]:
    total = len(data)
    total_pages = max(1, (total + limit - 1) // limit) if total else 1
    safe_page = max(1, page)
    start = (safe_page - 1) * limit
    end = start + limit
    return {
        "success": True,
        "data": data[start:end],
        "pagination": {
            "page": safe_page,
            "limit": limit,
            "total": total,
            "totalPages": total_pages,
        },
    }


def ensure_seed_catalog(db: Session) -> None:
    products = db.query(Product).count()
    if products > 0:
        return

    product_rows = _load_json("products.json")
    listing_rows = _load_json("listings.json")
    review_rows = _load_json("reviews.json")
    price_rows = _load_json("price_history.json")

    platform_map = {}
    for platform_name in {"Amazon", "Flipkart", "Croma", "Reliance Digital"}:
        platform = db.query(Platform).filter(Platform.name == platform_name).first()
        if not platform:
            platform = Platform(
                id=f"plat_{platform_name.lower().replace(' ', '_')}",
                name=platform_name,
                logo_url="",
                base_url="",
                status="active",
                is_demo_source=True,
            )
            db.add(platform)
            db.commit()
            db.refresh(platform)
        platform_map[platform_name] = platform.id

    for item in product_rows:
        product = Product(
            id=item["id"],
            canonical_name=item["canonical_name"],
            brand=item.get("brand"),
            model=item.get("model"),
            category=item.get("category"),
            description=item.get("description"),
            image_url=item.get("image_url"),
            specs=item.get("specs", {}),
            created_at=datetime.now(timezone.utc),
        )
        db.add(product)

    db.commit()

    for listing in listing_rows:
        platform_id = platform_map.get(listing.get("platform_name"), "")
        if not platform_id:
            continue
        db.add(
            Listing(
                id=listing["id"],
                product_id=listing["product_id"],
                platform_id=platform_id,
                external_product_id=listing.get("id"),
                product_url=listing.get("product_url", ""),
                seller_name=listing.get("seller_name", "Verified Seller"),
                seller_rating=float(listing.get("seller_rating", 4.5)),
                price=float(listing.get("price", 0)),
                original_price=float(listing.get("original_price")) if listing.get("original_price") is not None else None,
                offer_price=float(listing.get("offer_price")) if listing.get("offer_price") is not None else None,
                discount=listing.get("discount"),
                currency=listing.get("currency", "₹"),
                rating=float(listing.get("rating", 4.0)),
                review_count=int(listing.get("review_count", 0)),
                availability=bool(listing.get("availability", True)),
                checked_at=datetime.fromisoformat(str(listing.get("checked_at", datetime.now(timezone.utc).isoformat())).replace("Z", "+00:00")),
                is_affiliate_link=bool(listing.get("is_affiliate_link", True)),
            )
        )

    db.commit()


def normalize_product_for_response(product: Product) -> Dict[str, Any]:
    public_specs = {
        key: value
        for key, value in (product.specs or {}).items()
        if not str(key).startswith("_")
    }
    return {
        "id": product.id,
        "canonical_name": product.canonical_name,
        "brand": product.brand,
        "model": product.model,
        "category": product.category,
        "description": product.description,
        "image_url": product.image_url,
        "specs": public_specs,
        "created_at": product.created_at.isoformat() if product.created_at else None,
    }


def normalize_listing_for_response(listing: Listing, platform: Optional[Platform] = None) -> Dict[str, Any]:
    return {
        "id": listing.id,
        "product_id": listing.product_id,
        "platform_name": platform.name if platform else "Unknown",
        "platform_logo": platform.logo_url if platform else "",
        "product_url": listing.product_url,
        "seller_name": listing.seller_name,
        "seller_rating": float(listing.seller_rating) if listing.seller_rating is not None else None,
        "price": float(listing.price or 0),
        "original_price": float(listing.original_price) if listing.original_price is not None else None,
        "offer_price": float(listing.offer_price) if listing.offer_price is not None else None,
        "discount": listing.discount,
        "currency": listing.currency,
        "rating": float(listing.rating) if listing.rating is not None else None,
        "review_count": int(listing.review_count) if listing.review_count is not None else None,
        "availability": bool(listing.availability) if listing.availability is not None else None,
        "checked_at": listing.checked_at.isoformat() if listing.checked_at else None,
        "is_demo_source": False,
        "is_affiliate_link": bool(listing.is_affiliate_link),
    }


def normalize_external_offer_for_response(offer: ExternalOffer, platform: Optional[Platform] = None) -> Dict[str, Any]:
    return {
        "id": offer.id,
        "product_id": offer.product_id,
        "platform_name": platform.name if platform else "Unknown",
        "platform_logo": platform.logo_url if platform else "",
        "product_url": offer.product_url,
        "provider_product_token": offer.provider_product_token,
        "seller_name": platform.name if platform else None,
        "seller_rating": None,
        "price": offer.price,
        "original_price": None,
        "offer_price": offer.price,
        "discount": None,
        "currency": offer.currency,
        "rating": offer.rating,
        "review_count": offer.review_count,
        "availability": offer.availability,
        "image": offer.image_url,
        "checked_at": offer.last_updated.isoformat() if offer.last_updated else None,
        "source_api": offer.source_api,
        "is_demo_source": False,
        "is_affiliate_link": False,
    }


def product_search_matches(product: Product, query: str) -> bool:
    search_text = " ".join(
        [
            product.canonical_name or "",
            product.brand or "",
            product.model or "",
            product.category or "",
            str(product.specs or ""),
        ]
    ).lower()
    q = re.sub(r"[^a-z0-9\s]", " ", query.lower())
    compact_search_text = re.sub(r"[^a-z0-9]", "", search_text)
    compact_query = re.sub(r"[^a-z0-9]", "", query.lower())
    terms = [t for t in q.split() if len(t) > 1]
    if not terms:
        return True
    return any(term in search_text for term in terms) or (bool(compact_query) and compact_query in compact_search_text)
