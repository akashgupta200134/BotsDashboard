import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart2, RefreshCw } from 'lucide-react';
import api from '../api/axios';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#64748b'];

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/logs/analytics/summary')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-center" style={{ minHeight: 400 }}>
      <div className="text-center text-gray-400">
        <RefreshCw size={24} className="mx-auto mb-2 animate-spin opacity-40" />
        Loading analytics...
      </div>
    </div>
  );

  const successRate = data.totalRuns
    ? Math.round((data.successRuns / data.totalRuns) * 100)
    : 0;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <BarChart2 size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
              <p className="text-gray-400 text-sm">Bot execution insights</p>
            </div>
          </div>
          <button onClick={load} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Runs"    value={data.totalRuns}   color="text-gray-900" />
        <StatCard label="Successful"    value={data.successRuns} color="text-green-600" />
        <StatCard label="Failed"        value={data.failedRuns}  color="text-red-500" />
        <StatCard label="Success Rate"  value={`${successRate}%`} color="text-indigo-600" sub="overall" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Last 7 Days Line Chart */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Runs — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Success" />
              <Line type="monotone" dataKey="failed"  stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Failed" />
              <Line type="monotone" dataKey="total"   stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} name="Total" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By Type Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-">Runs by Bot Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.byType} dataKey="count" nameKey="bot_type" cx="50%" cy="51%" outerRadius={80} label={({ bot_type, percent }) => `${bot_type} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Bots Bar Chart */}
  {/* Top Bots Bar Chart */}
<div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
  <h3 className="font-semibold text-gray-800 mb-4">Top Bots by Run Count</h3>
  <ResponsiveContainer width="100%" height={data.byBot.length * 50 + 60}>  {/* ← dynamic height */}
    <BarChart data={data.byBot} layout="vertical" margin={{ left: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
      <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
      <YAxis type="category" dataKey="bot_name" tick={{ fontSize: 11, fill: '#64748b' }} width={150} />
      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Bar dataKey="success" fill="#10b981" radius={[0, 4, 4, 0]} name="Success" stackId="a" />
      <Bar dataKey="total"   fill="#e2e8f0" radius={[0, 4, 4, 0]} name="Total"   stackId="b" />
    </BarChart>
  </ResponsiveContainer>
</div>

    </div>
  );
}