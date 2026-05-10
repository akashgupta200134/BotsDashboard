import { useEffect, useState } from 'react';
import { FileText, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  running: 'bg-blue-500/20 text-blue-400',
  success: 'bg-green-500/20 text-green-400',
  failed:  'bg-red-500/20 text-red-400',
};
const DOT = {
  running: 'bg-blue-400 animate-pulse',
  success: 'bg-green-400',
  failed:  'bg-red-400',
};

function duration(start, end) {
  if (!start || !end) return null;
  const ms = new Date(end) - new Date(start);
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    api.get('/logs').then(r => setLogs(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    try {
      await api.delete(`/logs/${id}`);
      toast.success('Log removed');
      setLogs(l => l.filter(x => x.id !== id));
    } catch {
      toast.error('Failed to delete log');
    }
  };

  const filters = ['all', 'PAD', 'Playwright', 'success', 'failed', 'running'];
  const filtered = filter === 'all' ? logs
    : logs.filter(l => l.status === filter || l.bot_type === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500/15 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Execution Logs</h2>
            <p className="text-slate-500 text-sm">Full history of every bot run</p>
          </div>
        </div>
        <button onClick={load} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}>
            {f}
          </button>
        ))}
        {filter !== 'all' && (
          <span className="px-3 py-1.5 text-xs text-slate-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Log list */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading logs...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-600">No logs found</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map(log => (
              <div key={log.id}>
                {/* Log row */}
                <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[log.status] || 'bg-slate-500'}`} />

                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-white text-sm font-medium truncate">{log.bot_name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 ${log.bot_type === 'PAD' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {log.bot_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[log.status] || 'bg-slate-700 text-slate-400'}`}>
                      {log.status}
                    </span>
                    {duration(log.started_at, log.ended_at) && (
                      <span className="text-slate-500 hidden sm:block">{duration(log.started_at, log.ended_at)}</span>
                    )}
                    <span className="text-slate-600 hidden md:block">{new Date(log.started_at).toLocaleString()}</span>
                    <button onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                      className="text-slate-500 hover:text-slate-300 transition-colors">
                      {expanded === log.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <button onClick={() => del(log.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded output */}
                {expanded === log.id && (
                  <div className="px-5 pb-4 space-y-3 bg-slate-800/20">
                    <div className="flex gap-4 text-xs text-slate-500 pt-2">
                      <span>Started: {new Date(log.started_at).toLocaleString()}</span>
                      {log.ended_at && <span>Ended: {new Date(log.ended_at).toLocaleString()}</span>}
                    </div>
                    {log.output && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1.5">Output</p>
                        <pre className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs text-green-400 overflow-x-auto whitespace-pre-wrap max-h-48">{log.output}</pre>
                      </div>
                    )}
                    {log.error && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1.5">Error</p>
                        <pre className="bg-slate-950 border border-red-900/30 rounded-lg px-4 py-3 text-xs text-red-400 overflow-x-auto whitespace-pre-wrap max-h-48">{log.error}</pre>
                      </div>
                    )}
                    {!log.output && !log.error && (
                      <p className="text-xs text-slate-600 italic">No output captured</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}