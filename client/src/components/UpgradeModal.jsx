import React, { useState } from 'react';
import { Lock, Check, Sparkles, X, ArrowRight, ShieldCheck, Zap, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UpgradeModal({
  isOpen,
  onClose,
  sectionKey = 'job_ready', // 'job_ready' | 'interactive_regulations' | 'quizzes'
  courseSlug,
  title,
  message
}) {
  const { initiateCheckout, user } = useAuth();
  const [successMsg, setSuccessMsg] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [loadingType, setLoadingType] = useState(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine section specific pass info
  const getSectionDetails = () => {
    if (courseSlug) {
      const names = {
        'ifsca-cmi': 'IFSCA Capital Market Intermediaries Pass',
        'sebi-aif': 'SEBI Alternative Investment Funds Pass',
        'ifsca-fme': 'IFSCA Fund Management Entities Pass'
      };
      return {
        passId: courseSlug,
        productType: 'course',
        productId: courseSlug,
        name: names[courseSlug] || `${courseSlug.toUpperCase()} Course Pass`,
        price: '₹499',
        scope: `${(courseSlug || '').toUpperCase()} Regulatory Master Course`,
        description: `Unlock all chapters, practitioner notes, questions, and case scenarios in ${(courseSlug || '').toUpperCase()}.`
      };
    }

    switch (sectionKey) {
      case 'sebi-aif':
      case 'ifsca-cmi':
      case 'ifsca-fme':
        return {
          passId: sectionKey,
          productType: 'course',
          productId: sectionKey,
          name: `${sectionKey.toUpperCase()} Course Pass`,
          price: '₹499',
          scope: `${sectionKey.toUpperCase()} Regulatory Master`,
          description: 'Unlock complete chapter curriculum, practitioner guidance, and assessments.'
        };
      default:
        return {
          passId: 'ifsca-cmi',
          productType: 'course',
          productId: 'ifsca-cmi',
          name: 'Regulatory Master Single Course Pass',
          price: '₹499',
          scope: 'Selected Regulatory Course',
          description: 'Unlock all 17 chapters, statutory analyses, compliance notes, and diagnostic questions.'
        };
    }
  };

  const sectionDetails = getSectionDetails();

  const handlePurchase = async (type, prodId) => {
    setCheckoutError(null);
    setLoadingType(type);

    await initiateCheckout({
      productType: type,
      productId: prodId || (type === 'course' ? sectionDetails.productId : 'full_access'),
      onSuccess: (data) => {
        setLoadingType(null);
        setSuccessMsg(type === 'membership' ? '🎉 All-Access Membership Unlocked for 1 Year!' : `🎉 ${sectionDetails.name} Unlocked!`);
        setTimeout(() => {
          setSuccessMsg(null);
          if (onClose) onClose();
        }, 1500);
      },
      onError: (err) => {
        setLoadingType(null);
        setCheckoutError(err.message || 'Payment initiation failed.');
      },
      onCancel: () => {
        setLoadingType(null);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-forest-deep via-forest to-slate-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3 pr-10">
            <div
              className="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center border border-gold/30 pointer-events-none select-none flex-shrink-0"
              aria-hidden="true"
            >
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
                onClick={() => handlePurchase('course', sectionDetails.productId)}
                disabled={loadingType === 'course'}
                className="cursor-target w-full py-3 bg-forest text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-forest-deep transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loadingType === 'course' ? 'Opening Checkout...' : `Buy Course Pass — ₹499`}</span>
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
                onClick={() => handlePurchase('membership', 'full_access')}
                disabled={loadingType === 'membership'}
                className="cursor-target w-full py-3 bg-gradient-to-r from-amber-600 via-gold to-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm hover:brightness-105 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loadingType === 'membership' ? 'Opening Checkout...' : 'Get Full Access — ₹1,999/yr'}</span>
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
