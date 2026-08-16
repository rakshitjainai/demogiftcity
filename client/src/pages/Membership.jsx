import React, { useState } from 'react';
import { Check, Star, ShieldCheck, Sparkles, CheckCircle2, Lock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Membership() {
  const { user, isMember, initiateCheckout } = useAuth();
  const navigate = useNavigate();

  const [selectedCourse, setSelectedCourse] = useState('ifsca-cmi');
  const [loadingType, setLoadingType] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const purchasedCourses = (user?.coursePurchases || []).map(p => p.courseSlug);
  const isCourseOwned = purchasedCourses.includes(selectedCourse);

  const handleBuyCourse = async () => {
    if (!user) {
      setErrorMessage('Please log in or register before completing your purchase.');
      return;
    }
    setErrorMessage(null);
    setLoadingType('course');

    await initiateCheckout({
      productType: 'course',
      productId: selectedCourse,
      onSuccess: (data) => {
        setLoadingType(null);
        setSuccessMessage(`🎉 Successfully unlocked ${selectedCourse.toUpperCase()} Regulatory Master course!`);
      },
      onError: (err) => {
        setLoadingType(null);
        setErrorMessage(err.message || 'Payment could not be completed.');
      },
      onCancel: () => {
        setLoadingType(null);
      }
    });
  };

  const handleBuyMembership = async () => {
    if (!user) {
      setErrorMessage('Please log in or register before completing your purchase.');
      return;
    }
    setErrorMessage(null);
    setLoadingType('membership');

    await initiateCheckout({
      productType: 'membership',
      productId: 'full_access',
      onSuccess: (data) => {
        setLoadingType(null);
        setSuccessMessage('🎉 RegMate All-Access Annual Membership Activated (Valid for 1 Year)!');
      },
      onError: (err) => {
        setLoadingType(null);
        setErrorMessage(err.message || 'Payment could not be completed.');
      },
      onCancel: () => {
        setLoadingType(null);
      }
    });
  };

  const formattedExpiry = user?.membership?.expiresAt
    ? new Date(user.membership.expiresAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : null;

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="text-center mb-12 sm:mb-16">
        <span className="eyebrow block mb-4">§ Premium Access Plans</span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-forest-deep mb-4 sm:mb-6">
          Flexible Compliance Learning Passes
        </h1>
        <p className="text-base sm:text-xl text-ink-soft max-w-2xl mx-auto">
          Choose a single Regulatory Master course pass (₹499) or unlock full platform access for 1 year (₹1,999).
        </p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-10 p-5 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            {successMessage}
          </div>
          <p className="text-sm text-emerald-700">
            Your access entitlements have been verified and updated on your account.
          </p>
          <button
            onClick={() => navigate('/learning')}
            className="mt-3 inline-flex items-center gap-2 px-6 py-2.5 bg-forest text-white font-semibold rounded-xl text-sm hover:bg-leaf transition-colors cursor-pointer"
          >
            Start Learning Now &rarr;
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-10 p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700 text-sm font-semibold flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Membership Notice */}
      {isMember && (
        <div className="mb-10 p-6 bg-gradient-to-r from-[#073321] via-[#0b4d32] to-[#073321] text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-xl">
              ★
            </div>
            <div>
              <div className="text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                Active Annual Membership
              </div>
              <h3 className="text-xl font-serif font-bold text-white">RegMate All-Access Active</h3>
              <p className="text-xs text-emerald-100/80">Valid until {formattedExpiry || '1 Year from Purchase'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/learning')}
              className="px-5 py-2.5 bg-white text-[#073321] font-bold rounded-xl text-xs hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
            >
              Access All Courses &rarr;
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Tier 1: ₹499 Single Course Pass */}
        <div className="bg-white border-2 border-line rounded-3xl p-8 card-shadow flex flex-col justify-between hover:border-forest/40 transition-colors">
          <div>
            <div className="inline-block px-3 py-1 bg-mint text-forest font-bold text-xs rounded-full uppercase mb-4">
              Per-Course Option
            </div>
            <h2 className="text-2xl font-display text-forest-deep mb-2">Single Course Pass</h2>
            <p className="text-xs text-ink-soft mb-4">Unlock one specific Regulatory Master course for focused preparation.</p>
            
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-display text-forest-deep font-bold">₹499</span>
              <span className="text-ink-soft text-sm mb-1">/ one-time</span>
            </div>

            {/* Course Selector Dropdown */}
            <div className="mb-6 bg-paper p-4 rounded-2xl border border-line space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-deep">
                Select Target Course:
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-white border border-line rounded-xl p-2.5 text-xs font-bold text-forest-deep focus:outline-none focus:border-forest"
              >
                <option value="ifsca-cmi">IFSCA Capital Market Intermediaries (17 Chapters)</option>
                <option value="sebi-aif">SEBI Alternative Investment Funds (14 Chapters)</option>
                <option value="ifsca-fme">IFSCA Fund Management Entities (7 Modules)</option>
              </select>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              {[
                'Full access to all chapters & lessons in selected course',
                'Statutory codex cards & practitioner notes',
                'Chapter-wise compliance tips & watch-outs',
                'Unlimited diagnostic practice questions & answers',
                'Lifetime access to chosen course updates'
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-leaf flex-shrink-0 mt-0.5" />
                  <span className="text-ink-soft">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {isMember || isCourseOwned ? (
              <div className="w-full py-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl font-bold text-center text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isMember ? 'Included in All-Access' : 'Course Already Owned ✓'}</span>
              </div>
            ) : (
              <button
                onClick={handleBuyCourse}
                disabled={loadingType === 'course'}
                className="cursor-target w-full py-3.5 bg-forest text-white rounded-2xl font-semibold hover:bg-leaf transition-colors text-sm min-h-[48px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loadingType === 'course' ? 'Opening Razorpay...' : `Buy Course Pass — ₹499`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tier 2: ₹1,999/yr Full Site Access */}
        <div className="bg-white border-2 border-gold rounded-3xl p-8 card-shadow flex flex-col justify-between relative hover-lift">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-white font-bold tracking-wider uppercase text-xs px-5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-current" /> Best Value — All Access
          </div>

          <div>
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full uppercase mb-4 mt-2">
              Full Platform Access (1 Year)
            </div>
            <h2 className="text-2xl font-display text-forest-deep mb-2">RegMate All-Access Pass</h2>
            <p className="text-xs text-ink-soft mb-4">Complete platform access across all 3 Regulatory Master courses, compliance tools, and mock tests.</p>
            
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-display text-forest-deep font-bold">₹1,999</span>
              <span className="text-ink-soft text-sm mb-1">/ 1 year access</span>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              {[
                'Unlimited access to all 3 Regulatory Master courses (CMI, AIF, FME)',
                '100-Question ExamReady Mock Test Simulator with detailed explanations',
                'All 5 IFSC Compliance Tools & Builders (Calendar, Filing Tracker, ESOP)',
                'Interactive Regulations Browser & Statutory provisions',
                'Downloadable checklists, templates, and board meeting planners',
                'Instant access to all new course releases throughout the year'
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span className="text-forest-deep font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {isMember ? (
              <div className="space-y-2">
                <div className="w-full py-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl font-bold text-center text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Membership Active until {formattedExpiry}</span>
                </div>
                <button
                  onClick={handleBuyMembership}
                  disabled={loadingType === 'membership'}
                  className="w-full py-2.5 bg-paper border border-line text-ink-soft hover:text-forest text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Renew Membership (Extend +1 Year)
                </button>
              </div>
            ) : (
              <button
                onClick={handleBuyMembership}
                disabled={loadingType === 'membership'}
                className="cursor-target w-full py-4 bg-gold hover:bg-amber-600 text-white rounded-2xl font-bold transition-colors shadow-md text-base min-h-[52px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loadingType === 'membership' ? 'Opening Razorpay...' : 'Get Full Access — ₹1,999/yr'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
            <p className="text-center text-[11px] text-ink-soft mt-3">
              Instant activation via Razorpay. 100% secure payment.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

