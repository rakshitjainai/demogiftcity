import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen, Flame, Target, Brain, Award, ChevronRight, CheckCircle2,
  Clock, Zap, BarChart3, ArrowLeft, Lock, Play, Star, Shield,
  TrendingUp, AlertCircle, RefreshCw, Trophy, Users, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import coursesData from '../data/courses.json';
import { getClassicStudyContent } from '../utils/courseContentResolver';
import {
  getCourseStats, getChapterProgress, getChapterNextAction, isModuleUnlocked,
  MASTERY_LEVELS, getMistakes, removeMistake, AVAILABLE_BADGES
} from '../utils/learnProgress';

const COURSES_META = {
  'ifsca-cmi': {
    code: 'IFSCA-CMI', regulator: 'IFSCA',
    color: 'from-slate-900 via-slate-800 to-blue-900',
    difficulty: 'Intermediate', durationHours: 12,
  },
  'ifsca-fme': {
    code: 'IFSCA-FME', regulator: 'IFSCA',
    color: 'from-emerald-900 via-emerald-800 to-teal-900',
    difficulty: 'Advanced', durationHours: 15,
  },
  'fme-regulations': {
    code: 'IFSCA-FME', regulator: 'IFSCA',
    color: 'from-emerald-900 via-emerald-800 to-teal-900',
    difficulty: 'Advanced', durationHours: 15,
  },
  'sebi-aif': {
    code: 'SEBI-AIF', regulator: 'SEBI',
    color: 'from-amber-900 via-amber-800 to-orange-900',
    difficulty: 'Advanced', durationHours: 14,
  },
  'companies-act': {
    code: 'MCA-CA2013', regulator: 'MCA',
    color: 'from-teal-900 via-emerald-950 to-slate-900',
    difficulty: 'Beginner to Intermediate', durationHours: 18,
  },
  'mca-ca2013': {
    code: 'MCA-CA2013', regulator: 'MCA',
    color: 'from-teal-900 via-emerald-950 to-slate-900',
    difficulty: 'Beginner to Intermediate', durationHours: 18,
  },
  'sebi-lodr': {
    code: 'SEBI-LODR', regulator: 'SEBI',
    color: 'from-sky-900 via-indigo-900 to-slate-900',
    difficulty: 'Intermediate', durationHours: 10,
  }
};

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Ananya Sharma', title: 'Compliance Lead', xp: 4850, streak: 14, avatar: '👑' },
  { rank: 2, name: 'Vikram Mehta', title: 'AIF Manager', xp: 4200, streak: 9, avatar: '⭐' },
  { rank: 3, name: 'Rohan Deshmukh', title: 'GIFT IFSC Specialist', xp: 3950, streak: 12, avatar: '🚀' },
  { rank: 4, name: 'You (Learner)', title: 'RegLearn Pioneer', xp: 0, streak: 0, avatar: '🛡️', isUser: true },
  { rank: 5, name: 'Priya Nair', title: 'Legal Counsel', xp: 3100, streak: 5, avatar: '⚖️' },
];

function MasteryBadge({ level }) {
  const ml = MASTERY_LEVELS[level] || MASTERY_LEVELS[0];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
      style={{ backgroundColor: ml.bg, color: ml.text }}
    >
      {level === 5 && <Star className="w-3 h-3 fill-amber-300 text-amber-500" />}
      {ml.short}
    </span>
  );
}

function ProgressRing({ pct, size = 64, stroke = 6 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  );
}

