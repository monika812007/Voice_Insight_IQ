from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseProvider(ABC):
    """Provider interface for licensed e-commerce sources."""

    @property
    @abstractmethod
    def platform_name(self) -> str:
        raise NotImplementedError

    @abstractmethod
    async def search_products(self, query: str) -> List[Dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    async def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    async def get_product_listings(self, product_id: str) -> List[Dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        raise NotImplementedError
