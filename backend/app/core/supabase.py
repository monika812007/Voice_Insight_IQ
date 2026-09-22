import logging
from typing import Any, Dict, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class SupabaseService:
    def __init__(self):
        self.url = (settings.SUPABASE_URL or "").rstrip("/")
        self.key = settings.SUPABASE_PUBLISHABLE_KEY or settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY or ""

    @property
    def is_configured(self) -> bool:
        return bool(self.url and self.key)

    def _headers(self, custom_token: Optional[str] = None) -> Dict[str, str]:
        token = custom_token or self.key
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    async def get_auth_settings(self) -> Dict[str, Any]:
        if not self.is_configured:
            return {"error": "Supabase credentials not configured."}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.url}/auth/v1/settings", headers=self._headers())
                if resp.is_success:
                    return resp.json()
                return {"error": f"Supabase auth check returned {resp.status_code}", "detail": resp.text}
        except Exception as e:
            logger.error("Error communicating with Supabase: %s", e)
            return {"error": str(e)}

    async def verify_user_token(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Verify Supabase JWT token and fetch user profile."""
        if not self.is_configured:
            return None
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.url}/auth/v1/user",
                    headers=self._headers(custom_token=access_token),
                )
                if resp.is_success:
                    return resp.json()
        except Exception as e:
            logger.error("Error verifying Supabase user token: %s", e)
        return None


supabase_service = SupabaseService()
