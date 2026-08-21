import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { getTrendingProducts } from '../services/api';
import { Sparkles, TrendingDown, Tag, ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const [trendingDeals, setTrendingDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const { isLiked, toggleLiked } = useWishlist();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await getTrendingProducts();
        const deals = res?.data || res || [];
        setTrendingDeals(deals);
      } catch (error) {
        setTrendingDeals([]);
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

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative text-center py-12 sm:py-16 space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>AI-Powered Multi-Platform Shopping Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Shop Smarter. <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400">Compare Better.</span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium">
          Find the right product, compare real prices across stores, and let AI help you choose.
        </p>

        {/* Large Multi-Modal Search Bar */}
        <div className="pt-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Recently Searched Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <span className="text-xs text-slate-400 font-semibold mr-1">Popular searches:</span>
          {['T-shirt', 'Watch', 'Shoes', 'Laptop', 'Headphones', 'Coffee Cup'].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSearch(chip, 'text')}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-1.5 rounded-xl border border-slate-800 transition"
            >
              {chip}
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
              <h3 className="text-xl font-bold text-white">Good news! iPhone 16 128GB dropped by ₹7,000 on Amazon</h3>
              <p className="text-xs text-slate-400 mt-1">
                Price dropped from <span className="line-through">₹79,900</span> to <strong className="text-emerald-400">₹72,900</strong> on Amazon India!
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

      {/* Trending Deals Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Trending Deals Today</h2>
            </div>
            <p className="text-xs text-slate-400">Products with highest effective price discounts right now</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingDeals ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse">
                <div className="h-44 bg-slate-800 rounded-xl mb-4" />
                <div className="h-3 w-20 bg-slate-800 rounded mb-3" />
                <div className="h-5 w-3/4 bg-slate-800 rounded mb-3" />
                <div className="h-7 w-1/2 bg-slate-800 rounded" />
              </div>
            ))
          ) : trendingDeals.length > 0 ? (
            trendingDeals.map((deal) => (
              <article
                key={deal.id}
                className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 shadow-xl hover:shadow-cyan-500/10 cursor-pointer transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <button type="button" onClick={() => openProduct(deal.id)} className="relative w-full h-44 bg-slate-950 rounded-xl overflow-hidden mb-4 p-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300" aria-label={`View ${deal.canonical_name}`}>
                    <img src={deal.image_url} alt={deal.canonical_name} className="h-full object-contain" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      SAVE ₹{deal.savings.toLocaleString('en-IN')}
                    </span>
                  </button>
                  <button type="button" onClick={() => toggleLiked(deal.id)} className="icon-button card-heart" aria-label={`${isLiked(deal.id) ? 'Remove' : 'Add'} ${deal.canonical_name} ${isLiked(deal.id) ? 'from' : 'to'} liked products`}><Heart size={17} fill={isLiked(deal.id) ? 'currentColor' : 'none'} /></button>

                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    {deal.platform} • {deal.category}
                  </span>

                  <button type="button" onClick={() => openProduct(deal.id)} className="text-left text-base font-bold text-white group-hover:text-cyan-400 line-clamp-2 transition-colors mb-2">
                    {deal.canonical_name}
                  </button>
                </div>

                <div>
                  <div className="flex items-baseline space-x-2 mb-3">
                    <span className="text-xl font-black text-white">
                      ₹{deal.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 line-through">
                      ₹{deal.original_price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button type="button" onClick={() => openProduct(deal.id)} className="w-full py-2.5 bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition">
                    <span>Compare All Stores</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              No live trending deals are available right now. Try searching for a product to generate a comparison.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
