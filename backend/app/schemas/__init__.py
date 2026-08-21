from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    preferences: Optional[Dict[str, Any]] = {}

    model_config = ConfigDict(from_attributes=True)

# Listing Schema
class ListingOut(BaseModel):
    id: str
    product_id: str
    platform_name: str
    platform_logo: Optional[str] = None
    product_url: str
    seller_name: str
    seller_rating: float
    price: float
    original_price: Optional[float] = None
    offer_price: Optional[float] = None
    discount: Optional[str] = None
    currency: str = "₹"
    rating: float
    review_count: int
    availability: bool
    checked_at: str
    is_demo_source: bool = False
    is_affiliate_link: bool = True

    model_config = ConfigDict(from_attributes=True)

# Best Option Recommendation Schema
class BestOptionOut(BaseModel):
    listing_id: str
    platform_name: str
    platform_logo: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    offer_price: Optional[float] = None
    savings: float
    rating: float
    review_count: int
    seller_name: str
    seller_rating: float
    score: float
    recommendation_type: str # BEST OVERALL, BEST DEAL, BEST RATED, BEST SELLER
    explanation: str
    product_url: str
    is_demo_source: bool = False
    is_affiliate_link: bool = True

# Product Schemas
class ProductOut(BaseModel):
    id: str
    canonical_name: str
    brand: str
    model: str
    category: str
    description: str
    image_url: str
    specs: Dict[str, Any]
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PriceTrendPoint(BaseModel):
    date: str
    prices: Dict[str, float]

class ProductDetailResponse(BaseModel):
    product: ProductOut
    best_option: BestOptionOut
    listings: List[ListingOut]
    review_analysis: Dict[str, Any]
    price_history: List[Dict[str, Any]]
    lowest_observed_price: float
    highest_observed_price: float
    related_products: List[ProductOut]

# Search Schemas
class SearchQueryRequest(BaseModel):
    query: str
    search_type: str = "text"
    page: int = Field(1, ge=1)

class SearchQueryResponse(BaseModel):
    matched_product: Optional[ProductOut] = None
    parsed_intent: Dict[str, Any]
    candidate_products: List[ProductOut]
    comparison: Optional[ProductDetailResponse] = None

# Notification Schemas
class NotificationOut(BaseModel):
    id: str
    user_id: str
    product_id: Optional[str] = None
    type: str
    message: str
    read: bool
    old_price: Optional[float] = None
    new_price: Optional[float] = None
    platform_name: Optional[str] = None
    savings: Optional[float] = None
    created_at: datetime
    product: Optional[ProductOut] = None

    model_config = ConfigDict(from_attributes=True)

# Search History Schema
class SearchHistoryOut(BaseModel):
    id: str
    query: str
    search_type: str
    created_at: datetime
    matched_product_name: Optional[str] = None
    matched_product_id: Optional[str] = None
    lowest_price: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
