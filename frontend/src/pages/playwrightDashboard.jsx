import { useEffect, useState } from 'react';
import { Plus, Globe, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import BotCard from '../components/BotCard';
import BotModal from '../components/BotModal';
import toast from 'react-hot-toast';

export default function PlaywrightDashboard() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBot, setEditBot] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/bots/type/Playwright').then(r => setBots(r.data)).finally(() => setLoading(false));
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

  const handleSave = async (form) => {
    try {
      if (editBot) {
        await api.put(`/bots/${editBot.id}`, form);
        toast.success('Bot updated!');
      } else {
        await api.post('/bots', { ...form, type: 'Playwright' });
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

  const openEdit = (bot) => { setEditBot(bot); setModalOpen(true); };
  const openAdd  = ()    => { setEditBot(null); setModalOpen(true); };
  const stat = (s) => bots.filter(b => b.status === s).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
            <Globe size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Playwright Bots</h2>
            <p className="text-slate-500 text-sm">Browser automation & E2E testing</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
            <RefreshCw size={15} />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20">
            <Plus size={15} /> Add Playwright Bot
          </button>
        </div>
      </div>

      {/* Mini stats */}
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
          <Globe size={44} className="text-slate-700 mb-3" />
          <p className="text-slate-400 font-medium">No Playwright bots yet</p>
          <p className="text-slate-600 text-sm mt-1 mb-4">Add your first Playwright bot to get started</p>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={15} /> Add Playwright Bot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bots.map(bot => (
            <BotCard key={bot.id} bot={bot} onRun={handleRun} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <BotModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditBot(null); }}
        onSave={handleSave} bot={editBot} defaultType="Playwright" />
    </div>
  );
}