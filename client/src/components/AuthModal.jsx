import React, { useState } from 'react';
import { X, LogIn, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ initialMode = 'login', onClose }) {
  const { login, register, authError, setAuthError } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
              R
            </div>
            <span className="text-lg font-black text-slate-900">
              Reg<span className="text-emerald-700">Mate</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-slate-900">
                {mode === 'login' ? 'Welcome Back!' : 'Account Created Successfully!'}
              </h3>
              <p className="text-xs text-slate-600">Syncing user progress & loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setAuthError(null); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[40px] ${mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setAuthError(null); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[40px] ${mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{authError}</p>
                    {authError.includes('sign up first') && (
                      <button
                        type="button"
                        onClick={() => { setMode('register'); setAuthError(null); }}
                        className="text-xs underline font-bold mt-1 text-emerald-800 hover:text-emerald-900 block cursor-pointer"
                      >
                        Click here to create an account
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="CS Prashant Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      {mode === 'login' ? <LogIn className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                      <span>{mode === 'login' ? 'Sign In to RegMate' : 'Create Account'}</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
