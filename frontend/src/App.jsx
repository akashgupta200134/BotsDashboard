import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Automations from './pages/Automations';  
import Logs from './pages/Logs';
import BotTypeDashboard from './pages/BotTypeDashboard';
import { BOT_TYPES } from './components/BotModal';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="automations" element={<Automations />} />
          <Route index element={<Dashboard />} />
          {BOT_TYPES.map(t => (
            <Route
              key={t.value}
              path={t.value.toLowerCase()}
              element={<BotTypeDashboard type={t.value} />}
            />
          ))}
          <Route path="logs" element={<Logs />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}