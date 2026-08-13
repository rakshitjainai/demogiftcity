import React, { useState, useMemo } from 'react';
import { Calendar, Filter, Download, CheckSquare, ShieldCheck, AlertCircle, FileText, Search, UserCheck } from 'lucide-react';

const INTERMEDIARIES = [
  { id: 'broker-dealer', name: 'Broker-Dealer / Trading Member' },
  { id: 'clearing-corp', name: 'Clearing Corporation' },
  { id: 'custodian', name: 'Custodian of Securities' },
  { id: 'depository-participant', name: 'Depository Participant' },
  { id: 'investment-banker', name: 'Investment Banker' },
  { id: 'portfolio-manager', name: 'Portfolio Manager' },
  { id: 'credit-rating-agency', name: 'Credit Rating Agency' },
  { id: 'debenture-trustee', name: 'Debenture Trustee' },
  { id: 'rta', name: 'Registrar & Share Transfer Agent (RTA)' }
];

const DEFAULT_CALENDAR_ITEMS = [
  {
    id: 'cmi-01',
    title: 'Quarterly Compliance Certificate by Compliance Officer',
    category: 'IFSCA Filing',
    frequency: 'Quarterly',
    dueDate: 'Within 15 days from end of Quarter',
    portal: 'IFSCA Single Window Portal',
    officer: 'Compliance Officer',
    evidence: 'Signed Certificate + Board Note',
    reference: 'IFSCA CMI Regulations 2025, Reg 14',
    applicable: ['broker-dealer', 'custodian', 'investment-banker', 'portfolio-manager', 'rta', 'debenture-trustee', 'credit-rating-agency']
  },
  {
    id: 'cmi-02',
    title: 'Net Worth Compliance & Auditor Certification',
    category: 'Capital Requirement',
    frequency: 'Half-Yearly',
    dueDate: '45 days from half-year end (Sep 30 & Mar 31)',
    portal: 'IFSCA Single Window Portal',
    officer: 'Principal Officer / CA',
    evidence: 'Auditor Net Worth Certificate',
    reference: 'IFSCA CMI Regulations 2025, Schedule II',
    applicable: ['broker-dealer', 'custodian', 'investment-banker', 'portfolio-manager', 'clearing-corp', 'depository-participant']
  },
  {
    id: 'cmi-03',
    title: 'AML/CFT Quarterly Return & High Risk Transaction Report',
    category: 'AML / FIU Compliance',
    frequency: 'Quarterly',
    dueDate: 'Within 15 days of quarter end',
    portal: 'FIU-IND FINNET Portal / IFSCA',
    officer: 'Principal Officer (AML)',
    evidence: 'CTR/STR Acknowledgment & Audit Trail',
    reference: 'IFSCA AML Guidelines 2024 & PMLA 2002',
    applicable: ['broker-dealer', 'custodian', 'investment-banker', 'portfolio-manager', 'clearing-corp', 'depository-participant', 'debenture-trustee']
  },
  {
    id: 'cmi-04',
    title: 'Annual System Audit & Cyber Security Audit Report',
    category: 'System Audit',
    frequency: 'Annual',
    dueDate: 'Within 3 months from FY close (June 30)',
    portal: 'IFSCA Regulatory Portal',
    officer: 'CISO / Compliance Officer',
    evidence: 'Cert-In Auditor Report & Management Representation',
    reference: 'IFSCA Cyber Security Circular 2024',
    applicable: ['broker-dealer', 'clearing-corp', 'custodian', 'depository-participant', 'rta']
  },
  {
    id: 'cmi-05',
    title: 'Annual Statutory Financial Audit & Regulatory Accounts Submission',
    category: 'Financial Filing',
    frequency: 'Annual',
    dueDate: 'Within 60 days of FY close (May 30)',
    portal: 'IFSCA & ROC Portal',
    officer: 'Board of Directors & Statutory Auditor',
    evidence: 'Audited Financial Statements & Directors Report',
    reference: 'IFSCA CMI Regulations 2025, Reg 28 & Companies Act Sec 137',
    applicable: ['broker-dealer', 'clearing-corp', 'custodian', 'depository-participant', 'investment-banker', 'portfolio-manager', 'credit-rating-agency', 'debenture-trustee', 'rta']
  },
  {
    id: 'cmi-06',
    title: 'Monthly Client Fund Segregation & Margin Reconciliation Statement',
    category: 'Client Asset Protection',
    frequency: 'Monthly',
    dueDate: '7th of following month',
    portal: 'Stock Exchange / IFSCA Portal',
    officer: 'Compliance Officer / Operations Head',
    evidence: 'Bank Reconciliation Statement & Client Ledger Summary',
    reference: 'IFSCA Client Fund Segregation Circular 2025',
    applicable: ['broker-dealer', 'portfolio-manager', 'custodian']
  },
  {
    id: 'cmi-07',
    title: 'Event-based Change in Key Managerial Personnel (KMP) / Principal Officer Notification',
    category: 'Corporate Governance',
    frequency: 'Event-Based',
    dueDate: 'Within 7 days of appointment/resignation',
    portal: 'IFSCA Portal',
    officer: 'Company Secretary / Compliance Officer',
    evidence: 'Board Resolution, Form DIR-12, Fit & Proper Declaration',
    reference: 'IFSCA CMI Regulations 2025, Reg 8',
    applicable: ['broker-dealer', 'clearing-corp', 'custodian', 'depository-participant', 'investment-banker', 'portfolio-manager', 'credit-rating-agency', 'debenture-trustee', 'rta']
  }
];

