import React from 'react';
import { Star } from 'lucide-react';
import { BuyNowLink } from './BuyNowLink';

export const ComparisonTable = ({ listings }) => {
  if (!listings || listings.length === 0) return null;

  return (
    <div className="w-full">
      {/* Desktop Table View (md & above) */}
      <div className="hidden md:block overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Product</th>
              <th className="py-4 px-6">Store</th>
              <th className="py-4 px-6">Current Price</th>
              <th className="py-4 px-6">Rating</th>
              <th className="py-4 px-6">Reviews</th>
              <th className="py-4 px-6">Availability</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-sm">
            {listings.map((l) => {
              const currentPrice = l.offer_price ?? l.price ?? null;
              const origPrice = l.original_price ?? null;
              const savings = origPrice != null && currentPrice != null && origPrice > currentPrice ? origPrice - currentPrice : 0;

              return (
                <tr key={l.id} className="hover:bg-slate-800/40 transition">
                  {/* Product */}
                  <td className="py-4 px-6">
                    <div className="flex min-w-56 max-w-[22rem] items-center gap-3 overflow-hidden">
                      {l.image && <img src={l.image} alt="" className="h-12 w-12 rounded-lg bg-slate-950 object-contain" />}
                      <span className="min-w-0 break-words font-semibold text-white line-clamp-2">{l.title || 'Product name unavailable'}</span>
                    </div>
                  </td>

                  {/* Store */}
                  <td className="py-4 px-6">
                    <span className="font-extrabold text-white tracking-wide">{l.platform_name || 'Not available'}</span>
                  </td>

                  {/* Current Price */}
                  <td className="py-4 px-6">
                    <span className="text-lg font-black text-white">
                      {currentPrice != null ? `₹${currentPrice.toLocaleString('en-IN')}` : 'Price unavailable'}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-6">
                    {l.rating != null ? <div className="flex items-center gap-1 font-bold text-white"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span>{l.rating}</span></div> : <span className="text-slate-500">Not available</span>}
                  </td>

                  {/* Reviews */}
                  <td className="py-4 px-6">
                    {l.review_count != null ? Number(l.review_count).toLocaleString('en-IN') : <span className="text-slate-500">Not available</span>}
                  </td>

                  {/* Availability */}
                  <td className="py-4 px-6 text-xs text-slate-400">
                    {l.availability || 'Not available'}
                  </td>

                  {/* Action Button */}
                  <td className="py-4 px-6 text-right">
                    <BuyNowLink
                      productUrl={l.product_url}
                      providerProductToken={l.provider_product_token}
                      merchant={l.platform_name}
                      productName={l.title || l.canonical_name}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View (sm & below) */}
      <div className="block md:hidden space-y-4">
        {listings.map((l) => {
          const currentPrice = l.offer_price ?? l.price ?? null;
          const origPrice = l.original_price ?? null;
          const savings = origPrice != null && currentPrice != null && origPrice > currentPrice ? origPrice - currentPrice : 0;

          return (
            <div key={l.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-base">{l.platform_name || 'Not available'}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{l.rating != null ? `${l.rating} ★` : 'Not available'}</span>
                </div>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-white">
                  {currentPrice != null ? `₹${currentPrice.toLocaleString('en-IN')}` : 'Price unavailable'}
                </span>
                {savings > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{origPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {savings > 0 && (
                  <span className="text-xs font-bold text-emerald-400">
                    Save ₹{savings.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                <span>Reviews: <strong>{l.review_count != null ? Number(l.review_count).toLocaleString('en-IN') : 'Not available'}</strong></span>
                <span>{l.availability || 'Not available'}</span>
              </div>

              <BuyNowLink
                productUrl={l.product_url}
                providerProductToken={l.provider_product_token}
                merchant={l.platform_name}
                productName={l.title || l.canonical_name}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
              >
                BUY NOW ON {l.platform_name.toUpperCase()}
              </BuyNowLink>
            </div>
          );
        })}
      </div>
    </div>
  );
};
