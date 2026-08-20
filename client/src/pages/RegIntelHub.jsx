import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Rss, Filter, Calendar, AlertTriangle, ArrowRight,
  ExternalLink, Search, ShieldAlert, Sparkles, Building, FileText
} from 'lucide-react';
import { LATEST_UPDATES } from '../data/mockData';

const REGULATORS = [
  { id: 'all', label: 'All Updates' },
  { id: 'mca', label: 'MCA' },
  { id: 'sebi', label: 'SEBI' },
  { id: 'ifsca', label: 'IFSCA' },
  { id: 'rbi', label: 'RBI' },
  { id: 'fema', label: 'FEMA' },
  { id: 'irdai', label: 'IRDAI' },
  { id: 'tax', label: 'Tax' },
  { id: 'others', label: 'Other Regulators' }
];

const SAMPLE_INTELLIGENCE = [
  {
    id: 'intel-1',
    title: 'IFSCA Issues Consultation Paper on Fund Management (Amendment) Regulations, 2026',
    regulator: 'IFSCA',
    regulatorId: 'ifsca',
    type: 'Consultation Paper',
    impact: 'High Impact',
    date: 'August 14, 2026',
    effectiveDate: 'Immediate Feedback',
    summary: 'Proposes key relaxations in Sponsor commitment for Restricted Schemes and clarifies co-investment vehicle structuring.',
    whatChanged: 'Reduction in mandatory continuing interest for Angel Funds and streamlined fast-track scheme approvals.',
    targetAudience: 'Fund Managers, AIFs, Family Offices in GIFT IFSC'
  },
  {
    id: 'intel-2',
    title: 'SEBI Issues Master Circular on Cybersecurity and Cyber Resilience Framework for Market Intermediaries',
    regulator: 'SEBI',
    regulatorId: 'sebi',
    type: 'Master Circular',
    impact: 'High Impact',
    date: 'August 11, 2026',
    effectiveDate: 'October 1, 2026',
    summary: 'Consolidated guidelines mandating periodic VAPT, SOC 2 compliance, and 6-hour incident reporting window to CERT-In and SEBI.',
    whatChanged: 'Stricter chief information security officer (CISO) reporting lines directly to the Board Risk Committee.',
    targetAudience: 'Brokers, Custodians, Depository Participants, Merchant Bankers'
  },
  {
    id: 'intel-3',
    title: 'MCA Mandates Standard Operating Procedure for DIR-3 KYC De-activation and Restoration',
    regulator: 'MCA',
    regulatorId: 'mca',
    type: 'Notification',
    impact: 'Medium Impact',
    date: 'August 08, 2026',
    effectiveDate: 'September 1, 2026',
    summary: 'MCA specifies automated notices and online challan reconciliation for DIN reactivation under Rule 12A of Companies (Appointment of Directors) Rules.',
    whatChanged: 'No manual physical representations accepted at ROC offices for KYC delinquent DINs.',
    targetAudience: 'All Indian Company Directors & Company Secretaries'
  },
  {
    id: 'intel-4',
    title: 'RBI Master Direction on Digital Lending — Clarification on First Loss Default Guarantee (FLDG)',
    regulator: 'RBI',
    regulatorId: 'rbi',
    type: 'Master Direction',
    impact: 'High Impact',
    date: 'August 04, 2026',
    effectiveDate: 'Immediate',
    summary: 'RBI clarifies cap of 5% on default loss guarantee arrangements between Regulated Entities and Lending Service Providers (LSPs).',
    whatChanged: 'Explicit prohibition on synthetic credit enhancement instruments outside the structured contractual framework.',
    targetAudience: 'Banks, NBFCs, FinTechs, Lending Platforms'
  },
  {
    id: 'intel-5',
    title: 'FEMA Non-Debt Instruments (NDI) Amendment — Overseas Direct Investment (ODI) Streamlining',
    regulator: 'FEMA',
    regulatorId: 'fema',
    type: 'Amendment Order',
    impact: 'Medium Impact',
    date: 'July 28, 2026',
    effectiveDate: 'August 1, 2026',
    summary: 'RBI and Department of Economic Affairs simplify automated APR filing and liberalize step-down subsidiary investment limits.',
    whatChanged: 'Self-certification allowed for unlisted overseas joint venture compliance up to USD 5 Million.',
    targetAudience: 'Indian Corporates, Startup Founders, Outbound Investors'
  }
];

