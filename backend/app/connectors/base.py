from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseConnector(ABC):
    """
    Abstract interface for all platform e-commerce data connectors.
    Every platform connector (Demo or Licensed API) must implement this contract.
    """
    
    @property
    @abstractmethod
    def platform_name(self) -> str:
        pass

    @property
    @abstractmethod
    def is_demo_mode(self) -> bool:
        pass

    @abstractmethod
    async def search_products(self, query: str) -> List[Dict[str, Any]]:
        """Search products on this platform using text query."""
        pass

    @abstractmethod
    async def get_product_listing(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve listing details for a specific canonical product."""
        pass

    @abstractmethod
    async def get_reviews(self, product_id: str) -> List[Dict[str, Any]]:
        """Retrieve reviews for a given listing."""
        pass

    @abstractmethod
    def normalize_listing(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert raw platform payload into normalized internal Listing object."""
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Check connector health, latency, and status."""
        pass
