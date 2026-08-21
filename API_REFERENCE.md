# API Response Structure & Field Reference

## Search Endpoint Response

### `POST /api/v1/search`

**Request:**
```json
{
  "query": "Sony WH-1000XM5",
  "search_type": "text",
  "page": 1
}
```

**Response Structure:**
```json
{
  "query": "Sony WH-1000XM5",
  "count": 40,
  "matched_product": {
    "id": "external_dcc676babb6532f5542bcacf",
    "canonical_name": "Sony WH-1000XM5 Wireless Noise Headphones",
    "brand": "Sony",
    "model": null,
    "category": null,
    "description": "Professional wireless noise-canceling headphones",
    "image_url": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:...",
    "specs": {},
    "created_at": "2026-08-19T08:48:14.261406"
  },
  
  "candidate_products": [
    {
      "id": "external_dcc676babb6532f5542bcacf",
      "canonical_name": "Sony WH-1000XM5 Wireless Noise Headphones",
      "brand": null,
      "model": null,
      "category": null,
      "description": null,
      "image_url": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:...",
      "specs": {},
      "created_at": "2026-08-19T08:48:14.261406",
      "source": "Amazon.in",
      "price": 29990,
      "original_price": null,
      "currency": "INR",
      "rating": 4.6,
      "review_count": 18000.0,
      "product_url": "https://www.google.com/search?ibp=oshop&q=Sony+WH-1000XM5&prds=...",
      "last_updated": "2026-08-19T08:48:54.219446+00:00"
    },
    // ... 39 more products
  ],
  
  "comparison": {
    "product": { /* matched_product details */ },
    "best_option": {
      "listing_id": "external_dcc676babb6532f5542bcacf",
      "platform_name": "Amazon.in",
      "platform_logo": "",
      "price": 29990.0,
      "original_price": null,
      "offer_price": 29990,
      "savings": 0,
      "rating": 4.6,
      "review_count": 18000,
      "seller_name": null,
      "seller_rating": 4.5,
      "score": 85.8,
      "recommendation_type": "BALANCED CHOICE",
      "explanation": "Amazon.in is recommended as the balanced choice option because it offers the retrieved price of ₹29,990 and a 4.6★ product rating.",
      "product_url": "https://www.google.com/search?ibp=oshop&...",
      "is_demo_source": false,
      "is_affiliate_link": false
    },
    "listings": [
      {
        "id": "external_dcc676babb6532f5542bcacf_listing",
        "product_id": "external_dcc676babb6532f5542bcacf",
        "platform_name": "Amazon.in",
        "platform_logo": "",
        "product_url": "https://www.google.com/search?...",
        "seller_name": null,
        "seller_rating": null,
        "price": 29990.0,
        "original_price": null,
        "offer_price": null,
        "discount": null,
        "currency": "₹",
        "rating": 4.6,
        "review_count": 18000,
        "availability": true,
        "checked_at": "2026-08-19T08:48:54.219446+00:00",
        "is_demo_source": false,
        "is_affiliate_link": false
      },
      // ... more listings from other merchants
    ],
    "review_analysis": {
      "summary": "No review analysis was returned by the shopping provider.",
      "sentiment_breakdown": {},
      "positives": [],
      "negatives": [],
      "neutrals": [],
      "sample_reviews": []
    },
    "price_history": [],
    "lowest_observed_price": 29990,
    "highest_observed_price": 89990,
    "related_products": []
  },
  
  "products": [
    {
      "id": "external_dcc676babb6532f5542bcacf",
      "title": "Sony WH-1000XM5 Wireless Noise Headphones",
      "price": 29990,
      "oldPrice": null,
      "currency": "INR",
      "extractedPrice": 29990,
      "store": "Amazon.in",
      "rating": 4.6,
      "reviews": 18000.0,
      "image": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:...",
      "productUrl": "https://www.google.com/search?ibp=oshop&...",
      "source": "Amazon.in",
      "sourceProductId": "14889149413452437791",
      "availability": "Free delivery",
      "seller": null,
      "shipping": "Free delivery",
      "lastUpdated": "2026-08-19T08:48:54.219446+00:00"
    },
    // ... 39 more products
  ],
  
  "totalResults": 40,
  "page": 1,
  "hasMore": true,
  "sources": ["Amazon.in", "AVShack.in", "Flipkart", "Vijay Sales", ...],
  "lastUpdated": "2026-08-19T08:48:54.219446+00:00"
}
```

---

## Field Reference

### `candidate_products` Array (Used by Frontend)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique product identifier | `external_dcc676babb6532f5542bcacf` |
| `canonical_name` | string | Product title/name | `Sony WH-1000XM5 Wireless Noise Headphones` |
| `brand` | string/null | Brand name | `Sony` |
| `model` | string/null | Model number | `null` |
| `category` | string/null | Product category | `null` |
| `description` | string/null | Long description | `null` |
| `image_url` | string | Product image URL | `https://encrypted-tbn3.gstatic.com/...` |
| `specs` | object | Product specifications | `{}` |
| `source` | string | Merchant/store name | `Amazon.in` |
| `price` | number | Current price in rupees | `29990` |
| `original_price` | number/null | Original/list price | `null` |
| `currency` | string | Currency code | `INR` |
| `rating` | number | Product rating (0-5) | `4.6` |
| `review_count` | number | Number of reviews | `18000.0` |
| `product_url` | string | Link to product page | `https://www.google.com/search?...` |
| `last_updated` | string | Timestamp of last price check | `2026-08-19T08:48:54.219446+00:00` |

