import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, FileText, Users, Calculator, ShieldAlert, ArrowRight,
  Search, Filter, Wrench, Sparkles, CheckSquare, Zap, Clock,
  ShieldCheck, HelpCircle, FileSpreadsheet, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LockOverlay from '../components/LockOverlay';
import Breadcrumb from '../components/Breadcrumb';
import BadgeChip from '../components/BadgeChip';

const ALL_TOOLS = [
  {
    slug: 'compliance-diagnostic',
    title: 'IFSCA CMI Compliance Readiness Assessment',
    category: 'Risk Diagnostics',
    icon: ShieldCheck,
    color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    desc: 'Structured self-assessment tool for GIFT IFSC CMIs & Investment Bankers with ACAR audit gap scoring across 11 CMI categories.',
    tags: ['IFSCA', 'CMI', 'ACAR', 'Audit Ready'],
    status: 'ACTIVE',
    badge: 'Featured 2026',
    estimatedMins: '10 min assessment'
  },
  {
    slug: 'compliance-calendar',
    title: 'Compliance Calendar Builder',
    category: 'Planners & Calendars',
    icon: Calendar,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Automated statutory deadline calculator for GIFT IFSC entities, SEBI AIFs, and ROC annual filings.',
    tags: ['IFSCA', 'MCA', 'SEBI'],
    status: 'ACTIVE',
    badge: 'Popular',
    estimatedMins: '3 min run'
  },
  {
    slug: 'annual-filing-tracker',
    title: 'Annual Filing Tracker',
    category: 'Filing Trackers',
    icon: FileText,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'ROC filings master tracker for AOC-4, MGT-7, ADT-1, DIR-3 KYC, and MSME-1 due dates with penalties.',
    tags: ['MCA', 'ROC', 'Companies Act'],
    status: 'ACTIVE',
    badge: 'Updated 2026',
    estimatedMins: '5 min run'
  },
  {
    slug: 'board-meeting-planner',
    title: 'Board Meeting & Quorum Planner',
    category: 'Planners & Calendars',
    icon: Users,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    desc: 'Section 174 Quorum calculator, 120-day maximum gap rule monitor, notice periods, and agenda generator.',
    tags: ['Corporate Governance', 'SS-1'],
    status: 'ACTIVE',
    badge: 'Essential',
    estimatedMins: '4 min run'
  },
  {
    slug: 'esop-calculator',
    title: 'ESOP & Vesting Calculator',
    category: 'Statutory Calculators',
    icon: Calculator,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    desc: 'Statutory 1-year cliff vesting schedule generator, pool dilution matrix, and exercise tax modeling.',
    tags: ['MCA', 'Tax', 'Startups'],
    status: 'ACTIVE',
    badge: 'Featured',
    estimatedMins: '5 min run'
  },
  {
    slug: 'aml-risk-assessment',
    title: 'AML/CFT Risk Assessment Matrix',
    category: 'Risk Diagnostics',
    icon: ShieldAlert,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    desc: '10-point statutory AML/CFT compliance audit scorecard, PEP screening rating, and risk rating matrix.',
    tags: ['IFSCA', 'FIU-IND', 'PMLA'],
    status: 'ACTIVE',
    badge: 'Audit Ready',
    estimatedMins: '8 min run'
  },
  {
    slug: 'net-worth-calculator',
    title: 'Net Worth & Capital Adequacy Checker',
    category: 'Statutory Calculators',
    icon: Calculator,
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    desc: 'Calculate regulatory net worth for IFSCA Capital Market Intermediaries & FMEs under 2025 guidelines.',
    tags: ['IFSCA', 'CMI', 'FME'],
    status: 'COMING_SOON',
    badge: 'Coming Soon',
    estimatedMins: '4 min run'
  },
  {
    slug: 'checklist-generator',
    title: 'Event-Based Secretarial Checklist Generator',
    category: 'Checklists',
    icon: CheckSquare,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    desc: 'Instant step-by-step checklists for Rights Issues, Private Placements, Name Changes, and Auditor Appointments.',
    tags: ['MCA', 'Secretarial'],
    status: 'COMING_SOON',
    badge: 'Coming Soon',
    estimatedMins: '2 min run'
  },
  {
    slug: 'applicability-checker',
    title: 'Statutory Applicability Generator',
    category: 'Risk Diagnostics',
    icon: Zap,
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    desc: 'Determine CSR applicability, Internal Audit thresholds, Secretarial Audit requirements, and CARO triggers.',
    tags: ['Companies Act', 'Thresholds'],
    status: 'COMING_SOON',
    badge: 'Coming Soon',
    estimatedMins: '3 min run'
  }
];

const CATEGORIES = [
  'ALL',
  'Planners & Calendars',
  'Filing Trackers',
  'Statutory Calculators',
  'Risk Diagnostics',
  'Checklists'
];

export default function ToolsIndex() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCat = selectedCategory === 'ALL' || tool.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);


  return (
    <div className="min-h-screen bg-paper py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Tools', href: '/tools' },
            { label: 'RegTools Compliance Suite', active: true }
          ]}
        />

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#042C1D] via-[#0B4D33] to-[#073321] text-white p-8 sm:p-12 shadow-xl border border-emerald-900/50">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>RegTools • Compliance Automation & Calculators</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight tracking-tight">
              Interactive Tools Built for Legal & Secretarial Workflows
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 font-normal leading-relaxed">
              Eliminate spreadsheet guesswork. Automate filing deadlines, statutory quorum requirements, ESOP vesting, and AML compliance scoring with verified Indian regulatory formulas.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-emerald-100 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Companies Act 2013 & IFSCA Formatted</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Instant Exportable Reports</span>
              </div>
            </div>
          </div>

          <div className="absolute right-6 -bottom-10 opacity-10 text-white pointer-events-none hidden lg:block">
            <Wrench className="w-80 h-80" />
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-line card-shadow space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools by keyword, regulation or act..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-paper rounded-xl border border-line text-sm text-ink focus:outline-none focus:border-forest"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-forest text-white shadow-sm'
                      : 'bg-paper text-ink-soft hover:bg-mint hover:text-forest border border-line'
                  }`}
                >
                  {cat === 'ALL' ? 'All Tools' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const isLive = tool.status === 'ACTIVE';

            return (
              <div
                key={tool.slug}
                className="group bg-white rounded-3xl p-7 border border-line card-shadow hover-lift flex flex-col justify-between transition-all duration-300 hover:border-forest/40"
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${tool.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-paper border border-line text-ink-soft">
                      {tool.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-display font-bold text-forest mb-2 group-hover:text-leaf transition-colors">
                    {tool.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mb-6">
                    {tool.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {tool.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-mint text-forest text-[11px] font-semibold border border-mint-deep"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-4 border-t border-line/60 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {tool.estimatedMins}
                  </span>

                  {isLive ? (
                    <Link
                      to={`/tools/${tool.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-forest group-hover:text-leaf transition-colors"
                    >
                      <span>Launch Tool</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">
                      In Development
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-forest to-forest-deep text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-display font-bold text-white">
              Need a Custom Compliance Calculator for Your Firm?
            </h3>
            <p className="text-sm text-mint max-w-xl">
              We design specialized applicability engines and filing calculators for GIFT City entities, AIF funds, and corporate secretarial teams.
            </p>
          </div>

          <Link
            to="/about"
            className="px-6 py-3 rounded-xl bg-white hover:bg-mint text-forest-deep font-bold text-xs sm:text-sm transition-all shadow-md flex-shrink-0"
          >
            Contact Product Team
          </Link>
        </div>

      </div>
    </div>
  );
}
