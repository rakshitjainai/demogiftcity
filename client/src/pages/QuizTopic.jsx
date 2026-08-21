import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Award, CheckCircle, XCircle, ArrowRight, RotateCcw,
  BookOpen, ChevronLeft, ChevronRight, Menu, X, Target, AlertCircle,
  CheckCircle2, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/UpgradeModal';

// ─── Quiz Question Bank ───────────────────────────────────────────────────────
const QUIZ_DATA = {
  'sebi-aif-regulations': [
    {
      q: 'Under SEBI (AIF) Regulations, 2012, what is the maximum number of investors allowed in a single scheme of Category I or Category II AIF (excluding Angel Funds)?',
      opts: ['50 investors', '100 investors', '1,000 investors', 'Unlimited investors'],
      ans: 2,
      explain: 'Under Regulation 10(b) of SEBI AIF Regulations, no scheme of an AIF (other than Angel Funds) shall have more than 1,000 investors.',
      ref: 'Reg 10(b), SEBI (AIF) Regulations, 2012',
    },
    {
      q: 'What is the minimum investment amount required from an individual investor in a standard Category I or II AIF scheme?',
      opts: ['₹10 Lakhs', '₹25 Lakhs', '₹1 Crore', '₹5 Crores'],
      ans: 2,
      explain: 'Under Regulation 10(a), the minimum investment from an individual investor in a Category I or II AIF is ₹1 Crore (₹25 Lakhs for employees/directors of the AIF or Manager).',
      ref: 'Reg 10(a), SEBI (AIF) Regulations, 2012',
    },
    {
      q: 'Which category of AIF is allowed to employ leverage for the purpose of making investments and day-to-day trading?',
      opts: ['Category I AIF', 'Category II AIF', 'Category III AIF', 'Angel Funds'],
      ans: 2,
      explain: 'Category III AIFs are permitted to employ leverage or complex trading strategies, subject to regulatory limits and investor consent.',
      ref: 'Reg 12(3), SEBI (AIF) Regulations, 2012',
    },
    {
      q: 'Category I and II AIFs are required to be structured as close-ended funds with a minimum tenure of:',
      opts: ['1 year', '3 years', '5 years', '10 years'],
      ans: 1,
      explain: 'Under Regulation 13(1), Category I and II AIFs shall be close-ended and the tenure of any scheme shall be at least three years.',
      ref: 'Reg 13(1), SEBI (AIF) Regulations, 2012',
    },
    {
      q: 'Large Value Funds (LVFs) for Accredited Investors require a minimum investment amount per investor of:',
      opts: ['₹1 Crore', '₹10 Crores', '₹25 Crores', '₹50 Crores'],
      ans: 2,
      explain: 'Large Value Funds for Accredited Investors are schemes in which each investor is an accredited investor and invests at least ₹25 Crores.',
      ref: 'Reg 10(c), SEBI (AIF) Regulations, 2012',
    },
  ],
  'corporate-laws': [
    {
      q: 'Under Section 188 of Companies Act 2013, prior approval of Audit Committee is required for:',
      opts: ['Only transactions exceeding ₹100 Crores', 'All Related Party Transactions or subsequent modifications', 'Only transactions not in the ordinary course of business', 'Only transactions with wholly owned subsidiaries'],
      ans: 1,
      explain: 'Under Section 177(4)(iv) read with Regulation 23 of SEBI LODR, all RPTs and subsequent material modifications require prior approval of the Audit Committee.',
      ref: 'Section 177(4)(iv), Companies Act 2013',
    },
    {
      q: 'What is the maximum gap allowed between two consecutive board meetings under the Companies Act, 2013?',
      opts: ['90 days', '120 days', '150 days', '180 days'],
      ans: 1,
      explain: 'As per Section 173, the gap between two consecutive Board Meetings shall not exceed 120 days.',
      ref: 'Section 173(1), Companies Act 2013',
    },
    {
      q: 'A company must hold its AGM within how many months from the close of the financial year?',
      opts: ['3 months', '6 months', '9 months', '12 months'],
      ans: 1,
      explain: 'Under Section 96, every company shall hold an AGM within six months from the date of closing of the financial year.',
      ref: 'Section 96(1), Companies Act 2013',
    },
    {
      q: 'Which form is filed for the annual return of a company with the ROC?',
      opts: ['AOC-4', 'MGT-7', 'DIR-3 KYC', 'INC-22'],
      ans: 1,
      explain: 'Form MGT-7 is the prescribed form for filing the Annual Return with the Registrar of Companies.',
      ref: 'Section 92, Companies Act 2013',
    },
    {
      q: 'The minimum number of directors required in a public company is:',
      opts: ['2', '3', '5', '7'],
      ans: 1,
      explain: 'Under Section 149(1)(b), every public company shall have a minimum of three directors.',
      ref: 'Section 149(1)(b), Companies Act 2013',
    },
  ],
  'ifsc-regulations': [
    {
      q: 'What is the minimum net worth requirement for a Registered FME (Non-Retail) under IFSCA Fund Management Regulations?',
      opts: ['USD 75,000', 'USD 500,000', 'USD 1,000,000', 'USD 150,000'],
      ans: 1,
      explain: 'A Registered Fund Management Entity (Non-Retail) in GIFT City IFSC requires a minimum net worth of USD 500,000.',
      ref: 'IFSCA (Fund Management) Regulations, 2022',
    },
    {
      q: 'Which body regulates entities operating within the GIFT City IFSC?',
      opts: ['SEBI', 'RBI', 'IFSCA', 'Ministry of Finance'],
      ans: 2,
      explain: 'The International Financial Services Centres Authority (IFSCA) is the unified regulator for all financial activities in GIFT City IFSC.',
      ref: 'IFSCA Act, 2019',
    },
    {
      q: 'An Authorised FME under IFSCA can offer which type of schemes?',
      opts: ['Only Venture Capital schemes', 'Only Angel schemes', 'Retail and non-retail schemes', 'Only ESG funds'],
      ans: 2,
      explain: 'An Authorised FME is permitted to manage both retail and non-retail schemes under the IFSCA FME Regulations.',
      ref: 'IFSCA (Fund Management) Regulations, 2022',
    },
    {
      q: 'What is the base currency for financial reporting in IFSC?',
      opts: ['INR', 'USD', 'EUR', 'Any freely convertible currency'],
      ans: 3,
      explain: 'Entities in IFSC may maintain their books and report in any freely convertible foreign currency as per IFSCA guidelines.',
      ref: 'IFSCA Circular on Accounting',
    },
    {
      q: 'Which of the following entities can register as a Capital Market Intermediary in IFSC?',
      opts: ['Only Indian entities', 'Only foreign entities', 'Both Indian and foreign entities', 'Only banks'],
      ans: 2,
      explain: 'Both Indian and foreign entities meeting the eligibility criteria can register as CMIs with IFSCA.',
      ref: 'IFSCA (CMI) Regulations, 2025',
    },
  ],
  'capital-markets': [
    {
      q: 'SEBI LODR Regulation 23 deals with which type of transactions?',
      opts: ['Insider Trading', 'Related Party Transactions', 'Corporate Governance', 'Preferential Allotment'],
      ans: 1,
      explain: 'Regulation 23 of SEBI (LODR) Regulations specifically governs Related Party Transactions for listed entities.',
      ref: 'Reg 23, SEBI (LODR) Regulations, 2015',
    },
    {
      q: 'What is the minimum public shareholding requirement for listed companies in India?',
      opts: ['10%', '15%', '25%', '51%'],
      ans: 2,
      explain: 'Under SEBI regulations, listed companies must maintain a minimum public shareholding of 25%.',
      ref: 'Rule 19(2)(b), SCRR 1957',
    },
    {
      q: 'SEBI (Prohibition of Insider Trading) Regulations require a trading window closure of at least:',
      opts: ['24 hours before UPSI', '48 hours before UPSI', '2 trading days before UPSI', '7 days before UPSI'],
      ans: 2,
      explain: 'The trading window must close at least 2 trading days before any UPSI is expected to be made public.',
      ref: 'Schedule B, SEBI (PIT) Regulations, 2015',
    },
    {
      q: 'The Takeover Code is triggered when an acquirer crosses what percentage of shares in a target company?',
      opts: ['10%', '15%', '25%', '51%'],
      ans: 2,
      explain: 'Under SEBI (Substantial Acquisition) Regulations, an open offer is triggered at 25% shareholding.',
      ref: 'Reg 3(1), SEBI SAST Regulations, 2011',
    },
    {
      q: 'Which committee is mandatory for the top 500 listed entities by market capitalisation?',
      opts: ['CSR Committee', 'Risk Management Committee', 'Nomination Committee', 'Stakeholders Relationship Committee'],
      ans: 1,
      explain: 'SEBI LODR mandates a Risk Management Committee for the top 500 listed entities.',
      ref: 'Reg 21, SEBI (LODR) Regulations, 2015',
    },
  ],
  'ipr': [
    {
      q: 'The term of a patent in India is:',
      opts: ['10 years from grant date', '15 years from filing date', '20 years from filing date', '25 years from filing date'],
      ans: 2,
      explain: 'Under the Patents Act, 1970, a patent is granted for a period of 20 years from the date of filing the application.',
      ref: 'Section 53, Patents Act, 1970',
    },
    {
      q: 'A registered trademark in India is valid for:',
      opts: ['5 years', '10 years (renewable)', '15 years', '20 years'],
      ans: 1,
      explain: 'A trademark registration in India is valid for 10 years and can be renewed indefinitely for successive 10-year periods.',
      ref: 'Section 25, Trade Marks Act, 1999',
    },
    {
      q: 'Design registration in India is governed by:',
      opts: ['Patents Act, 1970', 'Copyright Act, 1957', 'Designs Act, 2000', 'Trade Marks Act, 1999'],
      ans: 2,
      explain: 'Industrial design protection in India is governed by the Designs Act, 2000.',
      ref: 'Designs Act, 2000',
    },
    {
      q: 'What is the maximum term of copyright protection for literary works in India?',
      opts: ['25 years after death', '50 years after death', '60 years after death', '70 years after death'],
      ans: 2,
      explain: 'Copyright in literary, dramatic, musical and artistic works subsists for 60 years after the death of the author.',
      ref: 'Section 22, Copyright Act, 1957',
    },
    {
      q: 'A geographical indication (GI) registration in India is valid for:',
      opts: ['5 years', '10 years (renewable)', '15 years', 'Perpetual'],
      ans: 1,
      explain: 'GI registration is valid for 10 years and is renewable for further periods of 10 years each.',
      ref: 'Geographical Indications of Goods Act, 1999',
    },
  ],
  'general-laws': [
    {
      q: 'As per Secretarial Standard-1 (SS-1), notice of every Board Meeting must be given at least how many days before?',
      opts: ['3 days', '5 days', '7 days', '14 days'],
      ans: 2,
      explain: 'Notice in writing of every Board Meeting shall be given to every Director at least seven (7) days before the date of the Meeting.',
      ref: 'SS-1, Secretarial Standard on Board Meetings',
    },
    {
      q: 'Under the Indian Contract Act, 1872, consideration must be:',
      opts: ['Always in money', 'At the desire of the promisor', 'Always adequate', 'Witnessed by two persons'],
      ans: 1,
      explain: 'Section 2(d) states that consideration must move at the desire of the promisor, and can be in kind, not necessarily money.',
      ref: 'Section 2(d), Indian Contract Act, 1872',
    },
    {
      q: 'An arbitration agreement under the Arbitration Act, 1996 must be in:',
      opts: ['Oral form only', 'Writing', 'Notarized document', 'Court order'],
      ans: 1,
      explain: 'Section 7 of the Arbitration Act requires the arbitration agreement to be in writing.',
      ref: 'Section 7, Arbitration & Conciliation Act, 1996',
    },
    {
      q: 'Under the Indian Stamp Act, an inadequately stamped document is:',
      opts: ['Void', 'Voidable', 'Inadmissible as evidence until deficit stamp duty is paid', 'Fully valid'],
      ans: 2,
      explain: 'An insufficiently stamped document is inadmissible as evidence unless the deficit duty and penalty are paid.',
      ref: 'Indian Stamp Act, 1899',
    },
    {
      q: 'The Limitation Act, 1963 prescribes a general limitation period for suits on contracts of:',
      opts: ['1 year', '3 years', '6 years', '12 years'],
      ans: 1,
      explain: 'Under the Limitation Act, the general period for filing suits based on contracts is 3 years from the date of cause of action.',
      ref: 'Schedule I, Limitation Act, 1963',
    },
  ],
};

