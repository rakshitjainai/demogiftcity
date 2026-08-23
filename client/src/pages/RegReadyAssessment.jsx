import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, HelpCircle,
  FileCheck, ArrowRight, RotateCcw, Filter, Search, ChevronDown,
  ChevronUp, Scale, Info, BookOpen, Layers, Award, Sparkles, SlidersHorizontal
} from 'lucide-react';
import Seo from '../components/Seo';
import Breadcrumb from '../components/Breadcrumb';
import dataset from '../data/tools/regmate_regready_dataset.json';

const STATUS_BADGES = {
  green: {
    code: 'green',
    emoji: '🟢',
    label: 'Likely Compliant',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeBg: 'bg-emerald-600 text-white',
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  amber: {
    code: 'amber',
    emoji: '🟡',
    label: 'Evidence Gap',
    bg: 'bg-amber-50 text-amber-900 border-amber-200',
    badgeBg: 'bg-amber-500 text-white',
    pill: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  red: {
    code: 'red',
    emoji: '🔴',
    label: 'Potential Exception',
    bg: 'bg-rose-50 text-rose-900 border-rose-200',
    badgeBg: 'bg-rose-600 text-white',
    pill: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  na: {
    code: 'na',
    emoji: '⚪',
    label: 'Not Applicable',
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    badgeBg: 'bg-slate-400 text-white',
    pill: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  un: {
    code: 'un',
    emoji: '⬜',
    label: 'Not Assessed',
    bg: 'bg-gray-50 text-gray-600 border-gray-200',
    badgeBg: 'bg-gray-300 text-gray-700',
    pill: 'bg-gray-100 text-gray-600 border-gray-200'
  }
};

const RISK_WEIGHTS = { High: 3, Medium: 2, Low: 1 };

const CMI_CATEGORIES = [
  'All Controls',
  'Part A (Universal Only)',
  'Investment Banker',
  'Broker Dealer',
  'Clearing Member',
  'Custodian',
  'Debenture Trustee',
  'Depository Participant',
  'Distributor',
  'ESG Ratings and Data Products Provider',
  'Investment Adviser',
  'Research Entity',
  'Credit Rating Agency'
];

/**
 * Deterministic computeVerdict function based on engine.compute_algorithm
 */
export function computeVerdict(control, ans, fyUnderReview = '2025-26') {
  if (!ans || !ans.primary) {
    return {
      code: 'un',
      label: 'Not Assessed',
      justification: `Not yet assessed. Basis: ${control.clause_ref}.`
    };
  }

  // Primary == 'no' branch
  if (ans.primary === 'no') {
    if (control.nature === 'mandatory') {
      return {
        code: 'red',
        label: 'Potential Exception',
        justification: `${control.regulatory_basis} Your response indicates the requirement may not be met. Prioritise remediation and flag it to your Compliance Auditor. Basis: ${control.clause_ref}.`
      };
    } else {
      const cond = control.condition || 'the specified regulatory condition';
      return {
        code: 'na',
        label: 'Not Applicable',
        justification: `This obligation is triggered only where ${cond}. You have indicated it did not arise, so it is not triggered. Basis: ${control.clause_ref}.`
      };
    }
  }

  // Primary == 'yes' branch
  let amberFloor = false;

  // 3a. PA-28 rotation override
  if (control.control_id === 'PA-28' && ans.rotFY) {
    const currentYr = parseInt(String(fyUnderReview).slice(0, 4) || '2026', 10);
    const startYr = parseInt(String(ans.rotFY).slice(0, 4) || '2026', 10);
    const years = currentYr - startYr + 1;
    if (years > 3) {
      return {
        code: 'red',
        label: 'Potential Exception',
        justification: `${control.regulatory_basis} Compliance Auditor tenure (${years} years) exceeds the 3 consecutive-year statutory cap under ACAR Circular. Basis: ${control.clause_ref}.`
      };
    }
    if (years === 3) {
      amberFloor = true;
    }
  }

  // 3b. Critical sufficiency checks
  const critIndices = control.critical_suff || [];
  for (const idx of critIndices) {
    if (ans.suff?.[idx] === 'n') {
      return {
        code: 'red',
        label: 'Potential Exception',
        justification: `${control.regulatory_basis} Critical sufficiency check failed (answered No). Basis: ${control.clause_ref}.`
      };
    }
  }

  // 3c. Any sufficiency == 'n'
  const suffValues = Object.values(ans.suff || {});
  if (suffValues.some(v => v === 'n')) {
    return {
      code: 'amber',
      label: 'Evidence Gap',
      justification: `${control.regulatory_basis} You have indicated it is addressed, but supporting sufficiency checks have gaps - close this before your audit. Basis: ${control.clause_ref}.`
    };
  }

  // 3d. Evidence check
  const hasEvidence = (ans.ev || []).length > 0;
  if ((control.evidence_options || []).length > 0 && !hasEvidence) {
    return {
      code: 'amber',
      label: 'Evidence Gap',
      justification: `${control.regulatory_basis} You have indicated it is addressed, but supporting evidence is not yet selected/attached. Basis: ${control.clause_ref}.`
    };
  }

  // 3e. Incomplete sufficiency set
  const totalSuff = (control.sufficiency_questions || []).length;
  const answeredSuffCount = Object.keys(ans.suff || {}).filter(k => ans.suff[k] === 'y' || ans.suff[k] === 'n').length;
  if (totalSuff > 0 && answeredSuffCount < totalSuff) {
    return {
      code: 'amber',
      label: 'Evidence Gap',
      justification: `${control.regulatory_basis} Sufficiency verification checks are incomplete (${answeredSuffCount}/${totalSuff} answered). Basis: ${control.clause_ref}.`
    };
  }

  // 3f. Final green / amber_floor
  if (amberFloor) {
    return {
      code: 'amber',
      label: 'Evidence Gap',
      justification: `${control.regulatory_basis} Auditor is in their 3rd consecutive year (cooling-off required next cycle). Basis: ${control.clause_ref}.`
    };
  }

  return {
    code: 'green',
    label: 'Likely Compliant',
    justification: `${control.regulatory_basis} Your responses indicate this is in place and evidenced. Basis: ${control.clause_ref}.`
  };
}

export default function RegReadyAssessment() {
  const [selectedCategory, setSelectedCategory] = useState('All Controls');
  const [selectedArchetype, setSelectedArchetype] = useState('All Archetypes');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [fyUnderReview, setFyUnderReview] = useState('2025-26');
  const [answers, setAnswers] = useState({});
  const [expandedControlId, setExpandedControlId] = useState(null);

  const controls = dataset.controls || [];

  // Extract unique archetypes from dataset
  const uniqueArchetypes = useMemo(() => {
    const set = new Set();
    controls.forEach(c => {
      if (c.archetype) set.add(c.archetype);
    });
    return ['All Archetypes', ...Array.from(set).sort()];
  }, [controls]);

  // Filter controls by category, archetype, search, and status
  const filteredControls = useMemo(() => {
    return controls.filter(c => {
      // Category filter
      let matchesCat = true;
      if (selectedCategory === 'Part A (Universal Only)') {
        matchesCat = c.part === 'A';
      } else if (selectedCategory !== 'All Controls') {
        matchesCat = c.part === 'A' || (c.category_applicability || []).includes(selectedCategory);
      }

      // Archetype filter
      let matchesArch = true;
      if (selectedArchetype !== 'All Archetypes') {
        matchesArch = c.archetype === selectedArchetype;
      }

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        c.control_id.toLowerCase().includes(q) ||
        (c.clause_ref && c.clause_ref.toLowerCase().includes(q)) ||
        (c.requirement_text && c.requirement_text.toLowerCase().includes(q)) ||
        (c.question_primary && c.question_primary.toLowerCase().includes(q));

      // Status filter
      if (!matchesCat || !matchesArch || !matchesSearch) return false;
      if (statusFilter === 'ALL') return true;

      const v = computeVerdict(c, answers[c.control_id], fyUnderReview);
      return v.code === statusFilter;
    });
  }, [controls, selectedCategory, selectedArchetype, searchQuery, statusFilter, answers, fyUnderReview]);

  // Compute metrics for all controls in current category scope
  const categoryScopeControls = useMemo(() => {
    return controls.filter(c => {
      if (selectedCategory === 'Part A (Universal Only)') return c.part === 'A';
      if (selectedCategory !== 'All Controls') {
        return c.part === 'A' || (c.category_applicability || []).includes(selectedCategory);
      }
      return true;
    });
  }, [controls, selectedCategory]);

  const metrics = useMemo(() => {
    let green = 0, amber = 0, red = 0, na = 0, un = 0;
    let riskWeightedOpen = 0;

    categoryScopeControls.forEach(c => {
      const v = computeVerdict(c, answers[c.control_id], fyUnderReview);
      if (v.code === 'green') green++;
      else if (v.code === 'amber') {
        amber++;
        riskWeightedOpen += (RISK_WEIGHTS[c.risk_weight] || 1);
      } else if (v.code === 'red') {
        red++;
        riskWeightedOpen += (RISK_WEIGHTS[c.risk_weight] || 1);
      } else if (v.code === 'na') na++;
      else un++;
    });

    const evaluatedTotal = green + amber + red;
    const readinessPct = evaluatedTotal > 0 ? Math.round((green / evaluatedTotal) * 100) : 0;

    return {
      total: categoryScopeControls.length,
      green,
      amber,
      red,
      na,
      un,
      evaluatedTotal,
      readinessPct,
      riskWeightedOpen
    };
  }, [categoryScopeControls, answers, fyUnderReview]);

  // Answer handlers
  const handlePrimaryChange = useCallback((controlId, val) => {
    setAnswers(prev => {
      const current = prev[controlId] || { ev: [], suff: {} };
      return {
        ...prev,
        [controlId]: {
          ...current,
          primary: val
        }
      };
    });
  }, []);

  const handleSuffChange = useCallback((controlId, suffIdx, val) => {
    setAnswers(prev => {
      const current = prev[controlId] || { primary: 'yes', ev: [], suff: {} };
      const newSuff = { ...(current.suff || {}), [suffIdx]: val };
      return {
        ...prev,
        [controlId]: {
          ...current,
          suff: newSuff
        }
      };
    });
  }, []);

  const handleEvidenceToggle = useCallback((controlId, evIdx) => {
    setAnswers(prev => {
      const current = prev[controlId] || { primary: 'yes', ev: [], suff: {} };
      const evList = current.ev || [];
      const newEv = evList.includes(evIdx)
        ? evList.filter(i => i !== evIdx)
        : [...evList, evIdx];
      return {
        ...prev,
        [controlId]: {
          ...current,
          ev: newEv
        }
      };
    });
  }, []);

  const handleRotFYChange = useCallback((controlId, rotFY) => {
    setAnswers(prev => {
      const current = prev[controlId] || { primary: 'yes', ev: [], suff: {} };
      return {
        ...prev,
        [controlId]: {
          ...current,
          rotFY
        }
      };
    });
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all assessment answers?')) {
      setAnswers({});
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <Seo
        title="IFSCA CMI Compliance Readiness Assessment | RegMate"
        description="Assess your IFSCA CMI compliance readiness with RegMate. Identify compliance gaps, evidence gaps and risks, and prepare audit-ready Excel and Word reports."
        keywords="IFSCA CMI Compliance Readiness Assessment, IFSCA CMI Compliance, IFSCA Compliance Checklist, IFSCA Investment Banker Compliance, GIFT IFSC Compliance, IFSCA Compliance Audit, ACAR Compliance, RegMate"
        canonical="https://regmate.in/tools/compliance-diagnostic"
        ogTitle="IFSCA CMI Compliance Readiness Assessment | RegMate"
        ogDescription="Assess your IFSCA CMI compliance readiness with RegMate. Identify compliance gaps, evidence gaps and risks, and prepare audit-ready Excel and Word reports."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "IFSCA CMI Compliance Readiness Assessment",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "Assess your IFSCA CMI compliance readiness with RegMate. Identify compliance gaps, evidence gaps and risks, and prepare audit-ready reports.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
          }
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Tools', href: '/tools' },
            { label: 'Compliance Diagnostic', active: true }
          ]}
        />

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#042C1D] via-[#0B4D33] to-[#073321] text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-emerald-900/50">
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>RegReady Engine • {dataset.meta.public_name}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white leading-tight">
              IFSCA CMI Compliance Readiness Assessment
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed font-normal">
              RegMate helps IFSCA Capital Market Intermediaries assess compliance readiness, identify gaps and prepare for their annual compliance review.
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-emerald-200">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>{dataset.meta.source_regulations}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>{dataset.meta.source_circular}</span>
              </div>
            </div>
          </div>

          <div className="absolute right-4 -bottom-8 opacity-10 text-white pointer-events-none hidden lg:block">
            <ShieldCheck className="w-72 h-72" />
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm leading-relaxed">
          <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Regulatory Notice: </span>
            {dataset.meta.disclaimer}
          </div>
        </div>

        {/* ═══ Scoreboard & Readiness Dashboard ═══ */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line card-shadow space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-line">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-1">
                Assessment Scope: {selectedCategory}
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-forest-deep">
                Compliance Readiness Scorecard
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-paper px-3.5 py-2 rounded-xl border border-line text-xs">
                <span className="text-ink-soft font-semibold">FY Under Review:</span>
                <select
                  value={fyUnderReview}
                  onChange={(e) => setFyUnderReview(e.target.value)}
                  className="bg-white border border-line rounded-lg px-2 py-1 font-mono font-bold text-forest text-xs focus:outline-none focus:border-forest cursor-pointer"
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                </select>
              </div>

              {Object.keys(answers).length > 0 && (
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl border border-line bg-paper text-ink-soft hover:text-rose-600 hover:border-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Answers
                </button>
              )}
            </div>
          </div>

          {/* Metric cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            {/* Readiness % */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-forest to-forest-deep text-white rounded-2xl p-5 flex items-center justify-between shadow-md">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1">
                  Readiness Score
                </div>
                <div className="text-3xl sm:text-4xl font-display font-bold">
                  {metrics.readinessPct}%
                </div>
                <div className="text-[11px] text-emerald-200 mt-1">
                  {metrics.green} of {metrics.evaluatedTotal} assessed controls compliant
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-7 h-7 text-amber-300" />
              </div>
            </div>

            {/* Green */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Likely Compliant
              </div>
              <div className="text-2xl font-display font-bold text-emerald-700">
                {metrics.green}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">🟢 Evidenced</div>
            </div>

            {/* Amber */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                Evidence Gap
              </div>
              <div className="text-2xl font-display font-bold text-amber-700">
                {metrics.amber}
              </div>
              <div className="text-[10px] text-amber-600 font-medium mt-1">🟡 Incomplete</div>
            </div>

            {/* Red */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-1">
                Exceptions
              </div>
              <div className="text-2xl font-display font-bold text-rose-700">
                {metrics.red}
              </div>
              <div className="text-[10px] text-rose-600 font-medium mt-1">🔴 Exception</div>
            </div>

            {/* Risk Weighted Open */}
            <div className="bg-paper border border-line rounded-2xl p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-1">
                Open Risk Weight
              </div>
              <div className="text-2xl font-display font-bold text-ink">
                {metrics.riskWeightedOpen}
              </div>
              <div className="text-[10px] text-ink-soft font-medium mt-1">Weighted gaps</div>
            </div>

          </div>
        </div>

        {/* ═══ Controls Filters & Selector ═══ */}
        <div className="bg-white rounded-2xl p-5 border border-line card-shadow space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Category & Archetype Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-soft uppercase tracking-wider whitespace-nowrap">
                  Category:
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-paper border border-line rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-forest focus:outline-none focus:border-forest cursor-pointer min-h-[40px]"
                >
                  {CMI_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-soft uppercase tracking-wider whitespace-nowrap">
                  Archetype:
                </span>
                <select
                  value={selectedArchetype}
                  onChange={(e) => setSelectedArchetype(e.target.value)}
                  className="bg-paper border border-line rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-forest focus:outline-none focus:border-forest cursor-pointer min-h-[40px]"
                >
                  {uniqueArchetypes.map(arch => (
                    <option key={arch} value={arch}>{arch}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search controls by ID, clause or requirement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-paper rounded-xl border border-line text-xs sm:text-sm text-ink focus:outline-none focus:border-forest min-h-[40px]"
              />
            </div>

          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-line/60">
            <span className="text-xs font-bold text-ink-soft uppercase tracking-wider whitespace-nowrap mr-1">
              Verdict Filter:
            </span>
            {[
              { code: 'ALL', label: `All (${categoryScopeControls.length})` },
              { code: 'un', label: `Not Assessed (${metrics.un})` },
              { code: 'green', label: `Likely Compliant (${metrics.green})` },
              { code: 'amber', label: `Evidence Gap (${metrics.amber})` },
              { code: 'red', label: `Potential Exception (${metrics.red})` },
              { code: 'na', label: `Not Applicable (${metrics.na})` }
            ].map(pill => (
              <button
                key={pill.code}
                onClick={() => setStatusFilter(pill.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                  statusFilter === pill.code
                    ? 'bg-forest text-white shadow-xs'
                    : 'bg-paper text-ink-soft hover:bg-mint hover:text-forest border border-line'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Controls Assessment List ═══ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-ink-soft px-1">
            <span>Showing {filteredControls.length} of {categoryScopeControls.length} controls</span>
            <span>Click any control to expand full statutory requirement</span>
          </div>

          {filteredControls.map((control) => {
            const controlId = control.control_id;
            const ans = answers[controlId] || { ev: [], suff: {} };
            const verdict = computeVerdict(control, ans, fyUnderReview);
            const badge = STATUS_BADGES[verdict.code] || STATUS_BADGES.un;
            const isExpanded = expandedControlId === controlId;
            const primaryOptions = dataset.engine?.primary_options_by_nature?.[control.nature] || [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ];

            return (
              <div
                key={controlId}
                className="bg-white rounded-3xl border border-line card-shadow overflow-hidden transition-all hover:border-forest/40"
              >
                {/* Header Row */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-xs bg-forest text-white px-2.5 py-1 rounded-lg">
                        {control.control_id}
                      </span>
                      <span className="text-xs font-mono font-semibold text-ink-soft bg-paper px-2 py-1 rounded-md border border-line">
                        {control.clause_ref}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        control.risk_weight === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        control.risk_weight === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {control.risk_weight} Risk
                      </span>
                      <span className="text-[10px] font-medium text-ink-soft bg-paper px-2 py-0.5 rounded border border-line">
                        {control.nature}
                      </span>
                    </div>

                    {/* Verdict Pill */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${badge.pill}`}>
                        <span>{badge.emoji}</span>
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Primary Question Callout */}
                  <div className="bg-paper rounded-2xl p-4 border border-line space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-forest">
                          Primary Assessment Question
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-forest-deep leading-snug">
                          {control.question_primary}
                        </p>
                      </div>
                    </div>

                    {/* Primary Answer Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {primaryOptions.map((opt) => {
                        const isSelected = ans.primary === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handlePrimaryChange(controlId, opt.value)}
                            className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-left flex items-center justify-between min-h-[44px] cursor-pointer ${
                              isSelected
                                ? opt.value === 'yes'
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300'
                                  : 'bg-rose-100 border-rose-400 text-rose-900 ring-2 ring-rose-300'
                                : 'bg-white border-line text-ink hover:border-forest hover:bg-mint/30'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* If Primary == 'yes': Show Sufficiency & Evidence & PA-28 inputs */}
                  {ans.primary === 'yes' && (
                    <div className="space-y-4 pt-1 animate-fade-in">
                      
                      {/* PA-28 Rotation input */}
                      {control.control_id === 'PA-28' && (
                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2">
                          <label className="text-xs font-bold text-amber-900 block">
                            First Financial Year of Current Auditor Appointment:
                          </label>
                          <select
                            value={ans.rotFY || '2024-25'}
                            onChange={(e) => handleRotFYChange(controlId, e.target.value)}
                            className="bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="2025-26">2025-26 (1st Year)</option>
                            <option value="2024-25">2024-25 (2nd Year)</option>
                            <option value="2023-24">2023-24 (3rd Year - Final before cooling-off)</option>
                            <option value="2022-23">2022-23 (&gt; 3 Years - Exceeded Cap)</option>
                          </select>
                        </div>
                      )}

                      {/* Sufficiency Questions */}
                      {(control.sufficiency_questions || []).length > 0 && (
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center justify-between">
                            <span>Sufficiency Verification Checks</span>
                            <span className="text-[10px] text-ink-soft lowercase">
                              {Object.keys(ans.suff || {}).length}/{control.sufficiency_questions.length} completed
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {control.sufficiency_questions.map((suffQ, sIdx) => {
                              const isCrit = (control.critical_suff || []).includes(sIdx);
                              const currVal = ans.suff?.[sIdx];

                              return (
                                <div
                                  key={sIdx}
                                  className="bg-white p-3 rounded-xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                >
                                  <div className="space-y-0.5 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      {isCrit && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                          Critical Check
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-medium text-ink leading-relaxed">{suffQ}</p>
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => handleSuffChange(controlId, sIdx, 'y')}
                                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                                        currVal === 'y'
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-paper text-ink-soft hover:bg-emerald-50 hover:text-emerald-800 border border-line'
                                      }`}
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => handleSuffChange(controlId, sIdx, 'n')}
                                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                                        currVal === 'n'
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-paper text-ink-soft hover:bg-rose-50 hover:text-rose-800 border border-line'
                                      }`}
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Evidence Options Checklist */}
                      {(control.evidence_options || []).length > 0 && (
                        <div className="bg-emerald-950/5 rounded-2xl p-4 border border-emerald-800/20 space-y-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center justify-between">
                            <span>What could you show an auditor? (Evidence checklist)</span>
                            <span className="text-[10px] text-forest font-medium">
                              {(ans.ev || []).length} attached
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {control.evidence_options.map((evOpt, evIdx) => {
                              const isChecked = (ans.ev || []).includes(evIdx);
                              return (
                                <button
                                  key={evIdx}
                                  onClick={() => handleEvidenceToggle(controlId, evIdx)}
                                  className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-start gap-2 cursor-pointer ${
                                    isChecked
                                      ? 'bg-mint border-mint-deep text-forest font-semibold'
                                      : 'bg-white border-line text-ink-soft hover:border-forest/40'
                                  }`}
                                >
                                  <FileCheck className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isChecked ? 'text-forest' : 'text-gray-300'}`} />
                                  <span className="leading-snug">{evOpt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Computed Statutory Justification Output */}
                  {ans.primary && (
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${badge.bg}`}>
                      <div className="font-bold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span>{badge.emoji} Computed Verdict Justification</span>
                      </div>
                      <p>{verdict.justification}</p>
                    </div>
                  )}

                  {/* Toggle Full Statutory Detail */}
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedControlId(isExpanded ? null : controlId)}
                      className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Statutory Requirement & Rationale' : 'View Full Statutory Text & Why It Matters'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-2xl bg-paper border border-line text-xs space-y-3 animate-fade-in">
                        <div>
                          <div className="font-bold text-ink mb-1 text-[11px] uppercase tracking-wider">Full Requirement</div>
                          <p className="text-ink-soft leading-relaxed">{control.requirement_text}</p>
                        </div>

                        {control.question_why && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                            <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-800 mb-0.5">Why This Matters</span>
                            <p className="leading-relaxed">{control.question_why}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-ink-soft text-[11px] font-mono pt-1">
                          <span>Owner: {control.owner_role}</span>
                          <span>Archetype: {control.archetype}</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ Longer Product Description & Regulatory Context (SEO & Guidance) ═══ */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-line card-shadow space-y-6">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-forest-deep">
            About the IFSCA CMI Compliance Readiness Assessment
          </h2>
          
          <div className="space-y-4 text-sm sm:text-base text-ink-soft leading-relaxed">
            <p>
              The <strong>RegMate IFSCA CMI Compliance Readiness Assessment</strong> is a structured self-assessment tool designed specifically for Capital Market Intermediaries (CMIs) and Investment Bankers operating within the GIFT IFSC. It assists entities in evaluating their compliance posture across universal Part A statutory obligations as well as category-specific Part B requirements.
            </p>
            <p>
              The assessment engine executes verified deterministic logic aligned with the <em>IFSCA (Capital Market Intermediaries) Regulations, 2025</em> and the Annual Compliance Audit Report (ACAR) circular. By answering structured primary questions, verifying critical sufficiency parameters, and cross-referencing audit evidence, compliance officers and principal officers can identify potential exceptions and evidence gaps before submitting filings to independent compliance auditors under Regulation 25.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-line">
            <div className="p-4 bg-paper rounded-2xl border border-line">
              <h3 className="font-bold text-forest text-sm mb-1">11 CMI Categories Covered</h3>
              <p className="text-xs text-ink-soft">Investment Bankers, Broker Dealers, Custodians, Depository Participants, Advisers, and more.</p>
            </div>
            <div className="p-4 bg-paper rounded-2xl border border-line">
              <h3 className="font-bold text-forest text-sm mb-1">Deterministic Scoring</h3>
              <p className="text-xs text-ink-soft">Strict statutory logic prevents simple answer-echoing and highlights genuine evidence gaps.</p>
            </div>
            <div className="p-4 bg-paper rounded-2xl border border-line">
              <h3 className="font-bold text-forest text-sm mb-1">Audit-Ready Framework</h3>
              <p className="text-xs text-ink-soft">Mapped directly to the ACAR/ACAC format mandated by the Authority.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
