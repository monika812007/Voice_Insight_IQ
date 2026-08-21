import React from 'react';
import { TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const PriceHistoryGraph = ({ priceHistory = [], lowestPrice, highestPrice }) => {
  const displayHistory = (priceHistory || []).filter((item) => item?.price != null);
  const prices = displayHistory.map((item) => Number(item.price)).filter(Number.isFinite);
  const minP = lowestPrice ?? (prices.length ? Math.min(...prices) : null);
  const maxP = highestPrice ?? (prices.length ? Math.max(...prices) : null);

  if (!displayHistory.length || minP == null || maxP == null) {
    return (
      <div className="price-history-panel bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center space-x-2">
          <TrendingDown className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Price History & Trend Analysis</h3>
        </div>
        <p className="mt-2 text-xs text-slate-400">No provider price history is available for this product yet.</p>
      </div>
    );
  }

  return (
    <div className="price-history-panel bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Price History & Trend Analysis</h3>
          </div>
          <p className="text-xs text-slate-400">Observed price trajectory over recent observation window</p>
        </div>

        {/* Price Extremes Stats */}
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Lowest Observed</span>
            <span className="text-emerald-400 font-bold text-sm">₹{minP.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Highest Observed</span>
            <span className="text-rose-400 font-bold text-sm">₹{maxP.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Visual Chart Representation */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
        <div className="h-48 flex items-end justify-between space-x-4 pt-6 pb-2 px-4 border-b border-slate-800/80 relative">
          {/* Horizontal Reference Lines */}
          <div className="absolute inset-x-0 top-4 border-b border-slate-800/40 text-[10px] text-slate-600 pl-2">
            ₹{maxP.toLocaleString('en-IN')}
          </div>
          <div className="absolute inset-x-0 bottom-8 border-b border-slate-800/40 text-[10px] text-slate-600 pl-2">
            ₹{minP.toLocaleString('en-IN')}
          </div>

          {displayHistory.map((item, idx) => {
            const itemPrice = Number(item.price);
            const heightPct = Math.max(20, Math.min(100, ((itemPrice - minP) / (maxP - minP || 1)) * 80 + 20));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded shadow border border-slate-700 pointer-events-none whitespace-nowrap z-10">
                  ₹{itemPrice.toLocaleString('en-IN')}
                </div>

                {/* Animated Price Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-cyan-600 to-emerald-400 rounded-t-xl group-hover:from-cyan-500 group-hover:to-emerald-300 transition-all duration-300 shadow-lg shadow-cyan-500/10"
                />

                <span className="mt-2 text-[11px] text-slate-400 font-medium">{item.date}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span>{[...new Set(displayHistory.map((item) => item.merchant).filter(Boolean))].join(' / ') || 'Returned merchant listings'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-indigo-400" />
            <span>Actual provider observations</span>
          </div>
        </div>
      </div>
    </div>
  );
};
