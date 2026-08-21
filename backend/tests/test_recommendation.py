from app.services.recommendation_engine import recommendation_engine

def test_recommendation_scoring():
    listing_a = {
        "id": "l_1",
        "platform_name": "Amazon",
        "price": 48999,
        "original_price": 54999,
        "offer_price": 46999,
        "seller_name": "Top Seller",
        "seller_rating": 4.7,
        "rating": 4.5,
        "review_count": 10000,
        "availability": True,
        "product_url": "https://amazon.in/dp/example"
    }

    listing_b = {
        "id": "l_2",
        "platform_name": "Store B",
        "price": 52000,
        "original_price": 54999,
        "offer_price": 51000,
        "seller_name": "Store B Seller",
        "seller_rating": 4.2,
        "rating": 4.3,
        "review_count": 500,
        "availability": True,
        "product_url": "https://storeb.com/example"
    }

    score_a = recommendation_engine.calculate_listing_score(listing_a, 46999, 51000)
    score_b = recommendation_engine.calculate_listing_score(listing_b, 46999, 51000)

    assert score_a["final_score"] > score_b["final_score"]

    best = recommendation_engine.select_best_option([listing_a, listing_b], "balanced")
    assert best["platform_name"] == "Amazon"
    assert best["recommendation_type"] == "BALANCED CHOICE"
