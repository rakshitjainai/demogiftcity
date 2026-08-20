import React from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical, CheckCircle2, HelpCircle, Award,
  ArrowRight, ShieldCheck, Zap, BookOpen, Clock, Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PracticeHub() {
  const { isMember } = useAuth();

  const practiceCards = [
    {
      id: 'quizzes',
      title: 'Topic & Daily Quizzes',
      badge: 'Quick Practice',
      desc: 'Short 5-10 question bite-sized quizzes across Companies Act, SEBI, IFSCA, and FEMA to test recall.',
      icon: <HelpCircle className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
      actionText: 'Browse Quizzes',
      link: '/practice/quizzes',
      stats: '15+ Subject Topics'
    },
    {
      id: 'mock-tests',
      title: 'Full Mock Examinations',
      badge: 'Exam Simulation',
      desc: 'Simulated 100-question timed examinations with negative marking, section review, and performance analytics.',
      icon: <FlaskConical className="w-6 h-6 text-emerald-700" />,
      bg: 'bg-emerald-50 border-emerald-200',
      actionText: 'Start IFSC CMI Mock Test',
      link: '/practice/mock-tests',
      stats: '100 Questions • 120 Mins'
    },
    {
      id: 'question-bank',
      title: 'Regulatory Question Bank',
      badge: 'Comprehensive',
      desc: 'Filter and practice thousands of MCQs categorized by regulator (SEBI, IFSCA, MCA, RBI) and difficulty level.',
      icon: <BookOpen className="w-6 h-6 text-blue-700" />,
      bg: 'bg-blue-50 border-blue-200',
      actionText: 'Explore Question Bank',
      link: '/practice/quizzes',
      stats: '1,500+ Verified Questions'
    },
    {
      id: 'analytics',
      title: 'Performance & Weak Areas',
      badge: 'Analytics',
      desc: 'Track accuracy rates, time per question, topic-level mastery, and historical test progress in your dashboard.',
      icon: <Target className="w-6 h-6 text-purple-700" />,
      bg: 'bg-purple-50 border-purple-200',
      actionText: 'View Dashboard Analytics',
      link: '/dashboard',
      stats: 'Personalized Insights'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--mint)] border border-[var(--leaf)]/30 rounded-full text-xs font-bold text-[var(--forest)] uppercase tracking-wider mb-4">
            <FlaskConical size={14} className="text-[var(--leaf)]" /> RegPractice Ecosystem
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--forest-deep)] tracking-tight">
            Test Your Regulatory Mastery
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[var(--ink-soft)] leading-relaxed">
            Convert theoretical knowledge into exam-ready confidence. Practice with daily quizzes, subject-specific topic tests, and real-time timed mock simulations.
          </p>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 p-5 bg-white rounded-2xl border border-[var(--line)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--ink)] font-serif">100%</p>
              <p className="text-xs text-[var(--ink-soft)]">Verified Answers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--ink)] font-serif">Timed</p>
              <p className="text-xs text-[var(--ink-soft)]">Real Exam Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--ink)] font-serif">Instant</p>
              <p className="text-xs text-[var(--ink-soft)]">Explanations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800">
              <Award size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--ink)] font-serif">Certificates</p>
              <p className="text-xs text-[var(--ink-soft)]">On Pass Completion</p>
            </div>
          </div>
        </div>

        {/* Practice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {practiceCards.map((card) => (
            <div
              key={card.id}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-[var(--line)] shadow-sm hover:shadow-md hover:border-[var(--leaf)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--mint)] flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="px-3 py-1 bg-[var(--mint-deep)] text-[var(--forest)] text-xs font-bold rounded-full">
                    {card.stats}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[var(--forest-deep)] mb-2 font-serif">
                  {card.title}
                </h2>
                <p className="text-[14px] text-[var(--ink-soft)] leading-relaxed mb-6">
                  {card.desc}
                </p>
              </div>

              <Link
                to={card.link}
                className="inline-flex items-center justify-between px-4 py-2.5 bg-[var(--forest)] hover:bg-[var(--leaf)] text-white text-sm font-semibold rounded-xl transition-colors group"
              >
                <span>{card.actionText}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/* Featured Live Exam Simulator Banner */}
        <div className="bg-gradient-to-r from-[var(--forest-deep)] via-[var(--forest)] to-[#134931] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="px-3 py-1 bg-[var(--gold)] text-white text-xs font-bold uppercase tracking-wider rounded-full inline-block mb-3">
              Official Simulator
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3">
              IFSCA Capital Market Intermediaries Mock Examination
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base mb-6 leading-relaxed">
              Experience the complete 100-question computer-based exam format with full topic coverage, countdown clock, mark-for-review capabilities, and immediate detailed scorecards.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/practice/mock-tests"
                className="px-6 py-3 bg-[var(--gold)] hover:bg-white hover:text-[var(--forest-deep)] text-white font-bold rounded-xl text-sm transition-all shadow-md"
              >
                Launch Mock Exam (Free Preview)
              </Link>
              <Link
                to="/learn"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-colors border border-white/20"
              >
                Review CMI Course First
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
