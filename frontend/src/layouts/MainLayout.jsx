import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Heart className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Care<span className="text-teal-600">Sync</span>
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-bold text-slate-700 hover:text-teal-600 px-3 py-2 rounded-xl transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl shadow-md shadow-teal-600/20 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 CareSync Platform – Intelligent Preventive Healthcare & Patient Monitoring.</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Non-diagnostic academic project for proactive health monitoring and doctor-patient collaboration.
        </p>
      </footer>
    </div>
  );
};

export default MainLayout;