const TOPIC_META = {
  'sebi-aif-regulations': { title: 'SEBI AIF Regulations', timeMin: 10, difficulty: 'Intermediate' },
  'corporate-laws': { title: 'Corporate Laws', timeMin: 10, difficulty: 'Intermediate' },
  'ifsc-regulations': { title: 'IFSC Regulations', timeMin: 10, difficulty: 'Advanced' },
  'capital-markets': { title: 'Capital Markets', timeMin: 10, difficulty: 'Advanced' },
  'ipr': { title: 'Intellectual Property Rights', timeMin: 10, difficulty: 'Foundational' },
  'general-laws': { title: 'General Laws', timeMin: 10, difficulty: 'Foundational' },
};

const FREE_PREVIEW_LIMIT = 2;

// Question status: 'unanswered' | 'answered' | 'review'
function buildInitialAnswers(count) {
  return Array.from({ length: count }, () => ({ selected: null, status: 'unanswered' }));
}

export default function QuizTopic() {
  const { topic } = useParams();
  const { user, saveQuizResult, trackUsage, isAuthenticated } = useAuth();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'quiz' | 'results' | 'review'
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [navOpen, setNavOpen] = useState(false);
  const [reviewQ, setReviewQ] = useState(0);

  const topicMeta = TOPIC_META[topic] || { title: topic?.replace(/-/g, ' ') || 'General Laws', timeMin: 10, difficulty: 'Foundational' };
  const questions = QUIZ_DATA[topic] || QUIZ_DATA['general-laws'];

  const isMember = user?.membershipStatus === 'active';
  const hasQuizPass = user?.subscriptions?.includes('quizzes') || user?.subscriptions?.includes('full_access');
  const hasFullAccess = isMember || hasQuizPass;

  const score = useMemo(() => answers.filter((a, i) => a.selected === questions[i]?.ans).length, [answers, questions]);
  const attempted = useMemo(() => answers.filter(a => a.selected !== null).length, [answers]);
  const pct = useMemo(() => questions.length > 0 ? Math.round((score / questions.length) * 100) : 0, [score, questions]);
  const passed = pct >= 70;

  // Kick off quiz
  const handleStart = useCallback(() => {
    setAnswers(buildInitialAnswers(questions.length));
    setCurrentQ(0);
    setPhase('quiz');
    setNavOpen(false);
  }, [questions.length]);

  // Select an option for current question
  const handleSelect = useCallback((optIdx) => {
    if (answers[currentQ]?.selected !== null) return; // already answered
    setAnswers(prev => {
      const next = [...prev];
      next[currentQ] = { ...next[currentQ], selected: optIdx, status: 'answered' };
      return next;
    });
    if (trackUsage) trackUsage('quiz');
  }, [answers, currentQ, trackUsage]);

  // Move to next question — check upgrade gate for non-members after 2 questions
  const handleNext = useCallback(() => {
    const isLastQ = currentQ >= questions.length - 1;
    if (!hasFullAccess && !isAuthenticated && currentQ >= FREE_PREVIEW_LIMIT - 1) {
      setShowUpgradeModal(true);
      return;
    }
    if (!hasFullAccess && isAuthenticated && currentQ >= FREE_PREVIEW_LIMIT - 1) {
      setShowUpgradeModal(true);
      return;
    }
    if (isLastQ) {
      finishQuiz();
    } else {
      setCurrentQ(q => q + 1);
      setNavOpen(false);
    }
  }, [currentQ, questions.length, hasFullAccess, isAuthenticated]);

  const handlePrev = useCallback(() => {
    if (currentQ > 0) {
      setCurrentQ(q => q - 1);
      setNavOpen(false);
    }
  }, [currentQ]);

  const handleJumpTo = useCallback((idx) => {
    setCurrentQ(idx);
    setNavOpen(false);
  }, []);

  const finishQuiz = useCallback(() => {
    if (isAuthenticated && saveQuizResult) {
      const finalScore = answers.filter((a, i) => a.selected === questions[i]?.ans).length;
      const finalPct = Math.round((finalScore / questions.length) * 100);
      saveQuizResult(topic, finalScore, questions.length, finalPct >= 70);
    }
    setPhase('results');
    setNavOpen(false);
  }, [answers, questions, topic, isAuthenticated, saveQuizResult]);

  const handleRestart = useCallback(() => {
    setAnswers(buildInitialAnswers(questions.length));
    setCurrentQ(0);
    setPhase('quiz');
    setNavOpen(false);
  }, [questions.length]);

  const handleReview = useCallback(() => {
    setReviewQ(0);
    setPhase('review');
  }, []);

  // ─── Phase: INTRO ────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="py-10 sm:py-14 px-4 sm:px-6 max-w-3xl mx-auto animate-fade-in-up">
        <Link
          to="/practice/quizzes"
          className="inline-flex items-center text-ink-soft hover:text-forest font-medium mb-8 text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Quizzes
        </Link>

        <div className="bg-white border border-line rounded-2xl p-6 sm:p-8 md:p-10 card-shadow">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-mint flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-forest" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-mint text-forest border border-mint-deep">
              {topicMeta.difficulty}
            </span>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-gold mb-2">§ Topic-wise Quiz</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-forest-deep mb-4 leading-snug">
            {topicMeta.title}
          </h1>
          <p className="text-ink-soft text-sm sm:text-base mb-8 leading-relaxed">
            Test your understanding of {topicMeta.title} with this {questions.length}-question diagnostic quiz.
            Questions are designed to simulate real compliance officer scenarios and exam patterns.
          </p>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 text-ink-soft bg-paper px-4 py-2 rounded-xl border border-line text-sm">
              <HelpCircle className="w-4 h-4 text-forest" />
              <span className="font-semibold">{questions.length} Questions</span>
            </div>
            <div className="flex items-center gap-2 text-ink-soft bg-paper px-4 py-2 rounded-xl border border-line text-sm">
              <Clock className="w-4 h-4 text-gold" />
              <span className="font-semibold">~{topicMeta.timeMin} Minutes</span>
            </div>
            <div className="flex items-center gap-2 text-ink-soft bg-paper px-4 py-2 rounded-xl border border-line text-sm">
              <Award className="w-4 h-4 text-gold" />
              <span className="font-semibold">70% to pass</span>
            </div>
          </div>

          {/* Access notice for guests */}
          {!hasFullAccess && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-900">
              <span className="font-bold">Free preview:</span> {FREE_PREVIEW_LIMIT} of {questions.length} questions available.{' '}
              <Link to="/membership" className="font-bold underline underline-offset-2 hover:text-amber-700">
                Upgrade to access all
              </Link>
            </div>
          )}

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 bg-forest text-white rounded-xl font-bold text-base hover:bg-forest-deep transition-all shadow-md flex items-center justify-center gap-2 min-h-[52px] cursor-pointer"
          >
            Start Quiz Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Phase: QUIZ ─────────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    const q = questions[currentQ];
    const currentAnswer = answers[currentQ];
    const isAnswered = currentAnswer?.selected !== null;
    const isCorrect = currentAnswer?.selected === q.ans;
    const isLast = currentQ === questions.length - 1;
    const isGated = !hasFullAccess && currentQ >= FREE_PREVIEW_LIMIT;

    return (
      <div className="min-h-screen bg-paper">
        {/* ─── Top Bar ─── */}
        <div className="bg-white border-b border-line sticky top-0 z-30 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <Link
              to="/practice/quizzes"
              className="flex items-center gap-1.5 text-ink-soft hover:text-forest transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quizzes</span>
            </Link>

            <div className="text-center flex-1">
              <div className="text-xs font-bold text-ink-soft uppercase tracking-wider truncate">{topicMeta.title}</div>
              <div className="text-[10px] text-ink-soft">Q {currentQ + 1} of {questions.length}</div>
            </div>

            <button
              onClick={() => setNavOpen(o => !o)}
              className="flex items-center gap-1.5 text-ink-soft hover:text-forest transition-colors text-sm font-medium cursor-pointer"
              aria-label="Question navigator"
            >
              {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="hidden sm:inline text-xs">Navigator</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-line">
            <div
              className="h-full bg-forest transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ─── Question Navigator Dropdown ─── */}
        {navOpen && (
          <div className="bg-white border-b border-line shadow-md px-4 sm:px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">
                Question Navigator — {attempted}/{questions.length} answered
              </div>
              <div className="flex flex-wrap gap-2">
                {questions.map((_, i) => {
                  const a = answers[i];
                  const isCurrent = i === currentQ;
                  const isDone = a?.selected !== null;
                  let cls = 'w-9 h-9 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center';
                  if (isCurrent) cls += ' bg-forest text-white border-forest ring-2 ring-forest/30';
                  else if (isDone) cls += ' bg-mint text-forest border-forest/30';
                  else cls += ' bg-paper text-ink-soft border-line hover:border-forest hover:text-forest';
                  return (
                    <button key={i} onClick={() => handleJumpTo(i)} className={cls}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-forest inline-block" /> Current
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-mint border border-forest/30 inline-block" /> Answered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-paper border border-line inline-block" /> Unanswered
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Question Content ─── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
          {isGated ? (
            /* ─── Upgrade Gate ─── */
            <div className="bg-white border border-amber-200 rounded-2xl p-6 sm:p-10 card-shadow text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-forest-deep">Free Preview Complete</h2>
              <p className="text-ink-soft text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                You have used your {FREE_PREVIEW_LIMIT} free questions on this quiz.
                Upgrade to access all {questions.length} questions, detailed explanations, and all topic areas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/membership"
                  className="px-6 py-3 bg-forest text-white rounded-xl font-bold text-sm hover:bg-forest-deep transition-colors shadow-md"
                >
                  Unlock Full Access
                </Link>
                <button
                  onClick={finishQuiz}
                  className="px-6 py-3 bg-paper border border-line text-ink rounded-xl font-semibold text-sm hover:bg-mint transition-colors cursor-pointer"
                >
                  See My Score ({score}/{FREE_PREVIEW_LIMIT})
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Question card */}
              <div className="bg-white border border-line rounded-2xl p-5 sm:p-8 card-shadow">
                {/* Q meta */}
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-mint px-2.5 py-1 rounded-full">
                    Question {currentQ + 1}/{questions.length}
                  </span>
                  {q.ref && (
                    <span className="text-[10px] font-mono text-ink-soft truncate max-w-[200px] sm:max-w-none">{q.ref}</span>
                  )}
                </div>

                <h2 className="text-base sm:text-xl font-display font-bold text-forest-deep mb-6 leading-snug">{q.q}</h2>

                {/* Options */}
                <div className="space-y-2.5 sm:space-y-3 mb-6">
                  {q.opts.map((opt, idx) => {
                    let cls = 'bg-paper border-line text-ink hover:border-forest hover:bg-mint/30';
                    if (isAnswered) {
                      if (idx === q.ans) cls = 'bg-mint border-forest text-forest-deep ring-2 ring-forest/20';
                      else if (idx === currentAnswer.selected) cls = 'bg-red-50 border-red-300 text-red-800';
                      else cls = 'bg-paper border-line text-ink-soft opacity-50';
                    } else if (currentAnswer?.selected === idx) {
                      cls = 'bg-mint-deep border-forest text-forest-deep';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        disabled={isAnswered}
                        className={`w-full text-left px-4 py-3 sm:py-3.5 rounded-xl border-2 font-medium transition-all flex items-center gap-3 min-h-[52px] text-sm sm:text-base disabled:cursor-default ${cls} cursor-pointer`}
                      >
                        <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isAnswered && idx === q.ans ? 'bg-forest border-forest text-white'
                          : isAnswered && idx === currentAnswer.selected && idx !== q.ans ? 'bg-red-500 border-red-500 text-white'
                          : 'border-current'
                        }`}>
                          {isAnswered && idx === q.ans ? <CheckCircle className="w-4 h-4" />
                          : isAnswered && idx === currentAnswer.selected && idx !== q.ans ? <XCircle className="w-4 h-4" />
                          : String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {isAnswered && (
                  <div className={`rounded-xl p-4 sm:p-5 mb-5 text-sm leading-relaxed ${
                    isCorrect ? 'bg-mint border border-forest/20 text-forest-deep' : 'bg-amber-50 border border-amber-200 text-amber-900'
                  }`}>
                    <div className="font-bold text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      {isCorrect
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Correct</>
                        : <><AlertCircle className="w-3.5 h-3.5" /> Explanation</>}
                    </div>
                    <p>{q.explain}</p>
                    {q.ref && (
                      <div className="mt-2 text-[10px] font-mono opacity-60">Source: {q.ref}</div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    disabled={currentQ === 0}
                    className="px-4 py-3 rounded-xl border border-line text-ink-soft font-semibold text-sm hover:border-forest hover:text-forest transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 min-h-[48px]"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>

                  {isAnswered ? (
                    <button
                      onClick={isLast ? finishQuiz : handleNext}
                      className="flex-1 py-3 rounded-xl bg-forest text-white font-bold text-sm hover:bg-forest-deep transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer shadow-sm"
                    >
                      {isLast
                        ? <><Award className="w-4 h-4 text-amber-300" /> See Results</>
                        : <><ChevronRight className="w-4 h-4" /> Next Question</>}
                    </button>
                  ) : (
                    <div className="flex-1 py-3 rounded-xl bg-mint border border-mint-deep text-ink-soft text-sm text-center font-medium min-h-[48px] flex items-center justify-center">
                      Select an answer above
                    </div>
                  )}

                  {isLast && isAnswered && (
                    <button
                      onClick={finishQuiz}
                      className="px-4 py-3 rounded-xl border border-forest text-forest font-bold text-sm hover:bg-forest hover:text-white transition-all cursor-pointer min-h-[48px]"
                    >
                      Finish
                    </button>
                  )}
                </div>
              </div>

              {/* Live score ticker */}
              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-ink-soft">
                <span><strong className="text-forest">{score}</strong> correct</span>
                <span><strong className="text-rose-500">{attempted - score}</strong> wrong</span>
                <span><strong className="text-ink">{questions.length - attempted}</strong> remaining</span>
              </div>
            </>
          )}
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            if (hasFullAccess) {
              if (currentQ < questions.length - 1) setCurrentQ(q => q + 1);
              else finishQuiz();
            }
          }}
          sectionKey="quizzes"
          title="Free Quiz Limit Reached"
          message={`You have used your ${FREE_PREVIEW_LIMIT} free preview questions. Upgrade to unlock all ${questions.length} questions across all topic areas.`}
        />
      </div>
    );
  }

  // ─── Phase: RESULTS ──────────────────────────────────────────────────────────
  if (phase === 'results') {
    const weakTopics = answers
      .map((a, i) => ({ ...questions[i], myAns: a.selected, correct: a.selected === questions[i].ans, idx: i }))
      .filter(q => !q.correct && q.myAns !== null);

    return (
      <div className="py-10 sm:py-14 px-4 sm:px-6 max-w-4xl mx-auto animate-fade-in-up">
        <Link to="/practice/quizzes" className="inline-flex items-center text-ink-soft hover:text-forest font-medium mb-8 text-sm transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> All Quizzes
        </Link>

        {/* Score Card */}
        <div className={`rounded-2xl p-6 sm:p-10 card-shadow text-center mb-6 ${passed ? 'bg-white border border-forest/20' : 'bg-white border border-line'}`}>
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-5 text-3xl font-bold font-mono ${passed ? 'bg-mint text-forest' : 'bg-red-50 text-red-500'}`}>
            {pct}%
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-forest-deep mb-2">
            {passed ? 'Well done!' : 'Keep practicing!'}
          </h1>
          <p className="text-ink-soft mb-6 text-sm sm:text-base">
            {topicMeta.title} · {score}/{questions.length} correct · {passed ? 'Passed (70%+)' : 'Need 70% to pass'}
          </p>

          {/* Score bar */}
          <div className="max-w-xs mx-auto bg-line h-3 rounded-full overflow-hidden mb-8">
            <div
              className={`h-full rounded-full transition-all duration-700 ${passed ? 'bg-forest' : 'bg-red-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-xl mx-auto">
            {[
              { label: 'Questions', value: questions.length, icon: HelpCircle },
              { label: 'Correct', value: score, icon: CheckCircle, color: 'text-forest' },
              { label: 'Wrong', value: attempted - score, icon: XCircle, color: 'text-red-500' },
              { label: 'Skipped', value: questions.length - attempted, icon: AlertCircle, color: 'text-amber-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-paper rounded-xl p-3 border border-line text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${color || 'text-ink-soft'}`} />
                <div className={`text-lg font-bold ${color || 'text-ink'}`}>{value}</div>
                <div className="text-[10px] text-ink-soft uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-forest text-white rounded-xl font-bold text-sm hover:bg-forest-deep transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] shadow-sm"
            >
              <RotateCcw className="w-4 h-4" /> Retry Quiz
            </button>
            <button
              onClick={handleReview}
              className="px-6 py-3 bg-white border border-forest text-forest rounded-xl font-bold text-sm hover:bg-mint transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              <BookOpen className="w-4 h-4" /> Review Answers
            </button>
            <Link
              to="/practice/quizzes"
              className="px-6 py-3 bg-paper border border-line text-ink-soft rounded-xl font-semibold text-sm hover:bg-mint hover:text-forest transition-colors flex items-center justify-center gap-2 min-h-[48px]"
            >
              All Quizzes
            </Link>
          </div>
        </div>

        {/* Weak areas */}
        {weakTopics.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 sm:p-6">
            <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" /> Questions to Review ({weakTopics.length})
            </h3>
            <div className="space-y-3">
              {weakTopics.map((wq) => (
                <div key={wq.idx} className="bg-white rounded-xl border border-amber-200 p-4 text-sm">
                  <div className="font-semibold text-amber-900 mb-1 leading-snug">{wq.q}</div>
                  {wq.myAns !== null && (
                    <div className="text-xs text-red-600 mb-0.5">
                      Your answer: {wq.opts[wq.myAns]}
                    </div>
                  )}
                  <div className="text-xs text-forest font-medium">
                    Correct: {wq.opts[wq.ans]}
                  </div>
                  {wq.ref && <div className="text-[10px] font-mono text-ink-soft mt-1">{wq.ref}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Phase: REVIEW ───────────────────────────────────────────────────────────
  if (phase === 'review') {
    const rq = questions[reviewQ];
    const ra = answers[reviewQ];
    const rCorrect = ra?.selected === rq.ans;

    return (
      <div className="min-h-screen bg-paper">
        {/* Top bar */}
        <div className="bg-white border-b border-line sticky top-0 z-30 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <button onClick={() => setPhase('results')}
              className="flex items-center gap-1.5 text-ink-soft hover:text-forest transition-colors text-sm font-medium cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Results</span>
            </button>
            <div className="text-center">
              <div className="text-xs font-bold text-ink-soft uppercase tracking-wider">Review Mode</div>
              <div className="text-[10px] text-ink-soft">Q {reviewQ + 1} of {questions.length}</div>
            </div>
            <div className="w-16" />
          </div>
          <div className="h-1.5 bg-line">
            <div className="h-full bg-gold" style={{ width: `${((reviewQ + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
          <div className="bg-white border border-line rounded-2xl p-5 sm:p-8 card-shadow">
            {/* Status */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-mint text-forest">
                Q {reviewQ + 1}/{questions.length}
              </span>
              {ra?.selected !== null ? (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  rCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {rCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-50 text-gray-500">
                  Skipped
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-display font-bold text-forest-deep mb-5 leading-snug">{rq.q}</h2>

            {/* Options review */}
            <div className="space-y-2.5 mb-6">
              {rq.opts.map((opt, idx) => {
                const isCorrectOpt = idx === rq.ans;
                const isMyOpt = ra?.selected === idx;
                let cls = 'bg-paper border-line text-ink-soft opacity-50';
                if (isCorrectOpt) cls = 'bg-mint border-forest text-forest-deep ring-1 ring-forest/20';
                else if (isMyOpt && !rCorrect) cls = 'bg-red-50 border-red-300 text-red-800';
                return (
                  <div key={idx}
                    className={`w-full px-4 py-3 rounded-xl border-2 flex items-center gap-3 min-h-[48px] text-sm ${cls}`}>
                    <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCorrectOpt ? 'bg-forest border-forest text-white'
                      : isMyOpt && !rCorrect ? 'bg-red-500 border-red-500 text-white'
                      : 'border-current'
                    }`}>
                      {isCorrectOpt ? <CheckCircle className="w-4 h-4" />
                      : isMyOpt && !rCorrect ? <XCircle className="w-4 h-4" />
                      : String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                    {isMyOpt && isCorrectOpt && <span className="ml-auto text-xs font-bold text-forest">Your answer ✓</span>}
                    {isMyOpt && !rCorrect && <span className="ml-auto text-xs font-bold text-red-600">Your answer</span>}
                    {!isMyOpt && isCorrectOpt && <span className="ml-auto text-xs font-bold text-forest">Correct answer</span>}
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="bg-mint-deep rounded-xl p-4 sm:p-5 mb-6 text-sm leading-relaxed">
              <div className="font-bold text-forest text-[10px] uppercase tracking-wider mb-1.5">Explanation</div>
              <p className="text-ink">{rq.explain}</p>
              {rq.ref && <div className="mt-2 text-[10px] font-mono text-ink-soft">{rq.ref}</div>}
            </div>

            {/* Nav */}
            <div className="flex gap-3">
              <button onClick={() => setReviewQ(q => Math.max(0, q - 1))}
                disabled={reviewQ === 0}
                className="flex-1 py-3 rounded-xl border border-line text-ink-soft font-semibold text-sm disabled:opacity-30 cursor-pointer hover:border-forest hover:text-forest transition-colors disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center gap-1.5">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              {reviewQ < questions.length - 1 ? (
                <button onClick={() => setReviewQ(q => q + 1)}
                  className="flex-1 py-3 rounded-xl bg-forest text-white font-bold text-sm cursor-pointer hover:bg-forest-deep transition-colors min-h-[48px] flex items-center justify-center gap-1.5">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setPhase('results')}
                  className="flex-1 py-3 rounded-xl bg-forest text-white font-bold text-sm cursor-pointer hover:bg-forest-deep transition-colors min-h-[48px] flex items-center justify-center gap-1.5">
                  Back to Results
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
