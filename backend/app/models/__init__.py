from app.core.database import Base
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    preferences = Column(JSON, default=dict)

    searches = relationship("SearchHistory", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    canonical_name = Column(String, nullable=False, index=True)
    brand = Column(String, index=True)
    model = Column(String, index=True)
    category = Column(String, index=True)
    description = Column(Text)
    image_url = Column(String)
    specs = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    normalized_title = Column(String, index=True)
    product_identifier = Column(String, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    listings = relationship("Listing", back_populates="product", cascade="all, delete-orphan")
    external_offers = relationship("ExternalOffer", back_populates="product", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="product")

class Platform(Base):
    __tablename__ = "platforms"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    logo_url = Column(String)
    base_url = Column(String)
    status = Column(String, default="active")
    is_demo_source = Column(Boolean, default=True)
    domain = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    listings = relationship("Listing", back_populates="platform")

class Listing(Base):
    __tablename__ = "listings"

    id = Column(String, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    platform_id = Column(String, ForeignKey("platforms.id"), nullable=False)
    external_product_id = Column(String)
    product_url = Column(String, nullable=False)
    seller_name = Column(String)
    seller_rating = Column(Float, default=4.0)
    price = Column(Float, nullable=False)
    original_price = Column(Float)
    offer_price = Column(Float)
    discount = Column(String)
    currency = Column(String, default="₹")
    rating = Column(Float, default=4.0)
    review_count = Column(Integer, default=0)
    availability = Column(Boolean, default=True)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_affiliate_link = Column(Boolean, default=True)

    product = relationship("Product", back_populates="listings")
    platform = relationship("Platform", back_populates="listings")
    reviews = relationship("Review", back_populates="listing")
    price_histories = relationship("PriceHistory", back_populates="listing")


class ExternalOffer(Base):
    __tablename__ = "external_offers"

    id = Column(String, primary_key=True, index=True)
    offer_key = Column(String, nullable=False, unique=True, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False, index=True)
    merchant_id = Column(String, ForeignKey("platforms.id"), nullable=False, index=True)
    source_api = Column(String, nullable=False)
    price = Column(Float)
    currency = Column(String)
    rating = Column(Float)
    review_count = Column(Integer)
    availability = Column(String)
    image_url = Column(String)
    product_url = Column(String)
    seller_url = Column(String)
    external_product_id = Column(String)
    provider_product_token = Column(String)
    last_updated = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="external_offers")
    merchant = relationship("Platform")


class SearchCache(Base):
    __tablename__ = "search_cache"

    id = Column(String, primary_key=True, index=True)
    cache_key = Column(String, nullable=False, unique=True, index=True)
    query = Column(String, nullable=False)
    page = Column(Integer, nullable=False, default=1)
    payload = Column(JSON, nullable=False)
    fetched_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=False)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, index=True)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False)
    rating = Column(Float, nullable=False)
    review_text = Column(Text, nullable=False)
    review_date = Column(String)
    verified_flag = Column(Boolean, default=True)
    sentiment = Column(String, default="neutral") # positive, neutral, negative
    sentiment_score = Column(Float, default=0.5)

    listing = relationship("Listing", back_populates="reviews")

class PriceHistory(Base):
    __tablename__ = "price_histories"

    id = Column(String, primary_key=True, index=True)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False)
    price = Column(Float, nullable=False)
    offer_price = Column(Float)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow)

    listing = relationship("Listing", back_populates="price_histories")

class SearchHistory(Base):
    __tablename__ = "searches"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    query = Column(String, nullable=False)
    search_type = Column(String, default="text") # text, voice, image, url
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="searches")


class LikedProduct(Base):
    __tablename__ = "liked_products"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ViewedProduct(Base):
    __tablename__ = "viewed_products"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False, index=True)
    viewed_at = Column(DateTime, default=datetime.datetime.utcnow)

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False)
    score = Column(Float, nullable=False)
    type = Column(String, default="BALANCED_CHOICE") # BALANCED_CHOICE, BEST_DEAL, BEST_RATED, BEST_SELLER
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="recommendations")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    type = Column(String, default="price_drop") # price_drop, deal_alert, info
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    old_price = Column(Float, nullable=True)
    new_price = Column(Float, nullable=True)
    platform_name = Column(String, nullable=True)
    savings = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
