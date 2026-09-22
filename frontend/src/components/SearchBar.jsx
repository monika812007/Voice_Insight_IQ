import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, Image as ImageIcon, Link2, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { getSearchSuggestions } from '../services/api';
import { VoiceSearchModal } from './VoiceSearchModal';
import { ImageUploadModal } from './ImageUploadModal';
import { UrlSearchModal } from './UrlSearchModal';

const POPULAR_SEARCHES = [
  "Apple iPhone 16 (128 GB)",
  "Samsung Galaxy S25 5G",
  "Sony WH-1000XM5 Wireless Headphones",
  "Apple Watch Series 10 Smartwatch",
  "HP Pavilion 15 Core i7 Laptop",
  "Dell XPS 15 OLED Laptop",
  "Samsung 55 inch Crystal 4K Smart TV",
  "Nike Air Force 1 '07 Sneakers",
  "Levi's Men's Graphic Crew Neck T-Shirt",
  "Levi's 501 Original Fit Jeans",
  "Philips Digital Air Fryer (4.1L)",
  "Ceramic Insulated Travel Coffee Mug & Cup",
  "boAt Rockerz 450 Bluetooth Headphones",
  "Royal Canin Kitten Dry Food & Care Kit"
];

export const SearchBar = ({ onSearch, initialQuery = '', className = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isUrlOpen, setIsUrlOpen] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const cleanQuery = query.trim();
    let cancelled = false;

    const fetchSuggestions = async () => {
      try {
        const response = await getSearchSuggestions(cleanQuery);
        if (!cancelled) {
          const list = Array.isArray(response)
            ? response
            : (response?.suggestions || response?.data || []);
          const normalized = list.map((item) => typeof item === 'string' ? { name: item } : item);
          setSuggestions(normalized.length > 0 ? normalized : POPULAR_SEARCHES.map(name => ({ name })));
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setSuggestions(POPULAR_SEARCHES.map(name => ({ name })));
        }
      }
    };

    const timer = setTimeout(fetchSuggestions, cleanQuery ? 150 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query.trim(), 'text');
    }
  };

  const handleSuggestionClick = (name) => {
    setQuery(name);
    setShowDropdown(false);
    onSearch(name, 'text');
  };

  const handleKeyDown = (e) => {
    const activeList = suggestions.length > 0 ? suggestions : POPULAR_SEARCHES.map(name => ({ name }));
    if (!showDropdown || activeList.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, activeList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(activeList[activeIndex].name);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const displayedSuggestions = suggestions.length > 0
    ? suggestions
    : POPULAR_SEARCHES.map(name => ({ name }));

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="search-bar-shell relative flex items-center bg-slate-900/90 border-2 border-slate-700/80 focus-within:border-cyan-500 rounded-2xl shadow-xl shadow-cyan-500/5 backdrop-blur-xl transition-all duration-300">
          <div className="pl-4 text-slate-400">
            <Search className="w-6 h-6 text-cyan-400" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for any product (iPhone 16, Watch, Shoes, Laptop, TV, T-Shirt, Coffee Mug)..."
            className="search-bar-input w-full bg-transparent py-4 pl-3 pr-40 text-white placeholder-slate-400 text-base focus:outline-none"
            autoComplete="off"
          />

          {/* Quick Action Icons inside/around search bar */}
          <div className="absolute right-3 flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition"
              title="Search using Voice"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsImageOpen(true)}
              className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-xl transition"
              title="Search using Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsUrlOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition"
              title="Paste Product Link"
            >
              <Link2 className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center space-x-1"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Autocomplete Suggestions Dropdown ── */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/40 z-50 animate-fadeIn"
          >
            <div className="px-4 pt-3 pb-1 flex items-center justify-between text-[10px] font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {query.trim() ? "Suggested Products & Matches" : "Popular Catalog Products"}
              </span>
              <span className="text-slate-500 font-normal lowercase">{displayedSuggestions.length} products available</span>
            </div>

            {displayedSuggestions.map((s, idx) => (
              <button
                key={`${s.name}_${idx}`}
                type="button"
                onMouseDown={() => handleSuggestionClick(s.name)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition ${idx === activeIndex
                  ? 'bg-cyan-500/10 text-cyan-300'
                  : 'hover:bg-slate-800/70 text-slate-200'
                  }`}
              >
                {query.trim() ? (
                  <Search className="w-4 h-4 text-cyan-500 shrink-0" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.name}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 group-hover:text-cyan-400" />
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Alternative Method Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-slate-400">
        <span className="text-slate-500 font-medium">Or search using:</span>
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-cyan-400 transition"
        >
          <Mic className="w-3.5 h-3.5 text-cyan-400" />
          <span>Voice Search</span>
        </button>
        <button
          onClick={() => setIsImageOpen(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-purple-400 transition"
        >
          <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
          <span>Image Matcher</span>
        </button>
        <button
          onClick={() => setIsUrlOpen(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-indigo-400 transition"
        >
          <Link2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Paste Product URL</span>
        </button>
      </div>

      {/* Search Modals */}
      <VoiceSearchModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} onSearch={onSearch} />
      <ImageUploadModal isOpen={isImageOpen} onClose={() => setIsImageOpen(false)} onSearch={onSearch} />
      <UrlSearchModal isOpen={isUrlOpen} onClose={() => setIsUrlOpen(false)} onSearch={onSearch} />
    </div>
  );
};
