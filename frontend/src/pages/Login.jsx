import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      toast.success(`Welcome, ${data.username}!`);
      navigate('/');
    } catch {
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/40">
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Actify</h1>
          <p className="text-slate-500 text-sm mt-1">Automation Control Room</p>
        </div>

        {/* Card */}
        <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Username</label>
            <input
              name="username" value={form.username} onChange={set} required autoFocus
              placeholder="Enter your username"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <input
                name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={set} required
                placeholder="Enter your password"
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2.5 pr-10 text-white text-sm placeholder-slate-600 outline-none transition-colors"
              />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2 shadow-lg shadow-indigo-500/20">
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-4">
          Default: <span className="text-slate-500">Akash</span> / <span className="text-slate-500">123456</span>
        </p>
      </div>
    </div>
  );
}