import { useState, useEffect } from 'react';
import { X, Bot, Globe, Terminal, Mail, FileText, Sparkles, Code, Cpu, Zap, Play } from 'lucide-react';

// ✅ ADD NEW BOT TYPES HERE
export const BOT_TYPES = [
  { value: 'PAD',        label: 'Power Automate', sub: 'Desktop flows',      icon: Bot,      color: 'blue' },
  { value: 'Playwright', label: 'Playwright',      sub: 'Browser automation', icon: Globe,    color: 'emerald' },
  { value: 'Python',     label: 'Python Script',   sub: 'Custom Python bots', icon: Code,     color: 'yellow' },
  { value: 'PowerShell', label: 'PowerShell',      sub: 'Windows automation', icon: Terminal, color: 'purple' },
  { value: 'NodeJS',     label: 'Node.js',         sub: 'JS automation',      icon: Zap,      color: 'green' },
  { value: 'Other',      label: 'Other',           sub: 'Any command',        icon: Cpu,      color: 'slate' },
];

const COLOR_MAP = {
  blue:    { border: 'border-blue-500',    bg: 'bg-blue-500/10',    iconBg: 'bg-blue-500/20',    text: 'text-blue-400',    btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25',    bar: 'from-blue-600 via-blue-400 to-indigo-500' },
  emerald: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', iconBg: 'bg-emerald-500/20', text: 'text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25', bar: 'from-emerald-600 via-emerald-400 to-teal-500' },
  yellow:  { border: 'border-yellow-500',  bg: 'bg-yellow-500/10',  iconBg: 'bg-yellow-500/20',  text: 'text-yellow-400',  btn: 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/25',  bar: 'from-yellow-600 via-yellow-400 to-orange-500' },
  purple:  { border: 'border-purple-500',  bg: 'bg-purple-500/10',  iconBg: 'bg-purple-500/20',  text: 'text-purple-400',  btn: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25',  bar: 'from-purple-600 via-purple-400 to-indigo-500' },
  green:   { border: 'border-green-500',   bg: 'bg-green-500/10',   iconBg: 'bg-green-500/20',   text: 'text-green-400',   btn: 'bg-green-600 hover:bg-green-500 shadow-green-500/25',   bar: 'from-green-600 via-green-400 to-teal-500' },
  slate:   { border: 'border-slate-500',   bg: 'bg-slate-500/10',   iconBg: 'bg-slate-500/20',   text: 'text-slate-400',   btn: 'bg-slate-600 hover:bg-slate-500 shadow-slate-500/25',   bar: 'from-slate-600 via-slate-400 to-slate-500' },
};

const InputField = ({ label, name, placeholder, type = 'text', hint, value, onChange, icon: Icon }) => (
  <div className="group">
    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          <Icon size={14} />
        </div>
      )}
      <input
        name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full bg-slate-800/80 border border-slate-700/60 focus:border-indigo-500 focus:bg-slate-800 rounded-xl py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
      />
    </div>
    {hint && <p className="text-xs text-slate-600 mt-1.5 ml-1">{hint}</p>}
  </div>
);

export default function BotModal({ isOpen, onClose, onSave, bot, defaultType = 'PAD' }) {
  const blank = { name: '', type: defaultType, command: '', description: '', email: '' };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    setForm(bot
      ? { name: bot.name, type: bot.type, command: bot.command, description: bot.description || '', email: bot.email || '' }
      : { ...blank, type: defaultType }
    );
  }, [bot, isOpen, defaultType]);

  if (!isOpen) return null;

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const selectedType = BOT_TYPES.find(t => t.value === form.type) || BOT_TYPES[0];
  const colors = COLOR_MAP[selectedType.color];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">

        {/* Accent bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${colors.bar} transition-all duration-300`} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg} transition-all duration-300`}>
              <selectedType.icon size={18} className={`${colors.text} transition-all duration-300`} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">{bot ? 'Edit Bot' : 'Add New Bot'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{bot ? 'Update automation configuration' : 'Configure a new automation bot'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        <div className="h-px bg-slate-800 mx-6" />

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[62vh] overflow-y-auto">

          <InputField label="Bot Name *" name="name" placeholder="e.g. Invoice Processor" value={form.name} onChange={set} icon={Sparkles} />

          {/* Type Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Bot Type</label>
            <div className="grid grid-cols-3 gap-2">
              {BOT_TYPES.map(({ value, label, sub, icon: Icon, color }) => {
                const c = COLOR_MAP[color];
                const active = form.type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: value }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                      active ? `${c.border} ${c.bg}` : 'border-slate-700/60 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? c.iconBg : 'bg-slate-700'}`}>
                      <Icon size={15} className={active ? c.text : 'text-slate-400'} />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold leading-tight ${active ? 'text-white' : 'text-slate-400'}`}>{label}</p>
                      <p className="text-xs text-slate-600 leading-tight mt-0.5">{sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Command */}
          <div className="group">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Command *</label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Terminal size={14} />
              </div>
              <input
                name="command" value={form.command} onChange={set}
                placeholder="e.g. node C:/bots/mybot.js"
                className="w-full bg-slate-800/80 border border-slate-700/60 focus:border-indigo-500 focus:bg-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono placeholder-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <p className="text-xs text-slate-600 mt-1.5 ml-1">Terminal command to execute this bot</p>
          </div>

          {/* Description */}
          <div className="group">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <FileText size={14} />
              </div>
              <textarea
                name="description" value={form.description} onChange={set} rows={2}
                placeholder="What does this bot do?"
                className="w-full bg-slate-800/80 border border-slate-700/60 focus:border-indigo-500 focus:bg-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>
          </div>

          <InputField label="Notification Email" name="email" placeholder="alerts@company.com" value={form.email} onChange={set} icon={Mail} hint="Get notified on success or failure" />

        </div>

        <div className="h-px bg-slate-800 mx-6" />

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg ${colors.btn}`}
          >
            <span className="flex items-center justify-center gap-2">
              <Play size={13} />
              {bot ? 'Save Changes' : `Add ${selectedType.label} Bot`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}