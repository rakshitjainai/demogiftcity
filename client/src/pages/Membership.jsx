import React, { useState } from 'react';
import { Check, Star, ShieldCheck, Sparkles, CheckCircle2, Lock, ArrowRight, AlertCircle, RefreshCw, HelpCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

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
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Pricing & Membership', active: true }
        ]}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint border border-mint-deep text-forest text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-leaf" />
          <span>Transparent & Flexible Plans</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-forest-deep font-bold">
          Unlock the Complete RegMate Intelligence Platform
        </h1>
        <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
          From self-study course passes to comprehensive all-access annual subscriptions, choose the plan tailored for your legal and compliance practice.
        </p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="max-w-3xl mx-auto p-5 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            {successMessage}
          </div>
          <p className="text-sm text-emerald-700">
            Your access entitlements have been verified and updated on your account.
          </p>
          <button
            onClick={() => navigate('/learn')}
            className="mt-3 inline-flex items-center gap-2 px-6 py-2.5 bg-forest text-white font-semibold rounded-xl text-sm hover:bg-leaf transition-colors cursor-pointer"
          >
            Start Learning Now &rarr;
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700 text-sm font-semibold flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Membership Notice */}
      {isMember && (
        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-[#073321] via-[#0b4d32] to-[#073321] text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-xl">
              ★
            </div>
            <div>
              <div className="text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                Active Annual Membership
              </div>
              <h3 className="text-xl font-serif font-bold text-white">RegMate All-Access Pass Active</h3>
              <p className="text-xs text-emerald-100/80">Valid until {formattedExpiry || '1 Year from Purchase'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/learn')}
              className="px-5 py-2.5 bg-white text-[#073321] font-bold rounded-xl text-xs hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
            >
              Access All Courses &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 3-Tier Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        
        {/* Tier 1: Free Starter */}
        <div className="bg-white border border-line rounded-3xl p-8 card-shadow flex flex-col justify-between hover-lift">
          <div>
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 font-bold text-xs rounded-full uppercase mb-4">
              Free Community Tier
            </div>
            <h2 className="text-2xl font-display text-forest-deep font-bold mb-2">Starter Account</h2>
            <p className="text-xs text-ink-soft mb-6">Essential statutory reading, community explainers, and preview modules.</p>
            
            <div className="flex items-end gap-1 mb-6 pb-6 border-b border-line">
              <span className="text-4xl font-display text-forest-deep font-bold">₹0</span>
              <span className="text-ink-soft text-sm mb-1">/ forever</span>
            </div>

            <ul className="space-y-3 mb-8 text-xs sm:text-sm">
              {[
                'Interactive Regulations (RegLens) statutory reader',
                'Sample lesson previews across all Master courses',
                'Daily regulatory updates and circular radar',
                'Free downloadable statutory checklists & templates',
                'Community blogs, articles & regulatory glossaries'
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-leaf flex-shrink-0 mt-0.5" />
                  <span className="text-ink-soft">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {user ? (
              <div className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl font-semibold text-center text-xs">
                Current Free Tier
              </div>
            ) : (
              <Link
                to="/register"
                className="w-full py-3.5 bg-paper border-2 border-forest text-forest hover:bg-mint rounded-2xl font-bold transition-colors text-xs text-center block"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>

        {/* Tier 2: Single Course Pass (₹499) */}
        <div className="bg-white border-2 border-line rounded-3xl p-8 card-shadow flex flex-col justify-between hover:border-forest/40 transition-colors hover-lift">
          <div>
            <div className="inline-block px-3 py-1 bg-mint text-forest font-bold text-xs rounded-full uppercase mb-4">
              Single Course Option
            </div>
            <h2 className="text-2xl font-display text-forest-deep font-bold mb-2">Single Course Pass</h2>
            <p className="text-xs text-ink-soft mb-6">Unlock one specific Regulatory Master course for targeted study.</p>
            
            <div className="flex items-end gap-1 mb-6 pb-6 border-b border-line">
              <span className="text-4xl font-display text-forest-deep font-bold">₹499</span>
              <span className="text-ink-soft text-sm mb-1">/ one-time pass</span>
            </div>

            {/* Course Selector Dropdown */}
            <div className="mb-6 bg-paper p-4 rounded-2xl border border-line space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-deep">
                Select Master Course:
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-white border border-line rounded-xl p-2.5 text-xs font-bold text-forest-deep focus:outline-none focus:border-forest"
              >
                <option value="ifsca-cmi">IFSCA CMI Regulations (17 Chapters • 102 Qs)</option>
                <option value="sebi-aif">SEBI AIF Regulations (14 Chapters • 63 Qs)</option>
                <option value="ifsca-fme">IFSCA FME Regulations (7 Modules • 32 Qs)</option>
              </select>
            </div>

            <ul className="space-y-3 mb-8 text-xs sm:text-sm">
              {[
                'Full unlocked access to chosen course curriculum',
                'All chapter-wise diagnostic quizzes & model solutions',
                'Statutory codex cards & practical compliance notes',
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
              <div className="w-full py-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl font-bold text-center text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isMember ? 'Included in All-Access' : 'Course Already Owned ✓'}</span>
              </div>
            ) : (
              <button
                onClick={handleBuyCourse}
                disabled={loadingType === 'course'}
                className="w-full py-3.5 bg-forest text-white rounded-2xl font-semibold hover:bg-leaf transition-colors text-xs sm:text-sm min-h-[48px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loadingType === 'course' ? 'Opening Razorpay...' : `Buy Course Pass — ₹499`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tier 3: All-Access Pass (₹1,999/yr) */}
        <div className="bg-white border-2 border-gold rounded-3xl p-8 card-shadow flex flex-col justify-between relative hover-lift lg:-translate-y-2 shadow-xl">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-white font-bold tracking-wider uppercase text-[11px] px-5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Star className="w-3.5 h-3.5 fill-current" /> Best Value • Complete Platform
          </div>

          <div>
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full uppercase mb-4 mt-2">
              All 6 Products Included
            </div>
            <h2 className="text-2xl font-display text-forest-deep font-bold mb-2">All-Access Membership</h2>
            <p className="text-xs text-ink-soft mb-6">Unlimited pass for corporate legal teams, compliance officers, and advisors.</p>
            
            <div className="flex items-end gap-1 mb-6 pb-6 border-b border-line">
              <span className="text-4xl font-display text-forest-deep font-bold">₹1,999</span>
              <span className="text-ink-soft text-sm mb-1">/ 1 full year</span>
            </div>

            <ul className="space-y-3 mb-8 text-xs sm:text-sm">
              {[
                'Unlimited access to ALL Regulatory Master courses (CMI, AIF, FME, LODR)',
                '100-Question ExamReady Mock Test Simulator with full timers',
                'All 8+ Compliance Workflow Tools (Calendar, Filing, ESOP, AML)',
                'RegReady Interview Prep & case scenario banks',
                'Instant access to all newly released courses and tools for 1 year',
                'Verifiable Certificate of Regulatory Competence on completion'
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span className="text-forest-deep font-semibold">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {isMember ? (
              <div className="space-y-2">
                <div className="w-full py-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl font-bold text-center text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Membership Active until {formattedExpiry}</span>
                </div>
                <button
                  onClick={handleBuyMembership}
                  disabled={loadingType === 'membership'}
                  className="w-full py-2.5 bg-paper border border-line text-ink-soft hover:text-forest text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Renew Membership (+1 Year)
                </button>
              </div>
            ) : (
              <button
                onClick={handleBuyMembership}
                disabled={loadingType === 'membership'}
                className="w-full py-4 bg-gold hover:bg-amber-600 text-white rounded-2xl font-bold transition-colors shadow-md text-sm sm:text-base min-h-[52px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loadingType === 'membership' ? 'Opening Razorpay...' : 'Get All-Access Pass — ₹1,999/yr'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
            <p className="text-center text-[11px] text-ink-soft mt-3">
              Instant activation via Razorpay • 100% Secure SSL Payment
            </p>
          </div>

        </div>

      </div>

      {/* Trust & Guarantee Strip */}
      <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-paper border border-line text-center grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-ink-soft">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-forest" />
          <span>Curated by Regulatory Specialists</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-gold" />
          <span>Instant Account Unlock</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4 text-leaf" />
          <span>Priority Compliance Support</span>
        </div>
      </div>
    </div>
  );
}
