import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, Award, CheckCircle, XCircle, ArrowRight, RotateCcw,
  Flag, AlertCircle, Loader2, ChevronDown, ChevronUp, BookOpen,
  GraduationCap, Target, BarChart3, MinusCircle, CheckCircle2, Lock,
  Sparkles, Download, ExternalLink, ShieldCheck, HelpCircle, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/UpgradeModal';
import {
  CANONICAL_MOCK_TESTS,
  MOCK_TEST_ALIASES,
  getCanonicalMockTest,
  isValidMockTestSlug
} from '../data/mockTestsConfig';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const DURATION_SECONDS = 90 * 60; // 90 minutes

// ─── Timer Hook ────────────────────────────────────────────────────────────
function useTimer(initialSeconds, onExpire) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const intervalRef = useRef(null);
  const expiredRef = useRef(false);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onExpire]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const isLow = remaining <= 300; // last 5 minutes

  return { start, stop, remaining, display: `${mm}:${ss}`, isLow };
}

// ─── Difficulty Badge ──────────────────────────────────────────────────────
function DiffBadge({ diff }) {
  const map = {
    Beginner: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Foundational: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
    Advanced: 'bg-amber-100 text-amber-800 border-amber-200',
    Expert: 'bg-purple-100 text-purple-800 border-purple-200'
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[diff] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {diff || 'General'}
    </span>
  );
}

// ─── Option Button ─────────────────────────────────────────────────────────
function OptionButton({ letter, text, selected, onSelect, disabled }) {
  const base = 'cursor-pointer w-full p-3 sm:p-4 rounded-xl border-2 text-left text-sm flex items-start gap-3 transition-all min-h-[52px]';
  const style = selected
    ? 'bg-mint/80 border-forest text-forest-deep font-semibold shadow-xs'
    : 'bg-white border-line text-ink hover:border-forest/60 hover:bg-mint/30';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`${base} ${style}`}
    >
      <span className={`px-2.5 py-1 rounded-lg font-bold text-xs flex-shrink-0 min-w-[28px] text-center border ${
        selected ? 'bg-forest text-white border-forest' : 'bg-paper text-ink-soft border-line'
      }`}>
        {letter}
      </span>
      <span className="pt-0.5 leading-relaxed">{text}</span>
    </button>
  );
}

