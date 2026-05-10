import { Play, Pencil, Trash2, Clock, Mail, Terminal } from 'lucide-react';

const STATUS = {
  idle:    { badge: 'bg-slate-700 text-slate-400',       dot: 'bg-slate-500' },
  running: { badge: 'bg-blue-500/20 text-blue-400',      dot: 'bg-blue-400 animate-pulse' },
  success: { badge: 'bg-green-500/20 text-green-400',    dot: 'bg-green-400' },
  failed:  { badge: 'bg-red-500/20 text-red-400',        dot: 'bg-red-400' },
};

export default function BotCard({ bot, onRun, onEdit, onDelete }) {
  const s = STATUS[bot.status] || STATUS.idle;
  const fmt = (ts) => ts ? new Date(ts).toLocaleString() : 'Never';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{bot.name}</h3>
          <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{bot.description || 'No description'}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${s.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {bot.status}
        </span>
      </div>

      {/* Command */}
      <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-2">
        <Terminal size={11} className="text-slate-500 flex-shrink-0" />
        <code className="text-xs text-slate-400 truncate">{bot.command}</code>
      </div>

      {/* Meta */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock size={11} />
          Last run: {fmt(bot.last_run)}
        </div>
        {bot.email && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Mail size={11} />
            {bot.email}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onRun(bot)}
          disabled={bot.status === 'running'}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Play size={13} />
          {bot.status === 'running' ? 'Running...' : 'Run Bot'}
        </button>
        <button
          onClick={() => onEdit(bot)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(bot)}
          disabled={bot.status === 'running'}
          className="p-2 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}