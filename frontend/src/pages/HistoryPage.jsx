import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchHistory } from '../services/api';
import { History, Search, Trash2, Mic, Image as ImageIcon, Link2, ExternalLink } from 'lucide-react';

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getSearchHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (id) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const getSearchIcon = (type) => {
    switch (type) {
      case 'voice': return <Mic className="w-4 h-4 text-cyan-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case 'url': return <Link2 className="w-4 h-4 text-indigo-400" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-white">Search & Price History</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Review past product comparisons and track observed prices</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setHistory([])}
            className="px-3 py-1.5 bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-semibold rounded-xl border border-slate-800 transition"
          >
            Clear All History
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading search history...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Search History Found</h3>
          <p className="text-xs text-slate-400">Search for products using text, voice, image or URL to record history.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                  {getSearchIcon(item.search_type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{item.query}</h3>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                      {item.search_type}
                    </span>
                  </div>
                  {item.matched_product_name && (
                    <p className="text-xs text-slate-400 mt-1">Matched: {item.matched_product_name}</p>
                  )}
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Searched on {new Date(item.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {item.lowest_price && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Lowest Found</span>
                    <span className="text-sm font-black text-emerald-400">₹{item.lowest_price.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/search?q=${encodeURIComponent(item.query)}&type=${item.search_type}`)}
                  className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                >
                  Search Again
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
