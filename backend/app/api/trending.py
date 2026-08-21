from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Listing, Platform, Product
from app.services.product_service import normalize_listing_for_response, normalize_product_for_response

router = APIRouter(prefix="/trending", tags=["Trending"])


@router.get("")
async def get_trending_products(db: Session = Depends(get_db)):
    rows = (
        db.query(Listing, Product, Platform)
        .join(Product, Product.id == Listing.product_id)
        .join(Platform, Platform.id == Listing.platform_id)
        .all()
    )

    items = []
    for listing, product, platform in rows:
        original = float(listing.original_price or listing.price)
        current = float(listing.offer_price or listing.price)
        savings = max(0, original - current)
        discount_pct = ((original - current) / original * 100) if original else 0
        items.append({
            "product": normalize_product_for_response(product),
            "listing": normalize_listing_for_response(listing, platform),
            "savings": savings,
            "discount_pct": round(discount_pct, 1),
        })

    items.sort(key=lambda item: (item["discount_pct"], item["savings"]), reverse=True)

    # Keep one best deal per product so the homepage does not render duplicate cards.
    best_by_product = {}
    for item in items:
        product_id = item["product"]["id"]
        if product_id not in best_by_product:
            best_by_product[product_id] = item

    data = [{
        "id": item["product"]["id"],
        "canonical_name": item["product"]["canonical_name"],
        "brand": item["product"]["brand"],
        "category": item["product"]["category"],
        "price": item["listing"]["offer_price"] or item["listing"]["price"],
        "original_price": item["listing"]["original_price"] or item["listing"]["price"],
        "savings": item["savings"],
        "platform": item["listing"]["platform_name"],
        "rating": item["listing"]["rating"],
        "image_url": item["product"]["image_url"],
        "discount_pct": item["discount_pct"],
    } for item in list(best_by_product.values())[:8]]

    return {"success": True, "data": data}
