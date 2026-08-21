import React from 'react';

export const DemoDataBadge = ({ text = "Demo Data" }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse"></span>
    {text}
  </span>
);

export const AffiliateDisclosure = () => (
  <div className="text-xs text-slate-400 bg-slate-900/50 border border-slate-800 rounded-lg p-3 my-4">
    <p>
      <span className="font-semibold text-slate-300">Disclosure:</span> Voice Insight IQ compares available platform options to find the best deal. Clicking "BUY NOW" redirects you directly to the authorized merchant's original product page. Outbound links may contain affiliate tags that support our platform at no extra cost to you.
    </p>
  </div>
);
