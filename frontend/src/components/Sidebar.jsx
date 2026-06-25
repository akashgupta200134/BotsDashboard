import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText,LayoutGrid, Zap } from 'lucide-react';
import { BOT_TYPES } from './BotModal';
import { BarChart2 } from 'lucide-react';

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/automations',  label: 'Automations',  icon: LayoutGrid },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },

  ...BOT_TYPES.map(t => ({
    to: `/${t.value.toLowerCase()}`,
    label: t.label,
    icon: t.icon,
    color: t.color,
  })),
  { to: '/logs', label: 'Logs', icon: FileText },
];

const COLOR_TEXT = {
  blue:    'text-blue-400',
  emerald: 'text-emerald-400',
  yellow:  'text-yellow-400',
  purple:  'text-purple-400',
  green:   'text-green-400',
  slate:   'text-slate-400',
};

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r border-slate-300 flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-lg font-bold text-black tracking-tight">Actify</span>
        </div>
        <p className="text-xs text-slate-700 mt-1 ml-0.5">Automation Control Room</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end, color }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-900 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-white' : (color ? COLOR_TEXT[color] : '')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-400">
        <p className="text-xs text-slate-600 text-center">v1.0 Starter</p>
      </div>
    </aside>
  );
}
