import React from 'react';
import { Lock, Crown, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function LockOverlay({
  type = 'login', // 'login' | 'membership'
  title,
  message,
  onAction
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isMembership = type === 'membership';
  const defaultTitle = isMembership ? 'Membership Required' : 'Sign In to Continue';
  const defaultMessage = isMembership
    ? 'This feature requires an active RegMate membership. Upgrade to unlock complete course access, all tools, and premium features.'
    : 'This section requires a RegMate account. Sign in or create a free account to continue.';

  // Build login URL with returnUrl so user comes back after auth
  const returnUrl = location.pathname + location.search;
  const loginUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
  const registerUrl = `/register?returnUrl=${encodeURIComponent(returnUrl)}`;

  const handlePrimaryAction = () => {
    if (onAction) {
      onAction();
      return;
    }
    if (isMembership) {
      navigate('/membership');
    } else {
      navigate(loginUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in-up">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-8 sm:p-10 relative">

        {/* Top Decorative Glow */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-30 ${isMembership ? 'bg-amber-400' : 'bg-emerald-500'}`} />

        {/* Lock / Crown Icon Badge */}
        <div className="relative z-10 mx-auto mb-6 w-20 h-20 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl flex items-center justify-center">
          {isMembership ? (
            <Crown className="w-10 h-10 text-amber-400" />
          ) : (
            <Lock className="w-10 h-10 text-emerald-400" />
          )}
        </div>

        {/* Badge tag */}
        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4 border ${
          isMembership
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
        }`}>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{isMembership ? 'Membership Required' : 'Sign In Required'}</span>
        </span>

        {/* Heading & Description */}
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-3 tracking-tight">
          {title || defaultTitle}
        </h2>

        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-8">
          {message || defaultMessage}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePrimaryAction}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isMembership
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            <span>{isMembership ? 'View Membership Plans' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isMembership && (
            <Link
              to={registerUrl}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
            >
              Create Free Account
            </Link>
          )}

          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}