export default function CourseHub() {
  const { courseSlug } = useParams();
  const { isMember, hasCourseAccess, initiateCheckout } = useAuth();
  const [activeTab, setActiveTab] = useState('path');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMistakesModal, setShowMistakesModal] = useState(false);

  const resolvedPackage = useMemo(() => getClassicStudyContent(courseSlug), [courseSlug]);
  const course = coursesData[courseSlug] || (!resolvedPackage.notFound ? resolvedPackage : null);
  const meta = COURSES_META[courseSlug] || {
    code: course?.code || (courseSlug || '').toUpperCase(),
    regulator: course?.regulator || 'Regulatory',
    color: 'from-forest-deep to-forest',
    difficulty: course?.difficulty || 'Intermediate',
    durationHours: course?.durationHours || 12,
  };
  const rawChapters = course?.chapters || [];
  const chapters = useMemo(() => {
    return rawChapters.map((c, idx) => {
      const num = c.num || c.chapterNo || c.number || (idx + 1);
      return {
        ...c,
        num,
        chapterNo: num,
        id: c.id || `ch_${num}`,
        title: c.title || `Chapter ${num}`,
        description: c.description || c.understandBody || 'Statutory compliance and operational requirements.',
        band: c.band || 'Regulatory Framework',
      };
    });
  }, [rawChapters]);

  const isOwned = Boolean(isMember || hasCourseAccess?.(courseSlug));
  const stats = useMemo(() => getCourseStats(courseSlug, chapters), [courseSlug, chapters]);
  const mistakes = useMemo(() => getMistakes().filter(m => m.courseSlug === courseSlug), [courseSlug]);

  const chapterStates = useMemo(() => chapters.map((ch, idx) => {
    const cp = getChapterProgress(courseSlug, ch.num);
    const nextAction = getChapterNextAction(courseSlug, ch.num);
    const unlockStatus = isModuleUnlocked(courseSlug, idx, chapters, isOwned);
    return { ...ch, cp, nextAction, isLocked: !unlockStatus.unlocked, unlockStatus, idx };
  }), [courseSlug, chapters, isOwned]);

  const currentChapter = chapterStates.find(c => !c.isLocked && c.cp.masteryLevel < 5) || chapterStates[0];

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center space-y-4 p-8">
          <BookOpen className="w-12 h-12 text-forest mx-auto opacity-40" />
          <h2 className="font-display font-bold text-xl text-forest-deep">Course not found</h2>
          <Link to="/learn" className="inline-flex items-center gap-2 text-forest font-semibold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to RegLearn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-20">
      
      {/* ─── Course Hero Header ─── */}
      <div className={`bg-gradient-to-r ${meta.color || 'from-forest-deep to-forest'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between gap-2 text-xs text-white/60 mb-5">
            <div className="flex items-center gap-2">
              <Link to="/learn" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" /> RegLearn
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/80">{meta.code}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-md bg-white/15 text-white font-bold text-xs font-mono">{meta.code}</span>
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-white/80 text-xs font-medium">{meta.regulator}</span>
                
                {/* Level Badge */}
                <span className="px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 font-bold text-xs flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Level {stats.level} ({stats.xp} XP)
                </span>

                {/* Streak Badge */}
                {stats.streak > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                    <Flame className="w-3.5 h-3.5" /> {stats.streak}-day streak
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-tight">{course.title}</h1>
              <p className="text-sm text-white/70 leading-relaxed max-w-xl">{course.description}</p>
            </div>

            {/* Progress Ring & Level Bar */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 self-start lg:self-auto flex-shrink-0">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <ProgressRing pct={stats.overallPct} size={64} stroke={5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold font-mono text-white leading-none">{stats.overallPct}%</span>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Overall Progress</div>
                <div className="text-white font-semibold text-sm">{stats.mastered}/{stats.total} mastered</div>
                <div className="text-white/70 text-xs">{stats.completed} modules complete</div>
                <div className="text-white/70 text-xs">Target Benchmark: 80%</div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ─── Main Content Container ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HERO: Resume Active Module Banner */}
        {currentChapter && (
          <div className="bg-[#0B4D33] text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-mono font-bold">
                Chapter {currentChapter.num} of {chapters.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display">{currentChapter.title}</h2>
              <p className="text-xs sm:text-sm text-white/70 max-w-lg">{currentChapter.description}</p>
            </div>

            <Link
              to={`/learn/${courseSlug}/chapter/${currentChapter.num}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 text-forest-deep font-bold text-sm shadow-md hover:bg-amber-300 transition-all flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-forest-deep" /> Continue Learning →
            </Link>
          </div>
        )}

        {/* ─── QUICK PRACTICE HUB ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-forest-deep flex items-center gap-2">
              <Zap className="w-5 h-5 text-forest" /> Interactive Practice & Revision Hub
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Daily 5 Recall */}
            <Link
              to={`/learn/${courseSlug}/challenge/rapid-recall`}
              className="bg-white p-5 rounded-2xl border border-forest/10 shadow-xs hover:shadow-md transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-forest-deep">Daily 5 Recall</h4>
                <p className="text-xs text-ink-soft mt-1">3–5 minute rapid recall check on recent provisions.</p>
              </div>
            </Link>

            {/* 2. My Mistakes */}
            <button
              onClick={() => setShowMistakesModal(true)}
              className="bg-white p-5 rounded-2xl border border-forest/10 shadow-xs hover:shadow-md transition-all space-y-3 group text-left w-full"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-forest-deep">My Mistakes</h4>
                  {mistakes.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-mono font-bold text-[10px]">
                      {mistakes.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft mt-1">Review questions answered incorrectly.</p>
              </div>
            </button>

            {/* 3. Fix My Weakest 5 */}
            <Link
              to={`/learn/${courseSlug}/challenge/weak-areas`}
              className="bg-white p-5 rounded-2xl border border-forest/10 shadow-xs hover:shadow-md transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-forest-deep">Fix My Weakest 5</h4>
                <p className="text-xs text-ink-soft mt-1">Auto-generated practice from low-mastery concepts.</p>
              </div>
            </Link>

            {/* 4. 60-Second Challenge */}
            <Link
              to={`/learn/${courseSlug}/challenge/which-number`}
              className="bg-white p-5 rounded-2xl border border-forest/10 shadow-xs hover:shadow-md transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-forest-deep">60-Second Challenge</h4>
                <p className="text-xs text-ink-soft mt-1">Speed drill on statutory limits, thresholds & dates.</p>
              </div>
            </Link>

          </div>
        </div>

        {/* ─── COURSE MODULE MAP (SEQUENTIAL FLOW) ─── */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-forest-deep flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-forest" /> Course Module Map & Progression
            </h3>
            <span className="text-xs font-mono text-ink-soft">Sequential Unlock Enabled</span>
          </div>

          <div className="space-y-3">
            {chapterStates.map((ch) => {
              const isCurrent = currentChapter?.num === ch.num;
              return (
                <div
                  key={ch.num}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'border-forest ring-2 ring-forest/20 shadow-md'
                      : ch.isLocked
                      ? 'border-gray-200 opacity-60 bg-gray-50/50'
                      : 'border-forest/10 shadow-xs hover:border-forest/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 mt-0.5 ${
                      ch.isLocked
                        ? 'bg-gray-200 text-gray-500'
                        : ch.cp.masteryLevel >= 5
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-forest/10 text-forest'
                    }`}>
                      {ch.isLocked ? <Lock className="w-4 h-4" /> : ch.num}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-forest-deep">{ch.title}</span>
                        <MasteryBadge level={ch.cp.masteryLevel || 0} />
                      </div>
                      <p className="text-xs text-ink-soft line-clamp-1 max-w-xl">{ch.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    {!ch.isLocked ? (
                      <Link
                        to={`/learn/${courseSlug}/chapter/${ch.num}`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-forest text-white hover:bg-forest-deep shadow-xs'
                            : 'bg-paper text-forest border border-forest/20 hover:bg-forest/5'
                        }`}
                      >
                        {ch.cp.masteryLevel >= 5 ? 'Review Module' : 'Start Module →'}
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ─── MY MISTAKES MODAL ─── */}
      {showMistakesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-forest/10 shadow-2xl space-y-5 max-h-[80vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-forest-deep font-bold font-display">
                <AlertCircle className="w-5 h-5 text-red-500" /> My Mistakes Review Log ({mistakes.length})
              </div>
              <button onClick={() => setShowMistakesModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-grow">
              {mistakes.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  🎉 Zero recorded mistakes! Keep up the flawless learning.
                </div>
              ) : (
                mistakes.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl bg-red-50/50 border border-red-200 text-xs space-y-2">
                    <div className="font-bold text-red-950">{m.question}</div>
                    <div className="text-gray-600">
                      <span className="text-red-700 font-semibold">Your Answer:</span> {m.selectedAnswer}
                    </div>
                    <div className="text-emerald-800 font-semibold">
                      <span>Correct Answer:</span> {m.correctAnswer}
                    </div>
                    {m.explanation && <p className="text-gray-700 pt-1 italic">{m.explanation}</p>}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => removeMistake(m.id)}
                        className="px-3 py-1 rounded bg-white border border-red-300 text-red-700 hover:bg-red-50 text-[10px] font-bold"
                      >
                        Mark Recovered ✓
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowMistakesModal(false)}
              className="w-full py-2.5 rounded-xl bg-forest text-white font-bold text-xs"
            >
              Close Log
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