// ─── Landing Screen ────────────────────────────────────────────────────────
function LandingScreen({ meta, onStart, loading, error, selectedSlug, onSwitchTest }) {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link to="/practice" className="inline-flex items-center text-xs font-semibold text-ink-soft hover:text-forest min-h-[44px]">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to RegPractice
        </Link>

        {/* Test switcher — All 5 Canonical Full-Length Mock Tests */}
        <div className="flex items-center gap-1.5 bg-white border border-line p-1 rounded-xl text-xs font-bold shadow-2xs overflow-x-auto max-w-full">
          {CANONICAL_MOCK_TESTS.map(test => (
            <button
              key={test.slug}
              onClick={() => onSwitchTest(test.slug)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-xs ${
                selectedSlug === test.slug ? 'bg-forest text-white' : 'text-ink-soft hover:text-forest hover:bg-mint/40'
              }`}
            >
              {test.shortTitle}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-line rounded-3xl p-6 sm:p-10 card-shadow overflow-hidden relative">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-mint to-transparent rounded-full -mr-20 -mt-20 pointer-events-none opacity-60" />

        {/* Header */}
        <div className="flex items-start gap-4 mb-6 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-deep to-forest text-white flex items-center justify-center shadow-md flex-shrink-0">
            <GraduationCap className="w-8 h-8 text-gold" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-mint border border-mint-deep text-[11px] font-bold uppercase tracking-wider text-forest mb-1.5">
              <Sparkles className="w-3 h-3 text-leaf" />
              <span>{meta?.track || 'RegReady Simulation'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display text-forest-deep font-bold leading-tight">
              {meta?.exam_name || 'IFSCA Full-Length Regulatory Mock Test'}
            </h1>
          </div>
        </div>

        <p className="text-ink-soft text-sm sm:text-base mb-8 leading-relaxed">
          Experience the high-stakes timed examination environment. Practice with negative marking, domain weightage distribution, detailed answer explanations, and verified statutory citations.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Total Questions', value: meta?.total || 100, color: 'text-forest' },
            { icon: Clock, label: 'Test Duration', value: `${meta?.duration_minutes || 90} Mins`, color: 'text-blue-700' },
            { icon: MinusCircle, label: 'Negative Mark', value: '−0.25', color: 'text-rose-600' },
            { icon: Target, label: 'Pass Benchmark', value: `${meta?.pass_benchmark_pct || 70}%`, color: 'text-emerald-700' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-paper border border-line rounded-2xl p-4 text-center shadow-2xs">
              <Icon className={`w-5 h-5 mx-auto mb-1.5 ${color}`} />
              <span className={`block text-xl font-extrabold ${color}`}>{value}</span>
              <span className="text-[11px] font-semibold text-ink-soft mt-0.5 block">{label}</span>
            </div>
          ))}
        </div>

        {/* Free Preview Banner */}
        <div className="bg-mint border border-mint-deep rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-forest text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-leaf-bright" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-forest-deep">Question 1 & 2 Free Preview</h4>
              <p className="text-xs text-ink-soft">Test the simulation interface freely. Unlock Question 3 onwards with a single pass or annual membership.</p>
            </div>
          </div>
          {meta?.userAccess?.hasAccess ? (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg">
              Full Test Unlocked
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-lg">
              ₹499 to Unlock Full Test
            </span>
          )}
        </div>

        {/* Syllabus / Domain coverage */}
        {meta?.topics && meta.topics.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest mb-3">
              Domain & Syllabus Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {meta.topics.map(t => (
                <div key={t.topic_number} className="flex items-center justify-between p-3 bg-paper border border-line rounded-xl text-xs">
                  <span className="text-ink font-semibold truncate max-w-[240px]">
                    <span className="font-bold text-forest mr-1.5">T{t.topic_number}.</span>
                    {t.topic_name}
                  </span>
                  <span className="text-leaf font-bold ml-2 bg-mint px-2 py-0.5 rounded-md border border-mint-deep">
                    {t.count} Qs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exam Rules & Instructions */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 mb-8 text-xs text-amber-950 space-y-1.5">
          <p className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            Exam Simulation Guidelines:
          </p>
          <p>• Correct answer: <strong>+1.00 mark</strong></p>
          <p>• Incorrect answer: <strong>−0.25 marks</strong></p>
          <p>• Unattempted questions: <strong>0.00 marks</strong> (no penalty)</p>
          <p>• Real-time countdown timer auto-submits when 90 minutes expire.</p>
          <p>• Answers & full statutory citations revealed only after submission.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onStart}
            disabled={loading}
            className="w-full sm:w-auto px-10 py-4 bg-forest hover:bg-forest-deep text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[52px] cursor-pointer"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Preparing Exam Questions…</>
            ) : (
              <><GraduationCap className="w-5 h-5 text-gold" /> Start Timed Mock Test</>
            )}
          </button>
        </div>

        <p className="text-center text-[11px] text-ink-soft mt-4">
          {meta?.disclaimer || 'RegMate independent practice examination simulation.'}
        </p>
      </div>
    </div>
  );
}

// ─── Test Screen ───────────────────────────────────────────────────────────
function TestScreen({
  questions,
  answers,
  flagged,
  onSelect,
  onFlag,
  onSubmit,
  timer,
  onTriggerUpgrade,
  hasFullAccess,
  examName
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  const q = questions[currentIdx] || questions[0];
  const isLocked = q?.isLocked;

  const opts = (Array.isArray(q?.options) && q.options.length > 0)
    ? q.options.map((o, idx) => ({
        letter: o.key || o.letter || String.fromCharCode(65 + idx),
        text: o.text || o.title || ''
      }))
    : [
        { letter: 'A', text: q?.option_a },
        { letter: 'B', text: q?.option_b },
        { letter: 'C', text: q?.option_c },
        { letter: 'D', text: q?.option_d },
      ].filter(o => o.text);

  const attempted = Object.keys(answers).length;
  const isFlagged = flagged.has(q.question_code);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top sticky exam bar */}
      <div className="sticky top-0 z-30 bg-forest-deep text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-mint">RegReady Test Engine</span>
          <span className="hidden sm:inline text-white/40">|</span>
          <span className="hidden sm:inline text-xs text-white/80 truncate max-w-[280px]">{examName}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-xs sm:text-sm ${
            timer.isLow ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/15 text-white'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timer.display}</span>
          </div>

          {/* Answered counter */}
          <span className="text-xs text-white/80 hidden sm:inline">
            {attempted} / {questions.length} Attempted
          </span>

          {/* Submit */}
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 bg-leaf hover:bg-leaf-bright text-white font-bold text-xs rounded-xl transition-colors cursor-pointer min-h-[38px] shadow-sm"
          >
            Submit Test
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Main Question Panel */}
        <div className="lg:col-span-8 space-y-5">
          {/* Progress bar */}
          <div className="w-full bg-line h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-leaf rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white border border-line rounded-3xl p-5 sm:p-8 card-shadow">
            {/* Header info */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-6 pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-forest bg-mint border border-mint-deep px-3 py-1 rounded-full">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <DiffBadge diff={q.difficulty} />
                {currentIdx < 2 ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Free Preview
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Paid Question
                  </span>
                )}
              </div>

              {!isLocked && (
                <button
                  type="button"
                  onClick={() => onFlag(q.question_code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] cursor-pointer ${
                    isFlagged
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-paper border border-line text-ink-soft hover:bg-amber-50 hover:text-amber-800'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-600 text-amber-700' : ''}`} />
                  <span>{isFlagged ? 'Flagged for Review' : 'Mark for Review'}</span>
                </button>
              )}
            </div>

            {/* Locked vs Unlocked state */}
            {isLocked ? (
              <div className="p-8 text-center bg-gradient-to-br from-paper to-mint/30 rounded-2xl border border-line space-y-4 my-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold text-forest-deep">
                  Question {currentIdx + 1} is Locked
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
                  You have accessed the 2 free preview questions. Unlock the complete 100-question mock test, negative marking analytics, answer keys with statutory citations, and certification.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onTriggerUpgrade}
                    className="w-full sm:w-auto px-6 py-3 bg-forest hover:bg-forest-deep text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Unlock Full Mock Test (₹499)
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Topic info */}
                <div className="text-xs font-medium text-ink-soft mb-3">
                  Topic: <strong className="text-forest">{q.topic_name || q.domain}</strong> {q.subtopic && `• ${q.subtopic}`}
                </div>

                {/* Question text */}
                <h2 className="text-base sm:text-lg font-semibold text-forest-deep mb-6 leading-relaxed">
                  {q.question_text}
                </h2>

                {/* Options list */}
                <div className="space-y-3">
                  {opts.map(opt => (
                    <OptionButton
                      key={opt.letter}
                      letter={opt.letter}
                      text={opt.text}
                      selected={answers[q.question_code] === opt.letter}
                      onSelect={() => onSelect(q.question_code, opt.letter)}
                      disabled={false}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Question Navigation Bar */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-line gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-paper border border-line rounded-xl font-bold text-xs text-ink hover:bg-mint transition-colors min-h-[42px] disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx(i => i + 1)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-forest hover:bg-forest-deep text-white rounded-xl font-bold text-xs transition-colors min-h-[42px] cursor-pointer shadow-xs"
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-leaf hover:bg-leaf-bright text-white rounded-xl font-bold text-xs transition-colors min-h-[42px] cursor-pointer shadow-sm"
                >
                  Submit Final Test <Award className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Navigator Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-line rounded-3xl p-5 card-shadow sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-2">
                <Layers className="w-4 h-4 text-leaf" />
                Question Palette
              </h3>
              <span className="text-xs font-bold text-ink-soft">
                {attempted} / {questions.length}
              </span>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-ink-soft bg-paper p-2.5 rounded-xl border border-line">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-leaf" /> Answered ({attempted})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Flagged ({flagged.size})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-line" /> Unanswered ({questions.length - attempted})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-300" /> Locked
              </span>
            </div>

            {/* Question Buttons Matrix */}
            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 gap-1.5 max-h-72 overflow-y-auto pr-1">
              {questions.map((question, idx) => {
                const isAnswered = !!answers[question.question_code];
                const isF = flagged.has(question.question_code);
                const isCurrent = idx === currentIdx;
                const isItemLocked = question.isLocked;

                return (
                  <button
                    key={question.question_code}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-forest ring-offset-1 bg-forest text-white'
                        : isF
                        ? 'bg-amber-400 text-amber-950 font-extrabold'
                        : isAnswered
                        ? 'bg-leaf text-white'
                        : isItemLocked
                        ? 'bg-slate-100 text-slate-400 border border-slate-200'
                        : 'bg-paper text-ink-soft border border-line hover:bg-mint'
                    }`}
                  >
                    {isItemLocked ? <Lock className="w-3 h-3 text-slate-400" /> : idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onSubmit}
              className="w-full py-3 bg-forest hover:bg-forest-deep text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              Submit Test Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Results Screen ────────────────────────────────────────────────────────
function ResultsScreen({ result, onRetry, onTriggerUpgrade, selectedSlug }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unanswered'

  const filteredQuestions = (result.perQuestion || []).filter(q => {
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'incorrect') return !q.isCorrect && q.selected;
    if (filter === 'unanswered') return !q.selected;
    return true;
  });

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link to="/practice" className="inline-flex items-center text-xs font-semibold text-ink-soft hover:text-forest">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to RegPractice
        </Link>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-paper border border-line rounded-xl text-xs font-bold text-forest hover:bg-mint transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Retake Test
        </button>
      </div>

      {/* Main Score Hero Card */}
      <div className={`rounded-3xl p-6 sm:p-10 text-white shadow-xl text-center relative overflow-hidden ${
        result.passed
          ? 'bg-gradient-to-br from-forest-deep via-forest to-emerald-950'
          : 'bg-gradient-to-br from-slate-900 via-forest-deep to-slate-900'
      }`}>
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{result.readiness_band || 'Performance Summary'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-bold">
            {result.passed ? 'Congratulations! Test Passed' : 'Test Completed'}
          </h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            {result.passed
              ? `You have cleared the ${result.pass_benchmark_pct}% pass benchmark with a strong performance across key regulatory domains.`
              : `You scored ${result.percentage}%. Target ${result.pass_benchmark_pct}% benchmark to achieve verified examination readiness.`}
          </p>

          {/* Score ring */}
          <div className="flex items-center justify-center my-6">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                <path strokeWidth="3" stroke="rgba(255,255,255,0.15)" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path strokeWidth="3"
                  strokeDasharray={`${Math.max(0, result.percentage)}, 100`}
                  strokeLinecap="round"
                  stroke={result.passed ? '#B48A52' : '#E2E8F0'}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{result.percentage}%</span>
                <span className="text-[11px] font-bold text-gold uppercase">{result.rawScore} Marks</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-w-lg mx-auto">
            <div className="bg-white/10 rounded-2xl p-3">
              <span className="block text-lg font-black text-emerald-300">{result.correct}</span>
              <span className="text-[10px] text-white/70">Correct (+1.0)</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <span className="block text-lg font-black text-rose-300">{result.wrong}</span>
              <span className="text-[10px] text-white/70">Wrong (−0.25)</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <span className="block text-lg font-black text-amber-300">{result.unanswered}</span>
              <span className="text-[10px] text-white/70">Unattempted</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 hidden sm:block">
              <span className="block text-lg font-black text-white">{result.total_evaluated}</span>
              <span className="text-[10px] text-white/70">Evaluated Qs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Free Preview Upgrade Banner */}
      {result.is_preview_result && (
        <div className="bg-gradient-to-r from-mint to-mint-deep border-2 border-forest/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 card-shadow">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-leaf" />
              <span>Full Test Access</span>
            </div>
            <h3 className="text-xl font-display font-bold text-forest-deep">
              Unlock the Full 100-Question Exam Simulation
            </h3>
            <p className="text-xs sm:text-sm text-ink-soft max-w-xl">
              You evaluated the 2-question free preview. Upgrade now to access all 100 scenario questions, detailed difficulty breakdown, full answer review, and verified completion certificate.
            </p>
          </div>
          <button
            type="button"
            onClick={onTriggerUpgrade}
            className="px-6 py-3.5 bg-forest hover:bg-forest-deep text-white font-bold text-xs rounded-xl shadow-md transition-colors whitespace-nowrap cursor-pointer"
          >
            Buy Full Mock Test (₹499)
          </button>
        </div>
      )}

      {/* Certificate Showcase Card if Eligible */}
      {result.certificate && (
        <div className="bg-white border-2 border-gold rounded-3xl p-6 sm:p-8 card-shadow space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center">
                <Award className="w-7 h-7 text-gold" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold block">
                  RegMate Certified Assessment
                </span>
                <h3 className="text-lg font-display font-bold text-forest-deep">
                  Verified Readiness Certificate Issued
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-forest-deep block">
                {result.certificate.certificate_number}
              </span>
              <span className="text-[10px] text-ink-soft">
                Issued: {result.certificate.completion_date}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-3 bg-paper rounded-xl border border-line">
              <span className="text-ink-soft block">Candidate</span>
              <strong className="text-forest-deep text-sm">{result.certificate.candidate_name}</strong>
            </div>
            <div className="p-3 bg-paper rounded-xl border border-line">
              <span className="text-ink-soft block">Programme</span>
              <strong className="text-forest-deep text-sm">{result.certificate.programme}</strong>
            </div>
            <div className="p-3 bg-paper rounded-xl border border-line">
              <span className="text-ink-soft block">Benchmark Score</span>
              <strong className="text-emerald-700 text-sm">{result.percentage}% ({result.readiness_band})</strong>
            </div>
          </div>
        </div>
      )}

      {/* Domain Breakdown Section */}
      {result.domainBreakdown && result.domainBreakdown.length > 0 && (
        <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 card-shadow space-y-6">
          <h3 className="text-base font-display font-bold text-forest-deep flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-forest" />
            Domain-Wise Accuracy Breakdown
          </h3>

          <div className="space-y-4">
            {result.domainBreakdown.map(d => (
              <div key={d.topic_number} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">
                    <strong className="text-forest mr-1">T{d.topic_number}.</strong> {d.topic_name}
                  </span>
                  <span className="font-bold text-forest">{d.accuracy_pct}% ({d.correct}/{d.total})</span>
                </div>
                <div className="w-full bg-line h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.accuracy_pct >= 70 ? 'bg-leaf' : d.accuracy_pct >= 50 ? 'bg-amber-400' : 'bg-rose-500'}`}
                    style={{ width: `${d.accuracy_pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Answer Review */}
      <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 card-shadow space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-line pb-4">
          <div>
            <h3 className="text-base font-display font-bold text-forest-deep">
              Question-By-Question Answer Review
            </h3>
            <p className="text-xs text-ink-soft">Inspect correct answers, explanations, and statutory citations.</p>
          </div>

          <div className="flex items-center gap-1.5 bg-paper border border-line p-1 rounded-xl text-xs font-semibold">
            {['all', 'correct', 'incorrect', 'unanswered'].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                  filter === k ? 'bg-forest text-white' : 'text-ink-soft hover:text-forest'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => (
            <div key={q.question_code} className="p-5 bg-paper rounded-2xl border border-line space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-forest bg-mint px-2.5 py-0.5 rounded-full">
                    Q{idx + 1} • {q.question_code}
                  </span>
                  <DiffBadge diff={q.difficulty} />
                </div>
                <div>
                  {q.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" /> Correct (+{q.pointsAwarded})
                    </span>
                  ) : q.selected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect ({q.pointsAwarded})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Unattempted (0)
                    </span>
                  )}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-forest-deep leading-relaxed">
                {q.question_text}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {['A', 'B', 'C', 'D'].map(letter => {
                  const optText = q[`option_${letter.toLowerCase()}`];
                  if (!optText) return null;
                  const isUserSelection = q.selected === letter;
                  const isCorrectAnswer = q.correct_answer === letter;

                  let optClass = 'bg-white border-line text-ink';
                  if (isCorrectAnswer) optClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold';
                  else if (isUserSelection && !q.isCorrect) optClass = 'bg-rose-50 border-rose-300 text-rose-950';

                  return (
                    <div key={letter} className={`p-2.5 rounded-xl border flex items-start gap-2 ${optClass}`}>
                      <span className="font-bold">{letter}.</span>
                      <span>{optText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation & Statutory Citation */}
              {q.explanation && (
                <div className="p-3.5 bg-mint/50 border border-mint-deep rounded-xl text-xs space-y-1.5 text-ink">
                  <div className="font-bold text-forest">Regulatory Explanation:</div>
                  <p className="leading-relaxed">{q.explanation}</p>
                  {q.regulatory_reference && (
                    <div className="text-[11px] text-ink-soft pt-1 border-t border-mint-deep">
                      <strong className="text-forest font-semibold">Source: </strong>
                      <span>{q.regulatory_reference.source} — {q.regulatory_reference.provision}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ExamReady Component ──────────────────────────────────────────────
export default function ExamReady() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, token, isMember, hasEntitlement } = useAuth();

  const rawSlug = (slug || '').toLowerCase().trim();
  const canonicalSlug = MOCK_TEST_ALIASES[rawSlug] || (rawSlug === '' ? 'fme-full-length-mock-test' : null);
  const isValidSlug = Boolean(canonicalSlug);
  const selectedSlug = canonicalSlug || 'fme-full-length-mock-test';
  const currentTestConfig = getCanonicalMockTest(selectedSlug);

  // Safe Canonical Redirect for legacy aliases (e.g. /practice/mock-tests/fme -> /practice/mock-tests/fme-full-length-mock-test)
  useEffect(() => {
    if (slug && canonicalSlug && slug !== canonicalSlug) {
      navigate(`/practice/mock-tests/${canonicalSlug}`, { replace: true });
    }
  }, [slug, canonicalSlug, navigate]);

  const [phase, setPhase] = useState('landing'); // 'landing' | 'test' | 'results'
  const [meta, setMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const hasCurrentTestAccess = Boolean(
    isMember ||
    hasEntitlement?.('REGMATE_ANNUAL') ||
    hasEntitlement?.(selectedSlug) ||
    hasEntitlement?.(currentTestConfig?.sku) ||
    hasEntitlement?.(currentTestConfig?.courseSlug) ||
    (selectedSlug === 'fme-full-length-mock-test' && hasEntitlement?.('REGREADY_FME_001'))
  );

  useEffect(() => {
    if (currentTestConfig) {
      document.title = `${currentTestConfig.title} | RegMate Practice`;
    }
  }, [currentTestConfig]);

  useEffect(() => {
    fetch(`${API_BASE}/exam-ready/${selectedSlug}/meta`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.json())
      .then(data => setMeta(data))
      .catch(() => {});
  }, [selectedSlug, token]);

  const handleSubmitTest = useCallback(async (qs, ans) => {
    setLoading(true);
    setError(null);
    try {
      const payload = Object.entries(ans).map(([question_code, selected]) => ({ question_code, selected }));
      const response = await fetch(`${API_BASE}/exam-ready/${selectedSlug}/submit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          answers: payload,
          candidate_name: user?.name || ''
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Submission failed');
      setResult(data);
      setPhase('results');
      timer.stop();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSlug, token, user]);

  const timer = useTimer(DURATION_SECONDS, () => {
    setAnswers(current => {
      handleSubmitTest(questions, current);
      return current;
    });
  });

  const handleStartTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/exam-ready/${selectedSlug}/questions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (!response.ok || !data.questions) throw new Error(data.message || 'Failed to load questions');
      setQuestions(data.questions);
      setAnswers({});
      setFlagged(new Set());
      setPhase('test');
      timer.start();
    } catch (err) {
      setError(err.message || 'Unable to load test questions. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionCode, option) => {
    setAnswers(prev => ({ ...prev, [questionCode]: option }));
  };

  const handleFlag = (questionCode) => {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(questionCode) ? next.delete(questionCode) : next.add(questionCode);
      return next;
    });
  };

  const handleRetry = () => {
    setPhase('landing');
    setResult(null);
    setAnswers({});
    setFlagged(new Set());
  };

  const handleSwitchTest = (newSlug) => {
    navigate(`/practice/mock-tests/${newSlug}`);
  };

  if (slug && !isValidSlug) {
    return (
      <div className="py-16 px-4 max-w-xl mx-auto text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-serif text-forest-deep mb-2">Mock Test Not Found</h1>
        <p className="text-sm text-ink-soft mb-6 leading-relaxed">
          The requested mock test slug <code className="px-2 py-0.5 bg-paper border rounded text-forest font-mono">{slug}</code> does not exist. Please select one of our 5 canonical full-length regulatory mock examinations.
        </p>
        <Link
          to="/practice/mock-tests/fme-full-length-mock-test"
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-bold text-sm rounded-full shadow hover:bg-forest-deep transition-all cursor-pointer"
        >
          <span>View Available Mock Tests</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      {phase === 'results' && result ? (
        <ResultsScreen
          result={result}
          onRetry={handleRetry}
          onTriggerUpgrade={() => setShowUpgradeModal(true)}
          selectedSlug={selectedSlug}
        />
      ) : phase === 'test' && questions.length > 0 ? (
        <TestScreen
          questions={questions}
          answers={answers}
          flagged={flagged}
          onSelect={handleSelect}
          onFlag={handleFlag}
          onSubmit={() => handleSubmitTest(questions, answers)}
          timer={timer}
          onTriggerUpgrade={() => setShowUpgradeModal(true)}
          hasFullAccess={hasCurrentTestAccess}
          examName={meta?.exam_name || currentTestConfig?.title || 'Full-Length Regulatory Mock Test'}
        />
      ) : (
        <LandingScreen
          meta={meta}
          onStart={handleStartTest}
          loading={loading}
          error={error}
          selectedSlug={selectedSlug}
          onSwitchTest={handleSwitchTest}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        sectionKey={selectedSlug}
        courseSlug={selectedSlug}
        title={`Unlock Full ${currentTestConfig?.shortTitle || 'Mock Test'}`}
        message="Unlock the complete timed exam simulation, negative marking analytics, full statutory answer review, and verified certificate."
      />
    </>
  );
}
