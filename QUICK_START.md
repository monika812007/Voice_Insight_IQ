# Quick Start & Testing Guide

## ✅ WHAT'S FIXED

Your Voice Insight IQ application is now powered by **real live product searches** instead of mock data. When you search for a product, you get actual results from 20+ merchants.

## 🚀 TO RUN THE APPLICATION

### 1. Ensure Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Backend Server
```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
# You should see: "Uvicorn running on http://127.0.0.1:8001"
```

### 3. Start Frontend Server (in another terminal)
```bash
cd frontend
npm run dev
# You should see: "Local: http://localhost:5175/" (or similar port)
```

### 4. Open in Browser
Click the link shown or go to: `http://localhost:5175`

---

## 🧪 TRY THESE SEARCHES TO TEST

### Test 1: Suggestions While Typing
1. Focus on the search box
2. Start typing: "sony wh"
3. **Expected:** Real suggestions appear below (Sony WH-1000XM5, Sony WH-1000XM4, etc.)
4. Click a suggestion → search executes

### Test 2: Real Live Search Results
1. Search: "Sony WH-1000XM5"
2. **Expected:** 40 real products appear from merchants like Amazon.in, Vijay Sales, Flipkart, etc.
3. Scroll to see multiple products
4. Each product shows: Title, Price, Store, Rating, Reviews, Image

### Test 3: Buy Now Opens Real Product Page
1. Search for a product
2. Click "Buy Now" on a product card
3. **Expected:** Opens the exact Google Shopping product page for that item
4. NOT the store homepage

### Test 4: Sorting Works
1. Search for "iPhone 15"
2. Use the "Sort" dropdown to try:
   - Relevance (default)
   - Price: Low to High
   - Price: High to Low
   - Rating
   - Most Reviews
3. **Expected:** Results reorder instantly

### Test 5: Filtering Works
1. Search for a product
2. Use filters to try:
   - Select specific store → only that store's products shown
   - Select "4.5+ stars" → only highly rated products shown
   - Enter max price → only products below that price shown
3. **Expected:** Count changes as filters applied

### Test 6: Pagination
1. Search for a product
2. Scroll to bottom
3. Click "Load More Products"
4. **Expected:** More products appear (40+ total available)

### Test 7: Best Option Recommendation
1. Search for "Samsung Galaxy S24"
2. Look for the blue card titled "BEST OPTION" or similar
3. **Expected:** Shows:
   - Recommended platform (e.g., Amazon.in)
   - Best price
   - Why it's recommended (based on score algorithm)
   - Buy Now button for that specific deal

### Test 8: Check Real Merchant Names
Search "HP laptop" and verify you see:
- Amazon.in ✓
- Flipkart ✓
- Vijay Sales ✓
- Croma ✓
- Other real Indian retailers ✓

NOT fake/made-up stores.

---

## 🔍 HOW IT WORKS

### Before (Old Way)
```
Search → Show same 5 hardcoded products
         Show "related products" from demo database
         Suggestions are 22 pre-written product names
         No real data
```

### Now (New Way)
```
Search → Query sent to SerpApi (Google Shopping)
         Real merchants return real current prices
         Suggestions dynamically generated from search trends
         40+ real products displayed
         Best option calculated from all available options
```

---

## ⚙️ CONFIGURATION

### API Key
The SerpApi key is already configured in `backend/.env`:
```
SERPAPI_API_KEY=<your-serpapi-key>
```

### Ports
- **Backend:** `http://localhost:8001`
- **Frontend:** `http://localhost:5175` (or next available port)

If port 8001 is in use:
1. Edit `src/services/api.js`
2. Change `const API_BASE_URL = 'http://localhost:8001/api/v1';`
3. Run `npm run dev` to rebuild

---

## 🆘 TROUBLESHOOTING

### "Connection Refused" Error
**Problem:** Backend not running
**Solution:** Start backend first with: `python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001`

### "No products found"
**Problem:** API rate limit or network issue
**Solution:** Wait 30 seconds and try again. SerpApi has rate limits.

### "Suggestions not appearing"
**Problem:** Debounce waiting for user to stop typing
**Solution:** Wait 400ms after typing stops, then suggestions appear

### "Buy Now opens wrong page"
**Problem:** Cache issue
**Solution:** Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## 📊 EXPECTED RESULTS BY QUERY

| Query | Expected Products | Expected Stores |
|-------|-------------------|-----------------|
| Sony WH-1000XM5 | 40 | Amazon, Vijay, Flipkart, others |
| iPhone 15 | 40 | Amazon, Flipkart, Croma, others |
| Samsung Galaxy S24 | 40 | Multiple retailers |
| HP laptop | 40 | Amazon, Flipkart, Dell, others |
| Nike running shoes | 40 | Sports sites, Amazon, others |

---

## 🎯 KEY FEATURES TO VERIFY

✓ **Exact User Query Used** — Not transformed to generic "headphones"
✓ **Multiple Merchants** — 20+ different stores shown
✓ **Real Prices** — Current prices from actual sellers
✓ **Product Integrity** — Title/price/image/store stay together
✓ **No Fake Data** — All data from SerpApi
✓ **Valid URLs** — Buy Now links work
✓ **Smart Recommendations** — Best option calculated, not just first product
✓ **Sorting & Filtering** — Works on actual result data
✓ **Pagination** — Load more products progressively
✓ **Honest Error States** — Shows "unavailable" if data missing, doesn't fake it

---

## 📝 FILES TO CHECK

If curious about implementation:

**Search Suggestions:**
- `backend/app/providers/serpapi_provider.py` - Line 96 (suggestions method)
- `src/components/SearchBar.jsx` - Dynamic debounced suggestions

**Live Product Search:**
- `backend/app/providers/serpapi_provider.py` - search_products() method
- `backend/app/services/search_service.py` - process_text_search()

**Recommendations:**
- `backend/app/services/recommendation_engine.py` - Scoring algorithm

**Sorting/Filtering:**
- `src/pages/SearchResultsPage.jsx` - Lines 40-70 (sort/filter logic)

---

## 🎓 LEARNING TIPS

1. **See the Data:** Open browser DevTools (F12) → Network tab → Search for a product → See the `/api/v1/search` response
2. **Check Ranking:** Look at `comparison.best_option.score` field to see how recommendations are calculated
3. **Trace a Product:** Find a product in results → Note its `id`, `source`, `price` → Verify they're all from same merchant

---

Ready to test? Open http://localhost:5175 and start searching! 🚀
