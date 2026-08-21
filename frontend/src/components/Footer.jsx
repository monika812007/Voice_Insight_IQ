import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-lg font-bold text-white tracking-tight">VOICE INSIGHT IQ</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-4">
              "Compare Smarter. Buy with Confidence." AI-powered multi-platform e-commerce comparison & recommendation system.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Fact vs AI Interpretation transparency enforced</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Supported Search</h4>
            <ul className="space-y-2 text-sm">
              <li>Text Search Engine</li>
              <li>Voice Recognition API</li>
              <li>Image Feature Embeddings</li>
              <li>Product URL Verification</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Authorized Platforms</h4>
            <ul className="space-y-2 text-sm">
              <li>Amazon India</li>
              <li>Flipkart</li>
              <li>Croma Digital</li>
              <li>Reliance Digital</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 VOICE INSIGHT IQ. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Licensed Integration Architecture v1.1 compliant</p>
        </div>
      </div>
    </footer>
  );
};
