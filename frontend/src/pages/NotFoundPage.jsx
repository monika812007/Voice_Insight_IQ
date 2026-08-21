import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
    <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
      <Sparkles className="w-8 h-8" />
    </div>
    <h1 className="text-4xl font-extrabold text-white tracking-tight">404 - Page Not Found</h1>
    <p className="text-sm text-slate-400 max-w-sm">The page or comparison view you are looking for does not exist.</p>
    <Link
      to="/home"
      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Return to Home Dashboard</span>
    </Link>
  </div>
);
