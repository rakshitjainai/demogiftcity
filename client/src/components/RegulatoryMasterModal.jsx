import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import fmeContent from '../data/regmate-fme-content.json';
import coursesData from '../data/courses.json';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Design Tokens & Badge Helpers (Codex System) ──────────────────────────
const W_SCORE = { 'very-high': 4, high: 3, medium: 2, low: 1 };
const P_SCORE = { critical: 4, high: 3, medium: 2, low: 1 };

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

function RolePill({ roleTag, weight }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-mint text-forest border border-mint-deep">
      <span>{roleTag}</span>
      {weight && <span className="text-ink-soft/70">· {weight}</span>}
    </span>
  );
}

function SourceChip({ source, verify }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {source && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white border border-line text-ink-soft shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          {source}
        </span>
      )}
      {verify && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          VERIFY AGAINST SOURCE
        </span>
      )}
    </div>
  );
}

function VerifyWarningBanner({ note }) {
  return (
    <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
      <div>
        <strong className="block font-mono uppercase text-[10px] tracking-wider text-amber-800 mb-0.5">
          Statutory Note — Verify Against Live Regulation
        </strong>
        {note || 'This topic draws on the general AML/FEMA framework. Please verify current thresholds and circulars against source.'}
      </div>
    </div>
  );
}

// ─── Cards Normalizer Helper ────────────────────────────────────────────────
// Safely converts both array of card objects and pipe-delimited card strings into uniform card objects
function normalizeCards(cards) {
  if (!cards) return [];
  if (Array.isArray(cards)) return cards;
  if (typeof cards === 'string') {
    return cards.split('||').map((rawCard, idx) => {
      const cardStr = rawCard.trim();
      if (!cardStr) return null;
      const parts = cardStr.split('|').map(p => p.trim());
      let title = '';
      let law = '';
      let means = '';
      let watch = '';
      let tag = `Point ${idx + 1}`;

      parts.forEach(part => {
        const u = part.toUpperCase();
        if (u.startsWith('LAW')) {
          law = part.replace(/^LAW\s*:?/i, '').trim();
        } else if (u.startsWith('PLAIN')) {
          means = part.replace(/^PLAIN\s*:?/i, '').trim();
        } else if (u.startsWith('WATCH')) {
          watch = part.replace(/^WATCH\s*:?/i, '').trim();
        } else if (!title) {
          title = part;
        }
      });

      if (title && title.includes(': LAW')) {
        const [t, l] = title.split(': LAW');
        title = t.trim();
        if (!law && l) law = l.trim();
      }

      return { tag, title, law, means, watch };
    }).filter(Boolean);
  }
  return [];
}

