import React from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical, CheckCircle2, HelpCircle, Award,
  ArrowRight, ShieldCheck, Zap, BookOpen, Clock, Target,
  GraduationCap, Sparkles, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PracticeHub() {
  const { isMember } = useAuth();

  const mockTests = [
    {
      id: 'fme-mock-test',
      slug: 'fme-full-length-mock-test',
      title: 'FME Mock Test',
      subtitle: 'IFSCA Fund Management Entity (FME)',
      badge: 'IFSCA FME 2025',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      desc: 'Complete 100-question computer-based mock exam covering AIF Concepts & Structures, Retail Schemes, and the IFSCA Regulatory Framework.',
      questions: '100 Questions',
      duration: '90 Minutes',
      marking: 'Negative Marking (−0.25)',
      accessNote: '2 Free Questions • Paid after Question 2',
      link: '/practice/mock-tests/fme-full-length-mock-test',
      actionText: 'Start FME Mock Test',
      icon: <GraduationCap className="w-6 h-6 text-emerald-700" />,
      highlightBg: 'border-emerald-200 hover:border-emerald-400 bg-white'
    },
    {
      id: 'cmi-mock-test',
      slug: 'cmi-full-length-mock-test',
      title: 'CMI Mock Test',
      subtitle: 'IFSCA Capital Market Intermediaries (CMI)',
      badge: 'IFSCA CMI 2025',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      desc: 'Simulated 100-question timed examination covering CMI registration categories, fit-and-proper criteria, conduct of business, and governance.',
      questions: '100 Questions',
      duration: '90 Minutes',
      marking: 'Negative Marking (−0.25)',
      accessNote: '2 Free Questions • Paid after Question 2',
      link: '/practice/mock-tests/cmi-full-length-mock-test',
      actionText: 'Start CMI Mock Test',
      icon: <FlaskConical className="w-6 h-6 text-blue-700" />,
      highlightBg: 'border-blue-200 hover:border-blue-400 bg-white'
    }
  ];

  const secondaryCards = [
    {
      id: 'quizzes',
      title: 'Topic & Daily Quizzes',
      badge: 'Quick Practice',
      desc: 'Short 5-10 question bite-sized quizzes across Companies Act, SEBI, IFSCA, and FEMA to test instant recall.',
      icon: <HelpCircle className="w-6 h-6 text-amber-600" />,
      actionText: 'Browse Quizzes',
      link: '/practice/quizzes',
      stats: '15+ Subject Topics'
    },
    {
      id: 'question-bank',
      title: 'Regulatory Question Bank',
      badge: 'Comprehensive',
      desc: 'Filter and practice thousands of MCQs categorized by regulator (SEBI, IFSCA, MCA, RBI) and difficulty level.',
      icon: <BookOpen className="w-6 h-6 text-blue-700" />,
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
      actionText: 'View Dashboard Analytics',
      link: '/dashboard',
      stats: 'Personalized Insights'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#042C1D] via-[#0B4D33] to-[#073321] text-white p-8 sm:p-10 mb-10 shadow-xl border border-emerald-900/50">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <FlaskConical size={14} className="text-blue-400" /> RegPractice Ecosystem
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Test Your Regulatory Mastery
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-normal leading-relaxed">
              Convert theoretical knowledge into exam-ready confidence. Practice with daily quizzes, subject-specific topic tests, and real-time timed mock simulations.
            </p>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 p-5 bg-white rounded-2xl border border-[var(--line)] shadow-sm">
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

        {/* ─── DEDICATED FULL MOCK EXAMINATIONS SECTION ───────────────────────────── */}
        <section className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold-dark)]">
                  Primary Exam Simulators
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--forest-deep)] mt-1">
                Full Mock Examinations
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--ink-soft)] max-w-md">
              Full length timed simulations built to exact statutory blueprints with negative marking and instant detailed scorecards.
            </p>
          </div>

          {/* TWO SEPARATE PRODUCT CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {mockTests.map((mock) => (
              <div
                key={mock.id}
                className={`bg-white rounded-3xl p-6 sm:p-8 border-2 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group ${mock.highlightBg}`}
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--mint)] border border-[var(--mint-deep)] flex items-center justify-center">
                      {mock.icon}
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${mock.badgeColor}`}>
                      {mock.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-[var(--forest-deep)] mb-1">
                    {mock.title}
                  </h3>
                  <p className="text-xs font-semibold text-[var(--gold-dark)] mb-3">
                    {mock.subtitle}
                  </p>

                  <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed mb-6">
                    {mock.desc}
                  </p>

                  {/* Spec Metadata Badges */}
                  <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                    <div className="bg-[var(--paper)] p-2.5 rounded-xl border border-[var(--line)] flex items-center gap-2">
                      <BookOpen size={15} className="text-[var(--forest)]" />
                      <span className="font-bold text-[var(--ink)]">{mock.questions}</span>
                    </div>
                    <div className="bg-[var(--paper)] p-2.5 rounded-xl border border-[var(--line)] flex items-center gap-2">
                      <Clock size={15} className="text-blue-600" />
                      <span className="font-bold text-[var(--ink)]">{mock.duration}</span>
                    </div>
                    <div className="bg-[var(--paper)] p-2.5 rounded-xl border border-[var(--line)] flex items-center gap-2">
                      <ShieldCheck size={15} className="text-rose-600" />
                      <span className="font-bold text-[var(--ink)]">{mock.marking}</span>
                    </div>
                    <div className="bg-[var(--paper)] p-2.5 rounded-xl border border-[var(--line)] flex items-center gap-2">
                      <Sparkles size={15} className="text-amber-600" />
                      <span className="font-bold text-[var(--ink)]">Free Preview (Q1-Q2)</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <Link
                    to={mock.link}
                    className="w-full inline-flex items-center justify-between px-5 py-3.5 bg-[var(--forest)] hover:bg-[var(--forest-deep)] text-white text-sm font-bold rounded-2xl shadow-sm transition-all group-hover:shadow-md min-h-[48px] cursor-pointer"
                  >
                    <span>{mock.actionText}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform text-[var(--gold)]" />
                  </Link>
                  <p className="text-center text-[11px] text-[var(--ink-soft)] mt-2 font-medium">
                    {mock.accessNote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECONDARY PRACTICE MODULES ────────────────────────────────────────── */}
        <section className="mb-10">
          <h3 className="text-xl font-bold font-serif text-[var(--forest-deep)] mb-4">
            Subject Practice & Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondaryCards.map((card) => (
              <div
                key={card.id}
                className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm hover:shadow-md hover:border-[var(--leaf)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--mint)] flex items-center justify-center">
                      {card.icon}
                    </div>
                    <span className="px-2.5 py-0.5 bg-[var(--mint-deep)] text-[var(--forest)] text-xs font-bold rounded-full">
                      {card.stats}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-[var(--forest-deep)] mb-1 font-serif">
                    {card.title}
                  </h4>
                  <p className="text-xs text-[var(--ink-soft)] leading-relaxed mb-6">
                    {card.desc}
                  </p>
                </div>

                <Link
                  to={card.link}
                  className="inline-flex items-center justify-between px-4 py-2.5 bg-[var(--paper)] hover:bg-[var(--mint)] text-[var(--forest-deep)] text-xs font-bold rounded-xl border border-[var(--line)] hover:border-[var(--forest)] transition-colors group"
                >
                  <span>{card.actionText}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
