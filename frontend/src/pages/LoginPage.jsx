import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Heart, Stethoscope, User, Shield } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) {
      addToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await login(loginEmail, loginPass);
      addToast(`Welcome back, ${user.name}!`, 'success');

      if (user.role === 'patient') {
        navigate('/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLogin(null, demoEmail, demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-500/20">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign In to CareSync
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Preventive healthcare monitoring & patient records
            </p>
          </div>

          {/* Quick 1-Click Placement Demo Profiles */}
          <div className="mb-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🚀 1-Click Placement Demo Logins:</span>
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoFill('john@caresync.health', 'Password123!')}
                className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200/80 hover:border-teal-300 text-xs text-slate-700 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-semibold">Patient: John Doe (Upward BP Trend)</span>
                </div>
                <span className="text-[10px] text-teal-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  Demo &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('dr.chen@caresync.health', 'Password123!')}
                className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200/80 hover:border-teal-300 text-xs text-slate-700 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold">Doctor: Dr. Emily Chen (Cardiologist)</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  Demo &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('admin@caresync.health', 'AdminPassword123!')}
                className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200/80 hover:border-teal-300 text-xs text-slate-700 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold">Administrator: System & Analytics</span>
                </div>
                <span className="text-[10px] text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  Demo &rarr;
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@caresync.health"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

