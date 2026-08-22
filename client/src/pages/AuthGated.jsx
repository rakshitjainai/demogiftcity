import React, { useState } from 'react';
import { Lock, User, Award, BookOpen, CheckCircle, LogOut, LogIn, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LEARNING_MODULES } from '../data/mockData';

function AuthInlineForm({ initialMode = 'login' }) {
  const { login, register, authError, setAuthError } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Redirect back to the page that required login, or /dashboard as fallback
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  React.useEffect(() => {
    setMode(initialMode);
    setAuthError(null);
  }, [initialMode, setAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      setSubmitted(true);
      setTimeout(() => {
        navigate(returnUrl);
      }, 1200);
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-md mx-auto animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-xl border border-line p-6 sm:p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-mint text-forest font-extrabold text-xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-leaf/20">
            R
          </div>
          <h2 className="text-2xl font-display font-bold text-forest-deep">
            {mode === 'login' ? 'Sign In to RegMate' : 'Create your RegMate Account'}
          </h2>
          <p className="text-xs text-ink-soft mt-1">
            {mode === 'login'
              ? 'Access your saved quizzes, certificates & learning progress'
              : 'Join India & GIFT IFSC’s premier regulatory learning platform'}
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-leaf mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-forest-deep">
              {mode === 'login' ? 'Welcome Back!' : 'Account Created Successfully!'}
            </h3>
            <p className="text-xs text-ink-soft">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex rounded-2xl bg-paper p-1 border border-line mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setAuthError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[40px] ${
                  mode === 'login' ? 'bg-white text-forest-deep shadow-sm border border-line/60' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setAuthError(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[40px] ${
                  mode === 'register' ? 'bg-white text-forest-deep shadow-sm border border-line/60' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-forest-deep mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="CS Prashant Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium outline-none focus:border-forest focus:ring-1 focus:ring-forest bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-forest-deep mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium outline-none focus:border-forest focus:ring-1 focus:ring-forest bg-white"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-forest-deep mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium outline-none focus:border-forest focus:ring-1 focus:ring-forest bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-deep mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium outline-none focus:border-forest focus:ring-1 focus:ring-forest bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-forest hover:bg-leaf text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer min-h-[44px]"
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

            <div className="mt-6 pt-4 border-t border-line text-center">
              {mode === 'login' ? (
                <p className="text-xs text-ink-soft">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setAuthError(null); }}
                    className="font-bold text-forest hover:text-leaf underline"
                  >
                    Create Free Account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-ink-soft">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setAuthError(null); }}
                    className="font-bold text-forest hover:text-leaf underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function AuthGated({ pageName }) {
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="py-10 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto animate-fade-in-up">
        {/* User Banner */}
        <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 mb-8 card-shadow flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full border-2 border-leaf shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-700 text-white font-extrabold text-3xl flex items-center justify-center shadow-md">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-display text-forest-deep">{user.name}</h1>
                <span className="bg-mint text-forest font-bold text-xs px-2.5 py-0.5 rounded-full uppercase border border-leaf/20">
                  {user.role || 'Member'}
                </span>
              </div>
              <p className="text-ink-soft text-sm">{user.email}</p>
              <p className="text-xs text-ink-soft mt-1">
                Account Active • Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-6 py-2.5 rounded-full border border-red-200 bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        {/* Certificates Banner if pageName is My Certificates */}
        {pageName === 'My Certificates' && (
          <div className="bg-white border border-line rounded-3xl p-8 mb-8 card-shadow space-y-4">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <div className="p-3 bg-mint text-forest rounded-2xl">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-display text-forest-deep">My Certificates & Credentials</h2>
                <p className="text-xs text-ink-soft">Verifiable statutory compliance mastery certificates</p>
              </div>
            </div>

            {(() => {
              const completedCourses = (user.courseProgress || []).filter(c => {
                const total = c.courseSlug === 'ifsca-cmi' ? 35 : 14;
                return (c.completedItems?.length || 0) >= total;
              });

              if (completedCourses.length > 0) {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {completedCourses.map((c, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-paper border border-leaf/30 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-forest text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-mint" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-leaf block">Verifiable Certificate</span>
                          <h4 className="font-bold text-sm text-forest-deep mt-0.5">{c.courseSlug.toUpperCase()} Compliance Certificate</h4>
                          <p className="text-xs text-ink-soft mt-1">Issued: August 2026 • Code: REGMATE-CERT-{c.courseSlug.toUpperCase()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div className="text-center py-8 bg-paper rounded-2xl border border-line text-ink-soft space-y-2">
                  <Award className="w-10 h-10 text-leaf mx-auto opacity-50" />
                  <p className="text-sm font-semibold text-forest-deep">No certificates earned yet.</p>
                  <p className="text-xs text-ink-soft max-w-md mx-auto">
                    Complete 100% of the lessons in any learning module (such as IFSCA Capital Market Intermediaries or SEBI AIF Regulations) to automatically generate your verifiable certificate!
                  </p>
                  <Link to="/learning" className="inline-block mt-3 px-5 py-2 bg-forest text-white text-xs font-bold rounded-full hover:bg-leaf transition-colors">
                    Start Learning Now
                  </Link>
                </div>
              );
            })()}
          </div>
        )}

        {/* Saved Quiz & Learning Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Quiz Results */}
          <div className="bg-white border border-line rounded-2xl p-6 card-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
              <div className="p-2.5 rounded-xl bg-mint text-forest">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-forest-deep">Saved Quiz Progress</h3>
                <p className="text-xs text-ink-soft">Your completed topics & scores stored in database</p>
              </div>
            </div>

            {user.quizProgress && user.quizProgress.length > 0 ? (
              <div className="space-y-3">
                {user.quizProgress.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-paper border border-line flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-forest-deep capitalize">
                        {q.topicId ? q.topicId.replace(/-/g, ' ') : 'General Quiz'}
                      </h4>
                      <p className="text-xs text-ink-soft">
                        Score: {q.score} / {q.totalQuestions} ({q.percentage}%)
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${q.passed ? 'bg-mint text-leaf' : 'bg-red-50 text-red-600'}`}>
                      {q.passed ? 'Passed' : 'Needs Practice'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-ink-soft">
                <p className="text-sm">No quizzes completed yet.</p>
                <Link to="/quizzes" className="inline-block mt-3 px-5 py-2 bg-forest text-white text-xs font-bold rounded-full">
                  Take a Quiz Now
                </Link>
              </div>
            )}
          </div>

          {/* Learning Progress */}
          <div className="bg-white border border-line rounded-2xl p-6 card-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-forest-deep">My Learning Modules</h3>
                <p className="text-xs text-ink-soft">Track chapter status and completion</p>
              </div>
            </div>

            {user.learningProgress && user.learningProgress.length > 0 ? (
              <div className="space-y-3">
                {user.learningProgress.map((m, idx) => {
                  const modDef = LEARNING_MODULES.find(lm => lm.id === m.moduleId);
                  const title = modDef ? modDef.title : (m.moduleId ? m.moduleId.replace(/-/g, ' ') : 'Module');
                  const totalLessons = modDef?.chapters?.length || 1;
                  const completedCount = m.completedLessons ? m.completedLessons.length : 0;
                  const pct = Math.round((completedCount / totalLessons) * 100);

                  return (
                    <div key={idx} className="p-4 rounded-xl bg-paper border border-line">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm text-forest-deep line-clamp-1">
                          {title}
                        </h4>
                        <span className="text-xs font-bold text-leaf flex-shrink-0 ml-2">
                          {completedCount}/{totalLessons} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-line h-2 rounded-full overflow-hidden">
                        <div className="bg-leaf h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-ink-soft">
                <p className="text-sm">No active course modules yet.</p>
                <Link to="/learning" className="inline-block mt-3 px-5 py-2 border border-forest text-forest text-xs font-bold rounded-full">
                  Explore Learning
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // If pageName is Login or Register, render the inline auth form
  if (pageName === 'Login' || pageName === 'Register') {
    return <AuthInlineForm initialMode={pageName === 'Register' ? 'register' : 'login'} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in-up">
      <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-leaf" />
      </div>
      <h1 className="text-3xl font-display text-forest-deep mb-4">
        {pageName} Access
      </h1>
      <p className="text-ink-soft max-w-md mx-auto mb-8 text-lg">
        Please sign in to your RegMate account to access your saved quiz scores, learning progress, certificates, and dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/login"
          className="cursor-target px-6 py-3.5 bg-forest text-white rounded-full font-medium hover-lift min-h-[52px] flex items-center justify-center"
        >
          Sign In to RegMate
        </Link>
        <Link
          to="/membership"
          className="cursor-target px-6 py-3.5 border border-forest text-forest rounded-full font-medium hover-lift min-h-[52px] flex items-center justify-center"
        >
          Become a Member
        </Link>
      </div>
    </div>
  );
}

