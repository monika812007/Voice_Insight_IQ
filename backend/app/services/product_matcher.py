import re
from typing import Dict, Any, List

class ProductMatcher:
    """
    Normalizes platform-specific raw titles into clean canonical titles
    and matches identical products based on Brand, Model, Storage, RAM, and Specs.
    """

    @staticmethod
    def clean_title(title: str) -> str:
        # Strip promotional buzzwords
        promotional_terms = [
            r"\bSPECIAL OFFER\b", r"\bBIG BILLION DAYS\b", r"\bGREAT INDIAN FESTIVAL\b",
            r"\bSALE\b", r"\bHOT DEAL\b", r"\bDISCOUNTED\b", r"\bLIMITED TIME\b", r"\bFREE DELIVERY\b"
        ]
        cleaned = title
        for term in promotional_terms:
            cleaned = re.sub(term, "", cleaned, flags=re.IGNORECASE)
        return re.sub(r"\s+", " ", cleaned).strip()

    @staticmethod
    def extract_specs_from_query(query: str) -> Dict[str, Any]:
        q = query.lower()
        extracted = {}

        # Brand detection
        brands = ["apple", "samsung", "sony", "hp", "dell", "lenovo", "lg", "asus", "oneplus", "xiaomi"]
        for b in brands:
            if b in q:
                extracted["brand"] = b.capitalize()
                break

        # Storage / RAM detection
        storage_match = re.search(r"(\d+\s*(gb|tb))", q)
        if storage_match:
            extracted["storage"] = storage_match.group(1).upper()

        # Price ceiling / budget detection (e.g., "under 70000", "under ₹50000")
        budget_match = re.search(r"(under|<|below|\bmax\b)\s*₹?\s*(\d+)", q)
        if budget_match:
            extracted["budget"] = float(budget_match.group(2))

        # Intent detection
        if "cheapest" in q or "lowest price" in q or "best deal" in q:
            extracted["priority"] = "cheapest"
        elif "best rated" in q or "top rated" in q or "highest rating" in q:
            extracted["priority"] = "best_rated"
        elif "trusted" in q or "best seller" in q:
            extracted["priority"] = "best_seller"
        else:
            extracted["priority"] = "balanced"

        return extracted

product_matcher = ProductMatcher()
