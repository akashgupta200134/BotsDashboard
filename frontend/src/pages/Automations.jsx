import { useEffect, useState } from 'react';
import {
  Play, Pencil, Trash2, RefreshCw, Search,
  Clock, Mail, Terminal, LayoutGrid, ChevronDown, X
} from 'lucide-react';
import api from '../api/axios';
import BotModal, { BOT_TYPES } from '../components/BotModal';
import toast from 'react-hot-toast';

const TYPE_META = Object.fromEntries(BOT_TYPES.map(t => [t.value, t]));

const STATUS_BADGE = {
  idle:    'bg-gray-100 text-gray-500 border border-gray-200',
  running: 'bg-blue-50 text-blue-600 border border-blue-200',
  success: 'bg-green-50 text-green-600 border border-green-200',
  failed:  'bg-red-50 text-red-600 border border-red-200',
};

const STATUS_DOT = {
  idle:    'bg-gray-400',
  running: 'bg-blue-500 animate-pulse',
  success: 'bg-green-500',
  failed:  'bg-red-500',
};

const TYPE_BADGE_COLORS = {
  blue:    'bg-blue-50 text-blue-600 border border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  yellow:  'bg-yellow-50 text-yellow-600 border border-yellow-200',
  purple:  'bg-purple-50 text-purple-600 border border-purple-200',
  green:   'bg-green-50 text-green-700 border border-green-200',
  slate:   'bg-gray-100 text-gray-600 border border-gray-200',
};

const TYPE_ICON_BG = {
  blue:    'bg-blue-50 text-blue-500',
  emerald: 'bg-emerald-50 text-emerald-500',
  yellow:  'bg-yellow-50 text-yellow-500',
  purple:  'bg-purple-50 text-purple-500',
  green:   'bg-green-50 text-green-500',
  slate:   'bg-gray-100 text-gray-500',
};

function fmt(ts) {
  return ts ? new Date(ts).toLocaleString() : 'Never';
}

function StatCard({ label, value, color, bg }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className={`text-xs mt-0.5 ${bg}`}>{label}</div>
    </div>
  );
}

function AutomationCard({ bot, onRun, onEdit, onDelete }) {
  const meta = TYPE_META[bot.type] || TYPE_META['Other'];
  const Icon = meta.icon;
  const typeBadge = TYPE_BADGE_COLORS[meta.color] || TYPE_BADGE_COLORS.slate;
  const iconStyle = TYPE_ICON_BG[meta.color] || TYPE_ICON_BG.slate;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconStyle}`}>
              <Icon size={17} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-sm">{bot.name}</h3>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{bot.description || 'No description'}</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_BADGE[bot.status] || STATUS_BADGE.idle}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[bot.status] || STATUS_DOT.idle}`} />
            {bot.status}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${typeBadge}`}>
            <Icon size={11} />
            {meta.label}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
          <Terminal size={11} className="text-gray-400 flex-shrink-0" />
          <code className="text-xs text-gray-600 truncate">{bot.command}</code>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={11} />
            {fmt(bot.last_run)}
          </div>
          {bot.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Mail size={11} />
              {bot.email}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onRun(bot)}
          disabled={bot.status === 'running'}
          className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          <Play size={12} />
          {bot.status === 'running' ? 'Running...' : 'Run'}
        </button>
        <button
          onClick={() => onEdit(bot)}
          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(bot)}
          disabled={bot.status === 'running'}
          className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Automations() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editBot, setEditBot] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/bots').then(r => setBots(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (bots.some(b => b.status === 'running')) load();
    }, 5000);
    return () => clearInterval(interval);
  }, [bots]);

  const handleRun = async (bot) => {
    try {
      await api.post(`/bots/${bot.id}/run`);
      toast.success(`${bot.name} started!`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to run');
    }
  };

  const handleEdit = (bot) => { setEditBot(bot); setModalOpen(true); };

  const handleSave = async (form) => {
    try {
      if (editBot) {
        await api.put(`/bots/${editBot.id}`, form);
        toast.success('Bot updated!');
      } else {
        await api.post('/bots', form);
        toast.success('Bot added!');
      }
      setModalOpen(false);
      setEditBot(null);
      load();
    } catch {
      toast.error('Failed to save bot');
    }
  };

  const handleDelete = async (bot) => {
    if (!window.confirm(`Delete "${bot.name}"? This will also remove its logs.`)) return;
    try {
      await api.delete(`/bots/${bot.id}`);
      toast.success('Bot deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = bots.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter   === 'all' || b.type   === typeFilter;
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const stat = (s) => bots.filter(b => b.status === s).length;
  const hasFilters = search || typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="bg-white rounded-2xl min-h-full shadow-sm border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <LayoutGrid size={20} className="text-indigo-600" />  {/* ✅ fixed */}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Automations</h2>
              <p className="text-gray-400 text-sm">All bots in one place — run, edit, and manage</p>
            </div>
          </div>
          <button
            onClick={load}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Bots"  value={bots.length}      color="text-gray-900"  bg="text-gray-400" />
          <StatCard label="Running"     value={stat('running')}  color="text-blue-600"  bg="text-gray-400" />
          <StatCard label="Successful"  value={stat('success')}  color="text-green-600" bg="text-gray-400" />
          <StatCard label="Failed"      value={stat('failed')}   color="text-red-500"   bg="text-gray-400" />
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search bots..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
            >
              <option value="all">All Types</option>
              {BOT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="idle">Idle</option>
              <option value="running">Running</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-500 bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              <X size={13} /> Clear
            </button>
          )}

          <span className="text-sm text-gray-400 ml-auto">
            {filtered.length} of {bots.length} bots
          </span>
        </div>

        {/* Bot Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw size={24} className="mx-auto mb-3 animate-spin opacity-40" />
            Loading automations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <LayoutGrid size={40} className="mx-auto mb-3 text-gray-300" />  {/* ✅ fixed */}
            <p className="text-gray-500 font-medium">
              {hasFilters ? 'No bots match your filters' : 'No bots yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {hasFilters ? 'Try clearing your search or filters' : 'Add bots from the individual type dashboards'}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}
                className="mt-3 text-sm text-indigo-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(bot => (
              <AutomationCard
                key={bot.id}
                bot={bot}
                onRun={handleRun}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <BotModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditBot(null); }}
        onSave={handleSave}
        bot={editBot}
        defaultType={editBot?.type || 'PAD'}
      />
    </div>
  );
}