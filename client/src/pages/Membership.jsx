import React, { useState } from 'react';
import { Check, Star, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Membership() {
  const { user, buyPass } = useAuth();
  const navigate = useNavigate();
  const [purchasedPass, setPurchasedPass] = useState(null);

  const handleBuy = (passType) => {
    buyPass(passType);
    setPurchasedPass(passType);
  };

  const isFullMember = user?.membershipStatus === 'active' || user?.subscriptions?.includes('full_access');

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="text-center mb-12 sm:mb-16">
        <span className="eyebrow block mb-4">§ Premium Access</span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-forest-deep mb-4 sm:mb-6">Flexible RegMate Plans</h1>
        <p className="text-base sm:text-xl text-ink-soft max-w-2xl mx-auto">
          Choose a single section pass or unlock full platform access for all legal, compliance, and regulatory modules.
        </p>
      </div>

      {purchasedPass && (
        <div className="mb-10 p-5 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            Pass Activated Successfully!
          </div>
          <p className="text-sm text-emerald-700">
            {purchasedPass === 'full_access'
              ? 'You now have full RegMate site access unlocked for 1 year!'
              : 'Your section pass is active. Restricted content in this category is unlocked.'}
          </p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-3 inline-flex items-center gap-2 px-6 py-2.5 bg-forest text-white font-semibold rounded-xl text-sm hover:bg-leaf transition-colors"
          >
            Start Exploring Content &rarr;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Tier 1: ₹499 Section Pass */}
        <div className="bg-white border-2 border-line rounded-3xl p-8 card-shadow flex flex-col justify-between hover:border-forest/40 transition-colors">
          <div>
            <div className="inline-block px-3 py-1 bg-mint text-forest font-bold text-xs rounded-full uppercase mb-4">
              Category Option
            </div>
            <h2 className="text-2xl font-display text-forest-deep mb-2">Section Pass</h2>
            <p className="text-xs text-ink-soft mb-4">Unlock one targeted section for focused preparation.</p>
            
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-display text-forest-deep font-bold">₹499</span>
              <span className="text-ink-soft text-sm mb-1">/ one-time</span>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              {[
                'Unlock complete Job & Interview Ready section OR',
                'Unlock all Interactive Regulations & Chapters OR',
                'Unlock all Practice Quizzes & Mock Tests',
                'Full access to all 7 modules in selected section',
                'Practitioner notes & exam focus guidance'
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-leaf flex-shrink-0 mt-0.5" />
                  <span className="text-ink-soft">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <button
              onClick={() => handleBuy('job_ready')}
              className="cursor-target w-full py-3.5 bg-forest text-white rounded-2xl font-semibold hover:bg-leaf transition-colors text-sm min-h-[48px]"
            >
              Get Section Pass — ₹499
            </button>
          </div>
        </div>

        {/* Tier 2: ₹1,999/yr Full Site Access */}
        <div className="bg-white border-2 border-gold rounded-3xl p-8 card-shadow flex flex-col justify-between relative hover-lift">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-white font-bold tracking-wider uppercase text-xs px-5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-current" /> Best Value — All Access
          </div>

          <div>
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full uppercase mb-4 mt-2">
              Full Platform Access
            </div>
            <h2 className="text-2xl font-display text-forest-deep mb-2">RegMate All-Access Pass</h2>
            <p className="text-xs text-ink-soft mb-4">Complete site access to all current and future features.</p>
            
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-display text-forest-deep font-bold">₹1,999</span>
              <span className="text-ink-soft text-sm mb-1">/ year</span>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              {[
                'Unlimited access to all Job & Interview Ready modules',
                'Complete Interactive Regulations & Chapter provisions',
                'Unlimited Practice Quizzes & Diagnostic Tests',
                'Practitioner commentary by CS Prashant Kumar',
                'Downloadable compliance checklists & templates',
                'Priority support & early access to new regulatory updates'
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span className="text-forest-deep font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <button
              onClick={() => handleBuy('full_access')}
              className="cursor-target w-full py-4 bg-gold text-white rounded-2xl font-bold hover:bg-amber-600 transition-colors shadow-md text-base min-h-[52px]"
            >
              {isFullMember ? 'Pass Active ✓' : 'Get Full Site Access — ₹1,999/yr'}
            </button>
            <p className="text-center text-[11px] text-ink-soft mt-3">
              Instant activation. 100% secure payment.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
