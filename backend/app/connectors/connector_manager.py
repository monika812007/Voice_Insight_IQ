import asyncio
from typing import List, Dict, Any, Optional
from app.connectors.base import BaseConnector
from app.connectors.amazon_connector import AmazonLicensedConnector

class ConnectorManager:
    def __init__(self):
        self.connectors: List[BaseConnector] = [
            AmazonLicensedConnector()
        ]

    async def get_all_health_checks(self) -> List[Dict[str, Any]]:
        health_results = []
        for conn in self.connectors:
            try:
                res = await conn.health_check()
                health_results.append(res)
            except Exception as e:
                health_results.append({
                    "platform": conn.platform_name,
                    "status": "error",
                    "error": str(e),
                    "demo_mode": conn.is_demo_mode
                })
        return health_results

connector_manager = ConnectorManager()
