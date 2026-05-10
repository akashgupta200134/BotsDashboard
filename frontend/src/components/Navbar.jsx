import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const titles = {
  '/':           'Overview',
  '/pad':        'PAD Bots',
  '/playwright': 'Playwright Bots',
  '/logs':       'Logs',
};

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const username = localStorage.getItem('username') || 'User';

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-white">{titles[pathname] || 'Actify'}</h1>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center">
            <User size={13} className="text-white" />
          </div>
          <span className="font-medium text-slate-300">{username}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  );
}