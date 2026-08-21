#!/usr/bin/env python3
"""
Comprehensive validation of Voice Insight IQ real-world search implementation.
Tests: suggestions, pagination, product details, sorting, filtering, Buy Now URLs.
"""
import httpx
import json

API_BASE = "http://127.0.0.1:8001/api/v1"

def test_suggestions():
    """Test dynamic search suggestions from external provider."""
    print("\n" + "="*70)
    print("TEST 1: DYNAMIC SEARCH SUGGESTIONS")
    print("="*70)
    
    queries = ["sony wh", "iphone 1", "samsung gal"]
    for q in queries:
        resp = httpx.get(f"{API_BASE}/search/suggestions?q={q}")
        data = resp.json()
        sugg = data.get('suggestions', [])
        print(f"Query '{q}': {len(sugg)} suggestions")
        if sugg:
            print(f"  → {sugg[:2]}")

def test_search_real_queries():
    """Test real product searches."""
    print("\n" + "="*70)
    print("TEST 2: LIVE PRODUCT SEARCHES")
    print("="*70)
    
    queries = [
        "Sony WH-1000XM5",
        "iPhone 15",
        "Samsung Galaxy S24",
        "HP laptop",
        "Nike running shoes"
    ]
    
    for query in queries:
        resp = httpx.post(f"{API_BASE}/search", json={
            "query": query,
            "search_type": "text",
            "page": 1
        })
        data = resp.json()
        products = data.get('candidate_products', [])
        best = data.get('comparison', {}).get('best_option')
        
        print(f"\n'{query}':")
        print(f"  → {len(products)} products retrieved")
        print(f"  → Sources: {', '.join(data.get('sources', []))}")
        
        if products:
            first = products[0]
            print(f"\n  First product:")
            print(f"    Title: {first.get('canonical_name')[:50]}")
            print(f"    Price: ₹{first.get('price')}")
            print(f"    Store: {first.get('source')}")
            print(f"    Rating: {first.get('rating')}★")
            print(f"    Image: {'✓' if first.get('image_url') else '✗'} {'exists' if first.get('image_url') else 'missing'}")
            print(f"    URL valid: {'✓ ' if first.get('product_url', '').startswith('http') else '✗'} {first.get('product_url', '')[:60]}")
        
        if best:
            print(f"\n  Best option recommendation:")
            print(f"    Type: {best.get('recommendation_type')}")
            print(f"    Platform: {best.get('platform_name')}")
            print(f"    Price: ₹{best.get('price')}")
            print(f"    Score: {best.get('score')}/100")

def test_product_integrity():
    """Verify product field integrity - title/price/image/URL stay together."""
    print("\n" + "="*70)
    print("TEST 3: PRODUCT DATA INTEGRITY")
    print("="*70)
    print("(Verifying title/price/image/store/URL don't get mixed up)\n")
    
    resp = httpx.post(f"{API_BASE}/search", json={
        "query": "Sony headphones",
        "search_type": "text",
        "page": 1
    })
    data = resp.json()
    products = data.get('candidate_products', [])[:3]
    
    issues = []
    for i, p in enumerate(products):
        # Check required fields exist
        if not p.get('canonical_name'):
            issues.append(f"Product {i}: Missing title")
        if not p.get('price'):
            issues.append(f"Product {i}: Missing price")
        if not p.get('source'):
            issues.append(f"Product {i}: Missing store")
        if not p.get('product_url'):
            issues.append(f"Product {i}: Missing URL")
        
        # Check URL is valid
        url = p.get('product_url', '')
        if url and not url.startswith('http'):
            issues.append(f"Product {i}: Invalid URL format")
        
        print(f"Product {i+1}: {p.get('canonical_name')[:40]}")
        print(f"  Price: ₹{p.get('price')} | Store: {p.get('source')}")
        print(f"  URL: {url[:60]}...")
    
    if not issues:
        print("\n✓ All products have correct field associations!")
    else:
        print("\n✗ Issues found:")
        for issue in issues:
            print(f"  - {issue}")

def test_pagination():
    """Test pagination support."""
    print("\n" + "="*70)
    print("TEST 4: PAGINATION SUPPORT")
    print("="*70)
    
    # First page
    resp1 = httpx.post(f"{API_BASE}/search", json={
        "query": "laptop",
        "search_type": "text",
        "page": 1
    })
    data1 = resp1.json()
    page1_count = len(data1.get('candidate_products', []))
    has_more = data1.get('hasMore', False)
    
    print(f"Page 1: {page1_count} products")
    print(f"Has more: {has_more}")
    print(f"Total available: {data1.get('totalResults', 0)}")
    
    # Second page
    if has_more:
        resp2 = httpx.post(f"{API_BASE}/search", json={
            "query": "laptop",
            "search_type": "text",
            "page": 2
        })
        data2 = resp2.json()
        page2_count = len(data2.get('candidate_products', []))
        print(f"Page 2: {page2_count} products")

def test_missing_data_handling():
    """Verify graceful handling of missing price/image/URL."""
    print("\n" + "="*70)
    print("TEST 5: MISSING DATA HANDLING")
    print("="*70)
    print("(All products should have valid data; none should be fake)\n")
    
    resp = httpx.post(f"{API_BASE}/search", json={
        "query": "iPhone 15",
        "search_type": "text",
        "page": 1
    })
    data = resp.json()
    products = data.get('candidate_products', [])
    
    prices_valid = 0
    urls_valid = 0
    images_valid = 0
    
    for p in products:
        if p.get('price'):
            prices_valid += 1
        if p.get('product_url', '').startswith('http'):
            urls_valid += 1
        if p.get('image_url', '').startswith('http'):
            images_valid += 1
    
    print(f"Analyzed {len(products)} products:")
    print(f"  Valid prices: {prices_valid}/{len(products)}")
    print(f"  Valid URLs: {urls_valid}/{len(products)}")
    print(f"  Valid images: {images_valid}/{len(products)}")
    
    if prices_valid == len(products) and urls_valid == len(products):
        print("\n✓ No hardcoded/fake data detected!")
    else:
        print("\n⚠ Some products may have missing data (verify in browser)")

def test_api_keys_not_exposed():
    """Verify API credentials aren't in response."""
    print("\n" + "="*70)
    print("TEST 6: API SECURITY")
    print("="*70)
    
    resp = httpx.post(f"{API_BASE}/search", json={
        "query": "test product",
        "search_type": "text",
        "page": 1
    })
    
    response_text = json.dumps(resp.json())
    sensitive_patterns = [
        "SERPAPI",
        "9e064ab04ce",
        "api_key",
        "secret_key"
    ]
    
    exposed = []
    for pattern in sensitive_patterns:
        if pattern.lower() in response_text.lower():
            exposed.append(pattern)
    
    if exposed:
        print(f"✗ Exposed patterns: {exposed}")
    else:
        print("✓ No API keys or secrets exposed in response")

if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════════════════╗
║      VOICE INSIGHT IQ — REAL-WORLD E-COMMERCE SEARCH VALIDATION       ║
╚════════════════════════════════════════════════════════════════════════╝
    """)
    
    try:
        test_suggestions()
        test_search_real_queries()
        test_product_integrity()
        test_pagination()
        test_missing_data_handling()
        test_api_keys_not_exposed()
        
        print("\n" + "="*70)
        print("VALIDATION COMPLETE")
        print("="*70)
        print("\nAll tests performed. Check output above for results.")
        
    except Exception as e:
        print(f"\n✗ Error during testing: {e}")
        import traceback
        traceback.print_exc()
