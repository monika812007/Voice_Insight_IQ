import React from 'react';
import { Sparkles, Star, ShieldCheck, Award } from 'lucide-react';
import { BuyNowLink } from './BuyNowLink';

export const BestOptionCard = ({ bestOption }) => {
  if (!bestOption) return null;

  const {
    platform_name,
    platform_logo,
    price,
    original_price,
    offer_price,
    savings,
    rating,
    review_count,
    seller_name,
    seller_rating,
    recommendation_type = "BALANCED CHOICE",
    explanation,
    product_url,
    provider_product_token,
  } = bestOption;

  const currentDisplayPrice = offer_price ?? price ?? null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10">
      {/* Decorative Glow background */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-cyan-500 to-indigo-600 text-white uppercase tracking-wider shadow-lg shadow-cyan-500/20">
            <Award className="w-4 h-4 text-amber-300" />
            <span>{recommendation_type}</span>
          </span>
          <span className="inline-flex items-center space-x-1 text-xs text-cyan-400 font-semibold bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Score: {bestOption.score}/100</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Platform & Price details */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center space-x-3">
            {platform_logo ? (
              <img src={platform_logo} alt={platform_name} className="h-7 object-contain bg-white/10 rounded px-2 py-1" />
            ) : (
              <span className="text-xl font-bold text-white">{platform_name}</span>
            )}
            <span className="text-sm font-semibold text-slate-300">Listing Option</span>
          </div>

          {/* Large Price Display */}
          <div className="flex items-baseline space-x-3">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {currentDisplayPrice != null ? `₹${currentDisplayPrice.toLocaleString('en-IN')}` : 'Price unavailable'}
            </span>
            {original_price && original_price > currentDisplayPrice && (
              <span className="text-xl text-slate-500 line-through font-semibold">
                ₹{original_price.toLocaleString('en-IN')}
              </span>
            )}
            {savings > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SAVE ₹{savings.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Ratings & Seller info */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
            <div className="flex items-center space-x-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">{rating ?? 'Rating unavailable'}</span>
              <span className="text-xs text-slate-400">{review_count != null ? `(${review_count.toLocaleString()} reviews)` : '(Reviews unavailable)'}</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Seller:</span>
              <span className="font-semibold text-slate-200">{seller_name}</span>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                {seller_rating} ★
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Explanation & Purchase Action */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Why Voice Insight IQ Recommends This</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              "{explanation}"
            </p>
          </div>

          <BuyNowLink
            productUrl={product_url}
            providerProductToken={provider_product_token}
            merchant={platform_name}
            productName={bestOption.title || bestOption.canonical_name}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-500/25 transition duration-200 flex items-center justify-center space-x-2 group"
          >
            BUY NOW ON {(platform_name || '').toUpperCase()}
          </BuyNowLink>
        </div>
      </div>
    </div>
  );
};
