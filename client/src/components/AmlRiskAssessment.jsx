import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Info, RefreshCw, ChevronRight } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    title: '1. Written AML/CFT Policy Framework',
    question: 'Does your entity have a formally approved, written Anti-Money Laundering & Countering the Financing of Terrorism (AML/CFT) policy document updated for IFSCA / PMLA guidelines?',
    category: 'Governance'
  },
  {
    id: 2,
    title: '2. Appointment of Principal Officer & Designated Director',
    question: 'Has your Board designated a qualified Principal Officer (PO) and Designated Director responsible for regulatory compliance and reporting to FIU-IND?',
    category: 'Governance'
  },
  {
    id: 3,
    title: '3. Customer Due Diligence (CDD) & KYC Procedures',
    question: 'Are standardized Customer Due Diligence (CDD) and Beneficial Ownership (BO) identification processes enforced before onboarding any client?',
    category: 'CDD/KYC'
  },
  {
    id: 4,
    title: '4. Enhanced Due Diligence (EDD) & PEP Screening',
    question: 'Do you conduct Enhanced Due Diligence (EDD) for Politically Exposed Persons (PEPs), high-risk geographic locations, or complex corporate structures?',
    category: 'CDD/KYC'
  },
  {
    id: 5,
    title: '5. Suspicious Transaction Reporting (STR) Mechanism',
    question: 'Is there an established, confidential procedure for employees to escalate red flags and file Suspicious Transaction Reports (STRs) with FIU-IND?',
    category: 'Reporting'
  },
  {
    id: 6,
    title: '6. Sanctions & Targeted Financial Sanctions Screening',
    question: 'Are all prospective and existing clients screened against UN Security Council (UNSC) lists, MHA proscribed lists, and global sanctions databases?',
    category: 'Sanctions'
  },
  {
    id: 7,
    title: '7. Periodic Employee Training & Awareness',
    question: 'Is mandatory AML/CFT training conducted at least annually for all relevant staff, management, and customer-facing employees?',
    category: 'Training'
  },
  {
    id: 8,
    title: '8. Document & Transaction Record Retention Policy',
    question: 'Does your record retention policy mandate storing client CDD records and transaction logs for at least 5 years following account closure?',
    category: 'Records'
  },
  {
    id: 9,
    title: '9. Independent Internal Audit & Review',
    question: 'Is an independent audit (internal or external) conducted periodically to test the effectiveness of your AML compliance controls?',
    category: 'Audit'
  },
  {
    id: 10,
    title: '10. Risk-Based Categorization of Clients',
    question: 'Do you systematically classify clients into Low, Medium, and High-Risk categories based on business nature, geography, and transaction pattern?',
    category: 'Risk Scoring'
  }
];

