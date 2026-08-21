from typing import Any, Dict, List, Optional

from app.providers.base_provider import BaseProvider


class AmazonProvider(BaseProvider):
    platform_name = "Amazon"

    async def search_products(self, query: str) -> List[Dict[str, Any]]:
        return []

    async def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        return None

    async def get_product_listings(self, product_id: str) -> List[Dict[str, Any]]:
        return []

    async def health_check(self) -> Dict[str, Any]:
        return {
            "platform": "Amazon",
            "status": "not_configured",
            "demo_mode": True,
            "message": "Add AMAZON_API_KEY and AMAZON_API_SECRET to enable this provider."
        }