// ─── Regulatory Master Error Boundary ───────────────────────────────────────
class RegulatoryMasterErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RegulatoryMasterErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
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
                Something went wrong loading this content
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft mt-1.5 leading-relaxed">
                An unexpected display issue occurred. You can retry safely or close this dialog.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-mono text-rose-900 max-h-36 overflow-y-auto">
                <strong>{this.state.error.toString()}</strong>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 bg-mint hover:bg-mint-deep text-forest border border-mint-deep font-semibold text-xs sm:text-sm rounded-xl transition-colors min-h-[44px]"
              >
                Try Again
              </button>
              <button
                onClick={this.props.onClose}
                className="flex-1 py-3 bg-forest hover:bg-forest-deep text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-colors min-h-[44px]"
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
  const { user, token, toggleCourseItem, isMember, hasCourseAccess, hasAccess, initiateCheckout } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isFME = (course?.code || '').toUpperCase().includes('FME') || (course?.slug || '').includes('fme');
  const resolvedSlug = isFME ? 'ifsca-fme' : (course?.slug || 'ifsca-cmi');
  const isCourseOwned = Boolean(isMember || hasCourseAccess?.(resolvedSlug) || user?.role === 'admin');

  // BUG 3 FIX: Lock body scroll when modal is open (prevents mobile bleed-through)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Tab navigation: default to 'modules' (Syllabus/Chapter List overview first!)
  const [activeTab, setActiveTab] = useState('modules');
  const [regLearnStep, setRegLearnStep] = useState('understand');
  const [topicIndex, setTopicIndex] = useState(0);
  const [practiceSelectedOption, setPracticeSelectedOption] = useState(null);
  const [chaptersPage, setChaptersPage] = useState(0);

  // Role selector (for FME: 'co', 'po', 'lc')
  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem('regmate_fme_selected_role') || 'co';
  });
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Prep mode: 'tonight' | 'twoday' | 'deep'
  const [prepMode, setPrepMode] = useState('tonight');

  // FME Module / Topic drilldown state
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Reset view to Chapter List overview whenever modal opens or course changes
  useEffect(() => {
    setActiveTab('modules');
    setSelectedTopicId(null);
    setSelectedModuleId(null);
    setTopicIndex(0);
    setPracticeSelectedOption(null);
    setChaptersPage(0);
  }, [course]);

  // Practice Questions state
  const [questionFilter, setQuestionFilter] = useState('all');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [revealedQuestions, setRevealedQuestions] = useState({});

  // QuickCheck states: { [topicId]: { answers: { [qIdx]: chosenIdx }, submitted: boolean } }
  const [quickCheckStates, setQuickCheckStates] = useState({});

  // Scenario / Simulation drilldown state
  const [scenarioSubTab, setScenarioSubTab] = useState('scenarios'); // 'scenarios' | 'simulations'
  const [openScenarioId, setOpenScenarioId] = useState(null);
  const [revealedScenarios, setRevealedScenarios] = useState({});

  // Rapid Recall state
  const [recallMode, setRecallMode] = useState(null); // null -> mode selector, or mode id
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);

  // Graded Assessment state
  const [assessIndex, setAssessIndex] = useState(0);
  const [assessAnswers, setAssessAnswers] = useState({});
  const [assessCompleted, setAssessCompleted] = useState(false);

  // Non-FME (CMI / AIF) state
  const [cmiItems, setCmiItems] = useState([]);
  const [cmiLoading, setCmiLoading] = useState(!isFME);
  const [cmiActiveItem, setCmiActiveItem] = useState(null);
  const [cmiSelectedOption, setCmiSelectedOption] = useState(null);
  const [cmiFillText, setCmiFillText] = useState('');
  const [cmiSubmitState, setCmiSubmitState] = useState({});
  const [cmiSubmitting, setCmiSubmitting] = useState(false);
  const [cmiTypeFilter, setCmiTypeFilter] = useState('all');
  const [cmiChapterFilter, setCmiChapterFilter] = useState('all');

  const handleSubmitAnswer = async (item) => {
    if (!item) return;
    const uid = item.uid;
    const answer = item.type === 'fill' ? cmiFillText : cmiSelectedOption;
    if (answer === null || answer === undefined || answer === '') return;

    setCmiSubmitting(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/regulatory-master/${resolvedSlug}/submit-answer`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ uid, answer })
      });

      if (res.ok) {
        const data = await res.json();
        setCmiSubmitState(prev => ({
          ...prev,
          [uid]: {
            isCorrect: data.isCorrect,
            correctKey: data.correctKey,
            correctText: data.correctText,
            explanation: data.explanation,
            selected: answer
          }
        }));
        setCompletedSet(prev => new Set([...prev, uid]));
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setCmiSubmitting(false);
    }
  };

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

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    localStorage.setItem('regmate_fme_selected_role', roleId);
    setShowRoleModal(false);
  };

  const handleToggleComplete = async (uid) => {
    const wasCompleted = completedSet.has(uid);
    setCompletedSet(prev => {
      const next = new Set(prev);
      wasCompleted ? next.delete(uid) : next.add(uid);
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

  // Load CMI / AIF from API or fallback
  useEffect(() => {
    if (isFME) return;
    setCmiLoading(true);
    fetch(`${API_BASE}/regulatory-master/${resolvedSlug}/items`)
      .then(r => r.json())
      .then(data => {
        if (data.items) {
          setCmiItems(data.items);
          if (data.items.length > 0) setCmiActiveItem(data.items[0]);
        }
      })
      .catch(err => console.error('Failed to load CMI/AIF items:', err))
      .finally(() => setCmiLoading(false));
  }, [isFME, resolvedSlug]);

  // Current Role Definition
  const currentRole = useMemo(() => {
    return fmeContent.roles.find(r => r.id === selectedRole) || fmeContent.roles[0];
  }, [selectedRole]);

  // FME filtered priority topics for the selected role
  const rolePriorityTopics = useMemo(() => {
    if (!isFME) return [];
    const allTopics = Object.values(fmeContent.topics);
    return allTopics
      .map(t => {
        const weight = t.roleWeight?.[selectedRole] || 'medium';
        const pScore = P_SCORE[t.priority] || 1;
        const wScore = W_SCORE[weight] || 1;
        return { ...t, combinedScore: pScore * 2 + wScore * 3, weight };
      })
      .sort((a, b) => b.combinedScore - a.combinedScore);
  }, [isFME, selectedRole]);

  // FME filtered questions
  const filteredQuestions = useMemo(() => {
    if (!isFME) return [];
    let qs = fmeContent.questions || [];
    if (questionFilter !== 'all') {
      qs = qs.filter(q => q.moduleId === questionFilter || q.priority === questionFilter);
    }
    return qs;
  }, [isFME, questionFilter]);

  // BUG 2 FIX: Clamp question index when filter changes so it never goes out of bounds
  useEffect(() => {
    if (filteredQuestions.length > 0 && currentQuestionIndex >= filteredQuestions.length) {
      setCurrentQuestionIndex(0);
    }
  }, [filteredQuestions.length]);

  // Flashcards for current recall mode
  const currentRecallCards = useMemo(() => {
    if (!isFME || !recallMode) return [];
    const mode = fmeContent.recall.modes.find(m => m.id === recallMode);
    if (!mode) return [];

    const cards = [];
    mode.includes.forEach(grp => {
      if (grp === 'definitions') {
        fmeContent.recall.definitions.forEach(d => cards.push({ cat: 'Definition', front: d.term, back: d.def }));
      }
      if (grp === 'thresholds') {
        fmeContent.recall.thresholds.forEach(d => cards.push({ cat: 'Threshold', front: d.k, back: d.v }));
      }
      if (grp === 'timelines') {
        fmeContent.recall.timelines.forEach(d => cards.push({ cat: 'Timeline', front: d.k, back: d.v }));
      }
      if (grp === 'distinctions') {
        fmeContent.recall.distinctions.forEach(d => cards.push({ cat: 'Distinction', front: `${d.a}  vs  ${d.b}`, back: d.note }));
      }
      if (grp === 'traps') {
        fmeContent.recall.traps.forEach(d => cards.push({ cat: 'Common Trap', front: 'Avoid this interview mistake', back: d }));
      }
    });
    return cards;
  }, [isFME, recallMode]);

  // Calculate readiness score
  const readinessPct = useMemo(() => {
    if (isFME) {
      const topicCount = Object.keys(fmeContent.topics).length;
      const qCount = (fmeContent.questions || []).length;
      const assessScore = assessCompleted ? (Object.values(assessAnswers).filter((v, idx) => v === fmeContent.assessment[idx]?.answer).length / fmeContent.assessment.length) * 100 : 0;
      const totalCount = topicCount + qCount;
      const doneCount = completedSet.size;
      return Math.min(100, Math.round((doneCount / totalCount) * 70 + (assessScore * 0.3)));
    } else {
      const total = cmiItems.length || 1;
      return Math.min(100, Math.round((completedSet.size / total) * 100));
    }
  }, [isFME, completedSet, assessCompleted, assessAnswers, cmiItems]);

  // Build RegLearn topics list for active course
  const topicsList = useMemo(() => {
    if (isFME) {
      return Object.values(fmeContent.topics).map((t) => ({
        id: t.id,
        title: t.title,
        sourceRef: t.source || 'IFSCA (Fund Management) Regulations, 2025',
        understandBody: t.explanation,
        understandCalloutTitle: 'WHY THIS MATTERS',
        understandCalloutBody: t.why,
        walkthroughBody: t.practicalPoint || t.example || 'Review statutory thresholds and filing requirements prior to scheme launch.',
        walkthroughCalloutTitle: 'PRACTITIONER NOTE',
        walkthroughCalloutBody: t.example || t.practicalPoint || 'Category selection determines permitted activities, AUM limits, and KMP appointments.',
        practiceQuestion: fmeContent.quickChecks[t.id]?.[0]?.q || `What is the core requirement under ${t.title}?`,
        practiceOptions: fmeContent.quickChecks[t.id]?.[0]?.options || ['Option A: Strict compliance per scheme', 'Option B: Umbrella fund level exemption', 'Option C: Voluntary guideline', 'Option D: Exempt for accredited investors'],
        practiceAnswer: fmeContent.quickChecks[t.id]?.[0]?.answer ?? 0,
        practiceExplain: fmeContent.quickChecks[t.id]?.[0]?.explain || 'Statutory compliance is enforced scheme-by-scheme.',
        rememberBody: Array.isArray(t.takeaway) ? t.takeaway.join('; ') + '.' : (t.explanation || 'Key compliance takeaway.'),
        rememberComplianceTip: t.practicalPoint || 'Verify requirements against live circulars and statutory filings.',
      }));
    }

    // Direct authentic extraction from courses.json for IFSCA-CMI and SEBI-AIF
    const courseObj = coursesData?.[resolvedSlug] || coursesData?.['ifsca-cmi'];
    if (courseObj?.chapters && courseObj.chapters.length > 0) {
      return courseObj.chapters.map((ch) => {
        const primaryLesson = ch.lessons?.[0] || {};
        const p = primaryLesson.payload || {};
        const cards = normalizeCards(p.cards || []);
        const primaryQ = ch.questions?.[0] || {};
        const qp = primaryQ.payload || {};
        const rawOptions = qp.options || [];
        const qOptions = Array.isArray(rawOptions)
          ? rawOptions.map(o => (typeof o === 'string' ? o : o.t || o.k || ''))
          : ['Option A: Mandatory statutory filing', 'Option B: Umbrella entity exemption', 'Option C: Voluntary guideline', 'Option D: Case-by-case waiver'];

        const understandBody = p.hook || p.meaning || p.summary || (cards.length > 0 ? cards.map(c => `${c.title}: ${c.means || c.law}`).join(' ') : 'Statutory overview and operational framework.');
        const understandCalloutTitle = cards[0]?.tag || (p.importance ? 'WHY THIS MATTERS' : 'CORE STATUTORY PRINCIPLE');
        const understandCalloutBody = cards[0]?.law || p.importance || p.meaning || p.reg_text || 'Ensure complete compliance with statutory requirements.';
        const walkthroughBody = p.summary || p.practitioner_note || (cards.length > 0 ? cards.map(c => c.means || c.law).join(' ') : 'Review operational guidelines and regulatory workflows.');
        const walkthroughCalloutTitle = 'PRACTITIONER NOTE';
        const walkthroughCalloutBody = p.tip || p.practitioner_note || (cards[0]?.watch ? `Watch: ${cards[0].watch}` : 'Verify all regulatory filings and disclosures before execution.');
        const practiceQuestion = qp.q || primaryQ.title || `What is the core regulatory mandate under Chapter ${ch.num} (${ch.title})?`;
        const practiceExplain = qp.scenario || p.tip || p.summary || 'Statutory compliance is enforced per regulation.';
        const rememberBody = p.summary || p.takeaway || (cards.length > 0 ? cards.map(c => `${c.title}: ${c.means || c.law}`).join('; ') : understandBody);
        const rememberComplianceTip = p.tip || p.practitioner_note || 'Verify all regulatory thresholds against the latest circulars.';

        return {
          id: primaryLesson.uid || `ch_${ch.num}`,
          chapterNo: ch.num,
          title: ch.title,
          band: ch.band || '',
          sourceRef: primaryLesson.provision ? `Reg. ${primaryLesson.provision} - ${courseObj.title}` : `Chapter ${ch.num} - ${courseObj.title}`,
          understandBody,
          understandCalloutTitle,
          understandCalloutBody,
          walkthroughBody,
          walkthroughCalloutTitle,
          walkthroughCalloutBody,
          practiceQuestion,
          practiceOptions: qOptions.length > 0 ? qOptions : ['Option A: Strict compliance per scheme', 'Option B: Umbrella fund level exemption', 'Option C: Voluntary guideline', 'Option D: Exempt for accredited investors'],
          practiceAnswer: 0,
          practiceExplain,
          rememberBody,
          rememberComplianceTip,
          cards,
          totalLessons: ch.lessons?.length || 0,
          totalQuestions: ch.questions?.length || 0,
        };
      });
    }

    if (cmiItems && cmiItems.length > 0) {
      return cmiItems.map((item, idx) => ({
        id: item.uid || item._id || `cmi_${idx}`,
        title: item.title || item.question || `Chapter ${idx + 1}`,
        sourceRef: item.provision ? `Reg. ${item.provision} - ${course?.title || 'Regulatory Master'}` : `Item ${idx + 1}`,
        understandBody: item.explanation || item.summary || item.title || 'Statutory compliance requirement.',
        understandCalloutTitle: 'STATUTORY REQUIREMENT',
        understandCalloutBody: item.statutoryText || 'Verify requirements against live circulars and regulations.',
        walkthroughBody: item.practicalNote || item.summary || 'Review operational processes and compliance guidelines.',
        walkthroughCalloutTitle: 'PRACTITIONER NOTE',
        walkthroughCalloutBody: 'Ensure all documentation aligns with regulatory filings.',
        practiceQuestion: item.question || `What is the statutory requirement under ${item.provision || 'this chapter'}?`,
        practiceOptions: [item.option_A, item.option_B, item.option_C, item.option_D].filter(Boolean).length > 0
          ? [item.option_A, item.option_B, item.option_C, item.option_D].filter(Boolean)
          : ['Mandatory compliance', 'Voluntary guideline', 'Exempted category', 'Conditional waiver'],
        practiceAnswer: 0,
        practiceExplain: item.explanation || 'Statutory compliance is enforced per regulation.',
        rememberBody: item.summary || item.title || 'Core regulatory takeaway.',
        rememberComplianceTip: 'Verify all regulatory thresholds against the latest circulars.',
      }));
    }

    return [];
  }, [isFME, cmiItems, course, resolvedSlug]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-paper flex flex-col h-[100dvh] overflow-hidden animate-fade-in"
      style={{
        fontFamily: "'Public Sans', system-ui, -apple-system, sans-serif",
        color: 'var(--ink)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* ─── Unified Top Header Controller (Strict Non-Overlapping Header) ─── */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 shadow-2xs flex-shrink-0 z-30">
        {/* Left: Logo, Title & Chapter Back Button */}
        <div className="flex items-center justify-between md:justify-start gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-base sm:text-lg text-[#073321]">
            <span className="text-[#073321] font-serif text-lg sm:text-2xl font-extrabold tracking-tight">RegLearn</span>
            <span className="text-slate-300 font-light">•</span>
            <span className="text-[#073321] font-bold text-xs sm:text-base line-clamp-1">{course?.title || 'Regulatory Master'}</span>
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
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-amber-600/80 text-amber-700 font-mono font-bold text-[11px] sm:text-xs flex items-center justify-center bg-amber-50 flex-shrink-0">
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

          {/* Exit Learning Button (Placed in Top Controller) */}
          <button
            onClick={onClose}
            aria-label="Exit Learning"
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
          >
            <span>Exit</span>
            <X className="w-4 h-4 text-rose-600" />
          </button>
        </div>
      </header>

      {/* ─── Main Content Body (Dedicated Scrollable Viewport with Safe Padding) ─── */}
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

                {/* ─── 4 Stepper Tabs (Ordered: Understand -> Walkthrough -> Remember -> Practice) ─── */}
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
                        Practice Assessment Question
                      </span>
                      <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                        {currentTopic.practiceQuestion}
                      </p>
                    </div>

                    {/* Interactive Multiple Choice Options */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {currentTopic.practiceOptions.map((opt, idx) => {
                        const isSelected = practiceSelectedOption === idx;
                        const isCorrect = idx === (currentTopic.practiceAnswer ?? 0);
                        const hasChosen = practiceSelectedOption !== null;

                        let btnStyles = 'border-slate-200 bg-white hover:border-[#073321] hover:bg-slate-50 text-slate-700';
                        if (hasChosen) {
                          if (isCorrect) {
                            btnStyles = 'border-[#073321] bg-[#E6F4ED] text-[#073321] font-bold shadow-xs';
                          } else if (isSelected) {
                            btnStyles = 'border-rose-300 bg-rose-50 text-rose-800 font-semibold';
                          } else {
                            btnStyles = 'border-slate-200 bg-white opacity-60 text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => setPracticeSelectedOption(idx)}
                            className={`p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyles}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 ${
                                hasChosen && isCorrect
                                  ? 'bg-[#073321] text-white'
                                  : hasChosen && isSelected
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {['A', 'B', 'C', 'D'][idx]}
                              </span>
                              <span className="leading-snug">{opt}</span>
                            </div>
                            {hasChosen && isCorrect && <Check className="w-5 h-5 text-[#073321] flex-shrink-0" />}
                            {hasChosen && isSelected && !isCorrect && <X className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Feedback Explanation Box */}
                    {practiceSelectedOption !== null && (
                      <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-1 ${
                        practiceSelectedOption === (currentTopic.practiceAnswer ?? 0)
                          ? 'bg-[#E6F4ED] border-[#073321] text-[#073321]'
                          : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}>
                        <div className="font-mono font-bold uppercase text-[10px] tracking-wider">
                          {practiceSelectedOption === (currentTopic.practiceAnswer ?? 0) ? '✓ Correct Answer' : '⚠ Statutory Explanation'}
                        </div>
                        <p>{currentTopic.practiceExplain || currentTopic.rememberComplianceTip}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
                      {regLearnStep === 'remember'
                        ? currentTopic.rememberBody
                        : regLearnStep === 'walkthrough'
                        ? currentTopic.walkthroughBody
                        : currentTopic.understandBody}
                    </p>

                    {/* Rich Codex Cards breakdown if available */}
                    {regLearnStep === 'understand' && currentTopic.cards && currentTopic.cards.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {currentTopic.cards.map((card, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-left space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                {card.tag || `Point ${cIdx + 1}`}
                              </span>
                              <span className="text-xs font-semibold text-slate-900">{card.title}</span>
                            </div>
                            {card.law && (
                              <p className="text-xs text-slate-700 font-sans italic border-l-2 border-emerald-600 pl-2.5 py-0.5">
                                "{card.law}"
                              </p>
                            )}
                            {card.means && (
                              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                                <strong className="text-slate-800 font-medium">In practice: </strong>{card.means}
                              </p>
                            )}
                            {card.watch && (
                              <div className="text-[11px] text-amber-900 bg-amber-50 rounded-xl p-2 border border-amber-200 font-sans leading-relaxed">
                                <strong className="font-mono text-amber-800 uppercase tracking-wider text-[9px] block mb-0.5">⚠ Watch Out</strong>
                                {card.watch}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Compliance Tip Box */}
                {(regLearnStep === 'remember' || regLearnStep === 'walkthrough' || regLearnStep === 'understand') && (
                  <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-5 space-y-1.5 text-left">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#073321]">
                      {regLearnStep === 'remember' ? 'COMPLIANCE TIP' : 'PRACTITIONER NOTE'}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {regLearnStep === 'remember'
                        ? (currentTopic.rememberComplianceTip || 'Check the four gates scheme by scheme, not fund by fund. The most common error in structuring is treating corpus and investor count as fund-level tests when the regulation applies them to each scheme.')
                        : (currentTopic.walkthroughCalloutBody || currentTopic.understandCalloutBody)}
                    </p>
                  </div>
                )}

                {/* Statutory Reference Line */}
                <div className="text-xs text-slate-400 font-mono pt-3 border-t border-slate-100 text-left">
                  {currentTopic.sourceRef}
                </div>

                {/* Action Button */}
                <div className="pt-2 text-left flex items-center justify-between gap-4">
                  <button
                    onClick={handleNextStep}
                    className="bg-[#073321] hover:bg-[#052819] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    {regLearnStep === 'practice'
                      ? (topicIndex < topicsList.length - 1 ? 'Complete & Next Chapter →' : 'Finish Course →')
                      : 'Continue →'}
                  </button>

                  <span className="text-xs font-mono text-slate-400">
                    Chapter {topicIndex + 1} of {topicsList.length}
                  </span>
                </div>

              </div>
            </div>
          );
        })()}

        {/* ================================================================= */}
        {/* TAB: MODULES / SYLLABUS (FIRST SHOW LIST OF ALL CHAPTERS)        */}
        {/* ================================================================= */}
        {activeTab === 'modules' && (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {!selectedTopicId ? (
              /* ─── Curriculum Chapter Overview List (Shown First) ─── */
              <div className="space-y-6 text-left">
                {(() => {
                  const CHAPTERS_PER_PAGE = 5;
                  const totalPages = Math.ceil(topicsList.length / CHAPTERS_PER_PAGE) || 1;
                  const safePage = Math.min(chaptersPage, totalPages - 1);
                  const visibleTopics = topicsList.slice(safePage * CHAPTERS_PER_PAGE, (safePage + 1) * CHAPTERS_PER_PAGE);

                  return (
                    <div className="space-y-6 max-w-4xl mx-auto pt-6 sm:pt-8">
                      {/* Modern Glassmorphic Top Hero Header (No Outer Border, Distinct Aesthetics) */}
                      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#073321] via-[#0b4d32] to-[#073321] text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-0">
                        {/* Decorative Glow */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-2 relative z-10">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Statutory Curriculum
                          </div>
                          <h2 className="text-xl sm:text-2xl font-serif font-extrabold tracking-tight text-white leading-tight">
                            {course?.title || 'Regulatory Master'} Chapters
                          </h2>
                          <p className="text-xs sm:text-sm text-emerald-100/90 font-sans max-w-md">
                            Showing Chapters {safePage * CHAPTERS_PER_PAGE + 1}–{Math.min((safePage + 1) * CHAPTERS_PER_PAGE, topicsList.length)} of {topicsList.length} total modules
                          </p>
                        </div>

                        {/* Modern Glassmorphic Arrow & Input Page Controller */}
                        <div className="relative z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl self-start md:self-auto shadow-lg">
                          {/* Previous Page Arrow */}
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

                          {/* Interactive Page Input */}
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-white px-2 whitespace-nowrap">
                            <span className="text-emerald-200/90 font-mono text-xs uppercase leading-none">Page</span>
                            <input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={safePage + 1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                                  setChaptersPage(val - 1);
                                }
                              }}
                              className="w-12 h-7 text-center bg-white/20 border border-white/30 rounded-lg font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-300 shadow-inner flex items-center justify-center p-0 leading-none"
                            />
                            <span className="text-emerald-200/90 font-mono text-xs leading-none">/ {totalPages}</span>
                          </div>

                          {/* Next Page Arrow */}
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

                      {/* Fixed Height Vertical List Container */}
                      <div className="min-h-[460px] flex flex-col justify-start space-y-3">
                        {visibleTopics.map((topic, offsetIdx) => {
                          const idx = safePage * CHAPTERS_PER_PAGE + offsetIdx;
                          const chNum = idx + 1;
                          const isUnlocked = hasAccess ? hasAccess('job_ready', idx) : idx < 2;
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
            ) : (
              <div className="space-y-6 max-w-6xl mx-auto">
                {isFME ? (
                // ─── FME Track Content (Modules -> Topics -> Multi-layer Card) ───
                selectedTopicId ? (
                  // Single Topic View
                  (() => {
                    const topic = fmeContent.topics[selectedTopicId];
                    const quickCheckList = fmeContent.quickChecks[selectedTopicId] || [];
                    const qcState = quickCheckStates[selectedTopicId] || { answers: {}, submitted: false };
                    const isDone = completedSet.has(topic.id);

                    const handleQcOption = (qIdx, optIdx) => {
                      if (qcState.submitted) return;
                      setQuickCheckStates(prev => ({
                        ...prev,
                        [selectedTopicId]: {
                          ...qcState,
                          answers: { ...qcState.answers, [qIdx]: optIdx }
                        }
                      }));
                    };

                    const handleQcSubmit = () => {
                      setQuickCheckStates(prev => ({
                        ...prev,
                        [selectedTopicId]: { ...qcState, submitted: true }
                      }));
                      handleToggleComplete(topic.id);
                    };

                    return (
                      <div className="space-y-5">
                        {/* Topic Header & Breadcrumb */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-line">
                          <button
                            onClick={() => setSelectedTopicId(null)}
                            className="cursor-target inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-forest min-h-[40px]"
                          >
                            <ArrowLeft className="w-4 h-4" /> Back to Module Topics
                          </button>
                          <button
                            onClick={() => handleToggleComplete(topic.id)}
                            className={`cursor-target px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[40px] ${
                              isDone
                                ? 'bg-mint text-forest-deep border border-leaf/40'
                                : 'bg-forest text-white hover:bg-forest-deep'
                            }`}
                          >
                            {isDone ? <><CheckCircle2 className="w-4 h-4 text-leaf" /> Topic Completed</> : <><Circle className="w-4 h-4" /> Mark Complete</>}
                          </button>
                        </div>

                        {/* Title & Source Banner */}
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <PriorityPill priority={topic.priority} />
                            <RolePill roleTag="CO" weight={topic.roleWeight?.co} />
                            <RolePill roleTag="PO" weight={topic.roleWeight?.po} />
                            <RolePill roleTag="L&C" weight={topic.roleWeight?.lc} />
                          </div>
                          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-forest-deep">
                            {topic.title}
                          </h2>
                          <div className="mt-3">
                            <SourceChip source={topic.source} verify={topic.verify} />
                          </div>
                        </div>

                        {topic.verify && <VerifyWarningBanner />}

                        {/* Layer 1: Why This Gets Asked (Signature dark forest card) */}
                        {topic.why && (
                          <div
                            className="rounded-2xl p-5 sm:p-6 card-shadow"
                            style={{ background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--forest) 100%)', border: '1px solid rgba(18,138,84,0.3)', color: '#ffffff' }}
                          >
                            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gold-soft font-bold mb-2">
                              <Sparkles className="w-4 h-4 text-gold-soft" /> Why this gets asked in interviews
                            </div>
                            <p className="text-xs sm:text-sm text-mint/90 leading-relaxed font-sans">
                              {topic.why}
                            </p>
                          </div>
                        )}

                        {/* Layer 2: The Core Statutory Explanation */}
                        {topic.explanation && (
                          <div className="bg-white border border-line rounded-2xl p-5 sm:p-6 card-shadow space-y-2">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-forest font-bold">
                              Statutory Core &amp; Regulatory Meaning
                            </div>
                            <p className="text-sm sm:text-base text-ink leading-relaxed">
                              {topic.explanation}
                            </p>
                          </div>
                        )}

                        {/* Layer 3: Practical Point */}
                        {topic.practicalPoint && (
                          <div className="bg-mint/40 border border-mint-deep rounded-2xl p-5 sm:p-6 card-shadow space-y-2">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-forest font-bold flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-leaf" /> Practical Point / In Practice
                            </div>
                            <p className="text-sm sm:text-base text-forest-deep leading-relaxed">
                              {topic.practicalPoint}
                            </p>
                          </div>
                        )}

                        {/* Layer 4: Example / Case */}
                        {topic.example && (
                          <div className="bg-paper border border-line rounded-2xl p-5 sm:p-6 card-shadow space-y-2">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-ink-soft font-bold">
                              Practitioner Scenario / Example
                            </div>
                            <p className="text-xs sm:text-sm text-ink leading-relaxed italic">
                              "{topic.example}"
                            </p>
                          </div>
                        )}

                        {/* Layer 5: Takeaways */}
                        {topic.takeaway && topic.takeaway.length > 0 && (
                          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 sm:p-6">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold mb-3 flex items-center gap-2">
                              <Check className="w-4 h-4 text-amber-700" /> Key Takeaways to Quote
                            </div>
                            <ul className="space-y-2">
                              {topic.takeaway.map((tk, idx) => (
                                <li key={idx} className="text-xs sm:text-sm text-amber-950 flex items-start gap-2.5 leading-relaxed">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                                  <span>{tk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* QuickCheck MCQs for this topic */}
                        {quickCheckList.length > 0 && (
                          <div className="bg-white border border-line rounded-2xl p-5 sm:p-6 card-shadow space-y-5 pt-6">
                            <div className="flex items-center justify-between pb-3 border-b border-line flex-wrap gap-2">
                              <div>
                                <h3 className="font-serif font-bold text-base sm:text-lg text-forest-deep">
                                  QuickCheck Diagnostic
                                </h3>
                                <p className="text-xs text-ink-soft">Test your retention of this topic</p>
                              </div>
                              <span className="px-3 py-1 rounded-full bg-mint text-forest text-[11px] font-mono font-bold border border-mint-deep">
                                {quickCheckList.length} Questions
                              </span>
                            </div>

                            <div className="space-y-5">
                              {quickCheckList.map((qc, qIdx) => {
                                const chosen = qcState.answers[qIdx];
                                const isCorrect = chosen === qc.answer;

                                return (
                                  <div key={qIdx} className="p-4 sm:p-5 rounded-xl bg-paper border border-line space-y-3">
                                    <div className="text-xs font-mono font-bold text-forest">Q{qIdx + 1}</div>
                                    <div className="text-sm sm:text-base font-semibold text-forest-deep leading-snug">{qc.q}</div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                      {qc.options.map((opt, optIdx) => {
                                        let optStyle = 'bg-white border-line text-ink hover:border-forest hover:bg-mint/20';
                                        if (qcState.submitted) {
                                          if (optIdx === qc.answer) optStyle = 'bg-mint border-leaf text-forest-deep font-bold ring-1 ring-leaf';
                                          else if (optIdx === chosen && !isCorrect) optStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                                          else optStyle = 'bg-white border-line opacity-50 text-ink-soft';
                                        } else if (chosen === optIdx) {
                                          optStyle = 'bg-forest text-white border-forest font-bold shadow-xs';
                                        }

                                        return (
                                          <button
                                            key={optIdx}
                                            disabled={qcState.submitted}
                                            onClick={() => handleQcOption(qIdx, optIdx)}
                                            className={`cursor-target p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-2.5 min-h-[48px] ${optStyle}`}
                                          >
                                            <span className="w-5 h-5 rounded-md bg-black/5 flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 mt-0.5">
                                              {['A', 'B', 'C', 'D'][optIdx]}
                                            </span>
                                            <span className="leading-snug">{opt}</span>
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {qcState.submitted && (
                                      <div className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${isCorrect ? 'bg-mint text-forest-deep border border-mint-deep' : 'bg-rose-50 text-rose-900 border border-rose-200'}`}>
                                        <strong className="block mb-1 font-bold">{isCorrect ? '✓ Correct Answer' : '✕ Explanation:'}</strong>
                                        {qc.explain}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {!qcState.submitted && (
                              <button
                                onClick={handleQcSubmit}
                                disabled={Object.keys(qcState.answers).length < quickCheckList.length}
                                className={`cursor-target w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 min-h-[48px] ${
                                  Object.keys(qcState.answers).length === quickCheckList.length
                                    ? 'bg-forest hover:bg-forest-deep text-white shadow-md hover-lift'
                                    : 'bg-line/70 text-ink-soft/60 cursor-not-allowed border border-line'
                                }`}
                              >
                                {Object.keys(qcState.answers).length < quickCheckList.length
                                  ? `Answer all ${quickCheckList.length} questions to submit (${Object.keys(qcState.answers).length}/${quickCheckList.length} selected)`
                                  : 'Submit QuickCheck Answers'
                                }
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  // Module & Topic Listing
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-deep">
                          Modules &amp; Knowledge Objects
                        </h2>
                        <p className="text-xs text-ink-soft">7 comprehensive IFSCA Fund Management modules</p>
                      </div>
                    </div>

                    {fmeContent.modules.map((m, idx) => {
                      const topicIds = fmeContent.moduleTopics[m.id] || [];
                      const isExpanded = selectedModuleId === m.id;
                      const doneTopics = topicIds.filter(tId => completedSet.has(tId)).length;
                      const isUnlocked = hasAccess ? hasAccess('job_ready', idx) : idx < 2;

                      return (
                        <div key={m.id} className={`bg-white border ${isUnlocked ? 'border-line' : 'border-amber-200 bg-amber-50/20'} rounded-2xl overflow-hidden card-shadow relative`}>
                          <button
                            onClick={() => {
                              if (!isUnlocked) {
                                setShowUpgradeModal(true);
                              } else {
                                setSelectedModuleId(isExpanded ? null : m.id);
                              }
                            }}
                            className="cursor-target w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 hover:bg-mint/10 transition-colors min-h-[64px]"
                          >
                            <div className="flex items-start gap-3.5 min-w-0">
                              <span className="font-serif text-xl sm:text-2xl font-bold text-forest w-8 flex-shrink-0 pt-0.5">
                                {m.no}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-sm sm:text-base text-forest-deep leading-snug">
                                    {m.title}
                                  </h3>
                                  {!isUnlocked && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                                      <Lock className="w-3 h-3 text-amber-600" /> Locked
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-ink-soft mt-1 leading-relaxed line-clamp-2">
                                  {m.summary}
                                </p>
                                <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-ink-soft">
                                  <span>{topicIds.length} Topics</span>
                                  <span>•</span>
                                  <span className={doneTopics > 0 ? 'text-leaf font-bold' : ''}>
                                    {doneTopics}/{topicIds.length} Done
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="pt-1 flex-shrink-0">
                              {!isUnlocked ? (
                                <Lock className="w-5 h-5 text-amber-600" />
                              ) : isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-forest" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-ink-soft" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-line bg-paper p-3 sm:p-4 space-y-2.5">
                              {topicIds.map(tId => {
                                const topic = fmeContent.topics[tId];
                                if (!topic) return null;
                                const isDone = completedSet.has(tId);

                                return (
                                  <button
                                    key={tId}
                                    onClick={() => setSelectedTopicId(tId)}
                                    className="cursor-target w-full p-3.5 sm:p-4 rounded-xl bg-white border border-line hover:border-forest text-left flex items-center justify-between gap-3 transition-all hover-lift min-h-[52px]"
                                  >
                                    <div className="min-w-0">
                                      <div className="font-semibold text-xs sm:text-sm text-forest-deep truncate">
                                        {topic.title}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <PriorityPill priority={topic.priority} />
                                        <RolePill roleTag={currentRole.tag} weight={topic.roleWeight?.[selectedRole]} />
                                        {topic.verify && (
                                          <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                                            Verify
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {isDone && <CheckCircle2 className="w-4 h-4 text-leaf" />}
                                      <ChevronRight className="w-4 h-4 text-ink-soft" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                // ─── Non-FME Track (CMI / AIF in Codex layout) ───
                <div className="space-y-5">
                  {cmiLoading ? (
                    <div className="py-20 text-center space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-forest mx-auto" />
                      <p className="text-xs text-ink-soft">Loading course curriculum…</p>
                    </div>
                  ) : cmiActiveItem ? (
                    (() => {
                      const item = cmiActiveItem;
                      const isLesson = item.itemType === 'lesson' || item.type === 'lesson';
                      const isMCQ = item.type === 'mcq' || item.type === 'spot_lapse' || item.type === 'old_vs_new' || (!isLesson && item.option_A);
                      const isTF = item.type === 'truefalse';
                      const isFill = item.type === 'fill';
                      const subState = cmiSubmitState[item.uid];
                      const isDone = completedSet.has(item.uid);

                      // Available options for MCQ
                      const mcqOptions = [
                        { key: 'A', text: item.option_A },
                        { key: 'B', text: item.option_B },
                        { key: 'C', text: item.option_C },
                        { key: 'D', text: item.option_D },
                      ].filter(o => o.text);

                      // BUG 4 FIX: Build filtered list, then safely recover if active item not in current filter
                      const filteredList = cmiItems.filter(i => {
                        const matchType = cmiTypeFilter === 'all' ||
                          (cmiTypeFilter === 'lesson' && (i.itemType === 'lesson' || i.type === 'lesson')) ||
                          (cmiTypeFilter === 'mcq' && (i.type === 'mcq' || i.type === 'spot_lapse' || i.type === 'old_vs_new')) ||
                          (cmiTypeFilter === 'truefalse' && i.type === 'truefalse') ||
                          (cmiTypeFilter === 'fill' && i.type === 'fill');
                        const matchCh = cmiChapterFilter === 'all' || (i.module_no || i.chapterNo) === Number(cmiChapterFilter);
                        return matchType && matchCh;
                      });
                      let currIdx = filteredList.findIndex(i => i.uid === item.uid);
                      // BUG 4 FIX: If active item is not in the filtered list (e.g. after filter change),
                      // snap to first item in the new filtered list instead of showing broken state
                      if (currIdx === -1 && filteredList.length > 0) {
                        // Defer state update to avoid render-loop
                        setTimeout(() => {
                          setCmiActiveItem(filteredList[0]);
                          setCmiSelectedOption(null);
                          setCmiFillText('');
                        }, 0);
                        currIdx = 0;
                      }

                      return (
                        <div className="space-y-5">
                          {/* Active Item Card */}
                          <div className="bg-white border border-line rounded-2xl p-5 sm:p-7 card-shadow space-y-5">
                            {/* Header / Meta */}
                            <div className="flex items-center justify-between pb-3 border-b border-line flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-mint text-forest border border-mint-deep">
                                  Chapter {item.module_no || item.chapterNo || 1}
                                </span>
                                <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                  {isLesson ? 'Lesson' : item.type ? item.type.toUpperCase() : 'Question'}
                                </span>
                                {item.provision && (
                                  <span className="text-[10px] font-mono text-ink-soft hidden sm:inline">
                                    § {item.provision}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleToggleComplete(item.uid)}
                                className={`cursor-target px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[38px] ${
                                  isDone
                                    ? 'bg-mint text-forest-deep border border-leaf/40'
                                    : 'bg-forest text-white hover:bg-forest-deep'
                                }`}
                              >
                                {isDone ? <><CheckCircle2 className="w-4 h-4 text-leaf" /> Done</> : <><Circle className="w-4 h-4" /> Mark Done</>}
                              </button>
                            </div>

                            {/* Title / Question text */}
                            <h2 className="text-lg sm:text-xl font-serif font-bold text-forest-deep leading-snug">
                              {item.title || item.question}
                            </h2>

                            {/* ─── LESSON CONTENT ─── */}
                            {isLesson && (
                              <div className="space-y-4">
                                {item.hook && (
                                  <div
                                    className="p-4 rounded-xl text-xs sm:text-sm italic leading-relaxed"
                                    style={{ background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--forest) 100%)', color: '#ffffff' }}
                                  >
                                    "{item.hook}"
                                  </div>
                                )}

                                {/* Cards (Points / Concepts) */}
                                {(() => {
                                  const cardsList = normalizeCards(item.cards);
                                  if (cardsList.length === 0) return null;
                                  return (
                                    <div className="space-y-3">
                                      {cardsList.map((card, cIdx) => (
                                        <div key={cIdx} className="p-4 rounded-xl bg-paper border border-line space-y-2.5">
                                          {card.tag && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-mint text-forest uppercase">
                                              {card.tag}
                                            </span>
                                          )}
                                          {card.title && <h3 className="font-bold text-sm text-forest-deep">{card.title}</h3>}
                                          {card.law && (
                                            <div className="p-3 bg-mint/40 border border-mint-deep rounded-lg text-xs font-mono text-forest-deep leading-relaxed">
                                              <strong className="block text-[10px] uppercase text-forest mb-1">Statutory Law:</strong>
                                              {card.law}
                                            </div>
                                          )}
                                          {card.means && (
                                            <p className="text-xs sm:text-sm text-ink leading-relaxed">
                                              <strong className="text-forest-deep">Meaning: </strong>{card.means}
                                            </p>
                                          )}
                                          {card.watch && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                                              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                                              <div>
                                                <strong className="block text-[10px] uppercase font-bold text-amber-800">Practitioner Caution:</strong>
                                                {card.watch}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}

                                {item.summary && (
                                  <div className="p-4 bg-paper border border-line rounded-xl text-xs sm:text-sm text-ink leading-relaxed">
                                    <strong className="block text-[10px] font-mono uppercase text-forest mb-1">Summary:</strong>
                                    {item.summary}
                                  </div>
                                )}

                                {item.tip && (
                                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                                    <Sparkles className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="block font-mono uppercase text-[10px] text-amber-800 mb-0.5">Practitioner Note &amp; Tip:</strong>
                                      {item.tip}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ─── MCQ QUESTION ─── */}
                            {isMCQ && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-2.5">
                                  {mcqOptions.map(opt => {
                                    const isSelected = cmiSelectedOption === opt.key;
                                    let style = 'bg-white border-line text-ink hover:border-forest hover:bg-mint/20';

                                    if (subState) {
                                      const isCorrectOpt = String(opt.key).toUpperCase() === String(subState.correctKey).toUpperCase();
                                      const isChosenOpt = String(opt.key).toUpperCase() === String(subState.selected).toUpperCase();
                                      if (isCorrectOpt) {
                                        style = 'bg-mint border-leaf text-forest-deep font-bold ring-1 ring-leaf';
                                      } else if (isChosenOpt && !subState.isCorrect) {
                                        style = 'bg-rose-50 border-rose-300 text-rose-900';
                                      } else {
                                        style = 'bg-white border-line opacity-50 text-ink-soft';
                                      }
                                    } else if (isSelected) {
                                      style = 'bg-forest border-forest text-white font-bold shadow-xs';
                                    }

                                    return (
                                      <button
                                        key={opt.key}
                                        disabled={!!subState || cmiSubmitting}
                                        onClick={() => setCmiSelectedOption(opt.key)}
                                        className={`cursor-target w-full p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 min-h-[50px] ${style}`}
                                      >
                                        <span className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                                          {opt.key}
                                        </span>
                                        <span className="leading-relaxed">{opt.text}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {!subState ? (
                                  <button
                                    onClick={() => handleSubmitAnswer(item)}
                                    disabled={!cmiSelectedOption || cmiSubmitting}
                                    className={`cursor-target w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 min-h-[48px] ${
                                      cmiSelectedOption && !cmiSubmitting
                                        ? 'bg-forest hover:bg-forest-deep text-white shadow-md hover-lift'
                                        : 'bg-line/70 text-ink-soft/60 cursor-not-allowed border border-line'
                                    }`}
                                  >
                                    {cmiSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Answer'}
                                  </button>
                                ) : (
                                  <div className="space-y-3 pt-2 animate-fade-in">
                                    <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                                      subState.isCorrect ? 'bg-mint text-forest-deep border border-leaf/30' : 'bg-rose-50 text-rose-900 border border-rose-200'
                                    }`}>
                                      {subState.isCorrect ? (
                                        <><CheckCircle2 className="w-5 h-5 text-leaf flex-shrink-0" /> Correct! Excellent regulatory analysis.</>
                                      ) : (
                                        <><ShieldAlert className="w-5 h-5 text-rose-700 flex-shrink-0" /> Incorrect. Correct answer: Option {subState.correctKey}</>
                                      )}
                                    </div>

                                    {subState.explanation && (
                                      <div className="p-4 bg-paper border border-line rounded-xl text-xs text-ink leading-relaxed">
                                        <strong className="block font-mono uppercase text-[10px] text-forest mb-1">Statutory Explanation:</strong>
                                        {subState.explanation}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ─── TRUE / FALSE QUESTION ─── */}
                            {isTF && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  {['true', 'false'].map(val => {
                                    const isSelected = cmiSelectedOption === val;
                                    let style = 'bg-white border-line text-ink hover:border-forest hover:bg-mint/20';

                                    if (subState) {
                                      const isCorrectOpt = String(val).toLowerCase() === String(subState.correctKey).toLowerCase();
                                      const isChosenOpt = String(val).toLowerCase() === String(subState.selected).toLowerCase();
                                      if (isCorrectOpt) {
                                        style = 'bg-mint border-leaf text-forest-deep font-bold';
                                      } else if (isChosenOpt && !subState.isCorrect) {
                                        style = 'bg-rose-50 border-rose-300 text-rose-900';
                                      } else {
                                        style = 'bg-white border-line opacity-50 text-ink-soft';
                                      }
                                    } else if (isSelected) {
                                      style = 'bg-forest border-forest text-white font-bold';
                                    }

                                    return (
                                      <button
                                        key={val}
                                        disabled={!!subState || cmiSubmitting}
                                        onClick={() => setCmiSelectedOption(val)}
                                        className={`cursor-target p-4 rounded-xl border text-center font-bold text-sm capitalize transition-all min-h-[50px] ${style}`}
                                      >
                                        {val}
                                      </button>
                                    );
                                  })}
                                </div>

                                {!subState ? (
                                  <button
                                    onClick={() => handleSubmitAnswer(item)}
                                    disabled={!cmiSelectedOption || cmiSubmitting}
                                    className={`cursor-target w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 min-h-[48px] ${
                                      cmiSelectedOption && !cmiSubmitting
                                        ? 'bg-forest hover:bg-forest-deep text-white shadow-md hover-lift'
                                        : 'bg-line/70 text-ink-soft/60 cursor-not-allowed border border-line'
                                    }`}
                                  >
                                    {cmiSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Answer'}
                                  </button>
                                ) : (
                                  <div className="space-y-3 pt-2 animate-fade-in">
                                    <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                                      subState.isCorrect ? 'bg-mint text-forest-deep border border-leaf/30' : 'bg-rose-50 text-rose-900 border border-rose-200'
                                    }`}>
                                      {subState.isCorrect ? (
                                        <><CheckCircle2 className="w-5 h-5 text-leaf flex-shrink-0" /> Correct statement analysis.</>
                                      ) : (
                                        <><ShieldAlert className="w-5 h-5 text-rose-700 flex-shrink-0" /> Incorrect statement analysis.</>
                                      )}
                                    </div>

                                    {subState.explanation && (
                                      <div className="p-4 bg-paper border border-line rounded-xl text-xs text-ink leading-relaxed">
                                        <strong className="block font-mono uppercase text-[10px] text-forest mb-1">Statutory Explanation:</strong>
                                        {subState.explanation}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ─── FILL IN THE BLANK QUESTION ─── */}
                            {isFill && (
                              <div className="space-y-4">
                                {!subState ? (
                                  <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                      <input
                                        type="text"
                                        placeholder="Type your answer here..."
                                        value={cmiFillText}
                                        onChange={(e) => setCmiFillText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitAnswer(item); }}
                                        className="flex-1 px-4 py-3 border border-line rounded-xl text-sm focus:outline-none focus:border-leaf min-h-[48px] bg-white"
                                      />
                                      <button
                                        onClick={() => handleSubmitAnswer(item)}
                                        disabled={!cmiFillText.trim() || cmiSubmitting}
                                        className={`cursor-target px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-[48px] ${
                                          cmiFillText.trim() && !cmiSubmitting
                                            ? 'bg-forest hover:bg-forest-deep text-white shadow-md hover-lift'
                                            : 'bg-line/70 text-ink-soft/60 cursor-not-allowed border border-line'
                                        }`}
                                      >
                                        {cmiSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Answer'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3 pt-2 animate-fade-in">
                                    <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                                      subState.isCorrect ? 'bg-mint text-forest-deep border border-leaf/30' : 'bg-rose-50 text-rose-900 border border-rose-200'
                                    }`}>
                                      {subState.isCorrect ? (
                                        <><CheckCircle2 className="w-5 h-5 text-leaf flex-shrink-0" /> Correct! Answer: {subState.correctKey}</>
                                      ) : (
                                        <><ShieldAlert className="w-5 h-5 text-rose-700 flex-shrink-0" /> Incorrect. Your answer: "{subState.selected}" · Correct answer: "{subState.correctKey}"</>
                                      )}
                                    </div>

                                    {subState.explanation && (
                                      <div className="p-4 bg-paper border border-line rounded-xl text-xs text-ink leading-relaxed">
                                        <strong className="block font-mono uppercase text-[10px] text-forest mb-1">Statutory Explanation:</strong>
                                        {subState.explanation}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ─── Prev / Next Navigation ─── */}
                            <div className="flex items-center justify-between pt-4 border-t border-line">
                              <button
                                disabled={currIdx <= 0}
                                onClick={() => {
                                  if (currIdx > 0) {
                                    setCmiActiveItem(filteredList[currIdx - 1]);
                                    setCmiSelectedOption(null);
                                    setCmiFillText('');
                                  }
                                }}
                                className="cursor-target px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-line hover:bg-mint/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                              >
                                ← Previous
                              </button>

                              <span className="text-xs font-mono text-ink-soft">
                                {currIdx >= 0 ? `${currIdx + 1} / ${filteredList.length}` : ''}
                              </span>

                              <button
                                disabled={filteredList.length === 0 || currIdx >= filteredList.length - 1}
                                onClick={() => {
                                  const nextIdx = Math.min(currIdx + 1, filteredList.length - 1);
                                  if (nextIdx > currIdx) {
                                    setCmiActiveItem(filteredList[nextIdx]);
                                    setCmiSelectedOption(null);
                                    setCmiFillText('');
                                  }
                                }}
                                className="cursor-target px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest text-white hover:bg-forest-deep disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 min-h-[44px]"
                              >
                                Next →
                              </button>
                            </div>
                          </div>

                          {/* ─── Curriculum Sidebar / Selector ─── */}
                          <div className="bg-white border border-line rounded-2xl p-4 sm:p-5 card-shadow space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4 className="text-xs font-mono font-bold uppercase text-forest">
                                Course Syllabus &amp; Items ({filteredList.length})
                              </h4>
                              {/* Type Filters */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {['all', 'lesson', 'mcq', 'truefalse', 'fill'].map(f => (
                                  <button
                                    key={f}
                                    onClick={() => { setCmiTypeFilter(f); setCmiActiveItem(null); }}
                                    className={`cursor-target px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold capitalize transition-colors min-h-[32px] ${
                                      cmiTypeFilter === f ? 'bg-forest text-white' : 'bg-paper text-ink-soft hover:bg-mint border border-line'
                                    }`}
                                  >
                                    {f}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                              {filteredList.map(itemObj => (
                                <button
                                  key={itemObj.uid}
                                  onClick={() => {
                                    setCmiActiveItem(itemObj);
                                    setCmiSelectedOption(null);
                                    setCmiFillText('');
                                  }}
                                  className={`cursor-target w-full p-3 rounded-xl text-left text-xs flex items-center justify-between transition-colors min-h-[44px] ${
                                    item.uid === itemObj.uid
                                      ? 'bg-forest text-white font-bold shadow-xs'
                                      : 'bg-paper hover:bg-mint/40 text-ink border border-line'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <span className="text-[10px] font-mono opacity-70 flex-shrink-0">
                                      Ch{itemObj.module_no || itemObj.chapterNo || 1}
                                    </span>
                                    <span className="truncate">{itemObj.title || itemObj.question}</span>
                                  </div>
                                  {completedSet.has(itemObj.uid) && (
                                    <CheckCircle2 className="w-4 h-4 text-leaf flex-shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      )}

          {/* ================================================================= */}
          {/* TAB: PRACTICE / QUESTIONS (Think → Reveal → Remember)             */}
          {/* ================================================================= */}
          {activeTab === 'practice' && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">

              {isFME ? (
                (() => {
                  const total = filteredQuestions.length;
                  const safeIndex = Math.min(Math.max(0, currentQuestionIndex), total - 1);
                  const q = filteredQuestions[safeIndex];
                  const isRevealed = !!revealedQuestions[q?.id];

                  if (!q) {
                    return (
                      <div className="p-8 text-center bg-white rounded-2xl border border-line">
                        <p className="text-xs text-ink-soft">No questions found for this filter.</p>
                      </div>
                    );
                  }

                  const handleReveal = () => {
                    setRevealedQuestions(prev => ({ ...prev, [q.id]: true }));
                    handleToggleComplete(q.id);
                  };

                  return (
                    <div className="space-y-5">
                      {/* Filter Bar */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {['all', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'critical'].map(f => (
                          <button
                            key={f}
                            onClick={() => { setQuestionFilter(f); setCurrentQuestionIndex(0); }}
                            className={`cursor-target px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
                              questionFilter === f ? 'bg-forest text-white' : 'bg-white border border-line text-ink-soft hover:bg-mint/40'
                            }`}
                          >
                            {f === 'all' ? 'All Questions' : f === 'critical' ? 'Critical Only' : `Module ${f.toUpperCase()}`}
                          </button>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center justify-between text-xs font-mono text-ink-soft">
                        <span className="font-bold text-forest">{String(safeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
                        <div className="flex-1 mx-3 h-2 bg-line rounded-full overflow-hidden">
                          <div className="h-full bg-leaf rounded-full transition-all duration-300" style={{ width: `${((safeIndex + 1) / total) * 100}%` }} />
                        </div>
                        <span className="uppercase text-[11px]">{q.length} answer</span>
                      </div>

                      {/* Question Card */}
                      <div className="bg-white border border-line rounded-3xl p-5 sm:p-7 card-shadow space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <PriorityPill priority={q.priority} />
                          <RolePill roleTag="CO" weight={q.roleWeight?.co} />
                          <RolePill roleTag="PO" weight={q.roleWeight?.po} />
                          <RolePill roleTag="L&C" weight={q.roleWeight?.lc} />
                        </div>

                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-forest-deep leading-snug">
                          {q.q}
                        </h2>

                        {!isRevealed ? (
                          // Think prompt before reveal
                          <div className="space-y-4 pt-2">
                            <div className="p-4 sm:p-5 bg-amber-50/70 border border-dashed border-amber-200 rounded-2xl text-center">
                              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">
                                Think It Through First
                              </div>
                              <p className="text-xs sm:text-sm text-amber-950 mt-1.5 max-w-md mx-auto leading-relaxed">
                                How would you structure this answer in 30 seconds before reading the model response?
                              </p>
                            </div>

                            <button
                              onClick={handleReveal}
                              className="cursor-target w-full py-4 bg-forest hover:bg-forest-deep text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 hover-lift min-h-[52px]"
                            >
                              <Eye className="w-4 h-4" /> Reveal How to Answer
                            </button>
                          </div>
                        ) : (
                          // Revealed Model Answer & Deep Structure
                          <div className="space-y-5 pt-2 animate-fade-in">
                            {/* Model Answer */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between pb-1.5 border-b border-line">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-forest font-bold">
                                  Model Interview Response
                                </span>
                                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase font-semibold">
                                  {q.length}
                                </span>
                              </div>
                              <p className="text-sm sm:text-base text-ink leading-relaxed font-sans">
                                {q.answer}
                              </p>
                            </div>

                            {/* Remember Flow Structure */}
                            {q.remember && q.remember.length > 0 && (() => {
                               // Strip leading arrow chars from each node (data sometimes includes them)
                               const nodes = q.remember
                                 .map(n => String(n).replace(/^[-→>]+\s*/, '').trim())
                                 .filter(n => n.length > 0);
                               if (nodes.length === 0) return null;
                               return (
                                 <div
                                   className="rounded-2xl p-5 sm:p-6 space-y-3 card-shadow"
                                   style={{ background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--forest) 100%)', border: '1px solid rgba(18,138,84,0.3)' }}
                                 >
                                   <div className="text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5" style={{ color: 'var(--gold-soft)' }}>
                                     <Brain className="w-4 h-4" style={{ color: 'var(--gold-soft)' }} /> Remember The Structure (Mental Flow)
                                   </div>
                                   <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                                     {nodes.map((node, nIdx) => (
                                       <React.Fragment key={nIdx}>
                                         {nIdx > 0 && <span className="font-bold text-sm leading-none" style={{ color: 'var(--gold-soft)' }}>→</span>}
                                         <span
                                           className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold leading-snug"
                                           style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff' }}
                                         >
                                           {node}
                                         </span>
                                       </React.Fragment>
                                     ))}
                                   </div>
                                 </div>
                               );
                             })()}

                            {/* Interview Trap */}
                            {q.trap && (
                              <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-900 leading-relaxed">
                                <strong className="block font-mono uppercase text-[10px] text-rose-700 mb-1">
                                  ⚠ Interview Trap to Avoid:
                                </strong>
                                {q.trap}
                              </div>
                            )}

                            {/* Delivery Tip */}
                            {q.tip && (
                              <div className="p-4 sm:p-5 bg-mint/50 border border-mint-deep rounded-2xl text-xs sm:text-sm text-forest-deep leading-relaxed">
                                <strong className="block font-mono uppercase text-[10px] text-forest mb-1">
                                  💡 Delivery &amp; Practitioner Tip:
                                </strong>
                                {q.tip}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-4 border-t border-line gap-3">
                          <button
                            disabled={safeIndex === 0}
                            onClick={() => setCurrentQuestionIndex(safeIndex - 1)}
                            className="cursor-target px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-line hover:bg-mint/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                          >
                            Previous
                          </button>
                          <span className="font-mono text-xs text-ink-soft font-bold">
                            {safeIndex + 1} / {total}
                          </span>
                          <button
                            onClick={() => setCurrentQuestionIndex((safeIndex + 1) % total)}
                            className="cursor-target px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-forest text-white hover:bg-forest-deep transition-colors flex items-center gap-1.5 min-h-[44px]"
                          >
                            Next <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-6 sm:p-8 bg-white border border-line rounded-2xl text-center space-y-4 card-shadow">
                  <p className="text-sm sm:text-base font-semibold text-forest-deep">CMI / AIF Practice Questions are organized chapter-wise in the Syllabus tab.</p>
                  <button onClick={() => setActiveTab('modules')} className="px-5 py-3 bg-forest text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-forest-deep transition-all min-h-[44px]">
                    Go to Syllabus
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: SCENARIOS & SIMULATIONS                                      */}
          {/* ================================================================= */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">

              {/* Sub-tab toggle */}
              <div className="flex items-center gap-2 p-1.5 bg-mint border border-mint-deep rounded-2xl w-fit">
                <button
                  onClick={() => { setScenarioSubTab('scenarios'); setOpenScenarioId(null); }}
                  className={`cursor-target px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                    scenarioSubTab === 'scenarios' ? 'bg-forest text-white shadow-xs' : 'text-forest hover:bg-mint-deep'
                  }`}
                >
                  Judgement Scenarios ({fmeContent.scenarios?.length || 0})
                </button>
                <button
                  onClick={() => { setScenarioSubTab('simulations'); setOpenScenarioId(null); }}
                  className={`cursor-target px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                    scenarioSubTab === 'simulations' ? 'bg-forest text-white shadow-xs' : 'text-forest hover:bg-mint-deep'
                  }`}
                >
                  Job Simulations ({fmeContent.simulations?.length || 0})
                </button>
              </div>

              {openScenarioId ? (
                // Drilldown Scenario / Simulation View
                (() => {
                  const isSim = scenarioSubTab === 'simulations';
                  const item = isSim
                    ? fmeContent.simulations.find(s => s.id === openScenarioId)
                    : fmeContent.scenarios.find(s => s.id === openScenarioId);
                  const isRevealed = !!revealedScenarios[openScenarioId];

                  if (!item) return null;

                  const handleReveal = () => {
                    setRevealedScenarios(prev => ({ ...prev, [openScenarioId]: true }));
                    handleToggleComplete(item.id);
                  };

                  return (
                    <div className="space-y-5">
                      <button
                        onClick={() => setOpenScenarioId(null)}
                        className="cursor-target inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-forest min-h-[40px]"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to All {isSim ? 'Simulations' : 'Scenarios'}
                      </button>

                      <div className="bg-white border border-line rounded-3xl overflow-hidden card-shadow">
                        {/* Setup Dark Header */}
                        <div
                          className="p-6 sm:p-7 space-y-3"
                          style={{ background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--forest) 50%, var(--forest-deep) 100%)', color: '#ffffff' }}
                        >
                          <span className="text-[10px] font-mono text-gold-soft uppercase tracking-widest font-bold">
                            {isSim ? `Job Simulation · ${item.role?.toUpperCase()} Role` : 'Judgement Scenario'}
                          </span>
                          <p className="text-sm sm:text-base text-mint/90 leading-relaxed font-sans">
                            {item.setup}
                          </p>
                          <div className="pt-3 border-t border-white/15 font-serif font-bold text-base sm:text-lg text-white">
                            {item.prompt}
                          </div>
                        </div>

                        {item.verify && (
                          <div className="p-4">
                            <VerifyWarningBanner note={item.verifyNote} />
                          </div>
                        )}

                        <div className="p-5 sm:p-7 space-y-5">
                          {!isRevealed ? (
                            <div className="space-y-4">
                              <div className="p-4 sm:p-5 bg-amber-50/70 border border-dashed border-amber-200 rounded-2xl text-center">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">
                                  What would you do first?
                                </div>
                                <p className="text-xs sm:text-sm text-amber-950 mt-1.5">
                                  Formulate your statutory steps and escalation ladder before revealing.
                                </p>
                              </div>
                              <button
                                onClick={handleReveal}
                                className="cursor-target w-full py-4 bg-forest hover:bg-forest-deep text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 hover-lift min-h-[52px]"
                              >
                                <Eye className="w-4 h-4" /> Reveal Framework &amp; Control
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-5 animate-fade-in">
                              {/* Scenario Steps */}
                              {item.steps && (
                                <div className="space-y-3">
                                  <div className="text-[10px] font-mono uppercase tracking-widest text-forest font-bold">
                                    Step-by-Step Approach Framework
                                  </div>
                                  <div className="space-y-2.5">
                                    {item.steps.map((st, sIdx) => (
                                      <div key={sIdx} className="flex items-start gap-3 p-3.5 bg-paper border border-line rounded-xl text-xs sm:text-sm text-ink leading-relaxed">
                                        <span className="w-6 h-6 rounded-lg bg-mint text-forest font-serif font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                          {sIdx + 1}
                                        </span>
                                        <p className="pt-0.5">{st}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Simulation Facts */}
                              {item.obligation && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="p-4 bg-paper border border-line rounded-xl">
                                    <div className="text-[10px] font-mono uppercase text-forest font-bold mb-1">Applicable Obligation</div>
                                    <div className="text-xs sm:text-sm text-ink font-medium leading-snug">{item.obligation}</div>
                                  </div>
                                  <div className="p-4 bg-paper border border-line rounded-xl">
                                    <div className="text-[10px] font-mono uppercase text-leaf font-bold mb-1">Practical Action</div>
                                    <div className="text-xs sm:text-sm text-ink font-medium leading-snug">{item.action}</div>
                                  </div>
                                </div>
                              )}

                              {/* Common Mistake */}
                              {item.mistake && (
                                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-900 leading-relaxed">
                                  <strong className="block font-mono uppercase text-[10px] text-rose-700 mb-1">Common Interview Mistake:</strong>
                                  {item.mistake}
                                </div>
                              )}

                              {/* Compliance Control Table */}
                              {item.control && (
                                <div
                                  className="rounded-2xl p-5 sm:p-6 space-y-3 card-shadow"
                                  style={{ background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--forest) 100%)', border: '1px solid rgba(18,138,84,0.3)', color: '#ffffff' }}
                                >
                                  <div className="text-[10px] font-mono uppercase tracking-widest text-gold-soft font-bold flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-gold-soft" /> Structured Compliance Control
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                                    {Object.entries(item.control).map(([k, v]) => (
                                      <div key={k} className="p-3 bg-white/10 border border-white/15 rounded-xl">
                                        <span className="text-[10px] uppercase text-gold-soft block mb-1 font-bold">{k}:</span>
                                        <span className="text-mint font-sans text-xs sm:text-sm leading-relaxed">{v}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Listing view
                <div className="space-y-3">
                  {(scenarioSubTab === 'scenarios' ? fmeContent.scenarios : fmeContent.simulations).map(s => {
                    const isDone = completedSet.has(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => setOpenScenarioId(s.id)}
                        className="cursor-target w-full p-4 sm:p-5 rounded-2xl bg-white border border-line hover:border-forest text-left flex items-center justify-between gap-4 transition-all hover-lift card-shadow min-h-[70px]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-mint text-forest text-[10px] font-mono font-bold rounded uppercase border border-mint-deep">
                              {s.role?.toUpperCase() || 'PRACTICE'}
                            </span>
                            {isDone && (
                              <span className="text-[10px] font-mono text-leaf font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm sm:text-base text-forest-deep leading-snug">
                            {s.title || s.setup.slice(0, 65) + '…'}
                          </h3>
                          <p className="text-xs text-ink-soft mt-1 line-clamp-2">
                            {s.setup}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-ink-soft flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: RAPID RECALL (Flashcards Deck)                              */}
          {/* ================================================================= */}
          {activeTab === 'recall' && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">

              {!recallMode ? (
                // Mode Selection
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-forest-deep">Rapid Recall Decks</h2>
                    <p className="text-xs text-ink-soft">High-speed active recall: definitions, thresholds, timelines and traps</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {fmeContent.recall.modes.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setRecallMode(m.id); setFlashIndex(0); setFlashFlipped(false); }}
                        className="cursor-target p-5 rounded-2xl bg-white border border-line hover:border-forest text-left flex items-start gap-4 transition-all hover-lift card-shadow min-h-[90px]"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-forest text-mint flex flex-col items-center justify-center flex-shrink-0 border border-leaf/30">
                          <span className="font-serif font-bold text-lg leading-none">{m.mins}</span>
                          <span className="font-mono text-[8px] text-mint/80 uppercase">min</span>
                        </div>
                        <div>
                          <div className="font-serif font-bold text-base text-forest-deep">{m.label}</div>
                          <p className="text-xs text-ink-soft mt-1 leading-relaxed">{m.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Flashcard Flip Viewer
                (() => {
                  const cards = currentRecallCards;
                  const card = cards[flashIndex];

                  if (!card) {
                    return (
                      <div className="p-8 text-center bg-white rounded-3xl border border-line space-y-4 card-shadow">
                        <div className="w-14 h-14 rounded-2xl bg-mint text-leaf flex items-center justify-center mx-auto">
                          <Check className="w-8 h-8" />
                        </div>
                        <h3 className="font-serif font-bold text-xl sm:text-2xl text-forest-deep">Deck Completed!</h3>
                        <p className="text-xs text-ink-soft">You reviewed all cards in this mode.</p>
                        <button
                          onClick={() => setRecallMode(null)}
                          className="px-6 py-3 bg-forest text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-forest-deep transition-all min-h-[44px]"
                        >
                          Back to Deck Selector
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setRecallMode(null)}
                          className="cursor-target text-xs font-semibold text-ink-soft hover:text-forest flex items-center gap-1 min-h-[36px]"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back to Recall Modes
                        </button>
                        <span className="font-mono text-xs font-bold text-forest">
                          {flashIndex + 1} / {cards.length}
                        </span>
                      </div>

                      {/* 3D Flashcard */}
                      <div
                        onClick={() => setFlashFlipped(!flashFlipped)}
                        className="cursor-pointer rounded-3xl p-6 sm:p-10 min-h-[280px] sm:min-h-[320px] flex flex-col justify-between card-shadow hover-lift relative select-none"
                        style={{ background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--forest) 50%, var(--forest-deep) 100%)', border: '1px solid rgba(18,138,84,0.3)', color: '#ffffff' }}
                      >
                        <div className="flex justify-between items-center text-xs text-mint/80 font-mono">
                          <span className="text-[10px] text-gold-soft uppercase font-bold tracking-widest">{card.cat}</span>
                          <span className="text-[11px] font-medium">Tap to flip</span>
                        </div>

                        <div className="py-6 text-center my-auto">
                          {!flashFlipped ? (
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white leading-snug">
                              {card.front}
                            </h3>
                          ) : (
                            <p className="text-sm sm:text-base lg:text-lg text-mint font-sans leading-relaxed text-left animate-fade-in whitespace-pre-line">
                              {card.back}
                            </p>
                          )}
                        </div>

                        <div className="text-center font-mono text-[11px] text-mint/70">
                          {flashFlipped ? '✓ Flipped (Tap to flip back)' : 'Tap anywhere to reveal statutory answer'}
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex items-center justify-between gap-3">
                        <button
                          disabled={flashIndex === 0}
                          onClick={() => { setFlashIndex(prev => prev - 1); setFlashFlipped(false); }}
                          className="cursor-target px-4 sm:px-5 py-3 rounded-xl border border-line bg-white text-xs sm:text-sm font-semibold disabled:opacity-40 min-h-[44px]"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => {
                            if (flashIndex < cards.length - 1) {
                              setFlashIndex(prev => prev + 1);
                              setFlashFlipped(false);
                            } else {
                              setFlashIndex(cards.length);
                            }
                          }}
                          className="cursor-target flex-1 py-3 bg-forest hover:bg-forest-deep text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 hover-lift min-h-[44px]"
                        >
                          {flashIndex < cards.length - 1 ? 'Next Card' : 'Finish Deck'} <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: GRADED ASSESSMENT                                            */}
          {/* ================================================================= */}
          {activeTab === 'assess' && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">

              {!assessCompleted ? (
                (() => {
                  const q = fmeContent.assessment[assessIndex];
                  const total = fmeContent.assessment.length;
                  const chosen = assessAnswers[assessIndex];
                  const isAnswered = chosen !== undefined;

                  const handleSelectOpt = (idx) => {
                    if (isAnswered) return;
                    setAssessAnswers(prev => ({ ...prev, [assessIndex]: idx }));
                  };

                  return (
                    <div className="space-y-5">
                      {/* Header */}
                      <div className="flex items-center justify-between text-xs font-mono text-ink-soft">
                        <span className="font-bold text-forest">Question {assessIndex + 1} of {total}</span>
                        <div className="flex-1 mx-3 h-2 bg-line rounded-full overflow-hidden">
                          <div className="h-full bg-leaf rounded-full transition-all duration-300" style={{ width: `${((assessIndex + 1) / total) * 100}%` }} />
                        </div>
                        <span className="font-semibold text-forest-deep">{fmeContent.areas[q?.area] || 'General'}</span>
                      </div>

                      {/* Question Card */}
                      <div className="bg-white border border-line rounded-3xl p-5 sm:p-8 card-shadow space-y-5">
                        <div className="font-serif font-bold text-lg sm:text-xl lg:text-2xl text-forest-deep leading-snug">
                          {q?.q}
                        </div>

                        <div className="space-y-2.5">
                          {q?.options.map((opt, optIdx) => {
                            let style = 'bg-white border-line text-ink hover:border-forest hover:bg-mint/20';
                            if (isAnswered) {
                              if (optIdx === q.answer) style = 'bg-mint border-leaf text-forest-deep font-bold ring-1 ring-leaf';
                              else if (optIdx === chosen && chosen !== q.answer) style = 'bg-rose-50 border-rose-300 text-rose-900';
                              else style = 'bg-white border-line opacity-50 text-ink-soft';
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isAnswered}
                                onClick={() => handleSelectOpt(optIdx)}
                                className={`cursor-target w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 min-h-[50px] ${style}`}
                              >
                                <span className="w-6 h-6 rounded-lg bg-black/5 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {['A', 'B', 'C', 'D'][optIdx]}
                                </span>
                                <span className="leading-relaxed">{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className="p-4 bg-paper border border-line rounded-xl text-xs sm:text-sm leading-relaxed space-y-1">
                            <strong className="block text-forest-deep font-bold">
                              {chosen === q.answer ? '✓ Correct Answer!' : '✕ Incorrect statutory analysis:'}
                            </strong>
                            <p className="text-ink-soft">{q.explain}</p>
                          </div>
                        )}

                        {isAnswered && (
                          <button
                            onClick={() => {
                              if (assessIndex < total - 1) {
                                setAssessIndex(prev => prev + 1);
                              } else {
                                setAssessCompleted(true);
                              }
                            }}
                            className="cursor-target w-full py-4 bg-forest hover:bg-forest-deep text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 hover-lift min-h-[50px]"
                          >
                            {assessIndex < total - 1 ? 'Next Question' : 'View Final Scored Results'} <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Assessment Scored Results
                (() => {
                  const total = fmeContent.assessment.length;
                  let correctCount = 0;
                  const byArea = {};

                  fmeContent.assessment.forEach((q, idx) => {
                    const ok = assessAnswers[idx] === q.answer;
                    if (ok) correctCount++;
                    const areaName = fmeContent.areas[q.area] || 'General';
                    if (!byArea[areaName]) byArea[areaName] = { c: 0, t: 0 };
                    byArea[areaName].t++;
                    if (ok) byArea[areaName].c++;
                  });

                  const pct = Math.round((correctCount / total) * 100);

                  return (
                    <div className="bg-white border border-line rounded-3xl p-6 sm:p-8 card-shadow space-y-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-mint text-forest flex items-center justify-center mx-auto border border-mint-deep">
                        <Award className="w-8 h-8 text-leaf" />
                      </div>

                      <div>
                        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-forest-deep">
                          Assessment Performance
                        </h2>
                        <div className="font-serif text-4xl sm:text-5xl font-bold text-forest mt-2">
                          {correctCount} <span className="text-lg text-ink-soft">/ {total}</span>
                        </div>
                        <p className="text-sm font-semibold text-leaf mt-1">{pct}% Score Overall</p>
                      </div>

                      {/* Area Breakdown Bars */}
                      <div className="text-left space-y-3 pt-4 border-t border-line">
                        <h4 className="text-xs font-mono font-bold uppercase text-forest">Area-wise Breakdown</h4>
                        {Object.entries(byArea).map(([area, stat]) => {
                          const areaPct = Math.round((stat.c / stat.t) * 100);
                          return (
                            <div key={area} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-ink font-semibold">{area}</span>
                                <span className="font-mono text-ink-soft">{stat.c}/{stat.t} ({areaPct}%)</span>
                              </div>
                              <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${areaPct >= 70 ? 'bg-leaf' : areaPct >= 40 ? 'bg-gold' : 'bg-rose-500'}`}
                                  style={{ width: `${areaPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-3 pt-4 flex-col sm:flex-row">
                        <button
                          onClick={() => { setAssessIndex(0); setAssessAnswers({}); setAssessCompleted(false); }}
                          className="cursor-target flex-1 py-3.5 bg-paper hover:bg-mint border border-line text-forest font-semibold text-xs sm:text-sm rounded-xl transition-colors min-h-[48px]"
                        >
                          Retake Assessment
                        </button>
                        <button
                          onClick={() => setActiveTab('home')}
                          className="cursor-target flex-1 py-3.5 bg-forest hover:bg-forest-deep text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-colors min-h-[48px]"
                        >
                          Return to Home
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

            </div>
          )}

          {/* ─── Modern Dark Emerald Regulatory Master Footer ─── */}
          <footer className="mt-16 rounded-3xl bg-gradient-to-r from-[#073321] via-[#0b4d32] to-[#073321] text-white p-6 sm:p-8 space-y-6 max-w-6xl mx-auto shadow-xl border-0 relative overflow-hidden">
            {/* Decorative Glow */}
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-emerald-800/80 pb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-emerald-300 flex items-center justify-center font-serif font-bold text-lg shadow-inner">
                  §
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base leading-none">RegMate Regulatory Master</h4>
                  <p className="text-xs text-emerald-200/80 mt-1">Structured Chapter-Wise Compliance &amp; Interview Learning System</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedTopicId(null);
                    setActiveTab('modules');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white/15 hover:bg-white/30 text-white border border-white/20 shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-emerald-300" />
                  <span>Chapter Modules</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-white" /> Exit Learning
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/80 gap-2 relative z-10">
              <span>© {new Date().getFullYear()} RegMate. All statutory learning modules consolidated for GIFT IFSC practitioners.</span>
              <span className="font-mono text-[11px] text-amber-300 font-semibold">GIFT IFSC Compliance Regulations 2026</span>
            </div>
          </footer>

        </main>

        {/* ─── Role Selection Modal ─── */}
        {showRoleModal && (
          <div className="fixed inset-0 z-50 bg-forest-deep/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-line space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-forest-deep">Select Target Role</h3>
                  <p className="text-xs text-ink-soft">Prioritize questions &amp; compliance controls</p>
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-1.5 text-ink-soft hover:text-forest min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {fmeContent.roles.map(r => {
                  const isSel = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRoleChange(r.id)}
                      className={`cursor-target w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 min-h-[64px] ${
                        isSel
                          ? 'bg-mint/60 border-leaf text-forest-deep shadow-xs'
                          : 'bg-white border-line hover:border-forest text-ink'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl font-serif font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                        isSel ? 'bg-forest text-white' : 'bg-mint text-forest'
                      }`}>
                        {r.tag}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm leading-snug">{r.name}</div>
                        <div className="text-xs text-ink-soft mt-0.5 leading-relaxed">{r.line}</div>
                      </div>
                      {isSel && <Check className="w-5 h-5 text-leaf ml-auto flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Upgrade / Subscription Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          sectionKey="job_ready"
          title="Unlock All Regulatory Master Modules"
          message="You have accessed the 2 free preview modules. Upgrade your membership pass to unlock all 7 Fund Management &amp; CMI modules."
        />

      </div>
    );
  }

export default function RegulatoryMasterModal(props) {
  return (
    <RegulatoryMasterErrorBoundary onClose={props.onClose}>
      <RegulatoryMasterModalInner {...props} />
    </RegulatoryMasterErrorBoundary>
  );
}
