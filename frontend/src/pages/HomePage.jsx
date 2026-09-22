import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { getTrendingProducts } from '../services/api';
import { BuyNowLink } from '../components/BuyNowLink';
import { 
  Sparkles, 
  TrendingDown, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Zap, 
  Heart, 
  Layers, 
  ShoppingBag,
  SlidersHorizontal
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'Fashion & Apparel', label: 'Shirts & Fashion' },
  { id: 'Smartphones', label: 'Smartphones' },
  { id: 'Footwear & Shoes', label: 'Shoes & Sneakers' },
  { id: 'Smartwatches & Watches', label: 'Smartwatches' },
  { id: 'Laptops & Computers', label: 'Laptops' },
  { id: 'Headphones & Audio', label: 'Headphones' },
  { id: 'Televisions', label: '4K Smart TVs' },
  { id: 'Home & Kitchen', label: 'Kitchen & Home' },
  { id: 'Pet Supplies', label: 'Pet Supplies' }
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [allDeals, setAllDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const { isLiked, toggleLiked } = useWishlist();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await getTrendingProducts();
        const deals = res?.data || (Array.isArray(res) ? res : []);
        setAllDeals(deals);
      } catch (error) {
        setAllDeals([]);
      } finally {
        setLoadingDeals(false);
      }
    };

    fetchTrending();
  }, []);

  const handleSearch = (query, searchType) => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
  };

  const openProduct = (productId) => {
    navigate(`/product/${encodeURIComponent(productId)}`);
  };

  const filteredDeals = useMemo(() => {
    return allDeals.filter((deal) => {
      const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory;
      const matchesSearch = !searchFilter.trim() || 
        deal.canonical_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        deal.brand.toLowerCase().includes(searchFilter.toLowerCase()) ||
        deal.category.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allDeals, selectedCategory, searchFilter]);

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative text-center py-10 sm:py-14 space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>AI-Powered Multi-Platform Shopping Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Shop Smarter. <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400">Compare Better.</span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium">
          Compare live prices across Amazon, Flipkart, Croma, Reliance Digital & Myntra with AI-powered recommendations.
        </p>

        {/* Large Multi-Modal Search Bar */}
        <div className="pt-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Popular Quick Search Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <span className="text-xs text-slate-400 font-semibold mr-1">Popular searches:</span>
          {[
            { label: 'Shirts & Apparel', query: 'shirt' },
            { label: 'Smartphones', query: 'iPhone 16' },
            { label: 'Shoes & Sneakers', query: 'shoes' },
            { label: 'Smartwatches', query: 'watch' },
            { label: 'Laptops', query: 'laptop' },
            { label: 'Headphones', query: 'headphones' },
            { label: 'Air Fryer', query: 'air fryer' },
            { label: 'Coffee Cup', query: 'coffee cup' }
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSearch(chip.query, 'text')}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-xl border border-slate-800 transition shadow-sm"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </section>

      {/* Price Drop Notification Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
              <TrendingDown className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
                PRICE DROP ALERT NOTIFICATION
              </span>
              <h3 className="text-xl font-bold text-white">Good news! Apple iPhone 16 128GB dropped by ₹8,000 on Amazon</h3>
              <p className="text-xs text-slate-400 mt-1">
                Price dropped from <span className="line-through">₹54,999</span> to <strong className="text-emerald-400">₹46,999</strong> on Amazon India!
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSearch('iPhone 16 128GB', 'text')}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition shrink-0 flex items-center justify-center space-x-2"
          >
            <span>VIEW DEAL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* All Products & Categories Showcase Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Featured Catalog Products & Multi-Store Deals
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Browse all {allDeals.length} available products across top stores with real price comparisons
            </p>
          </div>

          {/* Search within catalog */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Quick filter products..."
              className="bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-48 sm:w-56"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-slate-400 mr-1">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Category:</span>
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-150 ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingDeals ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse space-y-3">
                <div className="h-44 bg-slate-800 rounded-xl" />
                <div className="h-3 w-20 bg-slate-800 rounded" />
                <div className="h-5 w-3/4 bg-slate-800 rounded" />
                <div className="h-7 w-1/2 bg-slate-800 rounded" />
              </div>
            ))
          ) : filteredDeals.length > 0 ? (
            filteredDeals.map((deal) => (
              <article
                key={deal.id}
                className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-44 bg-slate-950 rounded-xl overflow-hidden mb-4 p-4 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300">
                    <button
                      type="button"
                      onClick={() => openProduct(deal.id)}
                      className="w-full h-full flex items-center justify-center"
                      aria-label={`View ${deal.canonical_name}`}
                    >
                      <img src={deal.image_url} alt={deal.canonical_name} className="h-full object-contain" />
                    </button>
                    {deal.savings > 0 && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        SAVE ₹{deal.savings.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      {deal.platform} • {deal.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleLiked(deal.id)}
                      className="icon-button card-heart p-1 text-slate-400 hover:text-rose-400"
                      aria-label={`${isLiked(deal.id) ? 'Remove' : 'Add'} ${deal.canonical_name} to liked products`}
                    >
                      <Heart size={16} fill={isLiked(deal.id) ? 'currentColor' : 'none'} className={isLiked(deal.id) ? 'text-rose-500' : ''} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openProduct(deal.id)}
                    className="text-left text-sm font-bold text-white group-hover:text-cyan-400 line-clamp-2 transition-colors mb-2"
                  >
                    {deal.canonical_name}
                  </button>

                  <div className="flex items-center space-x-1 text-xs text-amber-400 font-bold mb-3">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{deal.rating ? `${deal.rating} ★` : '4.5 ★'}</span>
                    <span className="text-slate-500 font-normal">verified</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline space-x-2 mb-3">
                    <span className="text-xl font-black text-white">
                      ₹{deal.price.toLocaleString('en-IN')}
                    </span>
                    {deal.original_price > deal.price && (
                      <span className="text-xs text-slate-500 line-through">
                        ₹{deal.original_price.toLocaleString('en-IN')}
                      </span>
                    )}
                    {deal.discount_pct > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        -{deal.discount_pct}%
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openProduct(deal.id)}
                      className="py-2.5 px-2 bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition"
                    >
                      <span>Compare</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <BuyNowLink
                      productUrl={deal.product_url}
                      merchant={deal.platform}
                      productName={deal.canonical_name}
                      className="py-2.5 px-2 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 font-bold text-xs rounded-xl flex items-center justify-center transition"
                    >
                      Buy Now
                    </BuyNowLink>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              No products found matching &ldquo;{searchFilter}&rdquo; in this category.
              <button
                onClick={() => { setSelectedCategory('all'); setSearchFilter(''); }}
                className="block mx-auto mt-3 text-xs text-cyan-400 hover:underline font-bold"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">Multi-Store Price Comparison</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instantly compare real listings from Amazon, Flipkart, Croma, Reliance Digital, and Myntra to get the best effective price.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">AI Review & Sentiment Insight</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our AI engine synthesizes verified reviews across stores into instant pros, cons, and customer satisfaction percentages.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">Direct Verified Store Navigation</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            One-click navigation directly to official store product pages with verified seller ratings and stock availability.
          </p>
        </div>
      </section>
    </div>
  );
};
