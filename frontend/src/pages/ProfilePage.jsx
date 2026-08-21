import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Settings, Save, Globe, Sliders, ShieldCheck } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();

  const [currency, setCurrency] = useState('INR (₹)');
  const [defaultPriority, setDefaultPriority] = useState('balanced');
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg('Preferences saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xl shadow-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{user?.name || 'Shopper Account'}</h1>
            <p className="text-xs text-slate-400">{user?.email || 'shopper@example.com'}</p>
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Application Settings & Localization</h3>
        </div>

        {/* Currency & Locale Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              <Globe className="w-4 h-4 text-cyan-400 inline mr-1" />
              Configured Display Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="INR (₹)">Indian Rupee - INR (₹)</option>
              <option value="USD ($)">US Dollar - USD ($)</option>
              <option value="EUR (€)">Euro - EUR (€)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              <Sliders className="w-4 h-4 text-indigo-400 inline mr-1" />
              Default Recommendation Algorithm Priority
            </label>
            <select
              value={defaultPriority}
              onChange={(e) => setDefaultPriority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="balanced">Balanced Choice (Price + Rating + Seller)</option>
              <option value="cheapest">Cheapest Price First</option>
              <option value="best_rated">Highest Product Rating</option>
              <option value="best_seller">Top Rated Seller Quality</option>
            </select>
          </div>
        </div>

        {/* Price Drop Alert Checkbox */}
        <div className="pt-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableAlerts}
              onChange={(e) => setEnableAlerts(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
            />
            <span className="text-xs font-semibold text-slate-300">
              Enable Price Drop Notifications for recently searched items
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Account Preferences</span>
        </button>
      </form>
    </div>
  );
};
