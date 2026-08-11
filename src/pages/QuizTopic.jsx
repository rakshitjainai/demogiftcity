import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Award, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

const QUIZ_DATA = {
  'sebi-aif-regulations': [
    { q: 'Under SEBI (AIF) Regulations, 2012, what is the maximum number of investors allowed in a single scheme of Category I or Category II AIF (excluding Angel Funds)?', opts: ['50 Investors', '100 Investors', '1000 Investors', 'Unlimited Investors'], ans: 2, explain: 'Under Regulation 10(b) of SEBI AIF Regulations, no scheme of an AIF (other than Angel Funds) shall have more than 1000 investors.' },
    { q: 'What is the minimum investment amount required from an individual investor in a standard Category I or II AIF scheme?', opts: ['₹10 Lakhs', '₹25 Lakhs', '₹1 Crore', '₹5 Crores'], ans: 2, explain: 'Under Regulation 10(a), the minimum investment from an individual investor in a Category I or II AIF is ₹1 Crore (₹25 Lakhs for employees/directors of the AIF or Manager).' },
    { q: 'Which category of AIF is allowed to employ leverage for purpose of making investments and day-to-day trading?', opts: ['Category I AIF', 'Category II AIF', 'Category III AIF', 'Angel Funds'], ans: 2, explain: 'Category III AIFs are permitted to employ leverage or complex trading strategies, subject to regulatory limits and investor consent.' },
    { q: 'Category I and II AIFs are required to be structured as close-ended funds with a minimum tenure of:', opts: ['1 Year', '3 Years', '5 Years', '10 Years'], ans: 1, explain: 'Under Regulation 13(1), Category I and II AIFs shall be close-ended and the tenure of any scheme shall be at least three years.' },
    { q: 'Large Value Funds (LVFs) for Accredited Investors require a minimum investment amount per investor of:', opts: ['₹1 Crore', '₹10 Crores', '₹25 Crores', '₹50 Crores'], ans: 2, explain: 'Large Value Funds for Accredited Investors are schemes in which each investor is an accredited investor and invests at least ₹25 Crores.' },
  ],
  'corporate-laws': [
    { q: 'Under Section 188 of Companies Act 2013, prior approval of Audit Committee is required for:', opts: ['Only transactions exceeding ₹100 Crores', 'All Related Party Transactions or subsequent modifications', 'Only transactions not in the ordinary course of business', 'Only transactions with wholly owned subsidiaries'], ans: 1, explain: 'Under Section 177(4)(iv) read with Regulation 23 of SEBI LODR, all RPTs and subsequent material modifications require prior approval of the Audit Committee.' },
    { q: 'What is the maximum gap allowed between two consecutive board meetings under the Companies Act, 2013?', opts: ['90 days', '120 days', '150 days', '180 days'], ans: 1, explain: 'As per Section 173, the gap between two consecutive Board Meetings shall not exceed 120 days.' },
    { q: 'A company must hold its AGM within how many months from the close of the financial year?', opts: ['3 months', '6 months', '9 months', '12 months'], ans: 1, explain: 'Under Section 96, every company shall hold an AGM within six months from the date of closing of the financial year.' },
    { q: 'Which form is filed for the annual return of a company with the ROC?', opts: ['AOC-4', 'MGT-7', 'DIR-3 KYC', 'INC-22'], ans: 1, explain: 'Form MGT-7 is the prescribed form for filing the Annual Return with the Registrar of Companies.' },
    { q: 'The minimum number of directors required in a public company is:', opts: ['2', '3', '5', '7'], ans: 1, explain: 'Under Section 149(1)(b), every public company shall have a minimum of three directors.' },
  ],
  'ifsc-regulations': [
    { q: 'What is the minimum net worth requirement for a Registered FME under IFSCA Fund Management Regulations?', opts: ['USD 75,000', 'USD 500,000', 'USD 1,000,000', 'USD 150,000'], ans: 1, explain: 'A Registered Fund Management Entity (Non-Retail) in GIFT City IFSC requires a minimum net worth of USD 500,000.' },
    { q: 'Which body regulates entities operating within the GIFT City IFSC?', opts: ['SEBI', 'RBI', 'IFSCA', 'Ministry of Finance'], ans: 2, explain: 'The International Financial Services Centres Authority (IFSCA) is the unified regulator for all financial activities in GIFT City IFSC.' },
    { q: 'An Authorised FME under IFSCA can offer which type of schemes?', opts: ['Only Venture Capital schemes', 'Only Angel schemes', 'Retail and non-retail schemes', 'Only ESG funds'], ans: 2, explain: 'An Authorised FME is permitted to manage both retail and non-retail schemes under the IFSCA FME Regulations.' },
    { q: 'What is the base currency for financial reporting in IFSC?', opts: ['INR', 'USD', 'EUR', 'Any freely convertible currency'], ans: 3, explain: 'Entities in IFSC may maintain their books and report in any freely convertible foreign currency as per IFSCA guidelines.' },
    { q: 'Which of the following entities can register as a Capital Market Intermediary in IFSC?', opts: ['Only Indian entities', 'Only foreign entities', 'Both Indian and foreign entities', 'Only banks'], ans: 2, explain: 'Both Indian and foreign entities meeting the eligibility criteria can register as CMIs with IFSCA.' },
  ],
  'capital-markets': [
    { q: 'SEBI LODR Regulation 23 deals with which type of transactions?', opts: ['Insider Trading', 'Related Party Transactions', 'Corporate Governance', 'Preferential Allotment'], ans: 1, explain: 'Regulation 23 of SEBI (LODR) Regulations specifically governs Related Party Transactions for listed entities.' },
    { q: 'What is the minimum public shareholding requirement for listed companies in India?', opts: ['10%', '15%', '25%', '51%'], ans: 2, explain: 'Under SEBI regulations, listed companies must maintain a minimum public shareholding of 25%.' },
    { q: 'SEBI (Prohibition of Insider Trading) Regulations require a trading window closure of at least:', opts: ['24 hours', '48 hours', '2 trading days before UPSI', '7 days'], ans: 2, explain: 'The trading window must close at least 2 trading days before any UPSI is made public.' },
    { q: 'The Takeover Code is triggered when an acquirer crosses what percentage of shares in a target company?', opts: ['10%', '15%', '25%', '51%'], ans: 2, explain: 'Under SEBI (Substantial Acquisition) Regulations, an open offer is triggered at 25% shareholding.' },
    { q: 'Which committee is mandatory for the top 500 listed entities by market capitalisation?', opts: ['CSR Committee', 'Risk Management Committee', 'Nomination Committee', 'All of the above'], ans: 1, explain: 'SEBI LODR mandates a Risk Management Committee for the top 500 listed entities.' },
  ],
  'ipr': [
    { q: 'The term of a patent in India is:', opts: ['10 years', '15 years', '20 years from filing date', '25 years'], ans: 2, explain: 'Under the Patents Act, 1970, a patent is granted for a period of 20 years from the date of filing the application.' },
    { q: 'A registered trademark in India is valid for:', opts: ['5 years', '10 years (renewable)', '15 years', '20 years'], ans: 1, explain: 'A trademark registration in India is valid for 10 years and can be renewed indefinitely for successive 10-year periods.' },
    { q: 'Design registration in India is governed by:', opts: ['Patents Act, 1970', 'Copyright Act, 1957', 'Designs Act, 2000', 'Trade Marks Act, 1999'], ans: 2, explain: 'Industrial design protection in India is governed by the Designs Act, 2000.' },
    { q: 'What is the maximum term of copyright protection for literary works in India?', opts: ['25 years', '50 years', '60 years after author death', '70 years'], ans: 2, explain: 'Copyright in literary, dramatic, musical and artistic works subsists for 60 years after the death of the author.' },
    { q: 'A geographical indication (GI) registration in India is valid for:', opts: ['5 years', '10 years (renewable)', '15 years', 'Perpetual'], ans: 1, explain: 'GI registration is valid for 10 years and is renewable for further periods of 10 years each.' },
  ],
  'general-laws': [
    { q: 'As per Secretarial Standard-1 (SS-1), notice of every Board Meeting must be given at least how many days before?', opts: ['3 Days', '5 Days', '7 Days', '14 Days'], ans: 2, explain: 'Notice in writing of every Board Meeting shall be given to every Director at least seven (7) days before the date of the Meeting.' },
    { q: 'Under the Indian Contract Act, 1872, consideration must be:', opts: ['Always in money', 'At the desire of the promisor', 'Always adequate', 'Witnessed by two persons'], ans: 1, explain: 'Section 2(d) states that consideration must move at the desire of the promisor, and can be in kind, not necessarily money.' },
    { q: 'An arbitration agreement under the Arbitration Act, 1996 must be in:', opts: ['Oral form only', 'Writing', 'Notarized document', 'Court order'], ans: 1, explain: 'Section 7 of the Arbitration Act requires the arbitration agreement to be in writing.' },
    { q: 'Under the Indian Stamp Act, an inadequately stamped document is:', opts: ['Void', 'Voidable', 'Inadmissible as evidence until deficit stamp duty is paid', 'Valid'], ans: 2, explain: 'An insufficiently stamped document is inadmissible as evidence unless the deficit duty and penalty are paid.' },
    { q: 'The Limitation Act, 1963 prescribes a general limitation period for suits on contracts of:', opts: ['1 year', '3 years', '6 years', '12 years'], ans: 1, explain: 'Under the Limitation Act, the general period for filing suits based on contracts is 3 years from the date of cause of action.' },
  ],
};

