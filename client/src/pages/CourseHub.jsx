import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen, Flame, Target, Brain, Award, ChevronRight, CheckCircle2,
  Clock, Zap, BarChart3, ArrowLeft, Lock, Play, Star,
  TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import coursesData from '../data/courses.json';
import {
  getCourseStats, getChapterProgress, getChapterNextAction, MASTERY_LEVELS
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
  'sebi-aif': {
    code: 'SEBI-AIF', regulator: 'SEBI',
    color: 'from-amber-900 via-amber-800 to-orange-900',
    difficulty: 'Advanced', durationHours: 14,
  },
};

function MasteryBadge({ level }) {
  const ml = MASTERY_LEVELS[level] || MASTERY_LEVELS[0];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
      style={{ backgroundColor: ml.bg, color: ml.text }}
    >
      {level === 5 && <Star className="w-2.5 h-2.5" />}
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

const ACTION_LABELS = {
  learn: 'Read Lesson', walkthrough: 'Practitioner Walkthrough',
  recall: 'Quick Recall', practice: 'Practice Questions',
  challenge: 'Take Challenge', review: 'Review', mastered: 'Mastered ✓',
};

export default function CourseHub() {
  const { courseSlug } = useParams();
  const { isMember, hasCourseAccess, initiateCheckout } = useAuth();
  const [activeTab, setActiveTab] = useState('path');

  const course = coursesData[courseSlug];
  const meta = COURSES_META[courseSlug] || {};
  const chapters = course?.chapters || [];
  const isOwned = Boolean(isMember || hasCourseAccess?.(courseSlug));
  const stats = useMemo(() => getCourseStats(courseSlug, chapters), [courseSlug, chapters]);

  const chapterStates = useMemo(() => chapters.map((ch, idx) => {
    const cp = getChapterProgress(courseSlug, ch.num);
    const nextAction = getChapterNextAction(courseSlug, ch.num);
    const isLocked = !isOwned && idx > 0;
    return { ...ch, cp, nextAction, isLocked, idx };
  }), [courseSlug, chapters, isOwned]);

  const currentChapter = chapterStates.find(c => !c.isLocked && c.cp.masteryLevel < 5) || chapterStates[0];
  const weakChapters = chapterStates.filter(c =>
    (c.cp.practiceAttempts || []).some(a => !a.correct) && c.cp.masteryLevel < 5
  );

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
    <div className="min-h-screen bg-paper">
      {/* ─── Course Hero Header ─── */}
      <div className={`bg-gradient-to-r ${meta.color || 'from-forest-deep to-forest'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-5">
            <Link to="/learn" className="hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> RegLearn
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80">{meta.code}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-md bg-white/15 text-white font-bold text-xs">{meta.code}</span>
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-white/80 text-xs font-medium">{meta.regulator}</span>
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-white/80 text-xs font-medium">{meta.difficulty}</span>
                {stats.streak > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                    <Flame className="w-3.5 h-3.5" /> {stats.streak}-day streak
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-tight">{course.title}</h1>
              <p className="text-sm text-white/70 leading-relaxed max-w-xl">{course.description}</p>
            </div>

            {/* Progress Ring */}
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
                <div className="text-white/70 text-xs">{stats.completed} chapters complete</div>
                <div className="text-white/70 text-xs">{stats.totalChallengesCompleted} challenges done</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats Band ─── */}
      <div className="bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-line">
            {[
              { label: 'Chapters', value: stats.total, icon: BookOpen },
              { label: 'Mastered', value: stats.mastered, icon: Star, hi: stats.mastered > 0 },
              { label: 'Weak Areas', value: stats.weakAreas, icon: AlertCircle, warn: stats.weakAreas > 0 },
              { label: 'Streak', value: `${stats.streak}d`, icon: Flame, hi: stats.streak > 1 },
            ].map(({ label, value, icon: Icon, hi, warn }) => (
              <div key={label} className="py-3 px-4 sm:px-6 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  hi ? 'bg-forest text-white' : warn ? 'bg-rose-50 text-rose-600' : 'bg-mint text-forest'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">{value}</div>
                  <div className="text-[10px] text-ink-soft uppercase tracking-wider">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ─── MAIN CONTENT ─── */}
          <div className="flex-1 min-w-0">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-line mb-6 overflow-x-auto no-scrollbar">
              {[
                { id: 'path', label: 'Learning Path', icon: BookOpen },
                { id: 'challenges', label: 'Challenges', icon: Zap },
                { id: 'mastery', label: 'Mastery View', icon: Target },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === id
                      ? 'bg-forest text-white shadow-sm'
                      : 'text-ink-soft hover:text-forest hover:bg-mint'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>

            {/* ═══ TAB: LEARNING PATH ═══ */}
            {activeTab === 'path' && (
              <div className="space-y-3">
                {chapterStates.map((ch, idx) => {
                  const isActive = currentChapter?.num === ch.num;
                  return (
                    <div
                      key={ch.num}
                      className={`relative bg-white rounded-2xl border transition-all ${
                        isActive
                          ? 'border-forest shadow-md ring-1 ring-forest/20'
                          : ch.cp.masteryLevel === 5
                          ? 'border-line opacity-80'
                          : 'border-line'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-forest rounded-l-2xl" />
                      )}
                      <div className="p-4 sm:p-5 pl-5 sm:pl-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Number badge */}
                          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                              ch.cp.masteryLevel === 5
                                ? 'bg-forest text-white'
                                : isActive
                                ? 'bg-mint border-2 border-forest text-forest'
                                : ch.isLocked
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-mint text-forest border border-mint-deep'
                            }`}>
                              {ch.cp.masteryLevel === 5 ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : ch.isLocked ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                String(ch.num).padStart(2, '0')
                              )}
                            </div>
                            {idx < chapterStates.length - 1 && (
                              <div className={`w-px h-3 ${ch.cp.masteryLevel === 5 ? 'bg-forest/30' : 'bg-line'}`} />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="min-w-0 flex-1">
                                {ch.band && (
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-0.5">{ch.band}</div>
                                )}
                                <h3 className={`font-semibold text-sm leading-snug ${ch.isLocked ? 'text-gray-400' : 'text-ink'}`}>
                                  Chapter {ch.num}: {ch.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  <span className="text-[10px] text-ink-soft flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" /> {ch.lessons?.length || 0} lessons
                                  </span>
                                  <span className="text-[10px] text-ink-soft flex items-center gap-1">
                                    <Brain className="w-3 h-3" /> {ch.questions?.length || 0} Qs
                                  </span>
                                  <MasteryBadge level={ch.cp.masteryLevel} />
                                </div>
                              </div>

                              {/* CTA */}
                              {!ch.isLocked ? (
                                <Link
                                  to={`/learn/${courseSlug}/chapter/${ch.num}`}
                                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] ${
                                    ch.cp.masteryLevel === 5
                                      ? 'bg-mint text-forest border border-mint-deep hover:bg-mint-deep'
                                      : isActive
                                      ? 'bg-forest text-white shadow-sm hover:bg-forest-deep'
                                      : 'bg-mint text-forest border border-mint-deep hover:bg-forest hover:text-white hover:border-transparent'
                                  }`}
                                >
                                  {ch.cp.masteryLevel === 5 ? (
                                    <><RefreshCw className="w-3.5 h-3.5" />Review</>
                                  ) : ch.nextAction === 'learn' ? (
                                    <><Play className="w-3.5 h-3.5" />Start</>
                                  ) : (
                                    <><ChevronRight className="w-3.5 h-3.5" />Continue</>
                                  )}
                                </Link>
                              ) : (
                                <button
                                  onClick={() => initiateCheckout({ productType: 'course', productId: courseSlug })}
                                  className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer min-h-[36px]"
                                >
                                  Unlock ₹499
                                </button>
                              )}
                            </div>

                            {/* Step progress */}
                            {!ch.isLocked && ch.cp.masteryLevel > 0 && ch.cp.masteryLevel < 5 && (
                              <div className="mt-3 space-y-1">
                                <div className="flex gap-2 flex-wrap">
                                  {[
                                    { label: 'Learn', done: ch.cp.lessonRead },
                                    { label: 'Walkthrough', done: ch.cp.walkthroughDone },
                                    { label: 'Recall', done: ch.cp.recallDone },
                                    { label: 'Practice', done: (ch.cp.practiceAttempts || []).length > 0 },
                                    { label: 'Challenge', done: (ch.cp.challengeScores || []).length > 0 },
                                  ].map(({ label, done }) => (
                                    <span key={label} className={`text-[10px] flex items-center gap-0.5 font-medium ${done ? 'text-forest' : 'text-gray-300'}`}>
                                      {done ? '✓' : '○'} {label}
                                    </span>
                                  ))}
                                </div>
                                <div className="h-1.5 bg-mint-deep rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-forest rounded-full transition-all duration-500"
                                    style={{ width: `${(ch.cp.masteryLevel / 5) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Course completion state */}
                {stats.mastered === stats.total && stats.total > 0 && (
                  <div className="bg-forest rounded-2xl p-6 text-white text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                      <Award className="w-7 h-7 text-amber-300" />
                    </div>
                    <h3 className="font-display font-bold text-xl">Regulation Mastered!</h3>
                    <p className="text-emerald-200 text-sm">{meta.code} — {stats.total}/{stats.total} chapters mastered</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <Link to="/membership" className="px-4 py-2 bg-white text-forest font-bold text-sm rounded-xl hover:bg-mint transition-colors">
                        View Certificate
                      </Link>
                      <Link to={`/learn/${courseSlug}/challenge/rapid-recall`} className="px-4 py-2 bg-white/20 text-white font-bold text-sm rounded-xl hover:bg-white/30 transition-colors border border-white/30">
                        Review Weak Areas
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ TAB: CHALLENGES ═══ */}
            {activeTab === 'challenges' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-line">
                  <h3 className="font-display font-bold text-lg text-forest-deep mb-1">Regulatory Challenges</h3>
                  <p className="text-sm text-ink-soft">Targeted activities to sharpen recall, test application, and build professional judgment.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'rapid-recall', title: 'Quick Recall',
                      desc: 'Answer 5 rapid-fire questions on key provisions, thresholds, and timelines.',
                      Icon: Brain, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200',
                      iconBg: 'bg-white', time: '3 min', level: 'Recall',
                    },
                    {
                      id: 'find-mistake', title: 'Find the Mistake',
                      desc: 'Identify the incorrect statement about a provision from four options.',
                      Icon: AlertCircle, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200',
                      iconBg: 'bg-white', time: '5 min', level: 'Recognition',
                    },
                    {
                      id: 'scenario', title: 'Compliance Scenario',
                      desc: 'A compliance officer faces a regulatory situation. What is the right course of action?',
                      Icon: Target, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200',
                      iconBg: 'bg-white', time: '8 min', level: 'Application',
                    },
                    {
                      id: 'which-number', title: 'Which Number?',
                      desc: 'Recall statutory thresholds, timelines, limits, and numerical requirements.',
                      Icon: BarChart3, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200',
                      iconBg: 'bg-white', time: '4 min', level: 'Recall',
                    },
                    {
                      id: 'interview-drill', title: 'Interview Drill',
                      desc: 'Professional Q&A: explain provisions concisely as in a technical interview.',
                      Icon: Award, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
                      iconBg: 'bg-white', time: '10 min', level: 'Professional',
                    },
                    {
                      id: 'weak-areas', title: 'Fix My Weak Areas',
                      desc: stats.weakAreas > 0
                        ? `Revisit ${stats.weakAreas} chapters where you answered incorrectly.`
                        : 'No weak areas yet — complete practice questions to identify gaps.',
                      Icon: TrendingUp, bg: 'bg-forest', text: 'text-white', border: 'border-transparent',
                      iconBg: 'bg-white/20', time: '5 min', level: 'Review',
                      disabled: stats.weakAreas === 0,
                    },
                  ].map(({ id, title, desc, Icon, bg, text, border, iconBg, time, level, disabled }) => (
                    <Link
                      key={id}
                      to={disabled ? '#' : `/learn/${courseSlug}/challenge/${id}`}
                      onClick={e => disabled && e.preventDefault()}
                      className={`block rounded-2xl p-4 sm:p-5 border transition-all ${bg} ${text} ${border} ${
                        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-current/10"
                            style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
                            {level}
                          </span>
                          <span className="text-[10px] flex items-center gap-0.5 opacity-70">
                            <Clock className="w-3 h-3" /> {time}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base mb-1">{title}</h4>
                      <p className="text-xs sm:text-sm leading-relaxed opacity-80">{desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ TAB: MASTERY VIEW ═══ */}
            {activeTab === 'mastery' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-line">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className="font-display font-bold text-lg text-forest-deep">Mastery Ladder</h3>
                    <div className="text-xs text-ink-soft bg-mint px-3 py-1 rounded-full font-semibold">
                      {stats.mastered}/{stats.total} Mastered
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5">
                    {Object.values(MASTERY_LEVELS).map(ml => (
                      <span key={ml.id} className="flex items-center gap-1.5 text-[10px]">
                        <span className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                          style={{ backgroundColor: ml.id === 5 ? '#0B4D33' : ml.bg === '#0B4D33' ? '#0B4D33' : ml.bg || '#E5E7EB' }} />
                        <span className="text-ink-soft">{ml.label}</span>
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {chapterStates.map(ch => (
                      <div key={ch.num} className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-ink-soft w-5 flex-shrink-0 text-center">{ch.num}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                            <span className="text-xs text-ink truncate max-w-[200px]">{ch.title}</span>
                            <MasteryBadge level={ch.cp.masteryLevel} />
                          </div>
                          <div className="h-2 bg-mint-deep rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${(ch.cp.masteryLevel / 5) * 100}%`,
                                backgroundColor: ch.cp.masteryLevel === 5 ? '#0B4D33'
                                  : ch.cp.masteryLevel >= 4 ? '#059669'
                                  : ch.cp.masteryLevel >= 3 ? '#EA580C'
                                  : ch.cp.masteryLevel >= 2 ? '#D97706'
                                  : ch.cp.masteryLevel >= 1 ? '#2563EB' : '#E5E7EB',
                              }}
                            />
                          </div>
                        </div>
                        {!ch.isLocked && (
                          <Link to={`/learn/${courseSlug}/chapter/${ch.num}`}
                            className="flex-shrink-0 text-forest hover:text-forest-deep">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {weakChapters.length > 0 && (
                  <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200">
                    <h4 className="font-bold text-rose-800 mb-3 flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4" /> Weak Areas
                    </h4>
                    <div className="space-y-2">
                      {weakChapters.slice(0, 5).map(ch => (
                        <Link key={ch.num} to={`/learn/${courseSlug}/chapter/${ch.num}`}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 transition-colors">
                          <span className="text-sm text-rose-800 font-medium">Ch {ch.num}: {ch.title}</span>
                          <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
                            Practice <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          <div className="lg:w-72 xl:w-80 space-y-4 flex-shrink-0">
            {currentChapter && (
              <div className="bg-forest rounded-2xl p-5 text-white">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Next Action
                </div>
                <h4 className="font-display font-bold text-base leading-snug mb-1">
                  Ch {currentChapter.num}: {currentChapter.title}
                </h4>
                <p className="text-emerald-200 text-xs mb-4">{ACTION_LABELS[currentChapter.nextAction] || 'Continue'}</p>
                <Link to={`/learn/${courseSlug}/chapter/${currentChapter.num}`}
                  className="w-full block py-2.5 rounded-xl bg-white text-forest font-bold text-sm text-center hover:bg-mint transition-colors">
                  {currentChapter.nextAction === 'learn' ? 'Start Learning →' : 'Continue →'}
                </Link>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 border border-line">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gold mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold" /> Today's Session
              </div>
              <h4 className="font-semibold text-ink text-sm mb-1">Daily 5-Minute Review</h4>
              <p className="text-ink-soft text-xs leading-relaxed mb-3">3 recall questions · 1 scenario · 1 number quiz</p>
              <Link to={`/learn/${courseSlug}/challenge/rapid-recall`}
                className="w-full block py-2.5 rounded-xl bg-mint text-forest font-bold text-sm text-center hover:bg-forest hover:text-white transition-colors border border-mint-deep">
                Start Session →
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-line space-y-3">
              <h4 className="font-semibold text-ink text-sm">Course Overview</h4>
              {[
                { label: 'Chapters', value: course.totalChapters },
                { label: 'Lessons', value: course.totalLessons },
                { label: 'Practice Qs', value: course.totalQuestions },
                { label: 'Est. Time', value: `${meta.durationHours || '–'} hrs` },
                { label: 'Difficulty', value: meta.difficulty || '–' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-ink-soft">{label}</span>
                  <span className="font-semibold text-ink">{value}</span>
                </div>
              ))}
            </div>

            {stats.overallPct >= 80 && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Nearly Complete
                </div>
                <p className="text-amber-800 text-xs leading-relaxed mb-3">
                  {stats.overallPct}% mastery achieved. Complete the remaining chapters for your certificate.
                </p>
                <Link to="/membership"
                  className="w-full block py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm text-center hover:bg-amber-700 transition-colors">
                  View Certificate →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