### `comparison.best_option` (Recommendation)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `platform_name` | string | Recommended merchant | `Amazon.in` |
| `price` | number | Best price available | `29990.0` |
| `original_price` | number/null | Original price if discount | `null` |
| `rating` | number | Product rating from this merchant | `4.6` |
| `review_count` | number | Reviews on this merchant listing | `18000` |
| `seller_rating` | number | Seller/merchant rating | `4.5` |
| `score` | number | Recommendation score (0-100) | `85.8` |
| `recommendation_type` | string | Type of recommendation | `BALANCED CHOICE` |
| `explanation` | string | Why this is recommended | `Amazon.in is recommended...` |
| `product_url` | string | URL to product on this merchant | `https://www.google.com/search?...` |

---

## Suggestions Endpoint Response

### `GET /api/v1/search/suggestions?q=sony%20wh`

**Response:**
```json
{
  "query": "sony wh",
  "suggestions": [
    "sony wh-1000xm5",
    "sony wh-1000xm4",
    "sony wh-ch720n",
    "sony wireless headphones",
    "sony wh-ch500",
    "sony wh-1000xm3",
    "sony wh-c600n",
    "sony wh ch510"
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `query` | string | Original query string |
| `suggestions` | array | List of suggested search terms (up to 8) |

---

## Frontend Components Usage

### SearchBar Component
Uses suggestions endpoint to populate dropdown:
```jsx
<SearchBar onSearch={handleSearch} />
// Calls: GET /api/v1/search/suggestions?q=<user-input>
// Debounced at 400ms
```

### SearchResultsPage Component
Uses search results to display:
```jsx
// Displays: candidate_products
// Sorts by: sortBy (relevance, price_asc, price_desc, rating, reviews)
// Filters by: storeFilter, minRating, maxPrice
// Pagination: Load More button uses page parameter
```

### BestOptionCard Component
Uses best_option to show recommendation:
```jsx
<BestOptionCard bestOption={comparison.best_option} />
// Displays: platform_name, price, rating, explanation, score
// Buy Now link: product_url
```

### RelatedProductsGrid Component
Uses candidate_products to show product cards:
```jsx
<RelatedProductsGrid products={candidate_products} />
// Each card shows: image, title, price, store, rating, Buy Now
// Uses: image_url, canonical_name, price, source, rating, product_url
```

---

## Error Responses

### API Error
```json
{
  "status": 400,
  "detail": "Search query cannot be empty."
}
```

### No Results
```json
{
  "query": "xyz12345",
  "count": 0,
  "matched_product": null,
  "candidate_products": [],
  "comparison": null,
  "products": [],
  "totalResults": 0,
  "page": 1,
  "hasMore": false,
  "sources": [],
  "providerNotice": "Shopping data is temporarily unavailable."
}
```

### Provider Unavailable
```json
{
  "query": "test",
  "providerNotice": "External shopping provider is not configured."
}
```

---

## Data Validation Rules

### URLs
- Must start with `http://` or `https://`
- If invalid, field shows `null` or empty string
- Frontend hides "Buy Now" button if URL is empty

### Prices
- Must be numeric
- If missing, displays `null`
- Frontend shows "Price unavailable" if null

### Ratings
- Should be 0-5.0
- Can be `null` if unavailable
- Frontend shows "—" if null

### Images
- Must start with `http://` or `https://`
- If invalid, placeholder shown
- Never fabricated from random URLs

### Product Title
- Always required
- Must match actual product
- Deduplication checks against this field

---

## Pagination Example

### First Request
```
POST /api/v1/search
{
  "query": "laptop",
  "page": 1
}

Response includes:
- "totalResults": 40
- "page": 1
- "hasMore": true
```

### Load More Request
```
POST /api/v1/search
{
  "query": "laptop",
  "page": 2
}

Response appends 40 more products
Frontend aggregates: previous 40 + new 40
```

---

## Common Integration Patterns

### Get All Products
```javascript
// Page 1
const response1 = await searchProducts(query, 'text', 1);
let allProducts = response1.candidate_products;

// Page 2 (if hasMore)
if (response1.hasMore) {
  const response2 = await searchProducts(query, 'text', 2);
  allProducts = [...allProducts, ...response2.candidate_products];
}
```

### Filter on Frontend
```javascript
const filtered = allProducts.filter(p => 
  (selectedStore === 'all' || p.source === selectedStore) &&
  (p.price <= maxPrice || !maxPrice) &&
  (p.rating >= minRating || minRating === 'all')
);
```

### Sort on Frontend
```javascript
const sorted = [...filtered].sort((a, b) => {
  if (sortBy === 'price_asc') return (a.price || Infinity) - (b.price || Infinity);
  if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
  // ... etc
});
```

### Generate Best Option
Backend provides pre-calculated `comparison.best_option`, so frontend just displays it:
```javascript
<BestOptionCard 
  bestOption={result.comparison?.best_option}
/>
```

---

## Notes

1. **Field Names:** Frontend uses `canonical_name`, backend API uses `title` in some responses
2. **Currency:** Always INR (₹) — configured in settings
3. **Timestamps:** ISO 8601 format with timezone info
4. **Images:** From Google Shopping thumbnails — may change
5. **URLs:** Google Shopping redirect URLs — valid and permanent
6. **Deduplication:** Automatic by backend — no duplicates in results
7. **Sorting/Filtering:** Done on frontend from real data, not stored/cached
