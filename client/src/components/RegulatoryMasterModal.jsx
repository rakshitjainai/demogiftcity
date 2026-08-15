import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X, CheckCircle2, Circle, BookOpen, HelpCircle, ArrowLeft, ArrowRight,
  ShieldAlert, Sparkles, Award, Loader2, AlertCircle, ChevronDown,
  ChevronRight, Zap, Target, Play, Brain, Shield, Clock, RotateCcw,
  Check, Eye, Filter, UserCheck, Flame, Scale, FileText, BarChart3,
  ExternalLink, Layers, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LockOverlay from './LockOverlay';
import UpgradeModal from './UpgradeModal';
import fmeContent from '../data/regmate-fme-content.json';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Design Tokens & Type Helpers ──────────────────────────────────────────
const W_SCORE = { 'very-high': 4, high: 3, medium: 2, low: 1 };
const P_SCORE = { critical: 4, high: 3, medium: 2, low: 1 };

function PriorityPill({ priority }) {
  const p = (priority || 'medium').toLowerCase();
  const styles = {
    critical: 'bg-[rgba(180,70,47,0.10)] text-[#B4462F] border border-[rgba(180,70,47,0.25)]',
    high: 'bg-[#F6ECDD] text-[#B0722B] border border-[#EAD6BB]',
    medium: 'bg-[rgba(63,122,140,0.12)] text-[#3F7A8C] border border-[rgba(63,122,140,0.25)]',
    low: 'bg-[rgba(124,138,163,0.14)] text-[#7C8AA3] border border-[rgba(124,138,163,0.25)]',
  }[p] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${styles}`}>
      {priority}
    </span>
  );
}

function RolePill({ roleTag, weight }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EEF2F9] text-[#182338] border border-slate-200">
      <span>{roleTag}</span>
      {weight && <span className="opacity-60">· {weight}</span>}
    </span>
  );
}

function SourceChip({ source, verify }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {source && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-white border border-[#E4E8F0] text-[#4B5A75] shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6863A]" />
          {source}
        </span>
      )}
      {verify && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#FBF2DC] border border-[#EBD9AE] text-[#9A6A16] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9A6A16]" />
          VERIFY AGAINST SOURCE
        </span>
      )}
    </div>
  );
}

function VerifyWarningBanner({ note }) {
  return (
    <div className="p-3.5 bg-[#FBF2DC] border border-[#EBD9AE] rounded-xl text-xs text-[#6E4E10] leading-relaxed flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 text-[#9A6A16] flex-shrink-0 mt-0.5" />
      <div>
        <strong className="block font-mono uppercase text-[10px] tracking-wider text-[#9A6A16] mb-0.5">
          Sample Content — Verify Against Live Regulation
        </strong>
        {note || 'This topic draws on the general AML/FEMA framework. Please verify current thresholds and circulars against source.'}
      </div>
    </div>
  );
}

// ─── Main Modal Component ──────────────────────────────────────────────────
export default function RegulatoryMasterModal({ course, onClose }) {
  const { user, token, toggleCourseItem, hasAccess } = useAuth();
  const isMember = user?.membershipStatus === 'active';
  const [showMembershipLock, setShowMembershipLock] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isFME = (course?.code || '').toUpperCase().includes('FME') || (course?.slug || '').includes('fme');
  const resolvedSlug = isFME ? 'ifsca-fme' : (course?.slug || 'ifsca-cmi');

  // Tab navigation: 'home' | 'modules' | 'practice' | 'scenarios' | 'recall' | 'assess'
  const [activeTab, setActiveTab] = useState('home');

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#182338',
      }}
    >
      {/* App Shell Container */}
      <div className="w-full sm:max-w-[480px] lg:max-w-[1060px] h-full sm:h-[92vh] sm:max-h-[920px] bg-[#F4F6FA] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E4E8F0] relative">

        {/* ─── Topbar ─── */}
        <header className="bg-[#16203A] text-[#EAF0FA] px-4 py-3.5 flex items-center justify-between border-b border-[#26324F] flex-shrink-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C6863A] to-[#B0722B] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm shadow-xs flex-shrink-0">
              §
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] font-bold text-sm text-white tracking-tight">
                  RegMate JobReady
                </span>
                <span className="px-2 py-0.5 bg-white/10 text-white/90 text-[10px] font-mono font-semibold rounded-full uppercase">
                  {course?.code || 'IFSCA-FME'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isFME && (
              <button
                onClick={() => setShowRoleModal(true)}
                className="cursor-target px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#EAF0FA] border border-white/15 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-medium"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#C6863A]" />
                <span className="hidden sm:inline font-mono text-[11px]">{currentRole.name}</span>
                <span className="sm:hidden font-mono text-[11px]">{currentRole.tag}</span>
                <ChevronDown className="w-3 h-3 text-[#9DB0CE]" />
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close"
              className="cursor-target p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ─── Track / Role Sub-Bar ─── */}
        <div className="bg-[#101A2E] text-white/80 px-4 py-2 flex items-center justify-between text-xs border-b border-[#26324F] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 truncate">
            <span className="text-[11px] font-mono text-[#C6863A] uppercase tracking-wider font-semibold">
              {isFME ? `Focus: ${currentRole.tag} Role` : 'Mastery Track'}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-xs text-slate-300 truncate">
              {isFME ? currentRole.line : course?.title}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
            <span className="text-slate-400">Readiness</span>
            <span className="font-bold text-[#C6863A]">{readinessPct}%</span>
          </div>
        </div>

        {/* ─── Main Content Body ─── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-4 pb-20">

          {/* ================================================================= */}
          {/* TAB: HOME / DASHBOARD                                            */}
          {/* ================================================================= */}
          {activeTab === 'home' && (
            <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">

              {/* Hero Banner with Readiness Dial */}
              <div className="bg-gradient-to-br from-[#1B2A49] to-[#16203A] text-white rounded-2xl p-5 sm:p-6 border border-[#26324F] shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#9DB0CE] uppercase tracking-widest block mb-1">
                      Target Role · {isFME ? currentRole.tag : 'Practitioner'}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-['Space_Grotesk'] font-bold text-white leading-tight">
                      {isFME ? currentRole.name : course?.title}
                    </h1>
                    <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
                      {isFME ? 'Role-weighted, statutory-backed interview preparation with real case judgements.' : course?.description}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#C6863A]/20 border border-[#C6863A]/40 text-[#E7C89B] font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                    {prepMode.toUpperCase()} MODE
                  </span>
                </div>

                {/* Dial + Action row */}
                <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative w-18 h-18 rounded-full border-4 border-white/10 border-t-[#C6863A] border-r-[#C6863A] flex items-center justify-center flex-shrink-0">
                      <div className="text-center">
                        <span className="font-['Space_Grotesk'] text-xl font-bold text-white block leading-none">
                          {readinessPct}%
                        </span>
                        <span className="text-[8px] font-mono text-[#9DB0CE] uppercase">Score</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Interview Readiness Status</div>
                      <div className="text-[11px] text-[#9DB0CE] mt-0.5">
                        {readinessPct < 30 ? 'Initial Calibration · Focus on High-Yield Modules' : readinessPct < 70 ? 'Intermediate · Reinforce Traps & Scenarios' : 'High Readiness · Ready for Final Mock'}
                      </div>
                    </div>
                  </div>

                  <div className="sm:ml-auto flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveTab('practice')}
                      className="cursor-target flex-1 sm:flex-none px-4 py-2.5 bg-[#C6863A] hover:bg-[#B0722B] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Target className="w-4 h-4" /> Start Interview Qs
                    </button>
                    <button
                      onClick={() => setActiveTab('modules')}
                      className="cursor-target flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4" /> Syllabus
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Action Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('practice')}
                  className="cursor-target p-4 bg-white border border-[#E4E8F0] hover:border-[#C6863A] rounded-2xl text-left transition-all hover-lift shadow-xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#F6ECDD] text-[#B0722B] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="font-['Space_Grotesk'] font-bold text-sm text-[#182338]">Interview Qs</div>
                  <div className="text-[11px] text-[#4B5A75] mt-0.5">Think → Reveal flow</div>
                </button>

                <button
                  onClick={() => setActiveTab('scenarios')}
                  className="cursor-target p-4 bg-white border border-[#E4E8F0] hover:border-[#C6863A] rounded-2xl text-left transition-all hover-lift shadow-xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#EEF2F9] text-[#182338] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="font-['Space_Grotesk'] font-bold text-sm text-[#182338]">Simulations</div>
                  <div className="text-[11px] text-[#4B5A75] mt-0.5">Controls & scenarios</div>
                </button>

                <button
                  onClick={() => setActiveTab('recall')}
                  className="cursor-target p-4 bg-white border border-[#E4E8F0] hover:border-[#C6863A] rounded-2xl text-left transition-all hover-lift shadow-xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#E4F3ED] text-[#2E8768] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div className="font-['Space_Grotesk'] font-bold text-sm text-[#182338]">Rapid Recall</div>
                  <div className="text-[11px] text-[#4B5A75] mt-0.5">Flip flashcards</div>
                </button>

                <button
                  onClick={() => setActiveTab('assess')}
                  className="cursor-target p-4 bg-white border border-[#E4E8F0] hover:border-[#C6863A] rounded-2xl text-left transition-all hover-lift shadow-xs group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FBF2DC] text-[#9A6A16] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="font-['Space_Grotesk'] font-bold text-sm text-[#182338]">Assessment</div>
                  <div className="text-[11px] text-[#4B5A75] mt-0.5">20-item scored test</div>
                </button>
              </div>

              {/* FME: Priority Topics for Selected Role */}
              {isFME && (
                <div className="bg-white border border-[#E4E8F0] rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#182338]">
                        Priority Topics for {currentRole.name}
                      </h3>
                      <p className="text-xs text-[#4B5A75]">Weighted by interview frequency for this role</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('modules')}
                      className="text-xs font-semibold text-[#B0722B] hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {rolePriorityTopics.slice(0, 5).map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedModuleId(t.moduleId);
                          setSelectedTopicId(t.id);
                          setActiveTab('modules');
                        }}
                        className="cursor-target w-full p-3.5 rounded-xl border border-[#E4E8F0] hover:border-[#C6863A] bg-[#FBFCFE] text-left flex items-center justify-between gap-3 transition-all hover-lift"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs font-bold text-[#8A97AD] w-5 text-center flex-shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-[#182338] truncate">{t.title}</div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <PriorityPill priority={t.priority} />
                              <RolePill roleTag={currentRole.tag} weight={t.weight} />
                              {t.verify && (
                                <span className="text-[10px] font-mono text-[#9A6A16] font-semibold bg-[#FBF2DC] px-1.5 py-0.5 rounded">
                                  Verify
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8A97AD] flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sourcing & Disclaimer Card */}
              <div className="p-4 bg-[#F6ECDD]/50 border border-[#EAD6BB] rounded-2xl text-xs text-[#5A431F] leading-relaxed">
                <div className="flex items-center gap-2 font-mono font-bold text-[10px] uppercase text-[#B0722B] mb-1">
                  <Shield className="w-3.5 h-3.5" /> Sourcing &amp; Regulatory Accuracy
                </div>
                <p>
                  {isFME ? fmeContent._meta.disclaimer : 'Preparation aid, not legal advice. Always verify live regulation text, circulars, and official gazette notifications prior to regulatory filings or assessments.'}
                </p>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: MODULES / SYLLABUS                                          */}
          {/* ================================================================= */}
          {activeTab === 'modules' && (
            <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">

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
                      <div className="space-y-4">
                        {/* Topic Header & Breadcrumb */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E4E8F0]">
                          <button
                            onClick={() => setSelectedTopicId(null)}
                            className="cursor-target inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B5A75] hover:text-[#182338]"
                          >
                            <ArrowLeft className="w-4 h-4" /> Back to Module Topics
                          </button>
                          <button
                            onClick={() => handleToggleComplete(topic.id)}
                            className={`cursor-target px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isDone
                                ? 'bg-[#E4F3ED] text-[#2E8768] border border-[#2E8768]/30'
                                : 'bg-[#16203A] text-white hover:bg-[#101A2E]'
                            }`}
                          >
                            {isDone ? <><CheckCircle2 className="w-3.5 h-3.5" /> Topic Completed</> : <><Circle className="w-3.5 h-3.5" /> Mark Complete</>}
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
                          <h2 className="text-xl sm:text-2xl font-['Space_Grotesk'] font-bold text-[#182338]">
                            {topic.title}
                          </h2>
                          <div className="mt-2.5">
                            <SourceChip source={topic.source} verify={topic.verify} />
                          </div>
                        </div>

                        {topic.verify && <VerifyWarningBanner />}

                        {/* Layer 1: Why This Gets Asked (Signature dark card) */}
                        {topic.why && (
                          <div className="bg-[#101A2E] text-white rounded-2xl p-5 border border-[#26324F] shadow-sm">
                            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#C6863A] font-bold mb-2">
                              <Sparkles className="w-3.5 h-3.5" /> Why this gets asked in interviews
                            </div>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                              {topic.why}
                            </p>
                          </div>
                        )}

                        {/* Layer 2: The Core Statutory Explanation */}
                        {topic.explanation && (
                          <div className="bg-white border border-[#E4E8F0] rounded-2xl p-5 shadow-xs space-y-2">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-[#4B5A75] font-bold">
                              Statutory Core &amp; Regulatory Meaning
                            </div>
                            <p className="text-sm text-[#182338] leading-relaxed">
                              {topic.explanation}
                            </p>
                          </div>
                        )}

                        {/* Layer 3: Practical Point */}
                        {topic.practicalPoint && (
                          <div className="bg-[#FBFCFE] border border-[#E4E8F0] rounded-2xl p-5 shadow-xs space-y-2">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-[#3F7A8C] font-bold flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" /> Practical Point / In Practice
                            </div>
                            <p className="text-sm text-[#4B5A75] leading-relaxed">
                              {topic.practicalPoint}
                            </p>
                          </div>
                        )}

                        {/* Layer 4: Example / Case */}
                        {topic.example && (
                          <div className="bg-[#F4F6FA] border border-[#E4E8F0] rounded-2xl p-5 shadow-xs space-y-2">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-[#4B5A75] font-bold">
                              Practitioner Scenario / Example
                            </div>
                            <p className="text-xs sm:text-sm text-[#182338] leading-relaxed italic">
                              "{topic.example}"
                            </p>
                          </div>
                        )}

                        {/* Layer 5: Takeaways */}
                        {topic.takeaway && topic.takeaway.length > 0 && (
                          <div className="bg-[#F6ECDD] border border-[#EAD6BB] rounded-2xl p-5">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-[#B0722B] font-bold mb-3 flex items-center gap-2">
                              <Check className="w-3.5 h-3.5" /> Key Takeaways to Quote
                            </div>
                            <ul className="space-y-2">
                              {topic.takeaway.map((tk, idx) => (
                                <li key={idx} className="text-xs sm:text-sm text-[#5A431F] flex items-start gap-2 leading-relaxed">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6863A] mt-2 flex-shrink-0" />
                                  <span>{tk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* QuickCheck MCQs for this topic */}
                        {quickCheckList.length > 0 && (
                          <div className="bg-white border border-[#E4E8F0] rounded-2xl p-5 shadow-xs space-y-4 pt-6">
                            <div className="flex items-center justify-between pb-3 border-b border-[#E4E8F0]">
                              <div>
                                <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#182338]">
                                  QuickCheck Diagnostic
                                </h3>
                                <p className="text-xs text-[#4B5A75]">5-question check for this topic</p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-[#EEF2F9] text-[#182338] text-[10px] font-mono font-bold">
                                {quickCheckList.length} Questions
                              </span>
                            </div>

                            <div className="space-y-5">
                              {quickCheckList.map((qc, qIdx) => {
                                const chosen = qcState.answers[qIdx];
                                const isCorrect = chosen === qc.answer;

                                return (
                                  <div key={qIdx} className="p-4 rounded-xl bg-[#FBFCFE] border border-[#E4E8F0] space-y-3">
                                    <div className="text-xs font-mono text-[#8A97AD]">Q{qIdx + 1}</div>
                                    <div className="text-sm font-semibold text-[#182338] leading-snug">{qc.q}</div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {qc.options.map((opt, optIdx) => {
                                        let optStyle = 'bg-white border-[#E4E8F0] text-[#182338] hover:border-[#C6863A]';
                                        if (qcState.submitted) {
                                          if (optIdx === qc.answer) optStyle = 'bg-[#E4F3ED] border-[#2E8768] text-[#2E8768] font-bold';
                                          else if (optIdx === chosen && !isCorrect) optStyle = 'bg-red-50 border-red-300 text-red-800';
                                          else optStyle = 'bg-white border-[#E4E8F0] opacity-50';
                                        } else if (chosen === optIdx) {
                                          optStyle = 'bg-[#16203A] border-[#16203A] text-white font-bold';
                                        }

                                        return (
                                          <button
                                            key={optIdx}
                                            disabled={qcState.submitted}
                                            onClick={() => handleQcOption(qIdx, optIdx)}
                                            className={`cursor-target p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${optStyle}`}
                                          >
                                            <span className="w-5 h-5 rounded-md bg-black/5 flex items-center justify-center font-mono text-[10px] flex-shrink-0">
                                              {['A', 'B', 'C', 'D'][optIdx]}
                                            </span>
                                            <span className="leading-snug">{opt}</span>
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {qcState.submitted && (
                                      <div className={`p-3 rounded-lg text-xs leading-relaxed ${isCorrect ? 'bg-[#E4F3ED] text-[#2E8768]' : 'bg-red-50 text-red-800'}`}>
                                        <strong className="block mb-0.5">{isCorrect ? '✓ Correct' : '✕ Explanation:'}</strong>
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
                                className={`cursor-target w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                                  Object.keys(qcState.answers).length === quickCheckList.length
                                    ? 'bg-[#16203A] text-white hover:bg-[#101A2E]'
                                    : 'bg-[#E4E8F0] text-[#8A97AD] cursor-not-allowed'
                                }`}
                              >
                                Submit QuickCheck Answers
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
                        <h2 className="text-xl font-['Space_Grotesk'] font-bold text-[#182338]">
                          Modules &amp; Knowledge Objects
                        </h2>
                        <p className="text-xs text-[#4B5A75]">7 comprehensive IFSCA Fund Management modules</p>
                      </div>
                    </div>

                    {fmeContent.modules.map((m, idx) => {
                      const topicIds = fmeContent.moduleTopics[m.id] || [];
                      const isExpanded = selectedModuleId === m.id;
                      const doneTopics = topicIds.filter(tId => completedSet.has(tId)).length;
                      const isUnlocked = hasAccess ? hasAccess('job_ready', idx) : idx < 2;

                      return (
                        <div key={m.id} className={`bg-white border ${isUnlocked ? 'border-[#E4E8F0]' : 'border-amber-200 bg-amber-50/20'} rounded-2xl overflow-hidden shadow-xs relative`}>
                          <button
                            onClick={() => {
                              if (!isUnlocked) {
                                setShowUpgradeModal(true);
                              } else {
                                setSelectedModuleId(isExpanded ? null : m.id);
                              }
                            }}
                            className="cursor-target w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 hover:bg-[#FBFCFE] transition-colors"
                          >
                            <div className="flex items-start gap-3.5 min-w-0">
                              <span className="font-['Space_Grotesk'] text-xl font-bold text-[#C6863A] w-7 flex-shrink-0 pt-0.5">
                                {m.no}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-sm sm:text-base text-[#182338] leading-snug">
                                    {m.title}
                                  </h3>
                                  {!isUnlocked && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                                      <Lock className="w-3 h-3 text-amber-600" /> Locked
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#4B5A75] mt-1 leading-relaxed line-clamp-2">
                                  {m.summary}
                                </p>
                                <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-[#8A97AD]">
                                  <span>{topicIds.length} Topics</span>
                                  <span>•</span>
                                  <span className={doneTopics > 0 ? 'text-[#2E8768] font-bold' : ''}>
                                    {doneTopics}/{topicIds.length} Done
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="pt-1 flex-shrink-0">
                              {!isUnlocked ? (
                                <Lock className="w-5 h-5 text-amber-600" />
                              ) : isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-[#8A97AD]" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-[#8A97AD]" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-[#E4E8F0] bg-[#F4F6FA] p-3 space-y-2">
                              {topicIds.map(tId => {
                                const topic = fmeContent.topics[tId];
                                if (!topic) return null;
                                const isDone = completedSet.has(tId);

                                return (
                                  <button
                                    key={tId}
                                    onClick={() => setSelectedTopicId(tId)}
                                    className="cursor-target w-full p-3.5 rounded-xl bg-white border border-[#E4E8F0] hover:border-[#C6863A] text-left flex items-center justify-between gap-3 transition-all hover-lift"
                                  >
                                    <div className="min-w-0">
                                      <div className="font-semibold text-xs sm:text-sm text-[#182338] truncate">
                                        {topic.title}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <PriorityPill priority={topic.priority} />
                                        <RolePill roleTag={currentRole.tag} weight={topic.roleWeight?.[selectedRole]} />
                                        {topic.verify && (
                                          <span className="text-[10px] font-mono text-[#9A6A16] bg-[#FBF2DC] px-1.5 py-0.5 rounded font-semibold">
                                            Verify
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {isDone && <CheckCircle2 className="w-4 h-4 text-[#2E8768]" />}
                                      <ChevronRight className="w-4 h-4 text-[#8A97AD]" />
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
                // ─── Non-FME Track (CMI / AIF in JobReady layout) ───
                <div className="space-y-4">
                  {cmiLoading ? (
                    <div className="py-20 text-center space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-[#C6863A] mx-auto" />
                      <p className="text-xs text-[#4B5A75]">Loading course curriculum…</p>
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

                      // Current index in filtered list
                      const filteredList = cmiItems.filter(i => {
                        const matchType = cmiTypeFilter === 'all' ||
                          (cmiTypeFilter === 'lesson' && (i.itemType === 'lesson' || i.type === 'lesson')) ||
                          (cmiTypeFilter === 'mcq' && (i.type === 'mcq' || i.type === 'spot_lapse' || i.type === 'old_vs_new')) ||
                          (cmiTypeFilter === 'truefalse' && i.type === 'truefalse') ||
                          (cmiTypeFilter === 'fill' && i.type === 'fill');
                        const matchCh = cmiChapterFilter === 'all' || (i.module_no || i.chapterNo) === Number(cmiChapterFilter);
                        return matchType && matchCh;
                      });
                      const currIdx = filteredList.findIndex(i => i.uid === item.uid);

                      return (
                        <div className="space-y-4">
                          {/* Active Item Card */}
                          <div className="bg-white border border-[#E4E8F0] rounded-2xl p-5 sm:p-7 shadow-sm space-y-5">
                            {/* Header / Meta */}
                            <div className="flex items-center justify-between pb-3 border-b border-[#E4E8F0] flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-[#EEF2F9] text-[#182338]">
                                  Chapter {item.module_no || item.chapterNo || 1}
                                </span>
                                <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded-md bg-[#F6ECDD] text-[#B0722B]">
                                  {isLesson ? 'Lesson' : item.type ? item.type.toUpperCase() : 'Question'}
                                </span>
                                {item.provision && (
                                  <span className="text-[10px] font-mono text-[#8A97AD] hidden sm:inline">
                                    § {item.provision}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleToggleComplete(item.uid)}
                                className={`cursor-target px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                  isDone
                                    ? 'bg-[#E4F3ED] text-[#2E8768] border border-[#2E8768]/30'
                                    : 'bg-[#16203A] text-white hover:bg-[#101A2E]'
                                }`}
                              >
                                {isDone ? <><CheckCircle2 className="w-3.5 h-3.5" /> Done</> : <><Circle className="w-3.5 h-3.5" /> Mark Done</>}
                              </button>
                            </div>

                            {/* Title / Question text */}
                            <h2 className="text-lg sm:text-xl font-['Space_Grotesk'] font-bold text-[#182338] leading-snug">
                              {item.title || item.question}
                            </h2>

                            {/* ─── LESSON CONTENT ─── */}
                            {isLesson && (
                              <div className="space-y-4">
                                {item.hook && (
                                  <div className="p-4 bg-[#101A2E] text-white rounded-xl text-xs sm:text-sm italic leading-relaxed">
                                    "{item.hook}"
                                  </div>
                                )}

                                {item.cards && item.cards.length > 0 && (
                                  <div className="space-y-3">
                                    {item.cards.map((card, cIdx) => (
                                      <div key={cIdx} className="p-4 rounded-xl bg-[#FBFCFE] border border-[#E4E8F0] space-y-2.5">
                                        {card.tag && (
                                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EEF2F9] text-[#182338] uppercase">
                                            {card.tag}
                                          </span>
                                        )}
                                        {card.title && <h3 className="font-bold text-sm text-[#182338]">{card.title}</h3>}
                                        {card.law && (
                                          <div className="p-3 bg-[#EEF2F9] rounded-lg text-xs font-mono text-[#182338] leading-relaxed">
                                            <strong className="block text-[10px] uppercase text-[#4B5A75] mb-1">Statutory Law:</strong>
                                            {card.law}
                                          </div>
                                        )}
                                        {card.means && (
                                          <p className="text-xs sm:text-sm text-[#4B5A75] leading-relaxed">
                                            <strong className="text-[#182338]">Meaning: </strong>{card.means}
                                          </p>
                                        )}
                                        {card.watch && (
                                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                                            <ShieldAlert className="w-4 h-4 text-[#C6863A] flex-shrink-0 mt-0.5" />
                                            <div>
                                              <strong className="block text-[10px] uppercase font-bold text-amber-800">Practitioner Caution:</strong>
                                              {card.watch}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {item.summary && (
                                  <div className="p-4 bg-[#F4F6FA] border border-[#E4E8F0] rounded-xl text-xs sm:text-sm text-[#182338] leading-relaxed">
                                    <strong className="block text-[10px] font-mono uppercase text-[#8A97AD] mb-1">Summary:</strong>
                                    {item.summary}
                                  </div>
                                )}

                                {item.tip && (
                                  <div className="p-4 bg-[#F6ECDD] border border-[#EAD6BB] rounded-xl text-xs text-[#5A431F] leading-relaxed flex items-start gap-2.5">
                                    <Sparkles className="w-4 h-4 text-[#C6863A] flex-shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="block font-mono uppercase text-[10px] text-[#B0722B] mb-0.5">Practitioner Note &amp; Tip:</strong>
                                      {item.tip}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ─── MCQ QUESTION ─── */}
                            {isMCQ && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-2.5">
                                  {mcqOptions.map(opt => {
                                    const isSelected = cmiSelectedOption === opt.key;
                                    let style = 'bg-white border-[#E4E8F0] text-[#182338] hover:border-[#C6863A]';

                                    if (subState) {
                                      const isCorrectOpt = String(opt.key).toUpperCase() === String(subState.correctKey).toUpperCase();
                                      const isChosenOpt = String(opt.key).toUpperCase() === String(subState.selected).toUpperCase();
                                      if (isCorrectOpt) {
                                        style = 'bg-[#E4F3ED] border-[#2E8768] text-[#2E8768] font-bold';
                                      } else if (isChosenOpt && !subState.isCorrect) {
                                        style = 'bg-red-50 border-red-300 text-red-800';
                                      } else {
                                        style = 'bg-white border-[#E4E8F0] opacity-50';
                                      }
                                    } else if (isSelected) {
                                      style = 'bg-[#16203A] border-[#16203A] text-white font-bold';
                                    }

                                    return (
                                      <button
                                        key={opt.key}
                                        disabled={!!subState || cmiSubmitting}
                                        onClick={() => setCmiSelectedOption(opt.key)}
                                        className={`cursor-target w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${style}`}
                                      >
                                        <span className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                                          {opt.key}
                                        </span>
                                        <span className="pt-0.5 leading-relaxed">{opt.text}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {!subState ? (
                                  <button
                                    onClick={() => handleSubmitAnswer(item)}
                                    disabled={!cmiSelectedOption || cmiSubmitting}
                                    className={`cursor-target w-full py-3.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                                      cmiSelectedOption && !cmiSubmitting
                                        ? 'bg-[#C6863A] hover:bg-[#B0722B] text-white shadow-md'
                                        : 'bg-[#E4E8F0] text-[#8A97AD] cursor-not-allowed'
                                    }`}
                                  >
                                    {cmiSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Answer'}
                                  </button>
                                ) : (
                                  <div className="space-y-3 pt-2 animate-fade-in">
                                    <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                                      subState.isCorrect ? 'bg-[#E4F3ED] text-[#2E8768]' : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}>
                                      {subState.isCorrect ? (
                                        <><CheckCircle2 className="w-5 h-5 text-[#2E8768] flex-shrink-0" /> Correct! Excellent regulatory analysis.</>
                                      ) : (
                                        <><ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" /> Incorrect. Correct answer: Option {subState.correctKey}</>
                                      )}
                                    </div>

                                    {subState.explanation && (
                                      <div className="p-4 bg-[#F4F6FA] border border-[#E4E8F0] rounded-xl text-xs text-[#182338] leading-relaxed">
                                        <strong className="block font-mono uppercase text-[10px] text-[#4B5A75] mb-1">Statutory Explanation:</strong>
                                        {subState.explanation}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ─── TRUE / FALSE QUESTION ─── */}
                            {isTF && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  {['true', 'false'].map(val => {
                                    const isSelected = cmiSelectedOption === val;
                                    let style = 'bg-white border-[#E4E8F0] text-[#182338] hover:border-[#C6863A]';

                                    if (subState) {
                                      const isCorrectOpt = String(val).toLowerCase() === String(subState.correctKey).toLowerCase();
                                      const isChosenOpt = String(val).toLowerCase() === String(subState.selected).toLowerCase();
                                      if (isCorrectOpt) {
                                        style = 'bg-[#E4F3ED] border-[#2E8768] text-[#2E8768] font-bold';
                                      } else if (isChosenOpt && !subState.isCorrect) {
                                        style = 'bg-red-50 border-red-300 text-red-800';
                                      } else {
                                        style = 'bg-white border-[#E4E8F0] opacity-50';
                                      }
                                    } else if (isSelected) {
                                      style = 'bg-[#16203A] border-[#16203A] text-white font-bold';
                                    }

                                    return (
                                      <button
                                        key={val}
                                        disabled={!!subState || cmiSubmitting}
                                        onClick={() => setCmiSelectedOption(val)}
                                        className={`cursor-target p-4 rounded-xl border text-center font-bold text-sm capitalize transition-all ${style}`}
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
                                    className={`cursor-target w-full py-3.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                                      cmiSelectedOption && !cmiSubmitting
                                        ? 'bg-[#C6863A] hover:bg-[#B0722B] text-white shadow-md'
                                        : 'bg-[#E4E8F0] text-[#8A97AD] cursor-not-allowed'
                                    }`}
                                  >
                                    {cmiSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Answer'}
                                  </button>
                                ) : (
                                  <div className="space-y-3 pt-2 animate-fade-in">
                                    <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                                      subState.isCorrect ? 'bg-[#E4F3ED] text-[#2E8768]' : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}>
                                      {subState.isCorrect ? (
                                        <><CheckCircle2 className="w-5 h-5 text-[#2E8768] flex-shrink-0" /> Correct statement analysis.</>
                                      ) : (
                                        <><ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" /> Incorrect statement analysis.</>
                                      )}
                                    </div>

                                    {subState.explanation && (
                                      <div className="p-4 bg-[#F4F6FA] border border-[#E4E8F0] rounded-xl text-xs text-[#182338] leading-relaxed">
                                        <strong className="block font-mono uppercase text-[10px] text-[#4B5A75] mb-1">Statutory Explanation:</strong>
                                        {subState.explanation}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ─── FILL IN THE BLANK QUESTION ─── */}
                            {isFill && (
                              <div className="space-y-3">
                                {!subState ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        placeholder="Type your answer here..."
                                        value={cmiFillText}
                                        onChange={(e) => setCmiFillText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitAnswer(item); }}
                                        className="flex-1 px-4 py-3 border border-[#E4E8F0] rounded-xl text-sm focus:outline-none focus:border-[#C6863A]"
                                      />
                                      <button
                                        onClick={() => handleSubmitAnswer(item)}
                                        disabled={!cmiFillText.trim() || cmiSubmitting}
                                        className={`cursor-target px-6 py-3 rounded-xl font-semibold text-xs transition-all ${
                                          cmiFillText.trim() && !cmiSubmitting
                                            ? 'bg-[#C6863A] hover:bg-[#B0722B] text-white shadow-md'
                                            : 'bg-[#E4E8F0] text-[#8A97AD] cursor-not-allowed'
                                        }`}
                                      >
                                        {cmiSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Answer'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3 pt-2 animate-fade-in">
                                    <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                                      subState.isCorrect ? 'bg-[#E4F3ED] text-[#2E8768]' : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}>
                                      {subState.isCorrect ? (
                                        <><CheckCircle2 className="w-5 h-5 text-[#2E8768] flex-shrink-0" /> Correct! Answer: {subState.correctKey}</>
                                      ) : (
                                        <><ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" /> Incorrect. Your answer: "{subState.selected}" · Correct answer: "{subState.correctKey}"</>
                                      )}
                                    </div>

                                    {subState.explanation && (
                                      <div className="p-4 bg-[#F4F6FA] border border-[#E4E8F0] rounded-xl text-xs text-[#182338] leading-relaxed">
                                        <strong className="block font-mono uppercase text-[10px] text-[#4B5A75] mb-1">Statutory Explanation:</strong>
                                        {subState.explanation}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ─── Prev / Next Navigation ─── */}
                            <div className="flex items-center justify-between pt-4 border-t border-[#E4E8F0]">
                              <button
                                disabled={currIdx <= 0}
                                onClick={() => {
                                  if (currIdx > 0) {
                                    setCmiActiveItem(filteredList[currIdx - 1]);
                                    setCmiSelectedOption(null);
                                    setCmiFillText('');
                                  }
                                }}
                                className="cursor-target px-4 py-2 rounded-xl text-xs font-semibold border border-[#E4E8F0] hover:bg-[#F4F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                ← Previous Item
                              </button>

                              <span className="text-xs font-mono text-[#8A97AD]">
                                {currIdx >= 0 ? `${currIdx + 1} / ${filteredList.length}` : ''}
                              </span>

                              <button
                                disabled={currIdx < 0 || currIdx >= filteredList.length - 1}
                                onClick={() => {
                                  if (currIdx >= 0 && currIdx < filteredList.length - 1) {
                                    setCmiActiveItem(filteredList[currIdx + 1]);
                                    setCmiSelectedOption(null);
                                    setCmiFillText('');
                                  }
                                }}
                                className="cursor-target px-4 py-2 rounded-xl text-xs font-semibold bg-[#16203A] text-white hover:bg-[#101A2E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                              >
                                Next Item →
                              </button>
                            </div>
                          </div>

                          {/* ─── Curriculum Sidebar / Selector ─── */}
                          <div className="bg-white border border-[#E4E8F0] rounded-2xl p-4 sm:p-5 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4 className="text-xs font-mono font-bold uppercase text-[#4B5A75]">
                                Course Syllabus &amp; Items ({filteredList.length})
                              </h4>
                              {/* Type Filters */}
                              <div className="flex items-center gap-1.5">
                                {['all', 'lesson', 'mcq', 'truefalse', 'fill'].map(f => (
                                  <button
                                    key={f}
                                    onClick={() => setCmiTypeFilter(f)}
                                    className={`cursor-target px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold capitalize transition-colors ${
                                      cmiTypeFilter === f ? 'bg-[#16203A] text-white' : 'bg-[#F4F6FA] text-[#4B5A75] hover:bg-[#E4E8F0]'
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
                                  className={`cursor-target w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors ${
                                    item.uid === itemObj.uid
                                      ? 'bg-[#16203A] text-white font-bold'
                                      : 'bg-[#FBFCFE] hover:bg-[#F4F6FA] text-[#182338] border border-[#E4E8F0]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <span className="text-[10px] font-mono opacity-60 flex-shrink-0">
                                      Ch{itemObj.module_no || itemObj.chapterNo || 1}
                                    </span>
                                    <span className="truncate">{itemObj.title || itemObj.question}</span>
                                  </div>
                                  {completedSet.has(itemObj.uid) && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8768] flex-shrink-0" />
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

          {/* ================================================================= */}
          {/* TAB: PRACTICE / QUESTIONS (Think → Reveal → Remember)             */}
          {/* ================================================================= */}
          {activeTab === 'practice' && (
            <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">

              {isFME ? (
                (() => {
                  const total = filteredQuestions.length;
                  const q = filteredQuestions[currentQuestionIndex] || filteredQuestions[0];
                  const isRevealed = !!revealedQuestions[q?.id];

                  if (!q) {
                    return (
                      <div className="p-8 text-center bg-white rounded-2xl border border-[#E4E8F0]">
                        <p className="text-xs text-[#4B5A75]">No questions found for this filter.</p>
                      </div>
                    );
                  }

                  const handleReveal = () => {
                    setRevealedQuestions(prev => ({ ...prev, [q.id]: true }));
                    handleToggleComplete(q.id);
                  };

                  return (
                    <div className="space-y-4">
                      {/* Filter Bar */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {['all', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'critical'].map(f => (
                          <button
                            key={f}
                            onClick={() => { setQuestionFilter(f); setCurrentQuestionIndex(0); }}
                            className={`cursor-target px-3 py-1 rounded-full text-xs font-mono font-semibold whitespace-nowrap transition-colors ${
                              questionFilter === f ? 'bg-[#16203A] text-white' : 'bg-white border border-[#E4E8F0] text-[#4B5A75]'
                            }`}
                          >
                            {f === 'all' ? 'All Questions' : f === 'critical' ? 'Critical Only' : `Module ${f.toUpperCase()}`}
                          </button>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center justify-between text-xs font-mono text-[#4B5A75]">
                        <span>{String(currentQuestionIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
                        <div className="flex-1 mx-3 h-1.5 bg-[#E4E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#C6863A] rounded-full transition-all" style={{ width: `${((currentQuestionIndex + 1) / total) * 100}%` }} />
                        </div>
                        <span className="uppercase">{q.length} answer</span>
                      </div>

                      {/* Question Card */}
                      <div className="bg-white border border-[#E4E8F0] rounded-3xl p-5 sm:p-7 shadow-lg space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <PriorityPill priority={q.priority} />
                          <RolePill roleTag="CO" weight={q.roleWeight?.co} />
                          <RolePill roleTag="PO" weight={q.roleWeight?.po} />
                          <RolePill roleTag="L&C" weight={q.roleWeight?.lc} />
                        </div>

                        <h2 className="text-xl sm:text-2xl font-['Space_Grotesk'] font-bold text-[#182338] leading-snug">
                          {q.q}
                        </h2>

                        {!isRevealed ? (
                          // Think prompt before reveal
                          <div className="space-y-4 pt-2">
                            <div className="p-4 bg-[#F6ECDD] border border-dashed border-[#EAD6BB] rounded-2xl text-center">
                              <div className="text-[10px] font-mono uppercase tracking-widest text-[#B0722B] font-bold">
                                Think It Through First
                              </div>
                              <p className="text-xs text-[#7A5B2A] mt-1">
                                How would you structure this answer in 30 seconds before reading the model response?
                              </p>
                            </div>

                            <button
                              onClick={handleReveal}
                              className="cursor-target w-full py-4 bg-[#C6863A] hover:bg-[#B0722B] text-white font-semibold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" /> Reveal How to Answer
                            </button>
                          </div>
                        ) : (
                          // Revealed Model Answer & Deep Structure
                          <div className="space-y-5 pt-2 animate-fade-in">
                            {/* Model Answer */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between pb-1 border-b border-[#E4E8F0]">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#4B5A75] font-bold">
                                  Model Interview Response
                                </span>
                                <span className="text-[10px] font-mono text-[#B0722B] bg-[#F6ECDD] px-2 py-0.5 rounded uppercase">
                                  {q.length}
                                </span>
                              </div>
                              <p className="text-sm sm:text-base text-[#182338] leading-relaxed font-sans">
                                {q.answer}
                              </p>
                            </div>

                            {/* Remember Flow Structure */}
                            {q.remember && q.remember.length > 0 && (
                              <div className="bg-[#101A2E] text-white rounded-2xl p-5 space-y-3">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-[#C6863A] font-bold flex items-center gap-1.5">
                                  <Brain className="w-3.5 h-3.5" /> Remember The Structure (Mental Flow)
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {q.remember.map((node, nIdx) => (
                                    <React.Fragment key={nIdx}>
                                      {nIdx > 0 && <span className="text-[#C6863A] text-xs">→</span>}
                                      <span className="px-3 py-1.5 bg-white/10 border border-white/15 rounded-lg text-xs font-mono font-semibold text-slate-200">
                                        {node.replace(/^→\s*/, '')}
                                      </span>
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Interview Trap */}
                            {q.trap && (
                              <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl text-xs text-red-900 leading-relaxed">
                                <strong className="block font-mono uppercase text-[10px] text-red-700 mb-1">
                                  ⚠ Interview Trap to Avoid:
                                </strong>
                                {q.trap}
                              </div>
                            )}

                            {/* Delivery Tip */}
                            {q.tip && (
                              <div className="p-4 bg-[#F6ECDD] border border-[#EAD6BB] rounded-2xl text-xs text-[#5A431F] leading-relaxed">
                                <strong className="block font-mono uppercase text-[10px] text-[#B0722B] mb-1">
                                  💡 Delivery &amp; Practitioner Tip:
                                </strong>
                                {q.tip}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Prev / Next Navigation */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#E4E8F0]">
                          <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="cursor-target px-4 py-2 rounded-xl text-xs font-semibold border border-[#E4E8F0] hover:bg-[#F4F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          <button
                            disabled={currentQuestionIndex === total - 1}
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="cursor-target px-4 py-2 rounded-xl text-xs font-semibold bg-[#16203A] text-white hover:bg-[#101A2E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                          >
                            Next Question <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-6 bg-white border border-[#E4E8F0] rounded-2xl text-center space-y-3">
                  <p className="text-sm font-semibold text-[#182338]">CMI / AIF Practice Questions are available in the Syllabus tab.</p>
                  <button onClick={() => setActiveTab('modules')} className="px-4 py-2 bg-[#16203A] text-white rounded-xl text-xs font-bold">
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
            <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">

              {/* Sub-tab toggle */}
              <div className="flex items-center gap-2 p-1 bg-white border border-[#E4E8F0] rounded-2xl w-fit">
                <button
                  onClick={() => { setScenarioSubTab('scenarios'); setOpenScenarioId(null); }}
                  className={`cursor-target px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    scenarioSubTab === 'scenarios' ? 'bg-[#16203A] text-white' : 'text-[#4B5A75] hover:text-[#182338]'
                  }`}
                >
                  Judgement Scenarios ({fmeContent.scenarios?.length || 0})
                </button>
                <button
                  onClick={() => { setScenarioSubTab('simulations'); setOpenScenarioId(null); }}
                  className={`cursor-target px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    scenarioSubTab === 'simulations' ? 'bg-[#16203A] text-white' : 'text-[#4B5A75] hover:text-[#182338]'
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
                    <div className="space-y-4">
                      <button
                        onClick={() => setOpenScenarioId(null)}
                        className="cursor-target inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B5A75] hover:text-[#182338]"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to All {isSim ? 'Simulations' : 'Scenarios'}
                      </button>

                      <div className="bg-white border border-[#E4E8F0] rounded-3xl overflow-hidden shadow-lg">
                        {/* Setup Dark Header */}
                        <div className="bg-gradient-to-br from-[#1B2A49] to-[#16203A] text-white p-6 space-y-3">
                          <span className="text-[10px] font-mono text-[#C6863A] uppercase tracking-widest font-bold">
                            {isSim ? `Job Simulation · ${item.role?.toUpperCase()} Role` : 'Judgement Scenario'}
                          </span>
                          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
                            {item.setup}
                          </p>
                          <div className="pt-3 border-t border-white/10 font-['Space_Grotesk'] font-bold text-base sm:text-lg text-white">
                            {item.prompt}
                          </div>
                        </div>

                        {item.verify && (
                          <div className="p-4">
                            <VerifyWarningBanner note={item.verifyNote} />
                          </div>
                        )}

                        <div className="p-6 space-y-5">
                          {!isRevealed ? (
                            <div className="space-y-4">
                              <div className="p-4 bg-[#F6ECDD] border border-dashed border-[#EAD6BB] rounded-2xl text-center">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-[#B0722B] font-bold">
                                  What would you do first?
                                </div>
                                <p className="text-xs text-[#7A5B2A] mt-1">
                                  Formulate your statutory steps and escalation ladder before revealing.
                                </p>
                              </div>
                              <button
                                onClick={handleReveal}
                                className="cursor-target w-full py-4 bg-[#C6863A] hover:bg-[#B0722B] text-white font-semibold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                              >
                                <Eye className="w-4 h-4" /> Reveal Framework &amp; Control
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-5 animate-fade-in">
                              {/* Scenario Steps */}
                              {item.steps && (
                                <div className="space-y-3">
                                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#4B5A75] font-bold">
                                    Step-by-Step Approach Framework
                                  </div>
                                  <div className="space-y-2.5">
                                    {item.steps.map((st, sIdx) => (
                                      <div key={sIdx} className="flex items-start gap-3 p-3 bg-[#FBFCFE] border border-[#E4E8F0] rounded-xl text-xs sm:text-sm text-[#182338] leading-relaxed">
                                        <span className="w-6 h-6 rounded-lg bg-[#F6ECDD] text-[#B0722B] font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center flex-shrink-0">
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
                                  <div className="p-4 bg-[#FBFCFE] border border-[#E4E8F0] rounded-xl">
                                    <div className="text-[10px] font-mono uppercase text-[#8A97AD] font-bold mb-1">Applicable Obligation</div>
                                    <div className="text-xs sm:text-sm text-[#182338] font-medium leading-snug">{item.obligation}</div>
                                  </div>
                                  <div className="p-4 bg-[#FBFCFE] border border-[#E4E8F0] rounded-xl">
                                    <div className="text-[10px] font-mono uppercase text-[#2E8768] font-bold mb-1">Practical Action</div>
                                    <div className="text-xs sm:text-sm text-[#182338] font-medium leading-snug">{item.action}</div>
                                  </div>
                                </div>
                              )}

                              {/* Common Mistake */}
                              {item.mistake && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
                                  <strong className="block font-mono uppercase text-[10px] text-red-700 mb-1">Common Interview Mistake:</strong>
                                  {item.mistake}
                                </div>
                              )}

                              {/* Compliance Control Table */}
                              {item.control && (
                                <div className="bg-[#101A2E] text-white rounded-2xl p-5 space-y-3">
                                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#C6863A] font-bold flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5" /> Structured Compliance Control
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                                    {Object.entries(item.control).map(([k, v]) => (
                                      <div key={k} className="p-2.5 bg-white/5 border border-white/10 rounded-lg">
                                        <span className="text-[10px] uppercase text-[#9DB0CE] block mb-0.5">{k}:</span>
                                        <span className="text-slate-100 font-sans text-xs">{v}</span>
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
                        className="cursor-target w-full p-4 sm:p-5 rounded-2xl bg-white border border-[#E4E8F0] hover:border-[#C6863A] text-left flex items-center justify-between gap-4 transition-all hover-lift shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2 py-0.5 bg-[#EEF2F9] text-[#182338] text-[10px] font-mono font-bold rounded uppercase">
                              {s.role?.toUpperCase() || 'PRACTICE'}
                            </span>
                            {isDone && (
                              <span className="text-[10px] font-mono text-[#2E8768] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Completed
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm sm:text-base text-[#182338] leading-snug">
                            {s.title || s.setup.slice(0, 65) + '…'}
                          </h3>
                          <p className="text-xs text-[#4B5A75] mt-1 line-clamp-2">
                            {s.setup}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#8A97AD] flex-shrink-0" />
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
            <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">

              {!recallMode ? (
                // Mode Selection
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-['Space_Grotesk'] font-bold text-[#182338]">Rapid Recall Decks</h2>
                    <p className="text-xs text-[#4B5A75]">High-speed active recall: definitions, thresholds, timelines and traps</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fmeContent.recall.modes.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setRecallMode(m.id); setFlashIndex(0); setFlashFlipped(false); }}
                        className="cursor-target p-5 rounded-2xl bg-white border border-[#E4E8F0] hover:border-[#C6863A] text-left flex items-start gap-4 transition-all hover-lift shadow-xs"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#101A2E] text-white flex flex-col items-center justify-center flex-shrink-0">
                          <span className="font-['Space_Grotesk'] font-bold text-lg leading-none">{m.mins}</span>
                          <span className="font-mono text-[8px] text-[#9DB0CE] uppercase">min</span>
                        </div>
                        <div>
                          <div className="font-['Space_Grotesk'] font-bold text-base text-[#182338]">{m.label}</div>
                          <p className="text-xs text-[#4B5A75] mt-1 leading-relaxed">{m.desc}</p>
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
                      <div className="p-8 text-center bg-white rounded-3xl border border-[#E4E8F0] space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#E4F3ED] text-[#2E8768] flex items-center justify-center mx-auto">
                          <Check className="w-8 h-8" />
                        </div>
                        <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#182338]">Deck Completed!</h3>
                        <p className="text-xs text-[#4B5A75]">You reviewed all cards in this mode.</p>
                        <button
                          onClick={() => setRecallMode(null)}
                          className="px-5 py-2.5 bg-[#16203A] text-white rounded-xl font-semibold text-xs"
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
                          className="cursor-target text-xs font-semibold text-[#4B5A75] hover:text-[#182338] flex items-center gap-1"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back to Recall Modes
                        </button>
                        <span className="font-mono text-xs text-[#8A97AD]">
                          {flashIndex + 1} / {cards.length}
                        </span>
                      </div>

                      {/* 3D Flashcard */}
                      <div
                        onClick={() => setFlashFlipped(!flashFlipped)}
                        className="cursor-pointer bg-gradient-to-br from-[#101A2E] via-[#16203A] to-[#1B2A49] text-white rounded-3xl p-6 sm:p-10 min-h-[300px] flex flex-col justify-between border border-[#26324F] shadow-xl hover-lift relative select-none"
                      >
                        <div className="flex justify-between items-center text-xs text-[#9DB0CE] font-mono">
                          <span className="text-[10px] text-[#C6863A] uppercase font-bold tracking-widest">{card.cat}</span>
                          <span>Tap to flip</span>
                        </div>

                        <div className="py-6 text-center my-auto">
                          {!flashFlipped ? (
                            <h3 className="text-xl sm:text-3xl font-['Space_Grotesk'] font-bold text-white leading-tight">
                              {card.front}
                            </h3>
                          ) : (
                            <p className="text-sm sm:text-lg text-slate-100 font-sans leading-relaxed text-left animate-fade-in whitespace-pre-line">
                              {card.back}
                            </p>
                          )}
                        </div>

                        <div className="text-center font-mono text-[11px] text-[#9DB0CE]">
                          {flashFlipped ? '✓ Flipped (Tap to flip back)' : 'Tap anywhere to reveal back'}
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex items-center justify-between gap-3">
                        <button
                          disabled={flashIndex === 0}
                          onClick={() => { setFlashIndex(prev => prev - 1); setFlashFlipped(false); }}
                          className="cursor-target px-4 py-2.5 rounded-xl border border-[#E4E8F0] bg-white text-xs font-semibold disabled:opacity-40"
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
                          className="cursor-target flex-1 py-2.5 bg-[#C6863A] hover:bg-[#B0722B] text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                        >
                          {flashIndex < cards.length - 1 ? 'Next Card' : 'Finish Deck'} <ArrowRight className="w-3.5 h-3.5" />
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
            <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">

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
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between text-xs font-mono text-[#4B5A75]">
                        <span className="font-bold text-[#182338]">Question {assessIndex + 1} of {total}</span>
                        <div className="flex-1 mx-3 h-1.5 bg-[#E4E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#C6863A] rounded-full transition-all" style={{ width: `${((assessIndex + 1) / total) * 100}%` }} />
                        </div>
                        <span>{fmeContent.areas[q?.area] || 'General'}</span>
                      </div>

                      {/* Question Card */}
                      <div className="bg-white border border-[#E4E8F0] rounded-3xl p-6 sm:p-8 shadow-lg space-y-5">
                        <div className="font-['Space_Grotesk'] font-bold text-lg sm:text-xl text-[#182338] leading-snug">
                          {q?.q}
                        </div>

                        <div className="space-y-2.5">
                          {q?.options.map((opt, optIdx) => {
                            let style = 'bg-white border-[#E4E8F0] text-[#182338] hover:border-[#C6863A]';
                            if (isAnswered) {
                              if (optIdx === q.answer) style = 'bg-[#E4F3ED] border-[#2E8768] text-[#2E8768] font-bold';
                              else if (optIdx === chosen && chosen !== q.answer) style = 'bg-red-50 border-red-300 text-red-800';
                              else style = 'bg-white border-[#E4E8F0] opacity-50';
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isAnswered}
                                onClick={() => handleSelectOpt(optIdx)}
                                className={`cursor-target w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center gap-3 ${style}`}
                              >
                                <span className="w-6 h-6 rounded-lg bg-black/5 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {['A', 'B', 'C', 'D'][optIdx]}
                                </span>
                                <span className="leading-relaxed">{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className="p-4 bg-[#F4F6FA] border border-[#E4E8F0] rounded-xl text-xs leading-relaxed space-y-1">
                            <strong className="block text-[#182338] font-bold">
                              {chosen === q.answer ? '✓ Correct!' : '✕ Incorrect statutory analysis:'}
                            </strong>
                            <p className="text-[#4B5A75]">{q.explain}</p>
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
                            className="cursor-target w-full py-3.5 bg-[#16203A] hover:bg-[#101A2E] text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
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
                    <div className="bg-white border border-[#E4E8F0] rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#F6ECDD] text-[#B0722B] flex items-center justify-center mx-auto">
                        <Award className="w-8 h-8" />
                      </div>

                      <div>
                        <h2 className="font-['Space_Grotesk'] font-bold text-2xl sm:text-3xl text-[#182338]">
                          Assessment Performance
                        </h2>
                        <div className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-bold text-[#16203A] mt-2">
                          {correctCount} <span className="text-lg text-[#8A97AD]">/ {total}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#C6863A] mt-1">{pct}% Score Overall</p>
                      </div>

                      {/* Area Breakdown Bars */}
                      <div className="text-left space-y-3 pt-4 border-t border-[#E4E8F0]">
                        <h4 className="text-xs font-mono font-bold uppercase text-[#4B5A75]">Area-wise Breakdown</h4>
                        {Object.entries(byArea).map(([area, stat]) => {
                          const areaPct = Math.round((stat.c / stat.t) * 100);
                          return (
                            <div key={area} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-[#182338]">{area}</span>
                                <span className="font-mono text-[#8A97AD]">{stat.c}/{stat.t} ({areaPct}%)</span>
                              </div>
                              <div className="w-full h-2 bg-[#E4E8F0] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${areaPct >= 70 ? 'bg-[#2E8768]' : areaPct >= 40 ? 'bg-[#C6863A]' : 'bg-red-500'}`}
                                  style={{ width: `${areaPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => { setAssessIndex(0); setAssessAnswers({}); setAssessCompleted(false); }}
                          className="cursor-target flex-1 py-3 bg-[#F4F6FA] hover:bg-[#E4E8F0] text-[#182338] font-semibold text-xs rounded-xl transition-colors"
                        >
                          Retake Assessment
                        </button>
                        <button
                          onClick={() => setActiveTab('home')}
                          className="cursor-target flex-1 py-3 bg-[#16203A] text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
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

        </main>

        {/* ─── Bottom Navigation Bar ─── */}
        <nav className="absolute bottom-0 left-0 right-0 bg-[#16203A] border-t border-[#26324F] h-16 flex items-center justify-around px-2 z-30">
          <button
            onClick={() => setActiveTab('home')}
            className={`cursor-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
              activeTab === 'home' ? 'text-white' : 'text-[#9DB0CE] hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'home' ? 'bg-[#C6863A]/20 text-[#C6863A]' : ''}`}>
              <Brain className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`cursor-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
              activeTab === 'modules' ? 'text-white' : 'text-[#9DB0CE] hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'modules' ? 'bg-[#C6863A]/20 text-[#C6863A]' : ''}`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-medium">Modules</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`cursor-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
              activeTab === 'practice' ? 'text-white' : 'text-[#9DB0CE] hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'practice' ? 'bg-[#C6863A]/20 text-[#C6863A]' : ''}`}>
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-medium">Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`cursor-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
              activeTab === 'scenarios' ? 'text-white' : 'text-[#9DB0CE] hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'scenarios' ? 'bg-[#C6863A]/20 text-[#C6863A]' : ''}`}>
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-medium">Scenarios</span>
          </button>

          <button
            onClick={() => setActiveTab('recall')}
            className={`cursor-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
              activeTab === 'recall' ? 'text-white' : 'text-[#9DB0CE] hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'recall' ? 'bg-[#C6863A]/20 text-[#C6863A]' : ''}`}>
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-medium">Recall</span>
          </button>
        </nav>

        {/* ─── Role Selection Modal ─── */}
        {showRoleModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E4E8F0] space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#182338]">Select Target Role</h3>
                  <p className="text-xs text-[#4B5A75]">Prioritize questions &amp; compliance controls</p>
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-1 text-[#8A97AD] hover:text-[#182338]"
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
                      className={`cursor-target w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                        isSel
                          ? 'bg-[#F6ECDD] border-[#C6863A] text-[#182338]'
                          : 'bg-white border-[#E4E8F0] hover:border-[#C6863A] text-[#182338]'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                        isSel ? 'bg-[#C6863A] text-white' : 'bg-[#EEF2F9] text-[#182338]'
                      }`}>
                        {r.tag}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm leading-snug">{r.name}</div>
                        <div className="text-xs text-[#4B5A75] mt-0.5 leading-relaxed">{r.line}</div>
                      </div>
                      {isSel && <Check className="w-5 h-5 text-[#C6863A] ml-auto flex-shrink-0" />}
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
          title="Unlock All Job &amp; Fund Management Modules"
          message="You have accessed the 2 free preview modules. Upgrade your membership pass to unlock all 7 Fund Management &amp; CMI modules."
        />

      </div>
    </div>
  );
}
