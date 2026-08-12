import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Calendar, HelpCircle, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { SAMPLE_QUIZ_QUESTIONS } from '../data/mockData';

export default function ToolModal({ toolTitle, onClose }) {
  const [activeTab, setActiveTab] = useState('interactive');
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Diagnostic Checklist State
  const [diagnosticChecklist, setDiagnosticChecklist] = useState({
    cdd: true,
    pep: false,
    str: true,
    audit: false,
    kmp: true
  });

  const handleOptionSelect = (idx) => {
    setSelectedOption(idx);
  };

  const handleNextQuiz = () => {
    if (selectedOption === SAMPLE_QUIZ_QUESTIONS[currentQuizIdx].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
    if (currentQuizIdx < SAMPLE_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const toggleDiagnostic = (key) => {
    setDiagnosticChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getDiagnosticScore = () => {
    const total = Object.keys(diagnosticChecklist).length;
    const checked = Object.values(diagnosticChecklist).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-reg-green flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {toolTitle || 'Compliance Tool Simulator'}
              </h2>
              <p className="text-xs text-slate-500">Interactive RegMate Utility & Self-Assessment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 custom-scrollbar">
          
          {/* Tool Type 1: Quiz / Knowledge Test */}
          {(toolTitle?.includes('Quiz') || toolTitle?.includes('Test') || toolTitle?.includes('Mock')) && (
            <div className="space-y-6">
              {!quizFinished ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 pb-3">
                    <span>Question {currentQuizIdx + 1} of {SAMPLE_QUIZ_QUESTIONS.length}</span>
                    <span className="text-reg-green bg-emerald-50 px-2.5 py-1 rounded-full">
                      Score: {quizScore}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {SAMPLE_QUIZ_QUESTIONS[currentQuizIdx].question}
                  </h3>

                  <div className="space-y-2.5">
                    {SAMPLE_QUIZ_QUESTIONS[currentQuizIdx].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                          selectedOption === idx
                            ? 'bg-emerald-50 border-reg-green text-reg-green shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{opt}</span>
                        {selectedOption === idx && <CheckCircle2 className="w-4 h-4 text-reg-green ml-2" />}
                      </button>
                    ))}
                  </div>

                  {selectedOption !== null && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1 animate-in fade-in">
                      <div className="font-bold flex items-center space-x-1">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Regulatory Explanation:</span>
                      </div>
                      <p className="leading-relaxed">{SAMPLE_QUIZ_QUESTIONS[currentQuizIdx].explanation}</p>
                    </div>
                  )}

                  <div className="pt-3 flex justify-end">
                    <button
                      disabled={selectedOption === null}
                      onClick={handleNextQuiz}
                      className="px-6 py-2.5 rounded-xl bg-reg-green disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                    >
                      <span>{currentQuizIdx === SAMPLE_QUIZ_QUESTIONS.length - 1 ? 'Finish Test' : 'Next Question'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-reg-green mx-auto flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Quiz Completed!</h3>
                  <p className="text-sm text-slate-600">
                    You scored <strong className="text-reg-green">{quizScore} / {SAMPLE_QUIZ_QUESTIONS.length}</strong> on the compliance drill.
                  </p>
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-2.5 rounded-xl bg-reg-green text-white font-bold text-xs inline-flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retake Quiz</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tool Type 2: AML/CFT Diagnostic */}
          {(toolTitle?.includes('AML') || toolTitle?.includes('Diagnostic')) && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold">Entity Readiness Rating</h3>
                  <p className="text-xs text-emerald-200">Based on IFSCA & FIU-IND compliance checks</p>
                </div>
                <div className="text-2xl font-black text-amber-300 bg-white/10 px-3 py-1 rounded-xl">
                  {getDiagnosticScore()}% Ready
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500">Key Audit Controls Check:</h4>
                
                {[
                  { key: 'cdd', label: 'Customer Due Diligence (CDD) & Ultimate Beneficial Owner (UBO) identification documented' },
                  { key: 'pep', label: 'Politically Exposed Persons (PEP) screening automated against sanctions databases' },
                  { key: 'str', label: 'Suspicious Transaction Reporting (STR) procedure established with designated Principal Officer' },
                  { key: 'audit', label: 'Independent annual AML audit completed by qualified auditor within last 12 months' },
                  { key: 'kmp', label: 'Key Managerial Personnel (KMP) statutory fit and proper certificates updated' }
                ].map(item => (
                  <div
                    key={item.key}
                    onClick={() => toggleDiagnostic(item.key)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-reg-green bg-slate-50 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${diagnosticChecklist[item.key] ? 'bg-reg-green text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Type 3: Compliance Calendar Generator */}
          {(toolTitle?.includes('Calendar') || !toolTitle?.includes('Quiz')) && !toolTitle?.includes('AML') && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-600">Select GIFT City Entity Type:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Authorised FME', 'Registered FME', 'Capital Market Intermediary', 'Ancillary Service Provider', 'Banking Unit'].map((ent, idx) => (
                    <button
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${idx === 0 ? 'bg-emerald-50 border-reg-green text-reg-green' : 'bg-white border-slate-200 text-slate-700'}`}
                    >
                      {ent}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Upcoming Statutory Deadlines:</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Quarterly Portfolio Report Filing</div>
                      <div className="text-[11px] text-slate-500">Form FME-Q3 under IFSCA (FM) Regulations</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold">Due: Aug 15</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Annual Secretarial Audit Filing (Form MR-3)</div>
                      <div className="text-[11px] text-slate-500">Section 204 Companies Act 2013</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">Due: Sep 30</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">RegMate Interactive Tools Suite</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-reg-green text-white font-bold text-xs hover:bg-reg-green-dark transition-colors"
          >
            Close Tool
          </button>
        </div>

      </div>
    </div>
  );
}
