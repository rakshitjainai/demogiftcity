import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Rss, Filter, Calendar, AlertTriangle, ArrowRight,
  ExternalLink, Search, ShieldAlert, Sparkles, Building, FileText
} from 'lucide-react';
import { LATEST_UPDATES } from '../data/mockData';

import { useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';

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

export default function RegIntelHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeReg = searchParams.get('reg') || 'all';
  const [impactFilter, setImpactFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const fetchUpdates = () => {
    setLoading(true);
    setApiError(false);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE}/blogs?limit=150`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.posts) {
          setUpdates(data.posts);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching regulatory updates:', err);
        setApiError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const filteredItems = useMemo(() => {
    return updates.filter((item) => {
      const matchReg = activeReg === 'all' || item.regulatorId === activeReg;
      const matchImpact = impactFilter === 'all' || item.impact.toLowerCase().includes(impactFilter.toLowerCase());
      const matchSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchReg && matchImpact && matchSearch;
    });
  }, [updates, activeReg, impactFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--paper)] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#042C1D] via-[#0B4D33] to-[#073321] text-white p-8 sm:p-10 mb-10 shadow-xl border border-emerald-900/50">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Rss size={14} className="text-emerald-400" /> RegIntel Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Regulatory Updates & Intelligence
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-normal leading-relaxed">
              Know what changed, who is affected, and what action is required. Filter by regulator, legal framework, and impact severity.
            </p>
          </div>
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
              {loading ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-[var(--line)] p-8">
                  <div className="w-8 h-8 border-3 border-forest border-t-gold rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-xs text-ink-soft">Fetching latest regulatory circulars & updates...</p>
                </div>
              ) : filteredItems.map((item) => (
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
                    {item.summary || item.desc}
                  </p>

                  <div className="p-3 bg-[var(--mint)]/60 rounded-xl border border-[var(--line)]/60 mb-4 text-xs space-y-1">
                    <p className="font-bold text-[var(--forest-deep)] flex items-center gap-1">
                      <Sparkles size={13} className="text-[var(--leaf)]" /> Key Practical Change:
                    </p>
                    <p className="text-[var(--ink)] leading-relaxed">{item.whatChanged || item.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]/50 text-xs">
                    <span className="text-[var(--ink-soft)] truncate">
                      <strong>Applies to:</strong> {item.targetAudience || item.category}
                    </span>
                    <Link
                      to={`/free-resources/blogs`}
                      className="inline-flex items-center gap-1 font-bold text-[var(--leaf)] hover:text-[var(--forest)] whitespace-nowrap ml-2"
                    >
                      <span>Read Order</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}

              {!loading && apiError && (
                <div className="text-center py-12 bg-white rounded-2xl border border-[var(--line)] p-6">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-base font-bold text-[var(--ink)]">Regulatory updates are temporarily unavailable</p>
                  <p className="text-xs text-[var(--ink-soft)] mt-1 mb-4">We're having trouble connecting to the updates feed. Please try again.</p>
                  <button
                    onClick={fetchUpdates}
                    className="px-5 py-2 bg-[var(--forest)] text-white text-xs font-bold rounded-full hover:bg-[var(--leaf)] transition-colors cursor-pointer min-h-[36px]"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !apiError && filteredItems.length === 0 && (
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