export default function ComplianceCalendarBuilder() {
  const [selectedIntermediary, setSelectedIntermediary] = useState('broker-dealer');
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [frequencyFilter, setFrequencyFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [completedItems, setCompletedItems] = useState({});

  const filteredItems = useMemo(() => {
    return DEFAULT_CALENDAR_ITEMS.filter(item => {
      const matchesIntermediary = item.applicable.includes(selectedIntermediary);
      const matchesFrequency = frequencyFilter === 'All' || item.frequency === frequencyFilter;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.reference.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesIntermediary && matchesFrequency && matchesSearch;
    });
  }, [selectedIntermediary, frequencyFilter, searchTerm]);

  const toggleComplete = (id) => {
    setCompletedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = useMemo(() => {
    return filteredItems.filter(item => completedItems[item.id]).length;
  }, [filteredItems, completedItems]);

  const readinessScore = filteredItems.length > 0 
    ? Math.round((completedCount / filteredItems.length) * 100) 
    : 0;

  const handleExportCSV = () => {
    const headers = ["Title", "Category", "Frequency", "Due Date", "Filing Portal", "Responsible Officer", "Evidence to Maintain", "Regulatory Reference"];
    const rows = filteredItems.map(item => [
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.frequency}"`,
      `"${item.dueDate}"`,
      `"${item.portal}"`,
      `"${item.officer}"`,
      `"${item.evidence.replace(/"/g, '""')}"`,
      `"${item.reference}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IFSC_Compliance_Calendar_${selectedIntermediary}_${financialYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow">
      {/* Top Banner & Control Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-line mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full uppercase tracking-wider">
              GIFT IFSC Compliance Engine v2.0
            </span>
            <span className="text-xs text-ink-soft">Updated for 2025/2026 Framework</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display text-forest-deep">IFSC Annual Compliance Calendar Builder</h2>
          <p className="text-sm text-ink-soft mt-1">
            Generate a personalized compliance roadmap for your regulated intermediary with officer responsibilities & evidence tracking.
          </p>
        </div>

        {/* Inspection Readiness Meter */}
        <div className="bg-paper border border-line rounded-xl p-4 flex items-center gap-4 min-w-[240px]">
          <div className="w-12 h-12 bg-forest text-white rounded-full flex items-center justify-center font-bold text-lg">
            {readinessScore}%
          </div>
          <div>
            <div className="text-xs font-bold text-ink-soft uppercase tracking-wider">Inspection Readiness</div>
            <div className="text-sm font-semibold text-forest-deep">{completedCount} of {filteredItems.length} Obligations Verified</div>
            <div className="w-32 bg-line h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-leaf h-full transition-all duration-300" style={{ width: `${readinessScore}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2">Select Intermediary Registration</label>
          <select 
            value={selectedIntermediary}
            onChange={(e) => setSelectedIntermediary(e.target.value)}
            className="cursor-target w-full border border-line rounded-lg p-2.5 bg-paper text-forest-deep font-medium focus:outline-none focus:border-leaf text-sm"
          >
            {INTERMEDIARIES.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2">Financial Year</label>
          <select 
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="cursor-target w-full border border-line rounded-lg p-2.5 bg-paper text-forest-deep font-medium focus:outline-none focus:border-leaf text-sm"
          >
            <option value="2026-2027">FY 2026 – 2027</option>
            <option value="2025-2026">FY 2025 – 2026</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2">Search Obligations</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-ink-soft" />
            <input 
              type="text"
              placeholder="Search regulation, topic or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cursor-target w-full pl-9 pr-3 py-2.5 border border-line rounded-lg bg-paper text-sm focus:outline-none focus:border-leaf"
            />
          </div>
        </div>
      </div>

      {/* Frequency Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['All', 'Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Event-Based'].map(freq => (
            <button
              key={freq}
              onClick={() => setFrequencyFilter(freq)}
              className={`cursor-target px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                frequencyFilter === freq 
                  ? 'bg-forest text-white shadow-sm' 
                  : 'bg-paper text-ink-soft hover:bg-mint hover:text-forest'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>

        <button 
          onClick={handleExportCSV}
          className="cursor-target inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-leaf text-white font-medium text-xs rounded-lg hover:bg-forest transition-colors shadow-sm min-h-[44px]"
        >
          <Download className="w-4 h-4" /> Export CSV / Excel
        </button>
      </div>

      {/* Compliance Table */}
      <div className="overflow-x-auto border border-line rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-forest-deep font-semibold text-xs uppercase tracking-wider border-b border-line">
            <tr>
              <th className="p-4 w-12 text-center">Status</th>
              <th className="p-4">Obligation & Title</th>
              <th className="p-4">Frequency & Due Date</th>
              <th className="p-4">Filing Authority / Portal</th>
              <th className="p-4">Responsible Officer</th>
              <th className="p-4">Evidence to Maintain</th>
              <th className="p-4">Regulatory Provision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-ink-soft">
                  No compliance obligations match your selected criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const isDone = completedItems[item.id];
                return (
                  <tr key={item.id} className={`hover:bg-mint/20 transition-colors ${isDone ? 'bg-emerald-50/40' : ''}`}>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => toggleComplete(item.id)}
                        className={`cursor-target w-8 h-8 min-h-[44px] min-w-[44px] rounded border flex items-center justify-center transition-colors mx-auto ${
                          isDone 
                            ? 'bg-leaf border-leaf text-white' 
                            : 'border-line text-transparent hover:border-leaf'
                        }`}
                        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="p-4 font-medium text-forest-deep max-w-xs">
                      <div>{item.title}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-paper text-ink-soft border border-line text-[10px] font-semibold rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-xs text-forest">{item.dueDate}</div>
                      <span className="text-[11px] text-ink-soft">{item.frequency}</span>
                    </td>
                    <td className="p-4 text-xs font-medium text-ink">
                      {item.portal}
                    </td>
                    <td className="p-4 text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-forest-deep">
                        <UserCheck className="w-3.5 h-3.5 text-leaf" /> {item.officer}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-ink-soft max-w-xs">
                      {item.evidence}
                    </td>
                    <td className="p-4 text-xs font-mono text-gold font-medium">
                      {item.reference}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between text-xs text-ink-soft border-t border-line pt-4 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-leaf" /> Designed for IFSCA Capital Market Intermediaries & Regulated Entities in GIFT City.
        </div>
        <div>
          Authoritative source: <a href="https://csatwork.in" target="_blank" rel="noreferrer" className="underline font-medium text-forest">CS Prashant Kumar (csatwork.in)</a>
        </div>
      </div>
    </div>
  );
}
