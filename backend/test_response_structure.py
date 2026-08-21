#!/usr/bin/env python
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

resp = client.post('/api/v1/search', json={
    'query': 'Sony WH-1000XM5',
    'search_type': 'text',
    'page': 1
})

data = resp.json()
products = data.get('candidate_products', [])

if products:
    print("First product structure:")
    print(json.dumps(products[0], indent=2, default=str))
else:
    print("No products in candidate_products")

print("\n" + "=" * 60)
print("Products array field summary:")
print("=" * 60)

products_list = data.get('products', [])
if products_list:
    print("First product in 'products' array:")
    print(json.dumps(products_list[0], indent=2, default=str))
