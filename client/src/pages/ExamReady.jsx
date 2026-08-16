import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, Award, CheckCircle, XCircle, ArrowRight, RotateCcw,
  Flag, AlertCircle, Loader2, ChevronDown, ChevronUp, BookOpen,
  GraduationCap, Target, BarChart3, MinusCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/UpgradeModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const DURATION_SECONDS = 90 * 60; // 90 minutes
const PASS_THRESHOLD = 50; // percent

// ─── Timer hook ────────────────────────────────────────────────────────────
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

// ─── Difficulty badge ─────────────────────────────────────────────────────
function DiffBadge({ diff }) {
  const map = {
    Foundational: 'bg-emerald-100 text-emerald-800',
    Intermediate: 'bg-blue-100 text-blue-800',
    Advanced: 'bg-amber-100 text-amber-800',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[diff] || 'bg-slate-100 text-slate-700'}`}>
      {diff || 'General'}
    </span>
  );
}

// ─── Option button ────────────────────────────────────────────────────────
function OptionButton({ letter, text, selected, onSelect, disabled }) {
  const base = 'cursor-target w-full p-3 sm:p-4 rounded-xl border-2 text-left text-sm flex items-start gap-3 transition-all min-h-[52px]';
  const style = selected
    ? 'bg-forest/10 border-forest text-forest font-semibold'
    : 'bg-paper border-line text-ink hover:border-forest hover:bg-mint/20';

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`${base} ${style}`}
    >
      <span className="px-2.5 py-1 bg-white border border-current/30 rounded-lg font-bold text-xs flex-shrink-0 min-w-[28px] text-center">
        {letter}
      </span>
      <span className="pt-0.5 leading-relaxed">{text}</span>
    </button>
  );
}

// ─── Landing screen ───────────────────────────────────────────────────────
function LandingScreen({ meta, onStart, loading, error }) {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto animate-fade-in-up">
      <Link to="/learning" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium mb-8 min-h-[44px]">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Regulatory Master
      </Link>

      <div className="bg-white border border-line rounded-2xl p-6 sm:p-10 md:p-12 card-shadow">
        {/* Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-forest text-white flex items-center justify-center shadow-lg">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <span className="eyebrow block text-xs">§ ExamReady</span>
            <h1 className="text-2xl sm:text-3xl font-display text-forest-deep font-bold leading-tight">
              IFSCA CMI — Full Mock Test
            </h1>
          </div>
        </div>

        <p className="text-ink-soft text-base sm:text-lg mb-8 leading-relaxed">
          Simulate the real IFSCA Capital Market Intermediaries certification exam. 100 questions drawn from the complete CMI regulations syllabus — with negative marking.
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Questions', value: meta?.total || 100, color: 'text-forest' },
            { icon: Clock, label: 'Duration', value: '90 Mins', color: 'text-blue-700' },
            { icon: MinusCircle, label: 'Negative Mark', value: '−0.25', color: 'text-rose-600' },
            { icon: Target, label: 'Pass Mark', value: '50%', color: 'text-emerald-700' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-paper border border-line rounded-xl p-4 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
              <span className={`block text-xl font-extrabold ${color}`}>{value}</span>
              <span className="text-xs text-ink-soft mt-0.5 block">{label}</span>
            </div>
          ))}
        </div>

        {/* Topic breakdown */}
        {meta?.topics && meta.topics.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-forest-deep mb-3">Syllabus Coverage</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {meta.topics.map(t => (
                <div key={t.topic_number} className="flex items-center justify-between p-2.5 bg-paper border border-line rounded-xl text-xs">
                  <span className="text-ink font-medium truncate max-w-[200px]">
                    <span className="font-bold text-forest mr-1">T{t.topic_number}.</span>
                    {t.topic_name}
                  </span>
                  <span className="text-leaf font-bold ml-2 flex-shrink-0">{t.count}Q</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-xs text-amber-900 space-y-1.5">
          <p className="font-bold text-amber-800 mb-2">Exam Rules:</p>
          <p>• Each correct answer: <strong>+1 mark</strong></p>
          <p>• Each wrong answer: <strong>−0.25 marks</strong></p>
          <p>• Unattempted questions: <strong>0 marks</strong></p>
          <p>• Timer auto-submits when 90 minutes expire</p>
          <p>• You can flag questions for review and navigate freely</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-700 text-sm p-3 bg-rose-50 border border-rose-200 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <button
          onClick={onStart}
          disabled={loading}
          className="cursor-target w-full sm:w-auto px-10 py-4 bg-forest text-white rounded-full font-bold hover-lift text-base shadow-lg min-h-[56px] flex items-center justify-center gap-2 mx-auto"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Loading Questions…</>
            : <><GraduationCap className="w-5 h-5" /> Start Mock Test</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Test screen ──────────────────────────────────────────────────────────
function TestScreen({ questions, answers, flagged, onSelect, onFlag, onSubmit, timer }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const q = questions[currentIdx];
  const opts = [
    { letter: 'A', text: q.option_a },
    { letter: 'B', text: q.option_b },
    { letter: 'C', text: q.option_c },
    { letter: 'D', text: q.option_d },
  ].filter(o => o.text);

  const attempted = Object.keys(answers).length;
  const isFlagged = flagged.has(q.question_code);

  return (
    <div className="min-h-screen bg-paper">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-forest-deep text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-mint">ExamReady</span>
          <span className="hidden sm:block text-white/50">|</span>
          <span className="hidden sm:block text-xs text-white/80">IFSCA CMI Mock Test</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-sm ${
            timer.isLow ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/10 text-white'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            {timer.display}
          </div>

          {/* Progress */}
          <span className="text-xs text-white/70">
            {attempted}/{questions.length}
          </span>

          {/* Submit */}
          <button
            onClick={onSubmit}
            className="cursor-target px-4 py-2 bg-leaf text-white font-bold text-xs rounded-xl hover:bg-leaf-bright transition-colors min-h-[40px]"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Question panel */}
        <div className="lg:col-span-8 space-y-5">
          {/* Progress bar */}
          <div className="w-full bg-line h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-leaf rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-white border border-line rounded-2xl p-5 sm:p-7 card-shadow">
            {/* Meta */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-leaf bg-mint px-2.5 py-0.5 rounded-full">
                  Q {currentIdx + 1} / {questions.length}
                </span>
                <DiffBadge diff={q.difficulty} />
                <span className="text-[10px] text-ink-soft hidden sm:block">
                  Topic {q.topic_number}: {q.topic_name}
                </span>
              </div>
              <button
                onClick={() => onFlag(q.question_code)}
                className={`cursor-target flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                  isFlagged
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-paper border border-line text-ink-soft hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {isFlagged ? 'Flagged' : 'Flag'}
              </button>
            </div>

            {/* Question text */}
            <h2 className="text-base sm:text-lg font-semibold text-forest-deep mb-6 leading-snug">
              {q.question_text}
            </h2>

            {/* Options */}
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

            {/* Navigation arrows */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
              <button
                onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="cursor-target flex items-center gap-2 px-5 py-2.5 bg-paper border border-line rounded-full font-medium text-sm text-ink hover:bg-mint transition-colors min-h-[44px] disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(i => i + 1)}
                  className="cursor-target flex items-center gap-2 px-5 py-2.5 bg-forest text-white rounded-full font-medium text-sm hover-lift min-h-[44px]"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onSubmit}
                  className="cursor-target flex items-center gap-2 px-5 py-2.5 bg-leaf text-white rounded-full font-bold text-sm hover-lift min-h-[44px]"
                >
                  Submit Test <Award className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Question navigation panel */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-line rounded-2xl p-4 card-shadow sticky top-20">
            <button
              className="w-full flex items-center justify-between text-sm font-bold text-forest-deep mb-3 lg:cursor-default"
              onClick={() => setNavOpen(o => !o)}
            >
              <span>Question Navigator</span>
              <span className="lg:hidden">{navOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
            </button>

            <div className={`${navOpen ? 'block' : 'hidden'} lg:block`}>
              {/* Legend */}
              <div className="flex gap-3 text-[10px] text-ink-soft mb-3 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-leaf inline-block" /> Answered</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Flagged</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-line inline-block" /> Not visited</span>
              </div>

              <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-8 gap-1.5 max-h-64 overflow-y-auto">
                {questions.map((question, idx) => {
                  const isAnswered = !!answers[question.question_code];
                  const isF = flagged.has(question.question_code);
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={question.question_code}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all min-h-0 ${
                        isCurrent
                          ? 'bg-forest text-white ring-2 ring-forest ring-offset-1'
                          : isF
                          ? 'bg-amber-400 text-white'
                          : isAnswered
                          ? 'bg-leaf text-white'
                          : 'bg-line text-ink-soft hover:bg-mint'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-line text-xs text-ink-soft space-y-1">
                <div className="flex justify-between">
                  <span>Answered</span><span className="font-bold text-leaf">{Object.keys(answers).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flagged</span><span className="font-bold text-amber-600">{flagged.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unanswered</span><span className="font-bold text-ink">{questions.length - Object.keys(answers).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────
function ResultsScreen({ result, onRetry }) {
  const [expandedReview, setExpandedReview] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const displayQuestions = showAll ? result.perQuestion : result.perQuestion?.slice(0, 20);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 max-w-5xl mx-auto animate-fade-in-up">
      <Link to="/learning" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium mb-8 min-h-[44px]">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Regulatory Master
      </Link>

      {/* Score hero */}
      <div className={`rounded-2xl p-6 sm:p-10 mb-8 text-center shadow-lg ${
        result.passed
          ? 'bg-gradient-to-br from-emerald-800 via-forest-deep to-teal-900 text-white'
          : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white'
      }`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
          result.passed ? 'bg-white/20' : 'bg-white/10'
        }`}>
          {result.passed
            ? <Award className="w-10 h-10 text-gold" />
            : <RotateCcw className="w-10 h-10 text-white/70" />
          }
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
          {result.passed ? 'Passed! 🎉' : 'Keep Practicing'}
        </h1>
        <p className="text-white/70 text-lg mb-6">
          {result.passed
            ? 'Excellent performance on the IFSCA CMI Mock Test.'
            : `You scored ${result.percentage}% — 50% needed to pass.`
          }
        </p>

        {/* Score ring */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
              <path strokeWidth="3" stroke="rgba(255,255,255,0.15)" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path strokeWidth="3"
                strokeDasharray={`${Math.max(0, result.percentage)}, 100`}
                strokeLinecap="round" stroke={result.passed ? '#D4AF37' : '#94a3b8'}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white">{result.percentage}%</span>
              <span className="text-[10px] text-white/60 uppercase">Score</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto text-center">
          {[
            { label: 'Raw Score', value: `${result.rawScore}/${result.maxScore}`, icon: BarChart3 },
            { label: 'Correct', value: result.correct, icon: CheckCircle },
            { label: 'Wrong', value: result.wrong, icon: XCircle },
            { label: 'Skipped', value: result.unanswered, icon: MinusCircle },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <span className="block text-lg font-extrabold text-white">{value}</span>
              <span className="text-[10px] text-white/60">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Domain breakdown */}
      {result.domainBreakdown && result.domainBreakdown.length > 0 && (
        <div className="bg-white border border-line rounded-2xl p-5 sm:p-6 card-shadow mb-6">
          <h2 className="font-bold text-lg text-forest-deep mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-leaf" />
            Topic-wise Breakdown
          </h2>
          <div className="space-y-3">
            {result.domainBreakdown.map(d => {
              const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
              return (
                <div key={d.topic_number} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink truncate max-w-xs">
                      <span className="text-leaf font-bold mr-1">T{d.topic_number}.</span>
                      {d.topic_name}
                    </span>
                    <span className="font-bold text-forest flex-shrink-0 ml-2">
                      {d.correct}/{d.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-line h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pct >= 50 ? 'bg-leaf' : 'bg-rose-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button
          onClick={onRetry}
          className="cursor-target flex items-center justify-center gap-2 px-8 py-3.5 bg-forest text-white rounded-full font-bold hover-lift min-h-[52px] text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Take Test Again
        </button>
        <Link
          to="/learning"
          className="cursor-target flex items-center justify-center gap-2 px-8 py-3.5 bg-paper border border-forest text-forest rounded-full font-bold hover-lift min-h-[52px] text-sm"
        >
          <BookOpen className="w-4 h-4" /> Back to Regulatory Master
        </Link>
      </div>

      {/* Per-question review */}
      {result.perQuestion && result.perQuestion.length > 0 && (
        <div className="bg-white border border-line rounded-2xl p-5 sm:p-6 card-shadow">
          <button
            onClick={() => setExpandedReview(o => !o)}
            className="cursor-target w-full flex items-center justify-between text-left min-h-[44px]"
          >
            <h2 className="font-bold text-lg text-forest-deep flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-leaf" />
              Question-by-Question Review
            </h2>
            {expandedReview ? <ChevronUp className="w-5 h-5 text-ink-soft" /> : <ChevronDown className="w-5 h-5 text-ink-soft" />}
          </button>

          {expandedReview && (
            <div className="mt-4 space-y-4">
              {displayQuestions?.map((pq, idx) => (
                <div key={pq.question_code} className={`p-4 rounded-xl border text-sm ${
                  pq.isCorrect
                    ? 'bg-mint/30 border-leaf/30'
                    : !pq.selected
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-ink-soft">#{idx + 1} · {pq.question_code}</span>
                      <DiffBadge diff={pq.difficulty} />
                    </div>
                    <span className={`flex-shrink-0 font-bold text-xs px-2 py-0.5 rounded-full ${
                      pq.isCorrect
                        ? 'bg-mint text-forest'
                        : !pq.selected
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {pq.isCorrect ? '+1' : !pq.selected ? '0' : '−0.25'}
                    </span>
                  </div>

                  <p className="font-medium text-ink mb-3 leading-snug">{pq.question_text}</p>

                  <div className="flex flex-wrap gap-2 text-xs mb-3">
                    {pq.selected && (
                      <span className={`px-2 py-1 rounded-lg font-bold ${pq.isCorrect ? 'bg-leaf/20 text-forest' : 'bg-rose-100 text-rose-800'}`}>
                        Your answer: {pq.selected} — {pq[`option_${pq.selected.toLowerCase()}`]}
                      </span>
                    )}
                    {!pq.isCorrect && (
                      <span className="px-2 py-1 rounded-lg font-bold bg-leaf/20 text-forest">
                        Correct: {pq.correct_answer} — {pq[`option_${pq.correct_answer.toLowerCase()}`]}
                      </span>
                    )}
                    {!pq.selected && <span className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700">Not attempted</span>}
                  </div>

                  {pq.explanation && (
                    <div className="bg-white/70 border border-line rounded-lg p-3 text-xs text-ink leading-relaxed">
                      <strong className="text-forest-deep font-semibold">Explanation: </strong>
                      {pq.explanation}
                    </div>
                  )}
                </div>
              ))}

              {!showAll && result.perQuestion.length > 20 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="cursor-target w-full py-3 bg-paper border border-line rounded-xl text-sm font-semibold text-forest hover:bg-mint transition-colors min-h-[48px]"
                >
                  Show all {result.perQuestion.length} questions
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ExamReady page ──────────────────────────────────────────────────
export default function ExamReady() {
  const { token, user } = useAuth();
  const [phase, setPhase] = useState('landing'); // 'landing' | 'test' | 'results'
  const [meta, setMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});       // { question_code: 'A' }
  const [flagged, setFlagged] = useState(new Set());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isMember = user?.membershipStatus === 'active';
  const hasExamPass = user?.subscriptions?.includes('exam_ready') || user?.subscriptions?.includes('quizzes') || user?.subscriptions?.includes('full_access');

  // Fetch meta on mount
  useEffect(() => {
    fetch(`${API_BASE}/exam-ready/meta`)
      .then(r => r.json())
      .then(data => setMeta(data))
      .catch(() => {});
  }, []);

  const handleSubmitTest = useCallback(async (qs, ans) => {
    setLoading(true);
    setError(null);
    try {
      const payload = Object.entries(ans).map(([question_code, selected]) => ({ question_code, selected }));
      const response = await fetch(`${API_BASE}/exam-ready/submit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ answers: payload }),
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
  }, [token]);

  const timer = useTimer(DURATION_SECONDS, () => {
    // Auto-submit on timer expiry
    setAnswers(current => {
      handleSubmitTest(questions, current);
      return current;
    });
  });

  const handleStartTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/exam-ready/questions`);
      const data = await response.json();
      if (!response.ok || !data.questions) throw new Error(data.message || 'Failed to load questions');
      setQuestions(data.questions);
      setAnswers({});
      setFlagged(new Set());
      setPhase('test');
      timer.start();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionCode, option) => {
    const activeMember = user?.membershipStatus === 'active';
    const activePass = user?.subscriptions?.includes('exam_ready') || user?.subscriptions?.includes('quizzes') || user?.subscriptions?.includes('full_access');

    const currentCount = Object.keys(answers).length;
    const isNewAnswer = !answers[questionCode];

    if (!activeMember && !activePass && currentCount >= 3 && isNewAnswer) {
      setShowUpgradeModal(true);
      return;
    }

    setAnswers(prev => {
      const next = { ...prev, [questionCode]: option };
      if (!activeMember && !activePass && Object.keys(next).length >= 3) {
        setShowUpgradeModal(true);
      }
      return next;
    });
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

  return (
    <>
      {phase === 'results' && result ? (
        <ResultsScreen result={result} onRetry={handleRetry} />
      ) : phase === 'test' && questions.length > 0 ? (
        <TestScreen
          questions={questions}
          answers={answers}
          flagged={flagged}
          onSelect={handleSelect}
          onFlag={handleFlag}
          onSubmit={() => handleSubmitTest(questions, answers)}
          timer={timer}
        />
      ) : (
        <LandingScreen
          meta={meta}
          onStart={handleStartTest}
          loading={loading}
          error={error}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        sectionKey="exam_ready"
        title="Free Preview Limit Reached (3 Questions Free)"
        message="You have answered the 3 free preview questions in this ExamReady Mock Test. Upgrade your pass to unlock the complete 100-question CMI exam simulation and detailed analysis."
      />
    </>
  );
}
