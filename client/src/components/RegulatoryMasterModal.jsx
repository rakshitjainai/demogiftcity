import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X, CheckCircle2, Circle, BookOpen, HelpCircle, ArrowLeft, ArrowRight,
  ShieldAlert, Sparkles, Award, Loader2, AlertCircle, ChevronDown, ChevronLeft,
  ChevronRight, Zap, Target, Play, Brain, Shield, Clock, RotateCcw,
  Check, Eye, Filter, UserCheck, Flame, Scale, FileText, BarChart3,
  ExternalLink, Layers, Lock, Crown, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LockOverlay from './LockOverlay';
import UpgradeModal from './UpgradeModal';
import { getClassicStudyContent, normalizeCourseSlug } from '../utils/courseContentResolver';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Design Tokens & Badge Helpers ──────────────────────────────────────────
function PriorityPill({ priority }) {
  const p = (priority || 'medium').toLowerCase();
  const styles = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-amber-50 text-amber-800 border-amber-200',
    medium: 'bg-mint text-forest border-mint-deep',
    low: 'bg-paper text-ink-soft border-line',
  }[p] || 'bg-paper text-ink-soft border-line';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${styles}`}>
      {priority}
    </span>
  );
}

function SourceChip({ source }) {
  if (!source) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white border border-line text-ink-soft shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
        {source}
      </span>
    </div>
  );
}

// ─── Production Error Boundary ──────────────────────────────────────────────
class RegulatoryMasterErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RegulatoryMasterErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            fontFamily: "'Public Sans', system-ui, -apple-system, sans-serif",
            background: 'rgba(7, 51, 33, 0.88)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="bg-paper rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-line shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-forest-deep">
                Unable to load this study content
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft mt-1.5 leading-relaxed">
                An unexpected display issue occurred. You can retry safely or return to the course catalogue.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 bg-mint hover:bg-mint-deep text-forest border border-mint-deep font-semibold text-xs sm:text-sm rounded-xl transition-colors min-h-[44px] cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={this.props.onClose}
                className="flex-1 py-3 bg-forest hover:bg-forest-deep text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-colors min-h-[44px] cursor-pointer"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Main Modal Component Inner ────────────────────────────────────────────
function RegulatoryMasterModalInner({ course, onClose }) {
  const { user, token, toggleCourseItem, isMember, hasCourseAccess, initiateCheckout } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Canonical course identification and content resolution
  const rawIdentifier = course?.slug || course?.code || course?.id || course || 'companies-act';
  const resolvedSlug = useMemo(() => normalizeCourseSlug(rawIdentifier), [rawIdentifier]);
  
  // Resolve authentic course content package (guaranteed no wrong-content crossover)
  const contentPackage = useMemo(() => getClassicStudyContent(rawIdentifier), [rawIdentifier]);
  const topicsList = useMemo(() => contentPackage?.chapters || [], [contentPackage]);

  const isCourseOwned = Boolean(isMember || hasCourseAccess?.(resolvedSlug) || user?.role === 'admin');

  // Lock body scroll when modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Tab navigation: default to 'home' (Chapter 1 Interactive Free Preview first!)
  const [activeTab, setActiveTab] = useState('home');
  const [regLearnStep, setRegLearnStep] = useState('understand');
  const [topicIndex, setTopicIndex] = useState(0);
  const [practiceSelectedOption, setPracticeSelectedOption] = useState(null);
  const [chaptersPage, setChaptersPage] = useState(0);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Reset view to Chapter 1 interactive lesson whenever course changes
  useEffect(() => {
    setActiveTab('home');
    setSelectedTopicId(null);
    setTopicIndex(0);
    setPracticeSelectedOption(null);
    setChaptersPage(0);
  }, [course]);

  // Progress state
  const getCompletedItems = useCallback(() => {
    if (user?.courseProgress) {
      const entry = user.courseProgress.find(c => c.courseSlug === resolvedSlug);
      if (entry) return new Set(entry.completedItems || []);
    }
    const guest = JSON.parse(localStorage.getItem('regmate_guest_course_progress') || '{}');
    return new Set(guest[resolvedSlug]?.completedItems || []);
  }, [user, resolvedSlug]);

  const [completedSet, setCompletedSet] = useState(getCompletedItems);

  useEffect(() => {
    setCompletedSet(getCompletedItems());
  }, [getCompletedItems]);

  const handleToggleComplete = async (uid) => {
    const wasCompleted = completedSet.has(uid);
    setCompletedSet(prev => {
      const next = new Set(prev);
      if (wasCompleted) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });

    if (token) {
      try {
        await fetch(`${API_BASE}/regulatory-master/${resolvedSlug}/mark-lesson`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ uid, markAs: wasCompleted ? 'incomplete' : 'complete' }),
        });
      } catch (_) {}
    } else {
      toggleCourseItem(resolvedSlug, uid);
    }
  };

  // Calculate readiness score
  const readinessPct = useMemo(() => {
    const total = topicsList.length || 1;
    return Math.min(100, Math.round((completedSet.size / total) * 100));
  }, [completedSet, topicsList]);

  // If content is not found, show graceful fallback UI
  if (contentPackage.notFound || topicsList.length === 0) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center"
        style={{ fontFamily: "'Public Sans', system-ui, -apple-system, sans-serif" }}
      >
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-line shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-xl text-forest-deep">
            Curriculum Under Review
          </h3>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
            The study material for <strong>{course?.title || rawIdentifier}</strong> is currently undergoing editorial review for Classic Study Mode.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-forest hover:bg-forest-deep text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            Return to Course Catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-[#F8FAFC] overflow-hidden animate-fade-in"
      style={{
        fontFamily: "'Public Sans', system-ui, -apple-system, sans-serif",
        color: 'var(--ink)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* ─── Unified Top Header Controller ─── */}
      <header className="w-full bg-white border-b border-slate-200 px-3 sm:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 shadow-2xs flex-shrink-0 z-30">
        {/* Left: Logo, Title & Chapter Back Button */}
        <div className="flex items-center justify-between md:justify-start gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-base sm:text-lg text-[#073321]">
            <span className="text-[#073321] font-serif text-lg sm:text-2xl font-extrabold tracking-tight">RegLearn</span>
            <span className="text-slate-300 font-light">•</span>
            <span className="text-[#073321] font-bold text-xs sm:text-base line-clamp-1">{contentPackage.title}</span>
          </div>

          {(selectedTopicId || activeTab === 'home') && (
            <button
              onClick={() => {
                setSelectedTopicId(null);
                setActiveTab('modules');
              }}
              className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-[#073321] hover:bg-slate-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs min-h-[36px]"
            >
              ← Chapters List
            </button>
          )}
        </div>

        {/* Center: Controller Navigation Tabs */}
        <div className="flex items-center justify-center gap-1 self-center md:self-auto">
          <button
            onClick={() => {
              setSelectedTopicId(null);
              setActiveTab('modules');
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[#073321] text-white shadow-2xs hover:bg-[#052819] flex items-center gap-2 min-h-[36px]"
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span>Chapter Modules</span>
          </button>
        </div>

        {/* Right: Chapter Select, XP & Exit Learning Button */}
        <div className="flex items-center justify-end gap-2 flex-shrink-0">
          {(selectedTopicId || activeTab === 'home') && (
            <select
              value={topicIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setTopicIndex(idx);
                const selectedT = topicsList[idx];
                if (selectedT) setSelectedTopicId(selectedT.id);
                setActiveTab('home');
                setRegLearnStep('understand');
                setPracticeSelectedOption(null);
              }}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-[#073321] focus:outline-none focus:border-forest truncate max-w-[120px] sm:max-w-[170px] min-h-[36px]"
            >
              {topicsList.map((t, idx) => (
                <option key={t.id || idx} value={idx}>
                  Ch {idx + 1}: {t.title} {completedSet.has(t.id) ? '✓' : ''}
                </option>
              ))}
            </select>
          )}

          {/* XP Badge */}
          <div className="bg-[#073321] text-white px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold whitespace-nowrap">
            {completedSet.size * 25} XP
          </div>

          {/* Readiness Percentage Badge */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-amber-600/80 text-amber-700 font-mono font-bold text-[11px] sm:text-xs flex items-center justify-center bg-amber-50 flex-shrink-0" title="Readiness Score">
            {readinessPct}%
          </div>

          {/* Unlock Course CTA */}
          {!isCourseOwned && (
            <button
              onClick={() => initiateCheckout({ productType: 'course', productId: resolvedSlug })}
              className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-600 via-gold to-amber-700 hover:brightness-105 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[36px]"
              title="Unlock All Chapters in this Course"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Unlock Course (₹499)</span>
              <span className="sm:hidden">₹499</span>
            </button>
          )}

          {/* Exit Learning Button */}
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors shadow-2xs border border-slate-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Exit Learning Mode"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* ─── Main Content Body ─── */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 space-y-6 pb-32 overflow-y-auto overscroll-y-contain">
        
        {/* ================================================================= */}
        {/* TAB: HOME / REGLEARN INTERACTIVE CARD VIEW                       */}
        {/* ================================================================= */}
        {activeTab === 'home' && (() => {
          const currentTopic = topicsList[topicIndex] || topicsList[0];

          // Gating for Chapters > 1 (Chapter 1 is free preview)
          if (topicIndex > 0 && !isCourseOwned) {
            return (
              <div className="py-8 sm:py-12 px-4 max-w-2xl mx-auto text-center animate-fade-in">
                <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-gold/30 shadow-xl space-y-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                    <Lock className="w-7 h-7" />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold uppercase tracking-wider">
                      Premium Chapter · Chapter {topicIndex + 1}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-deep">
                      {currentTopic.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
                      Chapter 1 is free to explore. To access Chapter {topicIndex + 1} and all remaining statutory lessons, practitioner notes, and questions, choose a plan below.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => initiateCheckout({ productType: 'course', productId: resolvedSlug })}
                      className="p-5 rounded-2xl bg-forest hover:bg-forest-deep text-white font-bold text-sm shadow-md transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="text-base font-bold">Buy Course Pass</span>
                      <span className="text-xs text-emerald-200 font-mono">₹499 · One-Time</span>
                      <span className="text-[11px] text-emerald-100/80 mt-1">Unlock all {topicsList.length} chapters</span>
                    </button>

                    <button
                      onClick={() => initiateCheckout({ productType: 'membership', productId: 'full_access' })}
                      className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 via-gold to-amber-700 hover:brightness-105 text-white font-bold text-sm shadow-md transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="text-base font-bold flex items-center gap-1.5">
                        Get All-Access <Sparkles className="w-4 h-4 text-amber-200" />
                      </span>
                      <span className="text-xs text-amber-200 font-mono">₹1,999 · 1 Year Access</span>
                      <span className="text-[11px] text-amber-100/80 mt-1">Unlock all courses & tools</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-ink-soft">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Instant activation via Razorpay · 100% secure</span>
                  </div>
                </div>
              </div>
            );
          }

          const stepNumber = regLearnStep === 'understand' ? 1 : regLearnStep === 'walkthrough' ? 2 : regLearnStep === 'remember' ? 3 : 4;
          const totalSteps = 4;

          const handleNextStep = () => {
            if (regLearnStep === 'understand') {
              setRegLearnStep('walkthrough');
            } else if (regLearnStep === 'walkthrough') {
              setRegLearnStep('remember');
            } else if (regLearnStep === 'remember') {
              setRegLearnStep('practice');
              setPracticeSelectedOption(null);
            } else if (regLearnStep === 'practice') {
              handleToggleComplete(currentTopic.id);
              setPracticeSelectedOption(null);
              if (topicIndex < topicsList.length - 1) {
                const nextIdx = topicIndex + 1;
                setTopicIndex(nextIdx);
                const nextT = topicsList[nextIdx];
                if (nextT) setSelectedTopicId(nextT.id);
                setRegLearnStep('understand');
              } else {
                setSelectedTopicId(null);
                setActiveTab('modules');
              }
            }
          };

          return (
            <div className="py-6 sm:py-10 px-4 max-w-3xl mx-auto space-y-6 animate-fade-in">
              {/* ─── The Main RegLearn Card ─── */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6 text-left relative">

                {/* ─── 4 Stepper Tabs ─── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto">
                  {[
                    { id: 'understand', label: 'Understand' },
                    { id: 'walkthrough', label: 'Walkthrough' },
                    { id: 'remember', label: 'Remember' },
                    { id: 'practice', label: 'Practice' },
                  ].map((s) => {
                    const isActive = regLearnStep === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setRegLearnStep(s.id);
                          setPracticeSelectedOption(null);
                        }}
                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-center border cursor-pointer ${
                          isActive
                            ? 'bg-[#E6F4ED] text-[#073321] border-[#073321] font-bold shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-forest hover:text-forest'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                {/* Screen indicator */}
                <div className="text-center font-mono text-xs text-slate-400 font-semibold">
                  Step {stepNumber} / {totalSteps}
                </div>

                {/* Eyebrow */}
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#073321]">
                  {regLearnStep.toUpperCase()}
                </div>

                {/* Heading */}
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#073321] tracking-tight leading-tight">
                  {regLearnStep === 'remember' ? 'One-Minute Summary & Traps' : currentTopic.title}
                </h2>

                {/* Content Body */}
                {regLearnStep === 'practice' ? (
                  <div className="space-y-4 pt-2 text-left">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Diagnostic Question
                      </span>
                      <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                        {currentTopic.practiceQuestion}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {currentTopic.practiceOptions?.map((opt, oIdx) => {
                        const isSelected = practiceSelectedOption === oIdx;
                        const isCorrect = oIdx === (currentTopic.practiceAnswer ?? 0);
                        const isSubmitted = practiceSelectedOption !== null;

                        let optStyles = 'bg-white border-slate-200 text-slate-800 hover:border-[#073321] hover:bg-slate-50';
                        if (isSubmitted) {
                          if (isSelected) {
                            optStyles = isCorrect
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium'
                              : 'bg-rose-50 border-rose-500 text-rose-950 font-medium';
                          } else if (isCorrect) {
                            optStyles = 'bg-emerald-50/50 border-emerald-300 text-emerald-900';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isSubmitted}
                            onClick={() => setPracticeSelectedOption(oIdx)}
                            className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 min-h-[48px] cursor-pointer ${optStyles}`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && isSelected && (
                              isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                              )
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {practiceSelectedOption !== null && (
                      <div className="p-4 bg-[#E6F4ED] border border-emerald-200 rounded-2xl text-xs sm:text-sm text-[#073321] leading-relaxed space-y-1 animate-fade-in">
                        <strong className="block font-mono uppercase text-[10px] tracking-wider text-emerald-800 font-bold">
                          Statutory Rationale
                        </strong>
                        <p>{currentTopic.practiceExplain}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5 text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
                    <p className="whitespace-pre-line">
                      {regLearnStep === 'understand' && currentTopic.understandBody}
                      {regLearnStep === 'walkthrough' && currentTopic.walkthroughBody}
                      {regLearnStep === 'remember' && currentTopic.rememberBody}
                    </p>

                    {/* Step-specific Callout */}
                    {regLearnStep === 'understand' && (
                      <div className="p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-950 space-y-1.5">
                        <strong className="block font-mono uppercase text-[10px] tracking-wider text-amber-800 font-bold">
                          {currentTopic.understandCalloutTitle || 'WHY THIS MATTERS'}
                        </strong>
                        <p className="leading-relaxed">{currentTopic.understandCalloutBody}</p>
                      </div>
                    )}

                    {regLearnStep === 'walkthrough' && (
                      <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-950 space-y-1.5">
                        <strong className="block font-mono uppercase text-[10px] tracking-wider text-emerald-800 font-bold">
                          {currentTopic.walkthroughCalloutTitle || 'PRACTITIONER NOTE'}
                        </strong>
                        <p className="leading-relaxed">{currentTopic.walkthroughCalloutBody}</p>
                      </div>
                    )}

                    {regLearnStep === 'remember' && currentTopic.rememberComplianceTip && (
                      <div className="p-4 sm:p-5 bg-[#E6F4ED] border border-emerald-300 rounded-2xl text-xs sm:text-sm text-[#073321] space-y-1.5">
                        <strong className="block font-mono uppercase text-[10px] tracking-wider text-emerald-800 font-bold">
                          COMPLIANCE TIP
                        </strong>
                        <p className="leading-relaxed">{currentTopic.rememberComplianceTip}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Source Citation */}
                {currentTopic.sourceRef && (
                  <div className="pt-2">
                    <SourceChip source={currentTopic.sourceRef} />
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-medium">
                    Chapter {topicIndex + 1} of {topicsList.length} • {completedSet.has(currentTopic.id) ? '✓ Completed' : 'In Progress'}
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {regLearnStep !== 'understand' && (
                      <button
                        onClick={() => {
                          if (regLearnStep === 'practice') setRegLearnStep('remember');
                          else if (regLearnStep === 'remember') setRegLearnStep('walkthrough');
                          else if (regLearnStep === 'walkthrough') setRegLearnStep('understand');
                        }}
                        className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
                      >
                        ← Back
                      </button>
                    )}

                    <button
                      onClick={handleNextStep}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-[#073321] hover:bg-[#052819] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                    >
                      <span>
                        {regLearnStep === 'practice'
                          ? topicIndex < topicsList.length - 1
                            ? 'Complete & Next Chapter →'
                            : 'Complete Course 🎉'
                          : 'Next Step →'}
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* ================================================================= */}
        {/* TAB: MODULES / SYLLABUS LIST                                     */}
        {/* ================================================================= */}
        {activeTab === 'modules' && (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="space-y-6 text-left">
              {(() => {
                const CHAPTERS_PER_PAGE = 5;
                const totalPages = Math.ceil(topicsList.length / CHAPTERS_PER_PAGE) || 1;
                const safePage = Math.min(chaptersPage, totalPages - 1);
                const visibleTopics = topicsList.slice(safePage * CHAPTERS_PER_PAGE, (safePage + 1) * CHAPTERS_PER_PAGE);

                return (
                  <div className="space-y-6 max-w-4xl mx-auto pt-6 sm:pt-8">
                    {/* Hero Header */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#073321] via-[#0b4d32] to-[#073321] text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-0">
                      <div className="space-y-2 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Statutory Curriculum
                        </div>
                        <h2 className="text-xl sm:text-2xl font-serif font-extrabold tracking-tight text-white leading-tight">
                          {contentPackage.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-emerald-100/90 font-sans max-w-md">
                          Showing Chapters {safePage * CHAPTERS_PER_PAGE + 1}–{Math.min((safePage + 1) * CHAPTERS_PER_PAGE, topicsList.length)} of {topicsList.length} total modules
                        </p>
                      </div>

                      {/* Pagination Controller */}
                      <div className="relative z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl self-start md:self-auto shadow-lg">
                        <button
                          disabled={safePage === 0}
                          onClick={() => setChaptersPage(p => Math.max(0, p - 1))}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            safePage === 0
                              ? 'opacity-30 cursor-not-allowed text-white'
                              : 'bg-white/15 hover:bg-white/30 text-white active:scale-95 shadow-2xs'
                          }`}
                          title="Previous Page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white px-2 whitespace-nowrap">
                          <span className="text-emerald-200/90 font-mono text-xs uppercase leading-none">Page</span>
                          <span className="font-mono text-xs font-bold">{safePage + 1} / {totalPages}</span>
                        </div>

                        <button
                          disabled={safePage >= totalPages - 1}
                          onClick={() => setChaptersPage(p => Math.min(totalPages - 1, p + 1))}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            safePage >= totalPages - 1
                              ? 'opacity-30 cursor-not-allowed text-white'
                              : 'bg-white/15 hover:bg-white/30 text-white active:scale-95 shadow-2xs'
                          }`}
                          title="Next Page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Chapter Cards List */}
                    <div className="space-y-3">
                      {visibleTopics.map((topic, offsetIdx) => {
                        const idx = safePage * CHAPTERS_PER_PAGE + offsetIdx;
                        const chNum = idx + 1;
                        const isUnlocked = isCourseOwned || idx < 1;
                        const isCompleted = completedSet.has(topic.id);

                        return (
                          <div
                            key={topic.id || idx}
                            onClick={() => {
                              if (!isUnlocked) {
                                setShowUpgradeModal(true);
                              } else {
                                setTopicIndex(idx);
                                setSelectedTopicId(topic.id);
                                setActiveTab('home');
                                setRegLearnStep('understand');
                                setPracticeSelectedOption(null);
                              }
                            }}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md ${
                              !isUnlocked
                                ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-400'
                                : isCompleted
                                ? 'bg-white border-[#073321]/40 hover:border-[#073321]'
                                : 'bg-white border-slate-200 hover:border-[#073321]'
                            }`}
                          >
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#E6F4ED] text-[#073321]">
                                  Chapter {chNum}
                                </span>
                                {!isUnlocked ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                                    <Crown className="w-3.5 h-3.5 text-amber-600" /> Premium Only
                                  </span>
                                ) : isCompleted ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed
                                  </span>
                                ) : (
                                  <span className="text-xs font-mono text-slate-400">Ready to Learn</span>
                                )}
                              </div>

                              <h3 className="font-bold text-base text-[#073321] leading-snug">
                                {topic.title}
                              </h3>
                              <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed font-sans">
                                {topic.understandBody ? topic.understandBody.slice(0, 130) + '...' : 'Explore core statutory provisions, compliance traps, and diagnostic questions.'}
                              </p>
                            </div>

                            <div className="flex-shrink-0 self-end sm:self-center">
                              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all ${
                                !isUnlocked ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-[#073321] text-white hover:bg-[#052819]'
                              }`}>
                                {!isUnlocked ? 'Unlock 👑' : 'Start Chapter →'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })()}
            </div>
          </div>
        )}

      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          source={`classic-study-${resolvedSlug}`}
        />
      )}
    </div>
  );
}

// ─── Exported Modal with Error Boundary ─────────────────────────────────────
export default function RegulatoryMasterModal(props) {
  if (!props.course) return null;
  return (
    <RegulatoryMasterErrorBoundary onClose={props.onClose}>
      <RegulatoryMasterModalInner {...props} />
    </RegulatoryMasterErrorBoundary>
  );
}
