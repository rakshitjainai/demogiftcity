import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileCheck, AlertTriangle, Info, CheckCircle2, Clock, ShieldCheck, UserCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AnnualFilingTracker() {
  const { user } = useAuth();

  // Inputs
  const [companyCategory, setCompanyCategory] = useState('small_pvt'); // 'small_pvt' | 'pvt' | 'public' | 'opc'
  const [financialYearEnd, setFinancialYearEnd] = useState('2026-03-31');
  const [agmDate, setAgmDate] = useState('2026-09-30');

  // Filing Status Map: { [filingId]: { status: 'Not Started' | 'In Progress' | 'Filed', dateFiled: string } }
  const [filingsState, setFilingsState] = useState({
    'agm': { status: 'Not Started', dateFiled: '' },
    'aoc-4': { status: 'Not Started', dateFiled: '' },
    'mgt-7': { status: 'Not Started', dateFiled: '' },
    'adt-1': { status: 'Not Started', dateFiled: '' },
    'dir-3-kyc': { status: 'Not Started', dateFiled: '' },
    'board-meetings': { status: 'Not Started', dateFiled: '' }
  });

  const [savingStatus, setSavingStatus] = useState('');

  // Helper date calculation functions
  const addDays = (dateStr, days) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Calculated Due Dates
  const agmDueDate = '2026-09-30'; // 6 months from 31 March
  const aoc4DueDate = addDays(agmDate, 30); // 30 days from AGM
  const mgt7DueDate = addDays(agmDate, 60); // 60 days from AGM
  const adt1DueDate = addDays(agmDate, 15); // 15 days from AGM
  const dir3KycDueDate = '2026-09-30'; // Annual Sept 30

  // Fetch persisted filings if user is logged in
  useEffect(() => {
    if (user && user.filingStatus && user.filingStatus.length > 0) {
      const initialMap = { ...filingsState };
      user.filingStatus.forEach(item => {
        if (initialMap[item.filingId]) {
          initialMap[item.filingId] = {
            status: item.status || 'Not Started',
            dateFiled: item.dateFiled || ''
          };
        }
      });
      setFilingsState(initialMap);
    }
  }, [user]);

  const updateFiling = async (filingId, key, value) => {
    const updated = {
      ...filingsState,
      [filingId]: {
        ...filingsState[filingId],
        [key]: value
      }
    };
    setFilingsState(updated);

    if (user) {
      setSavingStatus('Saving...');
      try {
        const token = localStorage.getItem('regmate_token');
        await fetch('/api/user/filing-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            filingId,
            status: updated[filingId].status,
            dateFiled: updated[filingId].dateFiled
          })
        });
        setSavingStatus('Saved!');
        setTimeout(() => setSavingStatus(''), 2000);
      } catch (err) {
        console.error('Error saving filing status:', err);
        setSavingStatus('Error saving');
      }
    }
  };

  const completedCount = Object.values(filingsState).filter(f => f.status === 'Filed').length;
  const inProgressCount = Object.values(filingsState).filter(f => f.status === 'In Progress').length;
  const totalFilings = 6;
  const completionPercentage = Math.round((completedCount / totalFilings) * 100);

  const filingsList = [
    {
      id: 'agm',
      name: 'AGM (Annual General Meeting)',
      formCode: 'Section 96',
      desc: 'Annual General Meeting must be held by companies within 6 months from the close of the financial year (30 September for 31 March FY end).',
      dueRule: 'Due within 6 months of FY end (30 September)',
      calcDueDate: agmDueDate,
      lateFeeNote: 'Late AGM requires NCLT extension under Section 96; failure to hold AGM attracts fines up to ₹1,00,000 + ₹5,000/day on officers.',
      link: null
    },
    {
      id: 'aoc-4',
      name: 'Form AOC-4 / AOC-4 XBRL (Financial Statements)',
      formCode: 'Section 137',
      desc: 'Filing of audited financial statements, Board report, auditor report, and annexures with the Registrar of Companies (ROC).',
      dueRule: 'Within 30 days of holding the AGM',
      calcDueDate: aoc4DueDate,
      lateFeeNote: 'Late fee: ₹100 per day per form with no upper cap. Continuing default attracts additional statutory penalties on company & directors.',
      link: null
    },
    {
      id: 'mgt-7',
      name: companyCategory === 'small_pvt' || companyCategory === 'opc' ? 'Form MGT-7A (Abridged Annual Return)' : 'Form MGT-7 (Annual Return)',
      formCode: 'Section 92',
      desc: companyCategory === 'small_pvt' || companyCategory === 'opc'
        ? 'Simplified Abridged Annual Return for One Person Companies (OPCs) and Small Companies under Section 2(85).'
        : 'Detailed Annual Return covering shareholding pattern, indebtedness, directors, and key management personnel (KMP).',
      dueRule: 'Within 60 days of holding the AGM',
      calcDueDate: mgt7DueDate,
      lateFeeNote: 'Late fee: ₹100 per day per form with no upper cap under Section 92(5).',
      link: null
    },
    {
      id: 'adt-1',
      name: 'Form ADT-1 (Auditor Appointment / Re-appointment)',
      formCode: 'Section 139(1)',
      desc: 'Written notice to ROC for appointment or re-appointment of statutory auditor at the AGM for a 5-year tenure.',
      dueRule: 'Within 15 days of the AGM',
      calcDueDate: adt1DueDate,
      note: 'Note: First auditor of a new company is appointed by the Board within 30 days of incorporation (Form ADT-1 is optional for 1st auditor but mandatory for AGM appointments).',
      lateFeeNote: 'Standard MCA additional fee schedule applies depending on delay duration.',
      link: null
    },
    {
      id: 'dir-3-kyc',
      name: 'Form DIR-3 KYC / DIR-3 KYC WEB',
      formCode: 'Rule 12A, Directors Rules',
      desc: 'Annual KYC verification for every individual holding a Director Identification Number (DIN) allotted on or before preceding 31 March.',
      dueRule: 'Annual due date: 30 September',
      calcDueDate: dir3KycDueDate,
      lateFeeNote: 'Missed deadline results in instant DIN deactivation. Reactivation requires a flat mandatory late fee of ₹5,000 per DIN.',
      link: null
    },
    {
      id: 'board-meetings',
      name: 'Board Meetings Cadence & Minutes Filing',
      formCode: 'Section 173 & Secretarial Standard-1',
      desc: 'Minimum 4 Board Meetings per FY, maximum gap between consecutive meetings must not exceed 120 days. Minutes must be recorded within 30 days.',
      dueRule: 'Min 4 meetings/FY, max 120 days gap between meetings',
      calcDueDate: 'Continuous (Max 120 Days Gap)',
      lateFeeNote: 'Non-compliance with SS-1 / Section 173 attracts penalty of ₹25,000 on company and ₹5,000 on officers in default.',
      link: '/tools/board-meeting-planner'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white border border-line rounded-2xl p-8 card-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-line">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="eyebrow block">§ Compliance Tool</span>
              <span className="px-3 py-0.5 bg-mint text-forest font-semibold text-xs rounded-full">
                MCA / Companies Act 2013
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display text-forest-deep">Annual Filing Tracker</h1>
            <p className="text-ink-soft mt-1">
              Checklist-style tracker for mandatory annual ROC e-filings, dynamically calculated due dates, and fee rules.
            </p>
          </div>

          {/* Sync Badge */}
          <div className="flex-shrink-0">
            {user ? (
              <div className="px-4 py-2 bg-mint-deep/30 border border-mint text-forest font-medium text-xs rounded-xl flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-leaf" />
                <span>Synced to <strong>{user.name}</strong></span>
                {savingStatus && <span className="text-ink-soft animate-pulse">({savingStatus})</span>}
              </div>
            ) : (
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Guest Mode — Log in to save across sessions</span>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div>
            <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
              Company Classification
            </label>
            <select
              value={companyCategory}
              onChange={(e) => setCompanyCategory(e.target.value)}
              className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-paper text-sm text-ink font-medium focus:outline-none focus:border-forest"
            >
              <option value="small_pvt">Small Company (Section 2(85))</option>
              <option value="opc">One Person Company (OPC)</option>
              <option value="pvt">Private Limited Company (Standard)</option>
              <option value="public">Public Limited Company / Listed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
              Financial Year End
            </label>
            <input
              type="date"
              value={financialYearEnd}
              onChange={(e) => setFinancialYearEnd(e.target.value)}
              className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-paper text-sm text-ink font-medium focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
              Actual / Planned AGM Date
            </label>
            <input
              type="date"
              value={agmDate}
              onChange={(e) => setAgmDate(e.target.value)}
              className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-paper text-sm text-ink font-medium focus:outline-none focus:border-forest"
            />
          </div>
        </div>
      </div>

      {/* Progress & Summary Bar */}
      <div className="bg-white border border-line rounded-2xl p-6 card-shadow flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/2 space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold text-forest-deep">
            <span>Cycle Progress ({completedCount} of {totalFilings} Completed)</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-paper border border-line rounded-full overflow-hidden">
            <div
              className="h-full bg-leaf transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <span className="px-3.5 py-1.5 bg-paper border border-line rounded-xl text-ink-soft font-semibold text-xs">
            Not Started: <strong className="text-forest-deep">{totalFilings - completedCount - inProgressCount}</strong>
          </span>
          <span className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-xs rounded-xl">
            In Progress: <strong>{inProgressCount}</strong>
          </span>
          <span className="px-3.5 py-1.5 bg-mint text-forest font-semibold text-xs rounded-xl">
            Filed / Done: <strong>{completedCount}</strong>
          </span>
        </div>
      </div>

      {/* Checklist Filings List */}
      <div className="space-y-4">
        {filingsList.map((item) => {
          const itemState = filingsState[item.id] || { status: 'Not Started', dateFiled: '' };

          return (
            <div
              key={item.id}
              className={`bg-white border transition-all rounded-2xl p-6 card-shadow ${
                itemState.status === 'Filed'
                  ? 'border-mint-deep bg-mint/10'
                  : itemState.status === 'In Progress'
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-line'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: Info */}
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 bg-forest/10 text-forest-deep font-semibold text-xs rounded-full">
                      {item.formCode}
                    </span>
                    <h3 className="font-semibold text-lg text-forest-deep">{item.name}</h3>
                    {item.link && (
                      <Link
                        to={item.link}
                        className="cursor-target inline-flex items-center text-xs text-leaf font-semibold hover:underline gap-1"
                      >
                        Open Tool <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  <p className="text-sm text-ink-soft leading-relaxed">{item.desc}</p>

                  {item.note && (
                    <div className="p-3 bg-paper border border-line rounded-xl text-xs text-ink-soft flex items-start gap-2">
                      <Info className="w-4 h-4 text-leaf flex-shrink-0 mt-0.5" />
                      <span>{item.note}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs flex-wrap pt-1">
                    <span className="font-medium text-forest-deep bg-mint-deep/20 px-2.5 py-1 rounded-md">
                      Statutory Rule: {item.dueRule}
                    </span>
                    <span className="font-semibold text-forest bg-paper border border-line px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Calculated Due Date: {formatDate(item.calcDueDate)}
                    </span>
                  </div>

                  {item.lateFeeNote && (
                    <div className="text-xs text-amber-800 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Late Fee Warning:</strong> {item.lateFeeNote}</span>
                    </div>
                  )}
                </div>

                {/* Right: Interactive Controls */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 min-w-[220px]">
                  <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wider">
                    Filing Status
                  </label>
                  <select
                    value={itemState.status}
                    onChange={(e) => updateFiling(item.id, 'status', e.target.value)}
                    className={`cursor-target w-full sm:w-auto border rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none transition-colors ${
                      itemState.status === 'Filed'
                        ? 'bg-mint text-forest border-mint-deep'
                        : itemState.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-paper text-ink-soft border-line'
                    }`}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Filed">Filed / Completed</option>
                  </select>

                  <div className="w-full sm:w-auto">
                    <label className="block text-xs font-medium text-ink-soft mb-1">Date Filed (Optional)</label>
                    <input
                      type="date"
                      value={itemState.dateFiled || ''}
                      onChange={(e) => updateFiling(item.id, 'dateFiled', e.target.value)}
                      className="cursor-target w-full border border-line rounded-lg px-3 py-1.5 bg-paper text-xs text-ink focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
