import React, { useState } from 'react';
import { Users, Calendar, CheckSquare, Square, Plus, Trash2, ShieldCheck, AlertCircle, Info, Clock, Printer, Sparkles } from 'lucide-react';

export default function BoardMeetingPlanner() {
  // Quorum inputs
  const [totalStrength, setTotalStrength] = useState(5); // total directors in office (excluding vacant seats)
  const [interestedDirectors, setInterestedDirectors] = useState(0);

  // Frequency inputs
  const [lastMeetingDate, setLastMeetingDate] = useState('2026-05-15');

  // Agenda checklist state
  const [agendaItems, setAgendaItems] = useState([
    { id: 1, text: 'Appointment of Chairperson & Confirmation of Notice & Quorum', category: 'Procedural', checked: true },
    { id: 2, text: 'Leave of Absence granted to Directors unable to attend', category: 'Procedural', checked: true },
    { id: 3, text: 'Reading, confirmation, and signing of Minutes of previous Board Meeting', category: 'Governance', checked: true },
    { id: 4, text: 'Review and approval of Unaudited/Audited Financial Results for the period', category: 'Finance', checked: false },
    { id: 5, text: 'Review of Statutory Compliance Report and regulatory updates', category: 'Compliance', checked: false },
    { id: 6, text: 'Noting of Disclosure of Interest by Directors in Form MBP-1 (Section 184)', category: 'Compliance', checked: false },
    { id: 7, text: 'Review and approval of Related Party Transactions (Section 188 / Audit Committee)', category: 'RPT', checked: false },
    { id: 8, text: 'Approval of Loans, Guarantees, or Investments under Section 186', category: 'Finance', checked: false },
    { id: 9, text: 'Noting of Share Transfer / Demat / Allotment register entries', category: 'Secretarial', checked: false }
  ]);

  const [newItemText, setNewItemText] = useState('');

  // Math Calculations for Quorum (Section 174(1))
  const numStrength = Math.max(1, parseInt(totalStrength, 10) || 1);
  const oneThirdRaw = numStrength / 3;
  const roundedUpOneThird = Math.ceil(oneThirdRaw);
  const calculatedQuorum = Math.max(2, roundedUpOneThird);

  // Disinterested quorum check
  const disinterestedDirectors = Math.max(0, numStrength - (parseInt(interestedDirectors, 10) || 0));
  const hasDisinterestedQuorum = disinterestedDirectors >= 2;

  // Date Calculations for Section 173 (120-Day Rule)
  const getNextMeetingDueDate = (lastDateStr) => {
    if (!lastDateStr) return '';
    const d = new Date(lastDateStr);
    if (isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + 120);
    return d.toISOString().split('T')[0];
  };

  const nextMeetingDue = getNextMeetingDueDate(lastMeetingDate);

  const getDaysRemaining = (dueDateStr) => {
    if (!dueDateStr) return 0;
    const due = new Date(dueDateStr);
    const today = new Date();
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining(nextMeetingDue);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Agenda Checklist Helpers
  const toggleAgendaItem = (id) => {
    setAgendaItems(agendaItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addAgendaItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setAgendaItems([
      ...agendaItems,
      { id: Date.now(), text: newItemText.trim(), category: 'Custom', checked: false }
    ]);
    setNewItemText('');
  };

  const removeAgendaItem = (id) => {
    setAgendaItems(agendaItems.filter(item => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white border border-line rounded-2xl p-8 card-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-line">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="eyebrow block">§ Compliance Tool</span>
              <span className="px-3 py-0.5 bg-mint text-forest font-semibold text-xs rounded-full">
                Section 173 &amp; 174, Companies Act 2013
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display text-forest-deep">Board Meeting Planner</h1>
            <p className="text-ink-soft mt-1">
              Calculate statutory quorum, track the 120-day meeting frequency rule, and build compliant meeting agendas.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="cursor-target inline-flex items-center gap-2 px-4 py-2.5 bg-paper border border-line text-forest font-semibold text-xs rounded-xl hover:bg-mint transition-colors self-start md:self-auto"
          >
            <Printer className="w-4 h-4" /> Print / Export Agenda
          </button>
        </div>

        {/* ─── SECTION 1: QUORUM CALCULATOR ─── */}
        <div className="pt-6 space-y-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-leaf" />
            <h2 className="text-xl font-semibold text-forest-deep">1. Statutory Quorum Calculator (Section 174)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-paper p-6 rounded-2xl border border-line">
            <div>
              <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
                Total Director Strength in Office
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={totalStrength}
                onChange={(e) => setTotalStrength(e.target.value)}
                className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-white text-base text-ink font-bold focus:outline-none focus:border-forest"
              />
              <p className="text-xs text-ink-soft mt-1">Excludes vacant seats on the Board.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
                Interested Directors (For Item)
              </label>
              <input
                type="number"
                min="0"
                max={numStrength}
                value={interestedDirectors}
                onChange={(e) => setInterestedDirectors(e.target.value)}
                className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-white text-base text-ink font-bold focus:outline-none focus:border-forest"
              />
              <p className="text-xs text-ink-soft mt-1">Directors concerned/interested under Sec 184.</p>
            </div>

            {/* Result Card */}
            <div className="bg-white border border-mint-deep rounded-xl p-5 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1">
                Calculated Statutory Quorum
              </span>
              <div className="text-4xl font-display text-forest-deep font-bold">
                {calculatedQuorum} <span className="text-base font-normal text-ink-soft">Directors</span>
              </div>
              <span className="mt-2 text-xs font-medium text-leaf bg-mint px-3 py-0.5 rounded-full">
                Max( 2 , Ceil( {numStrength} / 3 ) ) = {calculatedQuorum}
              </span>
            </div>
          </div>

          {/* Math & Rule Step Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white border border-line rounded-xl space-y-1">
              <span className="font-semibold text-forest-deep block">Step 1: One-Third Rule</span>
              <p className="text-ink-soft">1/3rd of {numStrength} = <strong>{oneThirdRaw.toFixed(2)}</strong></p>
              <p className="text-ink-soft">Rounded UP to next whole number = <strong>{roundedUpOneThird}</strong></p>
            </div>
            <div className="p-4 bg-white border border-line rounded-xl space-y-1">
              <span className="font-semibold text-forest-deep block">Step 2: Statutory Floor (2 Directors)</span>
              <p className="text-ink-soft">Statutory minimum is 2 directors.</p>
              <p className="text-forest font-semibold">Higher of ({roundedUpOneThird}, 2) = {calculatedQuorum} directors.</p>
            </div>
            <div className="p-4 bg-white border border-line rounded-xl space-y-1">
              <span className="font-semibold text-forest-deep block">Step 3: Video Participation</span>
              <p className="text-ink-soft">Directors attending via Video/Audio-Visual means <strong>count towards quorum</strong> under Section 174(1).</p>
            </div>
          </div>

          {/* AOA Note & Disinterested Quorum Alert */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700" /> Articles of Association (AOA) Note &amp; Disinterested Quorum
            </div>
            <p className="leading-relaxed">
              • <strong>Statutory Floor vs. AOA:</strong> A company's Articles of Association (AOA) may validly prescribe a <em>higher</em> quorum requirement than this statutory floor.
            </p>
            {interestedDirectors > 0 && (
              <p className="leading-relaxed font-medium">
                • <strong>Interested Directors Rule (Section 174(2)):</strong> {disinterestedDirectors} disinterested directors available. {hasDisinterestedQuorum ? 'Quorum requirement satisfied.' : 'If disinterested directors fall below 2, disinterested quorum is not met for that specific item!'}
              </p>
            )}
          </div>
        </div>

        {/* ─── SECTION 2: 120-DAY MEETING FREQUENCY CALCULATOR ─── */}
        <div className="pt-8 border-t border-line space-y-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-leaf" />
            <h2 className="text-xl font-semibold text-forest-deep">2. Meeting Frequency &amp; 120-Day Gap Tracker (Section 173)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-paper p-6 rounded-2xl border border-line">
            <div>
              <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
                Date of Last Board Meeting
              </label>
              <input
                type="date"
                value={lastMeetingDate}
                onChange={(e) => setLastMeetingDate(e.target.value)}
                className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-white text-sm text-ink font-medium focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
                Statutory Next Meeting Deadline
              </label>
              <div className="w-full border border-line rounded-xl px-4 py-2.5 bg-white text-sm font-bold text-forest-deep">
                {formatDate(nextMeetingDue)}
              </div>
              <p className="text-xs text-ink-soft mt-1">Exactly +120 days from last meeting date.</p>
            </div>

            <div className="bg-white border border-line rounded-xl p-5 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1">
                Compliance Countdown
              </span>
              <div className={`text-2xl font-bold font-display ${daysRemaining < 15 ? 'text-red-600' : 'text-forest-deep'}`}>
                {daysRemaining >= 0 ? `${daysRemaining} Days Remaining` : `${Math.abs(daysRemaining)} Days OVERDUE!`}
              </div>
              <span className={`mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                daysRemaining < 0
                  ? 'bg-red-100 text-red-800'
                  : daysRemaining < 15
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-mint text-forest'
              }`}>
                {daysRemaining >= 0 ? 'Within Statutory Limit' : 'Non-Compliant — Schedule Immediately'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── SECTION 3: STANDARD BOARD MEETING AGENDA CHECKLIST ─── */}
        <div className="pt-8 border-t border-line space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-leaf" />
              <h2 className="text-xl font-semibold text-forest-deep">3. Standard Board Agenda Builder (SS-1 Compliant)</h2>
            </div>
            <span className="text-xs text-ink-soft">
              {agendaItems.filter(i => i.checked).length} of {agendaItems.length} items checked for draft agenda
            </span>
          </div>

          <form onSubmit={addAgendaItem} className="flex gap-3">
            <input
              type="text"
              placeholder="Add custom agenda item (e.g. Approval of new bank account opening)..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="cursor-target flex-grow border border-line rounded-xl px-4 py-2.5 bg-paper text-sm text-ink focus:outline-none focus:border-forest"
            />
            <button
              type="submit"
              className="cursor-target px-5 py-2.5 bg-forest text-white font-medium text-sm rounded-xl hover:bg-leaf transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </form>

          <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden card-shadow">
            {agendaItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-paper/60 transition-colors"
              >
                <div className="flex items-center gap-3 flex-grow">
                  <button
                    type="button"
                    onClick={() => toggleAgendaItem(item.id)}
                    className="cursor-target text-forest hover:text-leaf"
                  >
                    {item.checked ? <CheckSquare className="w-5 h-5 text-leaf" /> : <Square className="w-5 h-5 text-ink-soft" />}
                  </button>
                  <span className="text-xs font-bold text-ink-soft w-6">{idx + 1}.</span>
                  <span className={`text-sm ${item.checked ? 'text-forest-deep font-semibold' : 'text-ink-soft'}`}>
                    {item.text}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 bg-mint-deep/20 text-forest font-semibold text-xs rounded">
                    {item.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(item.id)}
                    className="cursor-target p-1 text-ink-soft hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
