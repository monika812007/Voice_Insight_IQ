import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Sparkles, Search, History, Bell, Heart, LogOut, LogIn, X, Settings } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const navClass = (path) => `flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(path) ? 'active-nav' : 'nav-link'}`;

  return (
    <header className="site-navbar sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/75 shadow-lg shadow-black/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-400 tracking-tight">
                VOICE INSIGHT <span className="text-cyan-400">IQ</span>
              </span>
              <span className="block text-[10px] font-medium text-cyan-400/80 uppercase tracking-wider">
                AI Comparison Assistant
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="site-navbar-nav hidden md:flex items-center space-x-1">
            <Link
              to="/home"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/home') || isActive('/')
                ? 'bg-slate-800/90 text-cyan-400 border border-slate-700/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
            >
              Home
            </Link>
            <Link to="/search?q=&type=text" className={navClass('/search')}>Explore</Link>
            <Link to="/compare" className={navClass('/compare')}>Compare</Link>
            <Link to="/liked" className={navClass('/liked')}><Heart className="w-4 h-4" />Liked</Link>
            <Link
              to="/search"
              className={navClass('/search')}
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search</span>
            </Link>
            <Link
              to="/history"
              className={navClass('/history')}
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>History</span>
            </Link>
            <Link
              to="/notifications"
              className={`${navClass('/notifications')} relative`}
            >
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Alerts</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-2 right-2" />
            </Link>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center space-x-3">
            <Link to="/settings" className="icon-button" aria-label="Settings" title="Settings"><Settings className="w-4 h-4" /></Link>
            <button type="button" className="md:hidden p-2 text-slate-300 hover:text-cyan-300" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-900 border border-slate-800/80 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-200">
                    {user.name || 'Shopper'}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 transition duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
        {menuOpen && (
          <nav className="site-navbar-mobile md:hidden border-t border-slate-800/80 py-3 space-y-1">
            {[
              ['/home', 'Home'],
              ['/search?q=&type=text', 'Explore'],
              ['/compare', 'Compare'],
              ['/liked', 'Liked'],
              ['/history', 'History'],
              ['/notifications', 'Alerts'],
              ['/settings', 'Settings'],
            ].map(([path, label]) => <Link key={`${label}-${path}`} to={path} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-cyan-300">{label}</Link>)}
          </nav>
        )}
      </div>
    </header>
  );
};
