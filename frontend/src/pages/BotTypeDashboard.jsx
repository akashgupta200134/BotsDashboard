import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import BotCard from '../components/BotCard';
import BotModal, { BOT_TYPES } from '../components/BotModal';
import toast from 'react-hot-toast';

const COLOR_MAP = {
  blue:    { btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',    iconBg: 'bg-blue-500/15',    text: 'text-blue-400' },
  emerald: { btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20', iconBg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  yellow:  { btn: 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20',  iconBg: 'bg-yellow-500/15',  text: 'text-yellow-400' },
  purple:  { btn: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20',  iconBg: 'bg-purple-500/15',  text: 'text-purple-400' },
  green:   { btn: 'bg-green-600 hover:bg-green-700 shadow-green-500/20',    iconBg: 'bg-green-500/15',    text: 'text-green-400' },
  slate:   { btn: 'bg-slate-600 hover:bg-slate-700 shadow-slate-500/20',    iconBg: 'bg-slate-500/15',    text: 'text-slate-400' },
};

export default function BotTypeDashboard({ type }) {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBot, setEditBot] = useState(null);

  const botType = BOT_TYPES.find(t => t.value === type) || BOT_TYPES[0];
  const colors = COLOR_MAP[botType.color];
  const Icon = botType.icon;

  const load = () => {
    setLoading(true);
    api.get(`/bots/type/${type}`).then(r => setBots(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [type]);

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

  const handleSave = async (form) => {
    try {
      if (editBot) {
        await api.put(`/bots/${editBot.id}`, form);
        toast.success('Bot updated!');
      } else {
        await api.post('/bots', { ...form, type });
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
    if (!window.confirm(`Delete "${bot.name}"?`)) return;
    try {
      await api.delete(`/bots/${bot.id}`);
      toast.success('Bot deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  const stat = (s) => bots.filter(b => b.status === s).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
            <Icon size={20} className={colors.text} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{botType.label} Bots</h2>
            <p className="text-slate-500 text-sm">{botType.sub}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => { setEditBot(null); setModalOpen(true); }}
            className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg ${colors.btn}`}>
            <Plus size={15} /> Add {botType.label} Bot
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[['Idle', 'idle', 'text-slate-400'], ['Running', 'running', 'text-blue-400'], ['Success', 'success', 'text-green-400'], ['Failed', 'failed', 'text-red-400']].map(([label, s, color]) => (
          <div key={s} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${color}`}>{stat(s)}</div>
            <div className="text-xs text-slate-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading...</div>
      ) : bots.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
          <Icon size={44} className="text-slate-700 mb-3" />
          <p className="text-slate-400 font-medium">No {botType.label} bots yet</p>
          <p className="text-slate-600 text-sm mt-1 mb-4">Add your first bot to get started</p>
          <button onClick={() => { setEditBot(null); setModalOpen(true); }}
            className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${colors.btn}`}>
            <Plus size={15} /> Add {botType.label} Bot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bots.map(bot => (
            <BotCard key={bot.id} bot={bot} onRun={handleRun} onEdit={(b) => { setEditBot(b); setModalOpen(true); }} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <BotModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditBot(null); }}
        onSave={handleSave} bot={editBot} defaultType={type} />
    </div>
  );
}