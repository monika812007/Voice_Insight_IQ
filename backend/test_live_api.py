#!/usr/bin/env python
import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test suggestions
print("=" * 60)
print("Testing Suggestions Endpoint")
print("=" * 60)
resp = client.get('/api/v1/search/suggestions?q=sony')
print(f"Status: {resp.status_code}")
data = resp.json()
suggestions = data.get('suggestions', [])
print(f"Suggestions returned: {len(suggestions)}")
if suggestions:
    print(f"First 3 suggestions: {suggestions[:3]}")
print()

# Test product search
print("=" * 60)
print("Testing Live Product Search")
print("=" * 60)
resp = client.post('/api/v1/search', json={
    'query': 'Sony WH-1000XM5',
    'search_type': 'text',
    'page': 1
})
print(f"Status: {resp.status_code}")
data = resp.json()
products = data.get('candidate_products', [])
print(f"Products returned: {len(products)}")
print(f"Has matched_product: {'matched_product' in data}")
if products:
    first_product = products[0]
    print(f"\nFirst product example:")
    print(f"  Title: {first_product.get('title', 'N/A')[:50]}")
    print(f"  Price: {first_product.get('price', 'N/A')}")
    print(f"  Source: {first_product.get('source', 'N/A')}")
    product_url = first_product.get('product_url') or first_product.get('productUrl')
    image_url = first_product.get('image') or first_product.get('image_url')
    print(f"  URL: {(product_url or 'Product page unavailable')[:60]}")
    print(f"  Image: {(image_url or 'Image unavailable')[:60]}")
