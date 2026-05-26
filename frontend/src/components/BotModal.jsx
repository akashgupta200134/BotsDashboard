import { useState, useEffect } from 'react';
import { X, Bot, Globe, Terminal, Mail, FileText, Sparkles, Code, Cpu, Zap, Play } from 'lucide-react';

// ✅ ADD NEW BOT TYPES HERE
export const BOT_TYPES = [
  { value: 'PAD',        label: 'Power Automate Agents', sub: 'Desktop flows',        icon: Bot,      color: 'blue' },
  { value: 'Playwright', label: 'Playwright Agents',      sub: 'Browser automation',   icon: Globe,    color: 'emerald' },
  { value: 'Python',     label: 'Python Script Agents',   sub: 'Custom Python agents', icon: Code,     color: 'yellow' },
  { value: 'PowerShell', label: 'PowerShell Agents',      sub: 'Windows automation',   icon: Terminal, color: 'purple' },
  { value: 'NodeJS',     label: 'Node.js Agents',         sub: 'JS automation',        icon: Zap,      color: 'green' },
  { value: 'Other',      label: 'Other Agents',           sub: 'Any command',          icon: Cpu,      color: 'slate' },
];

const COLOR_MAP = {
  blue:    { border: 'border-blue-500',    bg: 'bg-blue-50',    iconBg: 'bg-blue-100',    text: 'text-blue-600',    btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25',    bar: 'from-blue-600 via-blue-400 to-indigo-500' },
  emerald: { border: 'border-emerald-500', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25', bar: 'from-emerald-600 via-emerald-400 to-teal-500' },
  yellow:  { border: 'border-yellow-400',  bg: 'bg-yellow-50',  iconBg: 'bg-yellow-100',  text: 'text-yellow-600',  btn: 'bg-yellow-500 hover:bg-yellow-400 shadow-yellow-500/25',  bar: 'from-yellow-500 via-yellow-400 to-orange-400' },
  purple:  { border: 'border-purple-500',  bg: 'bg-purple-50',  iconBg: 'bg-purple-100',  text: 'text-purple-600',  btn: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25',  bar: 'from-purple-600 via-purple-400 to-indigo-500' },
  green:   { border: 'border-green-500',   bg: 'bg-green-50',   iconBg: 'bg-green-100',   text: 'text-green-600',   btn: 'bg-green-600 hover:bg-green-500 shadow-green-500/25',   bar: 'from-green-600 via-green-400 to-teal-500' },
  slate:   { border: 'border-slate-400',   bg: 'bg-slate-100',  iconBg: 'bg-slate-200',   text: 'text-slate-600',   btn: 'bg-slate-600 hover:bg-slate-500 shadow-slate-500/25',   bar: 'from-slate-500 via-slate-400 to-slate-500' },
};

// Shared input classes for consistency across all fields
const inputBase =
  'w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400/20';

const InputField = ({ label, name, placeholder, type = 'text', hint, value, onChange, icon: Icon }) => (
  <div className="group">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={14} />
        </div>
      )}
      <input
        name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`${inputBase} ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
      />
    </div>
    {hint && <p className="text-xs text-slate-400 mt-1.5 ml-1">{hint}</p>}
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Accent bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${colors.bar} transition-all duration-300`} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg} transition-all duration-300`}>
              <selectedType.icon size={18} className={`${colors.text} transition-all duration-300`} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">{bot ? 'Edit Agent' : 'Add New Agent'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{bot ? 'Update automation configuration' : 'Configure a new automation agent'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <div className="h-px bg-slate-100 mx-6" />

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[62vh] overflow-y-auto">

          <InputField
            label="Agent Name *" name="name" placeholder="e.g. Invoice Processor Agent"
            value={form.name} onChange={set} icon={Sparkles}
          />

          {/* Type Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Agent Type</label>
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
                      active
                        ? `${c.border} ${c.bg}`
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? c.iconBg : 'bg-slate-200'}`}>
                      <Icon size={15} className={active ? c.text : 'text-slate-500'} />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold leading-tight ${active ? 'text-slate-800' : 'text-slate-600'}`}>{label}</p>
                      <p className="text-xs text-slate-400 leading-tight mt-0.5">{sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Command */}
          <div className="group">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Command *</label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Terminal size={14} />
              </div>
              <input
                name="command" value={form.command} onChange={set}
                placeholder="e.g. node C:/agents/myagent.js"
                className={`${inputBase} pl-10 pr-4 font-mono`}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 ml-1">Terminal command to execute this Agent</p>
          </div>

          {/* Description */}
          <div className="group">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Description</label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <FileText size={14} />
              </div>
              <textarea
                name="description" value={form.description} onChange={set} rows={2}
                placeholder="What does this agent do?"
                className={`${inputBase} pl-10 pr-4 resize-none`}
              />
            </div>
          </div>

          <InputField
            label="Notification Email" name="email" placeholder="alerts@company.com"
            value={form.email} onChange={set} icon={Mail} hint="Get notified on success or failure"
          />

        </div>

        <div className="h-px bg-slate-100 mx-6" />

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg ${colors.btn}`}
          >
            <span className="flex items-center justify-center gap-2">
              <Play size={13} />
              {bot ? 'Save Changes' : `Add ${selectedType.label}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}