export default function RegIntelHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeReg = searchParams.get('reg') || 'all';
  const [impactFilter, setImpactFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return SAMPLE_INTELLIGENCE.filter((item) => {
      const matchReg = activeReg === 'all' || item.regulatorId === activeReg;
      const matchImpact = impactFilter === 'all' || item.impact.toLowerCase().includes(impactFilter.toLowerCase());
      const matchSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.whatChanged.toLowerCase().includes(searchQuery.toLowerCase());
      return matchReg && matchImpact && matchSearch;
    });
  }, [activeReg, impactFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--paper)] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--mint)] border border-[var(--leaf)]/30 rounded-full text-xs font-bold text-[var(--forest)] uppercase tracking-wider mb-4">
            <Rss size={14} className="text-[var(--leaf)]" /> RegIntel Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--forest-deep)] tracking-tight">
            Regulatory Updates & Intelligence
          </h1>
          <p className="mt-2.5 text-base sm:text-lg text-[var(--ink-soft)] leading-relaxed">
            Know what changed, who is affected, and what action is required. Filter by regulator, legal framework, and impact severity.
          </p>
        </div>

        {/* Layout: Main Feed (8 cols) + Side Widgets (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Feed & Filters */}
          <div className="lg:col-span-8 space-y-6">

            {/* Regulator Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-[var(--line)]">
              {REGULATORS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSearchParams(r.id === 'all' ? {} : { reg: r.id })}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeReg === r.id
                      ? 'bg-[var(--forest)] text-white shadow-sm'
                      : 'bg-white text-[var(--ink-soft)] border border-[var(--line)] hover:bg-[var(--mint)] hover:text-[var(--forest)]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Sub Filters: Search & Impact */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-white p-3.5 rounded-xl border border-[var(--line)] shadow-sm">
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  type="text"
                  placeholder="Search updates or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--paper)] rounded-lg border border-[var(--line)] focus:outline-none focus:border-[var(--leaf)] text-[var(--ink)]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-[var(--ink-soft)] whitespace-nowrap">Impact:</span>
                <select
                  value={impactFilter}
                  onChange={(e) => setImpactFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[var(--paper)] rounded-lg border border-[var(--line)] text-[var(--ink)] font-medium focus:outline-none"
                >
                  <option value="all">All Impact Levels</option>
                  <option value="high">High Impact</option>
                  <option value="medium">Medium Impact</option>
                </select>
              </div>
            </div>

            {/* Updates List */}
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-[var(--line)] shadow-sm hover:border-[var(--leaf)] hover:shadow-md transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[var(--forest)] text-white text-[11px] font-bold">
                        {item.regulator}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--mint-deep)] text-[var(--forest-deep)] text-[11px] font-medium">
                        {item.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        item.impact.includes('High')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.impact}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--ink-soft)] font-medium flex items-center gap-1">
                      <Calendar size={12} /> {item.date}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[var(--forest-deep)] mb-2 font-serif leading-snug">
                    {item.title}
                  </h2>

                  <p className="text-[13.5px] text-[var(--ink-soft)] mb-3 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="p-3 bg-[var(--mint)]/60 rounded-xl border border-[var(--line)]/60 mb-4 text-xs space-y-1">
                    <p className="font-bold text-[var(--forest-deep)] flex items-center gap-1">
                      <Sparkles size={13} className="text-[var(--leaf)]" /> Key Practical Change:
                    </p>
                    <p className="text-[var(--ink)] leading-relaxed">{item.whatChanged}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]/50 text-xs">
                    <span className="text-[var(--ink-soft)] truncate">
                      <strong>Applies to:</strong> {item.targetAudience}
                    </span>
                    <Link
                      to={`/news`}
                      className="inline-flex items-center gap-1 font-bold text-[var(--leaf)] hover:text-[var(--forest)] whitespace-nowrap ml-2"
                    >
                      <span>Read Order</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-[var(--line)] p-6">
                  <p className="text-base font-bold text-[var(--ink)]">No updates found</p>
                  <p className="text-xs text-[var(--ink-soft)] mt-1">Try clearing filters or search queries.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Widgets */}
          <div className="lg:col-span-4 space-y-6">

            {/* "What's Changed?" Widget */}
            <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm">
              <div className="flex items-center gap-2 text-[var(--forest)] mb-2">
                <Sparkles size={18} className="text-[var(--gold)]" />
                <h3 className="text-base font-serif font-bold text-[var(--forest-deep)]">
                  What's Changed?
                </h3>
              </div>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed mb-4">
                Track consolidated legal amendments, comparison tables, and effective dates across Company Law, SEBI, and IFSC regulations.
              </p>
              <Link
                to="/interactive-regulations"
                className="block w-full text-center py-2.5 bg-[var(--mint-deep)] hover:bg-[var(--forest)] hover:text-white text-[var(--forest-deep)] text-xs font-bold rounded-xl transition-all border border-[var(--line)]"
              >
                View Regulatory Tracker
              </Link>
            </div>

            {/* Regulatory Calendar Widget */}
            <div className="bg-gradient-to-br from-[var(--forest-deep)] to-[var(--forest)] text-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-[var(--gold)]" />
                <h3 className="text-base font-serif font-bold">
                  Regulatory Calendar
                </h3>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                Never miss statutory compliance deadlines, quarterly board approvals, or annual ROC filings.
              </p>
              <Link
                to="/tools/compliance-calendar"
                className="block w-full text-center py-2.5 bg-[var(--gold)] hover:bg-white hover:text-[var(--forest-deep)] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Open Compliance Calendar
              </Link>
            </div>

            {/* Enforcement Actions Widget */}
            <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm">
              <div className="flex items-center gap-2 text-[var(--forest)] mb-2">
                <ShieldAlert size={18} className="text-rose-600" />
                <h3 className="text-base font-serif font-bold text-[var(--forest-deep)]">
                  Enforcement Actions
                </h3>
              </div>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed mb-4">
                Study recent adjudication orders, compounding penalties, and key compliance lessons from SEBI, MCA, and IFSCA.
              </p>
              <Link
                to="/news"
                className="block w-full text-center py-2.5 bg-rose-50 text-rose-800 hover:bg-rose-600 hover:text-white text-xs font-bold rounded-xl transition-all border border-rose-200"
              >
                Browse Adjudication Orders
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
