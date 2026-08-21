import math
from typing import List, Dict, Any

class RecommendationEngine:
    """
    Multi-Factor Recommendation Engine.
    Evaluates listings using a transparent, auditable weighted scoring model.
    """
    
    DEFAULT_WEIGHTS = {
        "price": 0.40,
        "seller": 0.20,
        "product_rating": 0.15,
        "review_confidence": 0.10,
        "offer_savings": 0.10,
        "availability": 0.05
    }

    def calculate_listing_score(
        self,
        listing: Dict[str, Any],
        min_price: float,
        max_price: float,
        weights: Dict[str, float] = None
    ) -> Dict[str, Any]:
        if weights is None:
            weights = self.DEFAULT_WEIGHTS

        price = float(listing.get("offer_price") or listing.get("price", 0))
        orig_price = float(listing.get("original_price") or price)
        seller_rating = float(listing.get("seller_rating") or 0)
        product_rating = float(listing.get("rating") or 0)
        review_count = int(listing.get("review_count") or 0)
        is_available = bool(listing.get("availability")) if listing.get("availability") is not None else False

        # 1. Price Score (Inverse linear interpolation: lowest price gets 100, highest gets 40)
        if max_price == min_price or max_price == 0:
            price_score = 100.0
        else:
            price_score = 100.0 - ((price - min_price) / (max_price - min_price) * 60.0)
        price_score = max(0.0, min(100.0, price_score))

        # 2. Seller Score (0 - 5.0 -> 0 - 100)
        seller_score = max(0.0, min(100.0, (seller_rating / 5.0) * 100.0))

        # 3. Product Rating Score (0 - 5.0 -> 0 - 100)
        rating_score = max(0.0, min(100.0, (product_rating / 5.0) * 100.0))

        # 4. Review Confidence Score (Logarithmic scaling based on review count)
        if review_count <= 0:
            review_score = 30.0
        else:
            review_score = min(100.0, math.log10(review_count + 1) * 25.0)

        # 5. Offer Savings Score (% discount amount)
        if orig_price > price:
            discount_pct = ((orig_price - price) / orig_price) * 100.0
            offer_score = min(100.0, discount_pct * 2.5) # 40% discount = 100 score
        else:
            offer_score = 10.0

        # 6. Availability Score
        avail_score = 100.0 if is_available else 0.0

        final_score = (
            weights["price"] * price_score +
            weights["seller"] * seller_score +
            weights["product_rating"] * rating_score +
            weights["review_confidence"] * review_score +
            weights["offer_savings"] * offer_score +
            weights["availability"] * avail_score
        )

        return {
            "final_score": round(final_score, 1),
            "breakdown": {
                "price_score": round(price_score, 1),
                "seller_score": round(seller_score, 1),
                "rating_score": round(rating_score, 1),
                "review_score": round(review_score, 1),
                "offer_score": round(offer_score, 1),
                "avail_score": round(avail_score, 1)
            }
        }

    def select_best_option(
        self,
        listings: List[Dict[str, Any]],
        user_priority: str = "balanced"
    ) -> Dict[str, Any]:
        if not listings:
            return None

        prices = [float(l.get("offer_price") or l.get("price", 0)) for l in listings if l.get("price")]
        min_price = min(prices) if prices else 0
        max_price = max(prices) if prices else 0

        scored_listings = []
        for l in listings:
            res = self.calculate_listing_score(l, min_price, max_price)
            scored_listings.append({
                "listing": l,
                "score": res["final_score"],
                "breakdown": res["breakdown"]
            })

        # Priority adjustments
        if user_priority == "cheapest":
            best = min(scored_listings, key=lambda x: float(x["listing"].get("offer_price") or x["listing"].get("price")))
            rec_type = "BEST DEAL"
        elif user_priority == "best_rated":
            best = max(scored_listings, key=lambda x: float(x["listing"].get("rating", 0)))
            rec_type = "BEST RATED"
        elif user_priority == "best_seller":
            best = max(scored_listings, key=lambda x: float(x["listing"].get("seller_rating", 0)))
            rec_type = "BEST SELLER"
        else: # balanced choice
            best = max(scored_listings, key=lambda x: x["score"])
            rec_type = "BALANCED CHOICE"

        l = best["listing"]
        price = float(l.get("offer_price") or l.get("price"))
        original_price = l.get("original_price")
        orig_price = float(original_price) if original_price is not None else None
        savings = orig_price - price if orig_price is not None and orig_price > price else 0

        # Build grounded explanation text
        facts = [f"the retrieved price of ₹{price:,.0f}"]
        if savings:
            facts.append(f"a saving of ₹{savings:,.0f}")
        if l.get("rating") is not None:
            facts.append(f"a {l['rating']}★ product rating")
        if l.get("seller_rating") is not None and l.get("seller_name"):
            facts.append(f"a {l['seller_rating']}★ seller rating from {l['seller_name']}")
        explanation = f"{l['platform_name']} is recommended as the {rec_type.lower()} option because it offers " + ", ".join(facts) + "."

        return {
            "listing_id": l["id"],
            "platform_name": l["platform_name"],
            "platform_logo": l.get("platform_logo"),
            "price": price,
            "original_price": orig_price,
            "offer_price": l.get("offer_price"),
            "savings": savings,
            "rating": float(l["rating"]) if l.get("rating") is not None else None,
            "review_count": int(l["review_count"]) if l.get("review_count") is not None else None,
            "seller_name": l.get("seller_name"),
            "seller_rating": float(l["seller_rating"]) if l.get("seller_rating") is not None else None,
            "score": best["score"],
            "recommendation_type": rec_type,
            "explanation": explanation,
            "product_url": l["product_url"],
            "provider_product_token": l.get("provider_product_token"),
            "is_demo_source": l.get("is_demo_source", True),
            "is_affiliate_link": l.get("is_affiliate_link", True)
        }

recommendation_engine = RecommendationEngine()
