import React from 'react';

export const ReviewSentimentChart = ({ breakdown }) => {
  const { positive_percent = 80, neutral_percent = 12, negative_percent = 8 } = breakdown || {};

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
        <span>Sentiment Distribution</span>
        <div className="flex items-center space-x-4">
          <span className="text-emerald-400">Positive: {positive_percent}%</span>
          <span className="text-slate-400">Neutral: {neutral_percent}%</span>
          <span className="text-rose-400">Negative: {negative_percent}%</span>
        </div>
      </div>

      {/* Multi-segment sentiment bar */}
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
        <div
          style={{ width: `${positive_percent}%` }}
          className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
          title={`Positive ${positive_percent}%`}
        />
        <div
          style={{ width: `${neutral_percent}%` }}
          className="h-full bg-slate-500 transition-all duration-500"
          title={`Neutral ${neutral_percent}%`}
        />
        <div
          style={{ width: `${negative_percent}%` }}
          className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
          title={`Negative ${negative_percent}%`}
        />
      </div>
    </div>
  );
};
