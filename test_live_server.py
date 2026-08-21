import httpx
import json

response = httpx.post(
    "http://127.0.0.1:8001/api/v1/search",
    json={"query": "Sony WH-1000XM5", "search_type": "text", "page": 1}
)

data = response.json()
print(f"Status: {response.status_code}")
print(f"Products: {len(data.get('candidate_products', []))}")
print(f"Has best_option: {data.get('comparison', {}).get('best_option') is not None}")

if data.get('comparison', {}).get('best_option'):
    best = data['comparison']['best_option']
    print(f"\nBest Option:")
    print(f"  Platform: {best.get('platform_name')}")
    print(f"  Price: {best.get('price')}")
    print(f"  Rating: {best.get('rating')}")
    print(f"  Type: {best.get('recommendation_type')}")
