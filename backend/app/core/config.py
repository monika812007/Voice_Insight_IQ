import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Voice Insight IQ"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "voice_insight_iq_super_secret_jwt_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    DATABASE_URL: str = "sqlite:///./voice_insight_iq.db"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    ECOMMERCE_API_KEY: str = ""
    ECOMMERCE_API_SECRET: str = ""
    AMAZON_API_KEY: str = ""
    AMAZON_API_SECRET: str = ""
    FLIPKART_API_KEY: str = ""
    SERPAPI_API_KEY: str = ""
    DATAFORSEO_LOGIN: str = ""
    DATAFORSEO_PASSWORD: str = ""
    SHOPPING_API_KEY: str = ""
    SHOPPING_LOCATION: str = "India"
    SHOPPING_COUNTRY: str = "in"
    SHOPPING_LANGUAGE: str = "en"
    SHOPPING_PAGE_SIZE: int = 20
    SHOPPING_PROVIDER_TIMEOUT_SECONDS: float = 15.0
    DATAFORSEO_PROVIDER_TIMEOUT_SECONDS: float = 30.0
    DATAFORSEO_LOCATION_CODE: int = 2356
    DATAFORSEO_LANGUAGE_CODE: str = "en"
    DATAFORSEO_PAGE_SIZE: int = 20
    SHOPPING_CACHE_TTL_SECONDS: int = 300

    DEMO_MODE: bool = False
    CURRENCY_SYMBOL: str = "₹"
    CURRENCY_CODE: str = "INR"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


settings = Settings()
