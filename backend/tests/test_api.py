import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "Voice Insight IQ"
    assert data["demo_mode"] is False

def test_text_search_api():
    response = client.post("/api/v1/search", json={"query": "iPhone 16 128GB", "search_type": "text"})
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert "providerNotice" in data or data["matched_product"] is not None

def test_url_search_validation():
    # Valid domain
    valid_res = client.post("/api/v1/search/url", json={"query": "https://www.amazon.in/dp/B0DGJ9XZQ7", "search_type": "url"})
    assert valid_res.status_code == 200
    assert valid_res.json()["domain_verified"] is True

    # Invalid domain
    invalid_res = client.post("/api/v1/search/url", json={"query": "https://untrusted-fake-site.com/item", "search_type": "url"})
    assert invalid_res.status_code == 400

def test_admin_metrics_api():
    response = client.get("/api/v1/admin/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "connector_health" in data


def test_catalog_and_search_endpoints():
    products = client.get("/api/v1/products?page=1&limit=20")
    assert products.status_code == 200
    payload = products.json()
    assert payload["success"] is True
    assert len(payload["data"]) > 0

    search = client.get("/api/v1/products/search?q=iphone")
    assert search.status_code == 200
    search_data = search.json()
    assert search_data["success"] is True
    assert len(search_data["data"]) > 0
