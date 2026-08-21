import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Brain, Target, AlertCircle, BarChart3, Award,
  TrendingUp, Clock, CheckCircle2, X, Check, ChevronRight,
  RotateCcw, Flame, Zap, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import coursesData from '../data/courses.json';
import { recordChallengeScore, getCourseStats } from '../utils/learnProgress';

const CHALLENGE_TYPES = {
  'rapid-recall': {
    title: 'Quick Recall',
    subtitle: 'Answer 5 questions from key provisions in this regulation.',
    icon: Brain, color: '#2563EB', bg: '#EFF6FF',
    time: 30, qCount: 5,
  },
  'find-mistake': {
    title: 'Find the Mistake',
    subtitle: 'One statement in each group is incorrect. Identify it.',
    icon: AlertCircle, color: '#DC2626', bg: '#FEF2F2',
    time: 45, qCount: 5,
  },
  'scenario': {
    title: 'Compliance Scenario',
    subtitle: 'A compliance officer faces a regulatory situation. What is the right course of action?',
    icon: Target, color: '#D97706', bg: '#FFFBEB',
    time: 60, qCount: 3,
  },
  'which-number': {
    title: 'Which Number?',
    subtitle: 'Test your recall of statutory thresholds, timelines, and numerical limits.',
    icon: BarChart3, color: '#7C3AED', bg: '#F5F3FF',
    time: 20, qCount: 5,
  },
  'interview-drill': {
    title: 'Interview Drill',
    subtitle: 'Professional Q&A in the style of a technical regulatory interview.',
    icon: Award, color: '#059669', bg: '#ECFDF5',
    time: 60, qCount: 5,
  },
  'weak-areas': {
    title: 'Weak Areas',
    subtitle: 'Questions from chapters where you have previously answered incorrectly.',
    icon: TrendingUp, color: '#0B4D33', bg: '#EEF6F0',
    time: 45, qCount: 5,
  },
};

function extractChallengeQuestions(course, chapters, challengeType) {
  const allQs = [];
  chapters.forEach(ch => {
    (ch.questions || []).forEach(q => {
      const payload = q.payload || {};
      const options = (payload.options || []).map(o => typeof o === 'string' ? o : o.t || o.k || '');
      if (options.length < 2) return;
      const correctKey = payload.answer || 'A';
      const correctIdx = ['A', 'B', 'C', 'D'].indexOf(correctKey);
      allQs.push({
        id: q.uid,
        q: payload.q || q.title || '',
        options,
        correctIdx: correctIdx >= 0 ? correctIdx : 0,
        explain: payload.scenario || payload.tip || payload.explain || '',
        provision: q.provision || '',
        chapterNum: ch.num,
        chapterTitle: ch.title,
        type: q.itemType || 'mcq',
        difficulty: q.difficulty || '1',
      });
    });
  });

  // Shuffle
  const shuffled = [...allQs].sort(() => Math.random() - 0.5);
  const meta = CHALLENGE_TYPES[challengeType] || CHALLENGE_TYPES['rapid-recall'];
  return shuffled.slice(0, meta.qCount);
}

