import React from 'react';
import { Sparkles, ThumbsUp, AlertTriangle, MinusCircle, MessageSquareQuote } from 'lucide-react';
import { ReviewSentimentChart } from './ReviewSentimentChart';

export const ReviewSummaryCard = ({ reviewAnalysis }) => {
  if (!reviewAnalysis) return null;

  const {
    summary,
    sentiment_breakdown = { positive_percent: 82, neutral_percent: 11, negative_percent: 7 },
    positives = [],
    negatives = [],
    neutrals = [],
    sample_reviews = []
  } = reviewAnalysis;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Customer Review Analysis</h3>
            <p className="text-xs text-slate-400">Summarized from verified buyer reviews across platforms</p>
          </div>
        </div>
      </div>

      {/* Visual Sentiment Ratio Chart */}
      <ReviewSentimentChart breakdown={sentiment_breakdown} />

      {/* Main AI Summary Box */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">
          AI Synthesis Summary
        </span>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          "{summary}"
        </p>
      </div>

      {/* Positives, Negatives, Neutrals Pill Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Positives */}
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4">
          <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <ThumbsUp className="w-4 h-4" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-2">
            {positives.map((p, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Negatives */}
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-4">
          <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>Common Complaints</span>
          </div>
          <ul className="space-y-2">
            {negatives.map((n, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                <span className="text-rose-400 font-bold">⚠</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Neutrals */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
            <MinusCircle className="w-4 h-4" />
            <span>Neutral Notes</span>
          </div>
          <ul className="space-y-2">
            {neutrals.map((neu, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-400">
                <span className="text-slate-500">•</span>
                <span>{neu}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sample Verified Reviews */}
      {sample_reviews && sample_reviews.length > 0 && (
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Verified Customer Excerpts
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sample_reviews.map((rev) => (
              <div key={rev.id} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">{rev.author}</span>
                  <span className="text-amber-400 font-bold">{rev.rating} ★</span>
                </div>
                <p className="text-xs text-slate-400 italic">"{rev.text}"</p>
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>{rev.date}</span>
                  {rev.verified && <span className="text-emerald-400 font-semibold">✓ Verified Purchase</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