export default function AmlRiskAssessment() {
  // Answers state: { [qId]: 'Yes' | 'Partial' | 'No' }
  const [answers, setAnswers] = useState({
    1: 'Yes',
    2: 'Yes',
    3: 'Yes',
    4: 'Partial',
    5: 'Partial',
    6: 'No',
    7: 'Partial',
    8: 'Yes',
    9: 'No',
    10: 'Partial'
  });

  const [submitted, setSubmitted] = useState(true);

  const handleSelect = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const calculateScore = () => {
    let score = 0;
    Object.values(answers).forEach(val => {
      if (val === 'Yes') score += 10;
      else if (val === 'Partial') score += 5;
    });
    return score;
  };

  const score = calculateScore();
  const maxScore = QUESTIONS.length * 10;
  const percentage = Math.round((score / maxScore) * 100);

  const getRiskBand = (pct) => {
    if (pct >= 85) {
      return {
        label: 'Strong AML Preparedness',
        color: 'text-leaf',
        bgColor: 'bg-mint-deep/30 border-mint',
        desc: 'Your organization demonstrates robust AML/CFT controls aligned with IFSCA and PMLA standards.'
      };
    }
    if (pct >= 60) {
      return {
        label: 'Needs Improvement / Moderate Risk',
        color: 'text-amber-800',
        bgColor: 'bg-amber-50 border-amber-300',
        desc: 'Core framework exists, but critical gaps in screening, EDD, or audit mechanisms require remediation.'
      };
    }
    return {
      label: 'High Risk Gaps — Action Required',
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-300',
      desc: 'Substantial compliance deficiencies detected. Urgent legal and regulatory review is advised.'
    };
  };

  const band = getRiskBand(percentage);

  const gapItems = QUESTIONS.filter(q => answers[q.id] === 'No' || answers[q.id] === 'Partial');

  const resetForm = () => {
    const cleared = {};
    QUESTIONS.forEach(q => { cleared[q.id] = 'No'; });
    setAnswers(cleared);
    setSubmitted(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white border border-line rounded-2xl p-8 card-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-line">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="eyebrow block">§ Diagnostic Tool</span>
              <span className="px-3 py-0.5 bg-mint text-forest font-semibold text-xs rounded-full">
                IFSCA / PMLA / FIU-IND
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display text-forest-deep">AML/CFT Risk Assessment</h1>
            <p className="text-ink-soft mt-1">
              Evaluate your entity's Anti-Money Laundering and Counter-Terrorist Financing readiness using our 10-point audit scorecard.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="cursor-target inline-flex items-center gap-2 px-4 py-2.5 bg-paper border border-line text-forest font-semibold text-xs rounded-xl hover:bg-mint transition-colors self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" /> Reset Assessment
          </button>
        </div>

        {/* Live Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-paper border border-line rounded-xl p-5 flex flex-col justify-center items-center text-center">
            <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1">
              Diagnostic Readiness Score
            </span>
            <div className="text-4xl font-display text-forest-deep font-bold">
              {percentage}%
            </div>
            <span className="text-xs text-ink-soft mt-1">
              {score} of {maxScore} total points
            </span>
          </div>

          <div className={`border rounded-xl p-5 md:col-span-2 flex flex-col justify-center ${band.bgColor}`}>
            <span className="text-xs font-semibold uppercase tracking-wider block mb-1">
              Readiness Band
            </span>
            <h3 className={`text-xl font-bold font-display ${band.color}`}>{band.label}</h3>
            <p className="text-xs text-ink mt-1 leading-relaxed">{band.desc}</p>
          </div>
        </div>
      </div>

      {/* Actionable Gaps Summary Card */}
      {gapItems.length > 0 && (
        <div className="bg-white border border-line rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="text-xl font-semibold text-forest-deep">
              Key Compliance Gaps to Address ({gapItems.length} Items)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gapItems.map(q => {
              const status = answers[q.id];
              return (
                <div key={q.id} className="p-4 bg-paper border border-line rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-forest-deep">{q.title}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      status === 'No' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {status === 'No' ? 'Missing (0 Pts)' : 'Partial (5 Pts)'}
                    </span>
                  </div>
                  <p className="text-ink-soft leading-relaxed">{q.question}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 10-Question Diagnostic Form */}
      <div className="bg-white border border-line rounded-2xl p-6 card-shadow space-y-6">
        <h3 className="text-xl font-semibold text-forest-deep pb-4 border-b border-line">
          10-Point AML Audit Scorecard
        </h3>

        <div className="space-y-6">
          {QUESTIONS.map((q) => {
            const currentVal = answers[q.id] || 'No';

            return (
              <div key={q.id} className="p-6 bg-paper border border-line rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-semibold text-forest-deep text-base">{q.title}</h4>
                  <span className="px-2.5 py-0.5 bg-mint text-forest font-semibold text-xs rounded-full self-start sm:self-auto">
                    {q.category}
                  </span>
                </div>

                <p className="text-sm text-ink-soft leading-relaxed">{q.question}</p>

                {/* Option Buttons */}
                <div className="flex items-center gap-3 flex-wrap pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelect(q.id, 'Yes')}
                    className={`cursor-target px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      currentVal === 'Yes'
                        ? 'bg-forest text-white shadow-md'
                        : 'bg-white border border-line text-ink-soft hover:bg-mint'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Yes — Fully Compliant (10 Pts)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect(q.id, 'Partial')}
                    className={`cursor-target px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      currentVal === 'Partial'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-white border border-line text-ink-soft hover:bg-amber-50'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" /> Partial / In Progress (5 Pts)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect(q.id, 'No')}
                    className={`cursor-target px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      currentVal === 'No'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-white border border-line text-ink-soft hover:bg-red-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> No / Missing (0 Pts)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Statutory & Regulatory Disclaimer */}
      <div className="p-6 bg-paper border border-line rounded-2xl text-xs text-ink-soft leading-relaxed space-y-2 card-shadow">
        <div className="flex items-center gap-2 font-semibold text-forest-deep">
          <Info className="w-4 h-4 text-leaf" /> Regulatory Self-Assessment Disclaimer
        </div>
        <p className="font-serif italic text-forest-deep/90">
          "This diagnostic is provided for educational and self-assessment purposes only and does not constitute legal, regulatory, or compliance advice. Completion of this questionnaire does not guarantee compliance with IFSCA, PMLA, or FIU-IND requirements. Consult a qualified compliance professional for a formal audit."
        </p>
      </div>
    </div>
  );
}
