from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import ExternalOffer, Listing, Platform, Product
from app.services.product_service import build_paginated_response, normalize_external_offer_for_response, normalize_listing_for_response, normalize_product_for_response, product_search_matches
from app.services.recommendation_engine import recommendation_engine

router = APIRouter(prefix="/products", tags=["Products & Comparison"])


@router.get("")
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    products = db.query(Product).order_by(Product.created_at.desc()).all()
    payload = [normalize_product_for_response(item) for item in products]
    return build_paginated_response(payload, page, limit)


@router.get("/search")
async def search_products_get(
    q: str = Query("", alias="q"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = (q or "").strip()
    if not query:
        return {"success": True, "data": [], "pagination": {"page": page, "limit": limit, "total": 0, "totalPages": 1}}

    matches = [
        normalize_product_for_response(item)
        for item in db.query(Product).order_by(Product.created_at.desc()).all()
        if product_search_matches(item, query)
    ]
    return build_paginated_response(matches, page, limit)


@router.get("/{product_id}")
async def get_product_detail(
    product_id: str,
    priority: Optional[str] = "balanced",
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    listings = (
        db.query(Listing, Platform)
        .join(Platform, Platform.id == Listing.platform_id)
        .filter(Listing.product_id == product_id)
        .all()
    )

    normalized_listings = [
        normalize_listing_for_response(listing, platform)
        for listing, platform in listings
    ]
    external_offers = (
        db.query(ExternalOffer, Platform)
        .join(Platform, Platform.id == ExternalOffer.merchant_id)
        .filter(ExternalOffer.product_id == product_id)
        .all()
    )
    if external_offers:
        normalized_listings = [
            normalize_external_offer_for_response(offer, platform)
            for offer, platform in external_offers
        ]
    for listing in normalized_listings:
        listing["title"] = product.canonical_name
        listing["image"] = product.image_url
        if not listing.get("provider_product_token"):
            listing["provider_product_token"] = (product.specs or {}).get("_provider_product_token")

    if not normalized_listings:
        raise HTTPException(status_code=404, detail="No listings found for this product.")

    prices = [float(item["offer_price"] or item["price"]) for item in normalized_listings]
    min_price = min(prices)
    max_price = max(prices)
    best_option = recommendation_engine.select_best_option(normalized_listings, priority)

    review_analysis = {
        "summary": "No review analysis was returned by the connected provider.",
        "sentiment_breakdown": {},
        "positives": [],
        "negatives": [],
        "neutrals": [],
        "sample_reviews": [],
    }

    history = [
        {
            "date": listing.checked_at.strftime("%b %d") if listing.checked_at else "Just now",
            "price": float(listing.offer_price or listing.price),
            "merchant": platform.name,
        }
        for listing, platform in listings[:10]
    ]

    related_rows = (
        db.query(Product, ExternalOffer, Platform)
        .join(ExternalOffer, ExternalOffer.product_id == Product.id)
        .join(Platform, Platform.id == ExternalOffer.merchant_id)
        .filter(Product.id != product_id)
        .filter(Product.category == product.category if product.category else Product.brand == product.brand)
        .filter(or_(ExternalOffer.product_url.isnot(None), ExternalOffer.provider_product_token.isnot(None)))
        .order_by(ExternalOffer.last_updated.desc())
        .limit(16)
        .all()
    )
    related_products = {}
    for related, offer, platform in related_rows:
        if related.id in related_products:
            continue
        related_payload = normalize_product_for_response(related)
        related_payload.update({
            "product_id": related.id,
            "source": platform.name,
            "price": offer.price,
            "currency": offer.currency,
            "rating": offer.rating,
            "review_count": offer.review_count,
            "reviews": offer.review_count,
            "availability": offer.availability,
            "image_url": offer.image_url or related.image_url,
            "product_url": offer.product_url,
            "providerProductToken": offer.provider_product_token,
            "provider_product_token": offer.provider_product_token,
        })
        related_products[related.id] = related_payload

    return {
        "product": normalize_product_for_response(product),
        "best_option": best_option,
        "listings": normalized_listings,
        "review_analysis": review_analysis,
        "price_history": history,
        "lowest_observed_price": min_price,
        "highest_observed_price": max_price,
        "related_products": list(related_products.values())[:8],
    }


@router.get("/{product_id}/listings")
async def get_product_listings(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    rows = (
        db.query(Listing, Platform)
        .join(Platform, Platform.id == Listing.platform_id)
        .filter(Listing.product_id == product_id)
        .all()
    )
    return {
        "success": True,
        "data": [normalize_listing_for_response(listing, platform) for listing, platform in rows],
    }


@router.get("/{product_id}/price-history")
async def get_product_price_history(product_id: str, db: Session = Depends(get_db)):
    rows = db.query(Listing).filter(Listing.product_id == product_id).all()
    if not rows:
        return {"success": True, "data": []}
    return {"success": True, "data": [
        {
            "listing_id": r.id,
            "price": float(r.offer_price or r.price),
            "timestamp": r.checked_at.isoformat() if r.checked_at else None,
        }
        for r in rows
    ]}


@router.get("/{product_id}/reviews")
async def get_product_reviews(product_id: str, db: Session = Depends(get_db)):
    rows = db.query(Listing).filter(Listing.product_id == product_id).all()
    return {"success": True, "data": [
        {
            "listing_id": row.id,
            "rating": float(row.rating or 0),
            "review_count": int(row.review_count or 0),
            "seller_name": row.seller_name,
            "platform": row.platform_id,
        }
        for row in rows
    ]}


@router.get("/{product_id}/related")
async def get_related_products(product_id: str, db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.id != product_id).limit(4).all()
    return {"success": True, "data": [normalize_product_for_response(item) for item in products]}
