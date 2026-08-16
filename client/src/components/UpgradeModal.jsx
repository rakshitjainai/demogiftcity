import React, { useState } from 'react';
import { Lock, Check, Sparkles, X, ArrowRight, ShieldCheck, Zap, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UpgradeModal({
  isOpen,
  onClose,
  sectionKey = 'job_ready', // 'job_ready' | 'interactive_regulations' | 'quizzes'
  title,
  message
}) {
  const { buyPass } = useAuth();
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  // Determine section specific pass info
  const getSectionDetails = () => {
    switch (sectionKey) {
      case 'exam_ready':
      case 'mock_test':
        return {
          passId: 'exam_ready',
          name: 'ExamReady Mock Test Pass',
          price: '₹499',
          scope: 'ExamReady Mock Test Section',
          description: 'Unlock complete 100-question CMI exam simulation, detailed question reviews, topic breakdowns, and negative marking analysis.'
        };
      case 'interactive_regulations':
      case 'regulations':
        return {
          passId: 'interactive_regulations',
          name: 'Interactive Regulations Pass',
          price: '₹499',
          scope: 'Complete Regulations',
          description: 'Unlock all chapters, statutory provisions, practical explanations, and risk points across all regulations.'
        };
      case 'quizzes':
      case 'diagnostic':
        return {
          passId: 'quizzes',
          name: 'Quizzes & Diagnostics Pass',
          price: '₹499',
          scope: 'Complete Quizzes Section',
          description: 'Unlock all quiz topics, diagnostic assessments, and detailed answer explanations.'
        };
      case 'job_ready':
      case 'job':
      case 'learn':
      default:
        return {
          passId: 'job_ready',
          name: 'FME & Job Interview Ready Pass',
          price: '₹499',
          scope: 'Complete Job Section',
          description: 'Unlock all 7 Fund Management & CMI modules, interview Q&A, case judgements, and simulations.'
        };
    }
  };

  const sectionDetails = getSectionDetails();

  const handlePurchase = (passId) => {
    buyPass(passId);
    setSuccessMsg(passId === 'full_access' ? '🎉 All-Access Membership Unlocked!' : `🎉 ${sectionDetails.name} Unlocked!`);
    setTimeout(() => {
      setSuccessMsg(null);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-forest-deep via-forest to-slate-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center border border-gold/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-mint uppercase tracking-wider block">
                Free Quota Reached (2 Modules Free)
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white leading-tight">
                {title || 'Unlock Locked Content'}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
            {message || 'You have accessed the 2 free modules. Choose a membership pass below to unlock full content immediately.'}
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-600 text-white p-4 text-center font-bold text-sm animate-bounce">
            {successMsg}
          </div>
        )}

        {/* Options Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* OPTION 1: Section Pass (₹499) */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-forest/50 transition-all hover-lift">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-800 text-[11px] font-bold uppercase tracking-wider">
                    Option 1 · Section Pass
                  </span>
                </div>

                <h3 className="text-lg font-display font-bold text-forest-deep mb-1">
                  {sectionDetails.name}
                </h3>
                <p className="text-xs text-ink-soft mb-4">
                  {sectionDetails.description}
                </p>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-display font-bold text-forest-deep">₹499</span>
                  <span className="text-xs text-ink-soft">one-time</span>
                </div>

                <ul className="space-y-2.5 text-xs text-ink mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Full access to <strong>{sectionDetails.scope}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>All locked modules &amp; topics unlocked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Practical guidance &amp; regulatory analysis</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handlePurchase(sectionDetails.passId)}
                className="cursor-target w-full py-3 bg-forest text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-forest-deep transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Buy Section Pass — ₹499</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* OPTION 2: RegMate All-Access Pass (₹1,999/yr) - Featured */}
            <div className="bg-gradient-to-b from-amber-50/60 to-white border-2 border-gold rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg relative hover-lift">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <Crown className="w-3 h-3 fill-current" /> Most Popular (Best Value)
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="px-2.5 py-1 rounded-md bg-gold/20 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
                    Option 2 · Full Access
                  </span>
                </div>

                <h3 className="text-lg font-display font-bold text-forest-deep mb-1">
                  RegMate All-Access Pass
                </h3>
                <p className="text-xs text-ink-soft mb-4">
                  Complete unlimited access across the entire RegMate platform for 1 full year.
                </p>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-display font-bold text-forest-deep">₹1,999</span>
                  <span className="text-xs text-ink-soft">/ year</span>
                </div>

                <ul className="space-y-2.5 text-xs text-ink mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong>All Job &amp; Interview Ready</strong> modules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Full Interactive Regulations</strong> browser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong>All Quizzes &amp; Diagnostic Tests</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Compliance Tools, Formats &amp; Templates</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handlePurchase('full_access')}
                className="cursor-target w-full py-3 bg-gradient-to-r from-amber-600 via-gold to-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm hover:brightness-105 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Get Full Access — ₹1,999/yr</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Bottom Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-ink-soft pt-2 border-t border-line">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Instant Activation · 100% Money Back Guarantee</span>
          </div>
        </div>

      </div>
    </div>
  );
}
