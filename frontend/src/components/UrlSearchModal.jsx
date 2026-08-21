import React, { useState } from 'react';
import { Link2, X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const ALLOWED_DOMAINS = ["amazon.in", "amazon.com", "flipkart.com", "croma.com", "reliancedigital.in"];

export const UrlSearchModal = ({ isOpen, onClose, onSearch }) => {
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [validDomain, setValidDomain] = useState(null);

  const handleUrlChange = (val) => {
    setUrlInput(val);
    setErrorMsg('');
    setValidDomain(null);

    if (!val.trim()) return;

    try {
      const parsed = new URL(val.trim());
      const host = parsed.hostname.toLowerCase();
      const matched = ALLOWED_DOMAINS.find(d => host.includes(d));
      if (matched) {
        setValidDomain(matched);
      } else {
        setErrorMsg(`Domain '${host}' is not in allowed platform list. Supported: Amazon, Flipkart, Croma, Reliance Digital.`);
      }
    } catch (e) {
      if (val.length > 8) {
        setErrorMsg('Please enter a valid URL starting with http:// or https://');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim() && !errorMsg) {
      onSearch(urlInput.trim(), 'url');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <Link2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Paste Product Link</h3>
          <p className="text-sm text-slate-400">Enter a supported product web link from Amazon, Flipkart, or Croma</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Product URL:</label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.amazon.in/dp/B0DGJ9XZQ7"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {validDomain && (
            <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified authorized domain: <strong>{validDomain}</strong></span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start space-x-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!urlInput.trim() || !!errorMsg}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
          >
            <span>Extract & Compare Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500">
          <p>Voice Insight IQ never accesses non-permitted domains or attempts to bypass access controls.</p>
        </div>
      </div>
    </div>
  );
};
