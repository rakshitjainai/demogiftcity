import React, { useState, useEffect } from 'react';
import { Lock, Check, Sparkles, X, ArrowRight, ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UpgradeModal({
  isOpen,
  onClose,
  sectionKey = 'job_ready',
  courseSlug,
  title,
  message
}) {
  const { initiateCheckout, user } = useAuth();
  const [successMsg, setSuccessMsg] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [loadingType, setLoadingType] = useState(null);

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

  const getSectionDetails = () => {
    const key = courseSlug || sectionKey;

    if (key === 'REGREADY_FME_001' || key === 'fme-full-length-mock-test' || key === 'fme_mock') {
      return {
        passId: 'REGREADY_FME_001',
        productType: 'exam_pass',
        productId: 'REGREADY_FME_001',
        name: 'FME Mock Test Pass (REGREADY_FME_001)',
        price: '₹499',
        scope: 'IFSCA FME 100-Question Mock Test',
        description: 'Unlock complete 100-question simulation, domain analytics, full statutory answer review, and certificate.'
      };
    }

    if (key === 'cmi-full-length-mock-test' || key === 'cmi_mock') {
      return {
        passId: 'ifsca-cmi',
        productType: 'exam_pass',
        productId: 'ifsca-cmi',
        name: 'IFSCA CMI Mock Test Pass',
        price: '₹499',
        scope: 'IFSCA CMI 100-Question Mock Test',
        description: 'Unlock full 100-question CMI examination simulation, scoring breakdown, and statutory citation reviews.'
      };
    }

    const courseNames = {
      'ifsca-cmi': 'IFSCA Capital Market Intermediaries Course Pass',
      'sebi-aif': 'SEBI Alternative Investment Funds Course Pass',
      'ifsca-fme': 'IFSCA Fund Management Entities Course Pass'
    };

    return {
      passId: key || 'ifsca-cmi',
      productType: 'course',
      productId: key || 'ifsca-cmi',
      name: courseNames[key] || `${(key || 'Course').toUpperCase()} Pass`,
      price: '₹499',
      scope: `${(key || 'Course').toUpperCase()} Regulatory Master`,
      description: 'Unlock complete chapter curriculum, practitioner guidance, and assessments.'
    };
  };

  const sectionDetails = getSectionDetails();

  const handlePurchase = async (type, prodId) => {
    setCheckoutError(null);
    setLoadingType(type);

    await initiateCheckout({
      productType: type,
      productId: prodId || (type === 'membership' ? 'full_access' : sectionDetails.productId),
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
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-line overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-forest-deep via-forest to-forest-deep text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2 pr-10">
            <div
              className="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center border border-gold/30 flex-shrink-0"
              aria-hidden="true"
            >
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-mint uppercase tracking-wider block">
                Free Quota Reached
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white leading-tight">
                {title || 'Unlock Full RegMate Access'}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
            {message || 'You have reached the free preview limit. Select a pass below to unlock immediate full access.'}
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-leaf text-white p-3 text-center font-bold text-sm">
            {successMsg}
          </div>
        )}

        {/* Error Alert */}
        {checkoutError && (
          <div className="bg-rose-50 text-rose-800 p-3 text-center text-xs font-semibold border-b border-rose-200">
            {checkoutError}
          </div>
        )}

        {/* Options Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* OPTION 1: Single Pass (₹499) */}
            <div className="bg-paper border-2 border-line rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-forest/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-mint text-forest text-[11px] font-bold uppercase tracking-wider border border-mint-deep">
                    Option 1 · Single Pass
                  </span>
                </div>

                <h3 className="text-base font-display font-bold text-forest-deep mb-1">
                  {sectionDetails.name}
                </h3>
                <p className="text-xs text-ink-soft mb-4 leading-relaxed">
                  {sectionDetails.description}
                </p>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-display font-bold text-forest-deep">₹499</span>
                  <span className="text-xs text-ink-soft">one-time</span>
                </div>

                <ul className="space-y-2.5 text-xs text-ink mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-leaf flex-shrink-0 mt-0.5" />
                    <span>Full access to <strong>{sectionDetails.scope}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-leaf flex-shrink-0 mt-0.5" />
                    <span>All locked questions &amp; modules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-leaf flex-shrink-0 mt-0.5" />
                    <span>Scoring analytics &amp; verified certificate</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handlePurchase(sectionDetails.productType, sectionDetails.productId)}
                disabled={loadingType === sectionDetails.productType}
                className="w-full py-3 bg-forest text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-forest-deep transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loadingType === sectionDetails.productType ? 'Opening Checkout...' : `Buy Single Pass — ₹499`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* OPTION 2: RegMate All-Access Pass (₹1,999/yr) - Featured */}
            <div className="bg-gradient-to-b from-mint/40 to-white border-2 border-gold rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <Crown className="w-3 h-3 fill-current" /> Most Popular (Best Value)
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="px-2.5 py-1 rounded-md bg-gold/15 text-amber-900 text-[11px] font-bold uppercase tracking-wider border border-gold/30">
                    Option 2 · Full Platform
                  </span>
                </div>

                <h3 className="text-base font-display font-bold text-forest-deep mb-1">
                  RegMate All-Access Membership
                </h3>
                <p className="text-xs text-ink-soft mb-4 leading-relaxed">
                  Complete unlimited access across every mock test, regulatory course, tool, and certificate for 1 year.
                </p>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-display font-bold text-forest-deep">₹1,999</span>
                  <span className="text-xs text-ink-soft">/ year</span>
                </div>

                <ul className="space-y-2.5 text-xs text-ink mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong>All Mock Tests</strong> (FME, CMI, LODR, AIF)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong>All RegLearn &amp; RegLens</strong> modules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span><strong>Interview &amp; Role Prep</strong> tracks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>All Compliance Tools &amp; Templates</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handlePurchase('membership', 'full_access')}
                disabled={loadingType === 'membership'}
                className="w-full py-3 bg-forest text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-forest-deep transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loadingType === 'membership' ? 'Opening Checkout...' : 'Join All-Access — ₹1,999/yr'}</span>
                <Sparkles className="w-4 h-4 text-gold" />
              </button>
            </div>

          </div>

          {/* Bottom Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-ink-soft pt-2 border-t border-line">
            <ShieldCheck className="w-4 h-4 text-leaf" />
            <span>Instant Server Verification · 256-bit Secure Razorpay Checkout</span>
          </div>
        </div>

      </div>
    </div>
  );
}
