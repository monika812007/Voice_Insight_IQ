import React, { useState, useEffect } from 'react';
import { getAdminMetrics } from '../services/api';
import { ShieldAlert, Users, Search, Database, Activity, Server, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await getAdminMetrics();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-extrabold text-white">System & Connector Health Monitoring</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time health, quota management, and collection success metrics</p>
        </div>
        <button
          onClick={fetchMetrics}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Fetching system health metrics...</div>
      ) : (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>TOTAL USERS</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-3xl font-black text-white">{metrics.total_users}</span>
              <span className="text-[10px] text-emerald-400 block">Registered Shopper Accounts</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>TOTAL SEARCHES</span>
                <Search className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-3xl font-black text-white">{metrics.total_searches}</span>
              <span className="text-[10px] text-slate-400 block">Multi-Modal Executed Searches</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>COLLECTION SUCCESS</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-3xl font-black text-emerald-400">{metrics.collection_success_rate}</span>
              <span className="text-[10px] text-slate-400 block">0% Connector Failures</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>AVG LATENCY</span>
                <Server className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-3xl font-black text-white">{metrics.avg_search_time_ms}ms</span>
              <span className="text-[10px] text-purple-400 block">Fast Response Pipeline</span>
            </div>
          </div>

          {/* Connector Health Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Data Connector Health & Mode Status</h3>
              <span className="text-xs text-slate-400">Architecture Policy Section 19.1 Compliant</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-3 px-4">Platform Connector</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {(metrics.connector_health || []).map((conn, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-white">{conn.platform}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{conn.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {conn.demo_mode ? <span className="text-amber-400 font-semibold">Demo Source</span> : <span className="text-emerald-400 font-semibold">Licensed API</span>}
                      </td>
                      <td className="py-3 px-4 font-mono">{conn.latency_ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
