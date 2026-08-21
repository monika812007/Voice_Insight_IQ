# External shopping search

Search uses the backend provider layer. Configure a SerpApi Google Shopping key in `backend/.env` to make external shopping data the primary source:

```env
SERPAPI_API_KEY=your_serpapi_key_here
SHOPPING_LOCATION=India
SHOPPING_COUNTRY=in
SHOPPING_LANGUAGE=en
SHOPPING_PAGE_SIZE=20
```

Never put provider keys in React, browser storage, or frontend environment variables. When no provider is configured, searches use matching records already cached in the existing database and clearly return provider metadata; no products, prices, stores, ratings, or URLs are generated.
# VOICE INSIGHT IQ

> **"Compare Smarter. Buy with Confidence."**

**Voice Insight IQ** is an AI-powered multi-platform e-commerce comparison & recommendation web application. The system helps shoppers answer critical questions before buying:
- *"Where is this product cheaper?"*
- *"Which platform seller should I trust?"*
- *"Are these customer reviews reliable?"*
- *"Am I getting the best effective deal?"*

---

## Key Features

1. **Multi-Modal Product Search**:
   - **Text Search**: Extracts canonical product, brand, model, specs, and budget constraints (e.g. *"cheapest 55 inch smart TV under ₹45000"*).
   - **Voice Search**: Browser Web Speech API (`SpeechRecognition`) integration with sound wave visualizer, transcript editor, and instant query execution.
   - **Image Search**: Drag-and-drop / photo upload with visual feature matching simulation.
   - **URL Search**: Validates product web links from authorized platforms (Amazon, Flipkart, Croma, Reliance Digital).

2. **Data Normalization & Matching Engine**:
   - Normalizes platform raw titles by removing promotional noise (*"SPECIAL OFFER SALE"*).
   - Standardizes listings into a unified `Listing` schema with clear factual attributes.
   - Visually labels Demo Mode listings with a **Demo Data** badge.

3. **Multi-Factor Recommendation Engine**:
   Evaluates candidate listings using a weighted scoring formula:
   $$\text{FinalScore} = 0.40 \times \text{PriceScore} + 0.20 \times \text{SellerScore} + 0.15 \times \text{RatingScore} + 0.10 \times \text{ReviewScore} + 0.10 \times \text{OfferScore} + 0.05 \times \text{AvailabilityScore}$$
   - Modes: `BALANCED CHOICE`, `BEST DEAL`, `BEST RATED`, `BEST SELLER`.
   - Generates natural language explanations grounded strictly in observed listing data.

4. **AI Review Sentiment & Synthesis**:
   - Classifies customer sentiment into Positive %, Neutral %, and Negative %.
   - Extracts aspect pills: Strengths (✓), Complaints (⚠), and Setup Notes (•).

5. **Price History & Trend Analysis**:
   - Interactive visual graph rendering historical price movements across platforms.
   - Displays lowest observed price, highest observed price, and price freshness timestamps (*"Checked 5 mins ago"*).

6. **Direct Purchase Navigation & Compliance**:
   - "BUY NOW" buttons open the original merchant page in a new tab.
   - Visible affiliate disclosure notes enforce transparency.

7. **Notification & History Center**:
   - Price drop alerts on recently searched products.
   - Search trajectory history with replay search buttons.

8. **Admin Dashboard**:
   - System stats, search latency, collection success rate, and connector health monitoring.

---

## Tech Stack

- **Frontend**: React 19 + Vite, Tailwind CSS, Lucide Icons, React Router DOM, Axios.
- **Backend**: Python FastAPI, SQLAlchemy 2.0 ORM, Pydantic V2, PyJWT / Passlib authentication, SQLite / PostgreSQL.
- **Testing**: Pytest automated test suite.

---

## Project Structure

```
Voice Insight IQ/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entrypoint
│   │   ├── core/                       # Config, database, security, dependencies
│   │   ├── models/                     # SQLAlchemy ORM models
│   │   ├── schemas/                    # Pydantic models
│   │   ├── connectors/                 # BaseConnector, DemoConnector, AmazonConnector, ConnectorManager
│   │   ├── services/                   # Product matcher, recommendation engine, search service
│   │   ├── ai/                         # Sentiment analyzer, vision matcher
│   │   └── api/                        # Auth, search, products, reviews, notifications, history, admin
│   ├── data/                           # JSON fixtures (products.json, listings.json, reviews.json, price_history.json)
│   ├── tests/                          # Pytest suite
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar, SearchBar, Modals, Cards, Charts, Tables
│   │   ├── pages/                      # Home, SearchResults, Login, Signup, History, Notifications, Profile, Admin
│   │   ├── services/                   # api.js API client & demo fallback engine
│   │   ├── context/                    # AuthContext
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Quick Start & Running Instructions

### 1. Start the FastAPI Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- Backend API Docs: `http://localhost:8000/api/v1/docs`

### 2. Start the React Frontend

```bash
# In project root
npm install
npm run dev
```
- Open browser at `http://localhost:5173`

---

## Running Automated Tests

```bash
cd backend
python -m pytest tests
```

---

## Adding Licensed E-Commerce APIs Later

Connectors follow the abstract `BaseConnector` class (`backend/app/connectors/base.py`). To add a licensed platform API (e.g. Amazon PA-API or Flipkart Affiliate API):
1. Create a connector class extending `BaseConnector`.
2. Implement `search_products()`, `get_product_listing()`, `get_reviews()`, `normalize_listing()`, and `health_check()`.
3. Add the connector to `ConnectorManager` (`backend/app/connectors/connector_manager.py`).