export default function ChallengeEngine() {
  const { courseSlug, challengeType } = useParams();
  const [searchParams] = useSearchParams();
  const { isMember, hasCourseAccess } = useAuth();

  const course = coursesData[courseSlug];
  const chapters = course?.chapters || [];
  const isOwned = Boolean(isMember || hasCourseAccess?.(courseSlug));

  const challengeMeta = CHALLENGE_TYPES[challengeType] || CHALLENGE_TYPES['rapid-recall'];
  const Icon = challengeMeta.icon;

  // State machine: 'intro' | 'active' | 'done'
  const [phase, setPhase] = useState('intro');
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(challengeMeta.time);
  const timerRef = useRef(null);

  const questions = useMemo(
    () => extractChallengeQuestions(course, chapters, challengeType),
    [courseSlug, challengeType]
  );

  const currentQ = questions[qIdx];

  // Timer
  useEffect(() => {
    if (phase !== 'active' || submitted) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Auto-submit on timeout
          handleAutoTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIdx, submitted]);

  const handleAutoTimeout = useCallback(() => {
    setSubmitted(true);
    setResults(prev => [...prev, { correct: false, selected: null, timeout: true }]);
  }, []);

  const handleStart = () => {
    setPhase('active');
    setQIdx(0);
    setSelected(null);
    setSubmitted(false);
    setResults([]);
    setTimeLeft(challengeMeta.time);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    clearInterval(timerRef.current);
    const correct = selected === currentQ.correctIdx;
    setSubmitted(true);
    setResults(prev => [...prev, { correct, selected, correctIdx: currentQ.correctIdx }]);
    if (currentQ) {
      recordChallengeScore(courseSlug, currentQ.chapterNum, challengeType, correct ? 1 : 0, 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setSubmitted(false);
    setTimeLeft(challengeMeta.time);
    if (qIdx < questions.length - 1) {
      setQIdx(i => i + 1);
    } else {
      setPhase('done');
    }
  };

  const handleRestart = () => {
    setPhase('intro');
    setQIdx(0);
    setSelected(null);
    setSubmitted(false);
    setResults([]);
    setTimeLeft(challengeMeta.time);
  };

  const score = results.filter(r => r.correct).length;
  const total = results.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const timerPct = (timeLeft / challengeMeta.time) * 100;
  const timerColor = timeLeft > 15 ? '#0B4D33' : timeLeft > 7 ? '#D97706' : '#DC2626';

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center space-y-3">
          <p className="text-ink-soft">Course not found.</p>
          <Link to="/learn" className="text-forest font-semibold text-sm hover:underline">← Back to RegLearn</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="bg-white border-b border-line sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to={`/learn/${courseSlug}`}
            className="flex items-center gap-1.5 text-ink-soft hover:text-forest transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Course</span>
          </Link>
          <div className="text-center">
            <div className="text-xs font-bold text-ink-soft uppercase tracking-wider">{challengeMeta.title}</div>
            {phase === 'active' && (
              <div className="text-[10px] text-ink-soft">Q {qIdx + 1} of {questions.length}</div>
            )}
          </div>
          {phase === 'active' && (
            <div className="flex items-center gap-1.5 text-sm font-mono font-bold"
              style={{ color: timerColor }}>
              <Clock className="w-3.5 h-3.5" />
              {timeLeft}s
            </div>
          )}
          {phase !== 'active' && <div className="w-16" />}
        </div>
        {/* Timer bar */}
        {phase === 'active' && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
            />
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ═══ PHASE: INTRO ═══ */}
        {phase === 'intro' && (
          <div className="space-y-6 animate-fade-in-up">
            <div
              className="rounded-3xl p-8 sm:p-10 text-center space-y-5"
              style={{ backgroundColor: challengeMeta.bg }}
            >
              <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center"
                style={{ backgroundColor: challengeMeta.color + '20', border: `2px solid ${challengeMeta.color}30` }}>
                <Icon className="w-10 h-10" style={{ color: challengeMeta.color }} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-forest-deep mb-2">{challengeMeta.title}</h1>
                <p className="text-sm sm:text-base text-ink-soft leading-relaxed max-w-md mx-auto">{challengeMeta.subtitle}</p>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-ink">{questions.length}</div>
                  <div className="text-xs text-ink-soft">Questions</div>
                </div>
                <div className="w-px h-8 bg-line" />
                <div className="text-center">
                  <div className="font-bold text-ink">{challengeMeta.time}s</div>
                  <div className="text-xs text-ink-soft">Per question</div>
                </div>
                <div className="w-px h-8 bg-line" />
                <div className="text-center">
                  <div className="font-bold text-ink">80%+</div>
                  <div className="text-xs text-ink-soft">To master</div>
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="bg-white rounded-2xl p-4 border border-line text-center">
                  <p className="text-sm text-ink-soft">Not enough questions available for this challenge type yet.</p>
                  <Link to={`/learn/${courseSlug}`} className="mt-2 inline-block text-forest font-semibold text-sm hover:underline">
                    ← Back to Course
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleStart}
                  className="px-8 py-4 bg-forest text-white font-bold text-base rounded-2xl hover:bg-forest-deep transition-all shadow-md cursor-pointer flex items-center gap-2 mx-auto"
                >
                  <Zap className="w-5 h-5 text-amber-300" /> Start Challenge
                </button>
              )}
            </div>

            {/* Recent challenge stats */}
            <div className="bg-white rounded-2xl border border-line p-5">
              <h3 className="font-semibold text-ink text-sm mb-3">About This Challenge</h3>
              <div className="space-y-2 text-xs text-ink-soft">
                <p>• Questions are drawn from {course.totalChapters} chapters of {course.title}</p>
                <p>• Each question has a {challengeMeta.time}-second timer</p>
                <p>• Score 80% or above to mark chapters as Proficient</p>
                <p>• Score 80% + good practice accuracy = Mastered status</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PHASE: ACTIVE ═══ */}
        {phase === 'active' && currentQ && (
          <div className="space-y-5 animate-fade-in-up">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 justify-center">
              {questions.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                  i < qIdx ? (results[i]?.correct ? 'bg-forest' : 'bg-rose-500')
                  : i === qIdx ? 'bg-forest w-4'
                  : 'bg-gray-200'
                }`} />
              ))}
            </div>

            {/* Chapter context */}
            <div className="text-center">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                Chapter {currentQ.chapterNum} · {currentQ.provision}
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-line p-5 sm:p-6 space-y-5 shadow-sm">
              <p className="text-sm sm:text-base sm:text-lg font-semibold text-ink leading-snug">{currentQ.q}</p>

              <div className="grid gap-2.5">
                {currentQ.options.map((opt, idx) => {
                  const label = ['A', 'B', 'C', 'D'][idx];
                  const isSelected = selected === idx;
                  const isCorrect = idx === currentQ.correctIdx;
                  const hasChosen = submitted;

                  let cls = 'border-line bg-white hover:border-forest/50 hover:bg-mint/30 text-ink cursor-pointer';
                  if (hasChosen) {
                    if (isCorrect) cls = 'border-forest bg-mint text-forest font-bold cursor-default';
                    else if (isSelected) cls = 'border-rose-400 bg-rose-50 text-rose-800 cursor-default';
                    else cls = 'border-line bg-white opacity-40 cursor-default text-ink-soft';
                  } else if (isSelected) {
                    cls = 'border-forest bg-mint text-forest cursor-pointer';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !submitted && setSelected(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 min-h-[48px] ${cls}`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 ${
                        hasChosen && isCorrect ? 'bg-forest text-white'
                        : hasChosen && isSelected && !isCorrect ? 'bg-rose-500 text-white'
                        : isSelected ? 'bg-forest text-white'
                        : 'bg-mint text-forest'
                      }`}>
                        {hasChosen && isCorrect ? <Check className="w-3.5 h-3.5" />
                        : hasChosen && isSelected && !isCorrect ? <X className="w-3.5 h-3.5" />
                        : label}
                      </span>
                      <span className="text-sm leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Timeout notice */}
              {submitted && results[results.length - 1]?.timeout && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 text-center">
                  Time's up! The correct answer is highlighted above.
                </div>
              )}

              {/* Feedback */}
              {submitted && !results[results.length - 1]?.timeout && (
                <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                  selected === currentQ.correctIdx
                    ? 'bg-mint border border-forest/20 text-forest'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}>
                  <div className="font-bold text-[10px] uppercase tracking-wider mb-1">
                    {selected === currentQ.correctIdx ? '✓ Correct' : '⚠ Review'}
                  </div>
                  {currentQ.explain && <p>{currentQ.explain}</p>}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                {!submitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selected === null}
                    className="flex-1 py-3.5 rounded-xl bg-forest text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-forest-deep transition-colors min-h-[48px]"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3.5 rounded-xl bg-forest text-white font-bold text-sm cursor-pointer hover:bg-forest-deep transition-colors min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {qIdx < questions.length - 1 ? (
                      <>Next <ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <>See Results <Award className="w-4 h-4 text-amber-300" /></>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Live score */}
            <div className="flex items-center justify-center gap-6 text-center text-xs text-ink-soft">
              <span><strong className="text-emerald-600 text-sm">{results.filter(r => r.correct).length}</strong> correct</span>
              <span><strong className="text-rose-500 text-sm">{results.filter(r => !r.correct).length}</strong> wrong</span>
              <span><strong className="text-ink text-sm">{questions.length - results.length}</strong> remaining</span>
            </div>
          </div>
        )}

        {/* ═══ PHASE: DONE ═══ */}
        {phase === 'done' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Score card */}
            <div className={`rounded-3xl p-8 sm:p-10 text-center space-y-4 ${
              pct >= 80 ? 'bg-forest text-white' : pct >= 60 ? 'bg-amber-50' : 'bg-rose-50'
            }`}>
              <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold font-mono ${
                pct >= 80 ? 'bg-white/20 text-white' : pct >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {pct}%
              </div>

              <div>
                <h2 className={`text-2xl font-display font-bold mb-1 ${pct >= 80 ? 'text-white' : 'text-forest-deep'}`}>
                  {pct >= 80 ? 'Excellent Work!' : pct >= 60 ? 'Good Progress' : 'Keep Practicing'}
                </h2>
                <p className={`text-sm ${pct >= 80 ? 'text-emerald-200' : 'text-ink-soft'}`}>
                  {score} of {total} questions correct
                </p>
              </div>

              {pct >= 80 && (
                <div className="flex items-center justify-center gap-2 text-emerald-200 text-xs font-medium">
                  <Flame className="w-4 h-4 text-amber-300" />
                  Chapter mastery updated — chapters marked as Proficient or Mastered
                </div>
              )}
            </div>

            {/* Question review */}
            <div className="bg-white rounded-2xl border border-line p-5">
              <h3 className="font-semibold text-ink text-sm mb-4">Question Review</h3>
              <div className="space-y-3">
                {questions.map((q, i) => {
                  const r = results[i];
                  if (!r) return null;
                  return (
                    <div key={i} className={`p-3 rounded-xl border text-xs ${
                      r.correct ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
                    }`}>
                      <div className="flex items-start gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          r.correct ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                        }`}>
                          {r.correct ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </span>
                        <div className="min-w-0">
                          <p className={`font-medium leading-snug ${r.correct ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {q.q.length > 120 ? q.q.slice(0, 120) + '…' : q.q}
                          </p>
                          {!r.correct && r.selected !== null && (
                            <div className="mt-1 text-rose-600 font-medium">
                              You answered: {q.options[r.selected]} <br />
                              <span className="text-emerald-700">Correct: {q.options[q.correctIdx]}</span>
                            </div>
                          )}
                          {r.timeout && (
                            <div className="mt-1 text-gray-600 font-medium">
                              Timed out · Correct: {q.options[q.correctIdx]}
                            </div>
                          )}
                          {q.provision && (
                            <div className="mt-1 font-mono text-[10px] opacity-60">{q.provision}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleRestart}
                className="py-3 rounded-xl bg-white border border-line text-ink font-semibold text-sm hover:border-forest hover:text-forest transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <Link
                to={`/learn/${courseSlug}`}
                className="py-3 rounded-xl bg-mint border border-mint-deep text-forest font-semibold text-sm text-center hover:bg-forest hover:text-white hover:border-transparent transition-colors"
              >
                ← Course Home
              </Link>
              <Link
                to={`/learn/${courseSlug}/challenge/${
                  challengeType === 'rapid-recall' ? 'scenario'
                  : challengeType === 'scenario' ? 'which-number'
                  : 'rapid-recall'
                }`}
                className="py-3 rounded-xl bg-forest text-white font-semibold text-sm text-center hover:bg-forest-deep transition-colors flex items-center justify-center gap-2"
              >
                Next Challenge <Zap className="w-4 h-4 text-amber-300" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
