import React, { useState, useEffect } from 'react';
import { Lock, Crown, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LockOverlay({
  type = 'login', // 'login' | 'membership'
  title,
  message,
  redirectPath,
  onAction
}) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(4);

  const isMembership = type === 'membership';
  const defaultTitle = isMembership ? 'Become a Member to Continue' : 'Login to Continue';
  const defaultMessage = isMembership
    ? 'You have reached the free access limit for Knowledge Hub content. Upgrade to an active membership for unlimited access.'
    : 'Access to this section requires a RegMate account. Please log in or register to proceed.';
  const targetPath = redirectPath || (isMembership ? '/membership' : '/login');

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onAction) {
            onAction();
          } else {
            navigate(targetPath);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, targetPath, onAction]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-8 sm:p-10 relative">
        
        {/* Top Decorative Glow */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-30 ${isMembership ? 'bg-amber-400' : 'bg-emerald-500'}`} />

        {/* Lock / Crown Icon Badge */}
        <div className="relative z-10 mx-auto mb-6 w-20 h-20 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl flex items-center justify-center group">
          {isMembership ? (
            <Crown className="w-10 h-10 text-amber-400 animate-pulse" />
          ) : (
            <Lock className="w-10 h-10 text-emerald-400 animate-bounce" />
          )}
        </div>

        {/* Badge tag */}
        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 border ${
          isMembership 
            ? 'bg-amber-50 text-amber-900 border-amber-200' 
            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
        }`}>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{isMembership ? 'Membership Required' : 'Authentication Locked'}</span>
        </span>

        {/* Heading & Description */}
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-3 tracking-tight">
          {title || defaultTitle}
        </h2>
        
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
          {message || defaultMessage}
        </p>

        {/* Countdown & Redirect Status */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center justify-between w-full text-xs font-bold text-slate-500">
            <span>Redirecting automatically...</span>
            <span className="text-slate-900 font-mono text-sm">{secondsLeft}s</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                isMembership ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${(secondsLeft / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (onAction) onAction();
            else navigate(targetPath);
          }}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            isMembership
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
              : 'bg-emerald-700 hover:bg-emerald-800'
          }`}
        >
          <span>{isMembership ? 'Upgrade Membership Now' : 'Proceed to Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
