import { useEffect, useState } from 'react';
import { Bot, Globe, CheckCircle, XCircle, Activity, Clock } from 'lucide-react';
import api from '../api/axios';

const TYPE_COLORS = {
  PAD: 'bg-blue-500/20 text-blue-400',
  Playwright: 'bg-emerald-500/20 text-emerald-400',
};
const STATUS_COLORS = {
  idle: 'bg-slate-700 text-slate-400',
  running: 'bg-blue-500/20 text-blue-400',
  success: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
};

export default function Dashboard() {
  const [bots, setBots] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/bots').then(r => setBots(r.data));
    api.get('/logs').then(r => setLogs(r.data.slice(0, 8)));
  }, []);

  const pad = bots.filter(b => b.type === 'PAD');
  const pw  = bots.filter(b => b.type === 'Playwright');

  const stats = [
    { label: 'Total Bots',  value: bots.length,                               icon: Activity,     color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'PAD Bots',    value: pad.length,                                 icon: Bot,          color: 'text-blue-400',   bg: 'bg-blue-500/10' },
    { label: 'Playwright',  value: pw.length,                                  icon: Globe,        color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
    { label: 'Running',     value: bots.filter(b => b.status === 'running').length, icon: Clock,   color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Successful',  value: bots.filter(b => b.status === 'success').length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Failed',      value: bots.filter(b => b.status === 'failed').length,  icon: XCircle, color: 'text-red-400',    bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Bots */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">All Bots</h2>
            <span className="text-xs text-slate-600">{bots.length} total</span>
          </div>
          <div className="divide-y divide-slate-800/50">
            {bots.slice(0, 8).map(bot => (
              <div key={bot.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/30 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${bot.status === 'running' ? 'bg-blue-400 animate-pulse' : bot.status === 'success' ? 'bg-green-400' : bot.status === 'failed' ? 'bg-red-400' : 'bg-slate-600'}`} />
                <span className="text-white text-sm flex-1 truncate">{bot.name}</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${TYPE_COLORS[bot.type]}`}>{bot.type}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[bot.status]}`}>{bot.status}</span>
              </div>
            ))}
            {bots.length === 0 && <div className="py-10 text-center text-slate-600 text-sm">No bots yet</div>}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">Recent Activity</h2>
            <span className="text-xs text-slate-600">{logs.length} entries</span>
          </div>
          <div className="divide-y divide-slate-800/50">
            {logs.map(log => (
              <div key={log.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/30 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === 'success' ? 'bg-green-400' : log.status === 'failed' ? 'bg-red-400' : 'bg-blue-400 animate-pulse'}`} />
                <span className="text-white text-sm flex-1 truncate">{log.bot_name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[log.status]}`}>{log.status}</span>
                <span className="text-slate-600 text-xs flex-shrink-0">{new Date(log.started_at).toLocaleTimeString()}</span>
              </div>
            ))}
            {logs.length === 0 && <div className="py-10 text-center text-slate-600 text-sm">No activity yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}