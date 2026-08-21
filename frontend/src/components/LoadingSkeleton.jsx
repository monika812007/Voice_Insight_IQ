import React from 'react';
import { AlertTriangle, SearchX, RefreshCw } from 'lucide-react';

export const LoadingSkeleton = ({ text = "Comparing prices & collecting listings..." }) => (
  <div className="w-full max-w-4xl mx-auto py-16 px-4 text-center space-y-6 animate-pulse">
    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold">
      <RefreshCw className="w-4 h-4 animate-spin" />
      <span>{text}</span>
    </div>
    <div className="h-48 bg-slate-900 border border-slate-800 rounded-3xl w-full" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl" />
      <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl" />
      <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl" />
    </div>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="w-full max-w-md mx-auto my-12 p-8 bg-rose-950/20 border border-rose-800/50 rounded-3xl text-center space-y-4">
    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
      <AlertTriangle className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-white">Notice / Error</h3>
    <p className="text-xs text-slate-300">{message || "An unexpected issue occurred while fetching product listings."}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition"
      >
        Retry Search
      </button>
    )}
  </div>
);

export const EmptyState = ({ title = "No Products Found", message = "Try searching for a different product or model name." }) => (
  <div className="w-full max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
      <SearchX className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-white">{title}</h3>
    <p className="text-xs text-slate-400">{message}</p>
  </div>
);
