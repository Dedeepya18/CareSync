import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
        <Heart className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="text-base font-bold text-slate-700 mt-2">Page Not Found</p>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The healthcare portal route you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
      >
        <Home className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;

