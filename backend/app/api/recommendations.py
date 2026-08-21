from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Listing, Platform, Product
from app.services.product_service import normalize_listing_for_response
from app.services.recommendation_engine import recommendation_engine

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/{product_id}")
async def get_recommendation_details(
    product_id: str,
    priority: str = Query("balanced"),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    rows = (
        db.query(Listing, Platform)
        .join(Platform, Platform.id == Listing.platform_id)
        .filter(Listing.product_id == product_id)
        .all()
    )
    listings = [normalize_listing_for_response(listing, platform) for listing, platform in rows]
    if not listings:
        raise HTTPException(status_code=404, detail="Recommendation unavailable for product.")

    best_option = recommendation_engine.select_best_option(listings, priority)
    return {
        "success": True,
        "data": {
            "best_option": best_option,
            "all_listings_scored": len(listings),
            "product_id": product_id,
        },
    }
