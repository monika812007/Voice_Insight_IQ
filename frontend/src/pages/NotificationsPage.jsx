import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../services/api';
import { Bell, TrendingDown, Check, Trash2, ArrowRight } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotif = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-white">Price Alerts & Notifications</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Receive automated updates when recently searched products drop in price</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading price drop notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <Bell className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Price Drop Alerts Yet</h3>
          <p className="text-xs text-slate-400">Search for products to enable automated price tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                notif.read
                  ? 'bg-slate-900/60 border-slate-800'
                  : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 shadow-lg'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Price Drop Detected
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white mt-1 leading-snug">
                    {notif.message}
                  </p>
                  {notif.old_price && notif.new_price && (
                    <div className="flex items-center space-x-3 mt-2 text-xs">
                      <span className="text-slate-400 line-through">₹{notif.old_price.toLocaleString('en-IN')}</span>
                      <span className="text-emerald-400 font-bold">₹{notif.new_price.toLocaleString('en-IN')}</span>
                      {notif.savings && (
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                          Save ₹{notif.savings.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => navigate(`/search?q=${encodeURIComponent(notif.platform_name ? notif.message.split(' is now ')[0] : 'iPhone 16')}&type=text`)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center space-x-1"
                >
                  <span>View Deal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {!notif.read && (
                  <button
                    onClick={() => markRead(notif.id)}
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotif(notif.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                  title="Delete notification"
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
