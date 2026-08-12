import React from 'react';
import { Lock, User, Award, BookOpen, CheckCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LEARNING_MODULES } from '../data/mockData';

export default function AuthGated({ pageName }) {
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
        {/* User Banner */}
        <div className="bg-white border border-line rounded-3xl p-8 mb-8 card-shadow flex flex-col md:flex-row items-center justify-between gap-6">
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
            className="px-6 py-2.5 rounded-full border border-red-200 bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

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
          to="/"
          className="cursor-target px-6 py-3 bg-forest text-white rounded-full font-medium hover-lift"
        >
          Return to Home & Login
        </Link>
        <Link
          to="/membership"
          className="cursor-target px-6 py-3 border border-forest text-forest rounded-full font-medium hover-lift"
        >
          Become a Member
        </Link>
      </div>
    </div>
  );
}
