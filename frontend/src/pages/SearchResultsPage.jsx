import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchByUrl, searchProducts, getProductComparison } from '../services/api';
import { SearchBar } from '../components/SearchBar';
import { BestOptionCard } from '../components/BestOptionCard';
import { ComparisonTable } from '../components/ComparisonTable';
import { ReviewSummaryCard } from '../components/ReviewSummaryCard';
import { PriceHistoryGraph } from '../components/PriceHistoryGraph';
import { RelatedProductsGrid } from '../components/RelatedProductsGrid';
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/LoadingSkeleton';
import { AffiliateDisclosure } from '../components/DemoDataBadge';
import { Sparkles, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || 'iPhone 16';
  const searchType = searchParams.get('type') || 'text';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [priority, setPriority] = useState('balanced'); // balanced, cheapest, best_rated, best_seller
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [storeFilter, setStoreFilter] = useState('all');
  const [minRating, setMinRating] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = searchType === 'url'
        ? await searchByUrl(query)
        : await searchProducts(query, searchType, 1);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch product comparison.');
    } finally {
      setLoading(false);
    }
  }, [query, searchType]);

  const loadMore = async () => {
    if (!result?.hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await searchProducts(query, searchType, (result.page || 1) + 1);
      setResult((current) => ({
        ...current,
        candidate_products: [...(current?.candidate_products || []), ...(next.candidate_products || [])],
        products: [...(current?.products || []), ...(next.products || [])],
        page: next.page,
        hasMore: next.hasMore,
        totalResults: (current?.totalResults || 0) + (next.totalResults || 0),
        sources: [...new Set([...(current?.sources || []), ...(next.sources || [])])],
        lastUpdated: next.lastUpdated || current?.lastUpdated,
      }));
    } catch (err) {
      setError(err.message || 'Unable to load more products.');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleNewSearch = (newQuery, newType) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}&type=${newType}`);
  };

  const matchedProduct = result?.matched_product || (result?.candidate_products && result.candidate_products[0]);
  const candidateProducts = result?.candidate_products || result?.products || [];
  
  // Update best option when priority preference changes
  const comparison = useMemo(() => {
    if (!result?.comparison) return null;
    const base = result.comparison;
    const listings = base.listings || [];
    if (!listings.length) return base;

    let bestOption = listings[0];
    if (priority === 'cheapest') {
      bestOption = listings.reduce((min, cur) => ((cur.offer_price || cur.price) < (min.offer_price || min.price) ? cur : min), listings[0]);
    } else if (priority === 'best_rated') {
      bestOption = listings.reduce((max, cur) => (cur.rating > max.rating ? cur : max), listings[0]);
    } else {
      bestOption = listings.reduce((best, cur) => {
        const bestScore = (best.rating * 20) - ((best.offer_price || best.price) / 1000);
        const curScore = (cur.rating * 20) - ((cur.offer_price || cur.price) / 1000);
        return curScore > bestScore ? cur : best;
      }, listings[0]);
    }

    return {
      ...base,
      best_option: {
        ...bestOption,
        recommendation_type: priority === 'cheapest' ? 'CHEAPEST DEAL' : priority === 'best_rated' ? 'HIGHEST RATED' : 'BALANCED CHOICE',
        score: Math.min(98, Math.max(85, Math.round((bestOption.rating || 4.5) * 19 + 5))),
        explanation: `Offers the best combination of competitive pricing at ₹${(bestOption.offer_price || bestOption.price).toLocaleString('en-IN')}, high customer satisfaction (${bestOption.rating}★), and fast verified delivery.`
      }
    };
  }, [result, priority]);

  const bestOption = comparison?.best_option;
  const stores = [...new Set(candidateProducts.map((product) => product.source || product.store).filter(Boolean))].sort();

  const displayedProducts = useMemo(() => {
    const filtered = candidateProducts.filter((product) => {
      const price = product.price ?? product.offer_price ?? product.extractedPrice;
      const rating = product.rating;
      const productStore = product.source || product.store;
      return (storeFilter === 'all' || productStore === storeFilter)
        && (minRating === 'all' || (rating != null && rating >= Number(minRating)))
        && (!maxPrice || (price != null && price <= Number(maxPrice)));
    });
    return [...filtered].sort((left, right) => {
      const leftPrice = left.price ?? left.offer_price ?? left.extractedPrice ?? Number.POSITIVE_INFINITY;
      const rightPrice = right.price ?? right.offer_price ?? right.extractedPrice ?? Number.POSITIVE_INFINITY;
      if (sortBy === 'price_asc') return leftPrice - rightPrice;
      if (sortBy === 'price_desc') return rightPrice - leftPrice;
      if (sortBy === 'rating') return (right.rating ?? -1) - (left.rating ?? -1);
      if (sortBy === 'reviews') return (right.review_count ?? right.reviews ?? -1) - (left.review_count ?? left.reviews ?? -1);
      return 0;
    });
  }, [candidateProducts, storeFilter, minRating, maxPrice, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Search Bar */}
      <SearchBar onSearch={handleNewSearch} initialQuery={query} />

      {loading && <LoadingSkeleton text={`Searching & comparing prices for "${query}"...`} />}

      {error && <ErrorState message={error} onRetry={fetchResults} />}

      {!loading && !error && (
        <div className="space-y-10 animate-fadeIn">
          {/* Search Query Header */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-400">Search results for</p>
                <h1 className="mt-1 text-3xl sm:text-4xl font-black text-white">“{query}”</h1>
              </div>
              <span className="text-sm text-slate-400 font-medium">{displayedProducts.length} matching product deals found</span>
            </div>

            {/* Filter & Sorting Controls */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
              <label className="text-xs text-slate-400">Sort
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="ml-2 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white">
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </label>
              <label className="text-xs text-slate-400">Store
                <select value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)} className="ml-2 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white">
                  <option value="all">All stores</option>
                  {stores.map((store) => <option key={store} value={store}>{store}</option>)}
                </select>
              </label>
              <label className="text-xs text-slate-400">Rating
                <select value={minRating} onChange={(event) => setMinRating(event.target.value)} className="ml-2 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white">
                  <option value="all">Any rating</option>
                  <option value="4">4+ stars</option>
                  <option value="4.5">4.5+ stars</option>
                </select>
              </label>
              <label className="text-xs text-slate-400">Max price
                <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="No limit" className="ml-2 w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white" />
              </label>
            </div>

            {displayedProducts.length > 0 ? (
              <RelatedProductsGrid products={displayedProducts} onSelectProduct={(id) => navigate(`/product/${encodeURIComponent(id)}`)} />
            ) : (
              <EmptyState title="No products match these filters" message="Adjust the filters above to see more product deals." />
            )}

            {result?.hasMore && (
              <div className="flex justify-center pt-4">
                <button type="button" className="primary-button" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading products...' : 'Load More Products'}
                </button>
              </div>
            )}
          </section>

          {/* Canonical Product Breakdown & Recommendation */}
          {matchedProduct && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-950 rounded-2xl p-4 border border-slate-800 shrink-0 flex items-center justify-center">
                <img src={matchedProduct.image_url || matchedProduct.image} alt={matchedProduct.canonical_name || matchedProduct.title} className="h-full object-contain" />
              </div>

              <div className="flex-1 space-y-3 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40 uppercase">
                    {matchedProduct.brand || 'Product'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                    {matchedProduct.category || 'Deals'}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">✓ Live Store Comparison</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {matchedProduct.canonical_name || matchedProduct.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {matchedProduct.description || 'Verified product specifications and multi-store price comparisons.'}
                </p>

                {matchedProduct.specs && (
                  <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
                    {Object.entries(matchedProduct.specs).filter(([k]) => !k.startsWith('_')).map(([key, val]) => (
                      <span key={key} className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                        <strong className="capitalize text-slate-400">{key}:</strong> {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BEST OPTION CARD */}
          {bestOption && (
            <section>
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 mb-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  <span>Recommendation Engine Priority:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'balanced', label: 'Balanced Choice' },
                    { id: 'cheapest', label: 'Cheapest Deal' },
                    { id: 'best_rated', label: 'Best Product Rating' },
                    { id: 'best_seller', label: 'Top Seller Quality' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setPriority(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${priority === item.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <BestOptionCard bestOption={bestOption} />
            </section>
          )}

          {/* PLATFORM COMPARISON TABLE */}
          {comparison?.listings?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">Available Platform Listings</h2>
                <span className="text-xs text-slate-400">Comparing {comparison.listings.length} verified stores</span>
              </div>
              <ComparisonTable listings={comparison.listings} />
              <AffiliateDisclosure />
            </section>
          )}

          {/* AI REVIEW ANALYSIS */}
          {comparison?.review_analysis && (
            <section>
              <ReviewSummaryCard reviewAnalysis={comparison.review_analysis} />
            </section>
          )}

          {/* PRICE HISTORY GRAPH */}
          {comparison?.price_history && (
            <section>
              <PriceHistoryGraph
                priceHistory={comparison.price_history}
                lowestPrice={comparison.lowest_observed_price}
                highestPrice={comparison.highest_observed_price}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
};