export default function QuizTopic() {
  const { topic } = useParams();
  const formattedTopic = topic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const questions = QUIZ_DATA[topic] || QUIZ_DATA['general-laws'];

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleSelect = (idx) => {
    if (answered) return;
    setSelectedOpt(idx);
    setAnswered(true);
    if (idx === questions[currentQ].ans) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelectedOpt(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentQ(0);
    setSelectedOpt(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);
    setFinished(false);
  };

  // Results screen
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;
    return (
      <div className="py-16 px-6 max-w-4xl mx-auto animate-fade-in-up">
        <Link to="/quizzes" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes
        </Link>
        <div className="bg-white border border-line rounded-2xl p-8 md:p-12 card-shadow text-center">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-mint' : 'bg-red-50'}`}>
            {passed ? <Award className="w-12 h-12 text-leaf" /> : <XCircle className="w-12 h-12 text-red-400" />}
          </div>
          <h1 className="text-3xl md:text-4xl font-display text-forest-deep mb-3">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h1>
          <p className="text-ink-soft text-lg mb-8">
            You scored <strong className="text-forest-deep">{score}/{questions.length}</strong> ({pct}%) on {formattedTopic}.
            {passed ? ' You passed!' : ' You need 70% to pass.'}
          </p>

          <div className="w-full max-w-xs mx-auto bg-line h-3 rounded-full overflow-hidden mb-10">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${passed ? 'bg-leaf-bright' : 'bg-red-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={handleRestart} className="cursor-target px-8 py-3 bg-forest text-white rounded-full font-medium hover-lift flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <Link to="/quizzes" className="cursor-target px-8 py-3 bg-paper border border-forest text-forest rounded-full font-medium hover-lift">
              All Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  if (started) {
    const q = questions[currentQ];
    return (
      <div className="py-16 px-6 max-w-4xl mx-auto animate-fade-in-up">
        <div className="flex items-center justify-between mb-8">
          <Link to="/quizzes" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
          <span className="text-sm font-bold text-ink-soft bg-paper border border-line px-4 py-1.5 rounded-full">
            {currentQ + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-line h-2 rounded-full overflow-hidden mb-10">
          <div 
            className="h-full bg-leaf rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="bg-white border border-line rounded-2xl p-8 md:p-10 card-shadow">
          <h2 className="text-xl md:text-2xl font-display text-forest-deep mb-8 leading-snug">{q.q}</h2>

          <div className="space-y-3 mb-8">
            {q.opts.map((opt, idx) => {
              let style = 'bg-paper border-line text-ink hover:border-leaf hover:bg-mint';
              if (answered) {
                if (idx === q.ans) style = 'bg-mint border-leaf-bright text-forest-deep ring-2 ring-leaf/30';
                else if (idx === selectedOpt) style = 'bg-red-50 border-red-300 text-red-800';
                else style = 'bg-paper border-line text-ink-soft opacity-60';
              } else if (idx === selectedOpt) {
                style = 'bg-mint-deep border-leaf text-forest-deep';
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`cursor-target w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ${style} flex items-center gap-3`}
                >
                  <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                  {answered && idx === q.ans && <CheckCircle className="w-5 h-5 text-leaf ml-auto flex-shrink-0" />}
                  {answered && idx === selectedOpt && idx !== q.ans && <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className="bg-mint-deep border border-leaf/20 rounded-xl p-5 mb-8 animate-fade-in-up">
              <h4 className="font-semibold text-forest-deep mb-1 text-sm">Explanation</h4>
              <p className="text-ink-soft text-sm">{q.explain}</p>
            </div>
          )}

          {answered && (
            <button onClick={handleNext} className="cursor-target w-full sm:w-auto px-8 py-3 bg-forest text-white rounded-full font-medium hover-lift flex items-center gap-2 mx-auto">
              {currentQ < questions.length - 1 ? <>Next Question <ArrowRight className="w-4 h-4" /></> : <>See Results <Award className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Start screen
  return (
    <div className="py-16 px-6 max-w-4xl mx-auto animate-fade-in-up">
      <Link to="/quizzes" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes
      </Link>
      
      <div className="bg-white border border-line rounded-2xl p-8 md:p-12 card-shadow">
        <span className="eyebrow block mb-4">§ Topic-wise quiz</span>
        <h1 className="text-3xl md:text-4xl font-display text-forest-deep mb-6">{formattedTopic}</h1>
        <p className="text-ink-soft text-lg mb-8">
          Test your understanding of {formattedTopic} with this comprehensive {questions.length}-question quiz. 
          Questions are designed to simulate real-world compliance scenarios.
        </p>

        <div className="flex flex-wrap gap-6 mb-10">
          <div className="flex items-center gap-3 text-ink-soft bg-paper px-4 py-2 rounded-lg border border-line">
            <Clock className="w-5 h-5 text-gold" />
            <span className="font-medium">{questions.length * 2} Mins</span>
          </div>
          <div className="flex items-center gap-3 text-ink-soft bg-paper px-4 py-2 rounded-lg border border-line">
            <Award className="w-5 h-5 text-gold" />
            <span className="font-medium">70% passing</span>
          </div>
          <div className="flex items-center gap-3 text-ink-soft bg-paper px-4 py-2 rounded-lg border border-line">
            <CheckCircle className="w-5 h-5 text-gold" />
            <span className="font-medium">{questions.length} Questions</span>
          </div>
        </div>

        <button 
          onClick={() => setStarted(true)} 
          className="cursor-target w-full sm:w-auto px-8 py-4 bg-forest text-white rounded-full font-medium hover-lift text-lg shadow-lg"
        >
          Start Quiz Now
        </button>
      </div>
    </div>
  );
}
