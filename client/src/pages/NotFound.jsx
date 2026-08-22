import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in-up">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-xs font-bold text-rose-800 uppercase tracking-wider mb-6">
        <AlertCircle className="w-3.5 h-3.5" />
        404 — Page Not Found
      </div>

      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-6">
        <Search className="w-10 h-10 text-slate-400" />
      </div>

      {/* Text */}
      <h1 className="text-3xl sm:text-4xl font-display font-bold text-forest-deep mb-3">
        Page Not Found
      </h1>
      <p className="text-base text-ink-soft max-w-md mx-auto mb-8 leading-relaxed">
        The page you're looking for doesn't exist or may have been moved.
        Try returning to the home page or use the navigation menu.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-xl font-bold text-sm hover:bg-forest-deep transition-colors shadow-md"
        >
          <Home className="w-4 h-4" />
          Go to Homepage
        </Link>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ink border border-line rounded-xl font-semibold text-sm hover:bg-mint hover:text-forest transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>

      {/* Helpful Links */}
      <div className="mt-10 text-sm text-ink-soft">
        <p className="mb-3 font-semibold">Or explore:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: 'RegLearn', href: '/learn' },
            { label: 'RegLens', href: '/understand' },
            { label: 'Practice', href: '/practice' },
            { label: 'RegTools', href: '/tools' },
            { label: 'RegIntel', href: '/regintel' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              to={href}
              className="px-3 py-1.5 bg-white border border-line rounded-full text-xs font-semibold text-forest hover:bg-mint transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
