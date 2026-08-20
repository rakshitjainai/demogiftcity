import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  FlaskConical,
  Wrench,
  Briefcase,
  Rss,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function EcosystemSection() {
  const products = [
    {
      id: 'reglearn',
      name: 'RegLearn',
      eyebrow: 'COURSE MASTERY',
      tagline: 'Structured learning modules and master courses for regulatory compliance.',
      icon: GraduationCap,
      href: '/learn',
      color: 'forest',
      features: ['IFSCA, SEBI & MCA Courses', 'Bite-sized Lesson Modules', 'Interactive Quizzes & Badges', 'Completion Certificates'],
      stats: '15+ Courses • 120+ Modules'
    },
    {
      id: 'reglens',
      name: 'RegLens',
      eyebrow: 'STATUTORY INTELLIGENCE',
      tagline: 'Deep statutory navigation with plain-English analysis and cross-provisions.',
      icon: BookOpen,
      href: '/understand',
      color: 'leaf',
      features: ['Section-by-Section Reader', 'Plain-English Breakdown', 'Amendment Trackers', 'Direct Gazette Citations'],
      stats: '50+ Regulations • 2,400+ Sections'
    },
    {
      id: 'regpractice',
      name: 'RegPractice',
      eyebrow: 'EXAM & TOPIC TESTING',
      tagline: 'Sharpen your knowledge with topic-based quizzes and timed mock exams.',
      icon: FlaskConical,
      href: '/practice',
      color: 'accent-blue',
      features: ['Topic-wise Practice Tests', 'Timed Exam Simulations', 'Comprehensive Question Bank', 'Detailed Answer Explanations'],
      stats: '2,500+ Questions • Real-Time Scoring'
    },
    {
      id: 'regtools',
      name: 'RegTools',
      eyebrow: 'COMPLIANCE WORKFLOW',
      tagline: 'Interactive calculators, filing trackers and compliance diagnostics.',
      icon: Wrench,
      href: '/tools',
      color: 'gold',
      features: ['Compliance Calendar Builder', 'Annual Filing Tracker', 'ESOP & Dilution Calculator', 'AML Risk Matrix'],
      stats: '8+ Interactive Tools'
    },
    {
      id: 'regready',
      name: 'RegReady',
      eyebrow: 'INTERVIEW & ROLE PREP',
      tagline: 'Role-specific scenario questions, model answers, and career readiness.',
      icon: Briefcase,
      href: '/prepare',
      color: 'forest',
      features: ['Fund Management (FME) Track', 'Listed Company CS Track', 'Real-World Case Scenarios', 'Model Interview Answers'],
      stats: '120+ Scenarios • Interview Playbooks'
    },
    {
      id: 'regintel',
      name: 'RegIntel',
      eyebrow: 'REGULATORY RADAR',
      tagline: 'Live regulatory circulars, amendment tracking, and enforcement analysis.',
      icon: Rss,
      href: '/regintel',
      color: 'leaf-bright',
      features: ['Multi-Regulator Circular Feed', "What's Changed Diff Tracker", 'Enforcement Order Summaries', 'Impact Assessment Badges'],
      stats: 'Daily Updates • Gazette Tracking'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-paper via-mint/30 to-paper relative overflow-hidden border-b border-line">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-leaf/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-forest/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint border border-mint-deep text-forest text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-leaf" />
            <span>The RegMate Unified Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-forest-deep tracking-tight">
            Six Specialized Engines.<br />One Definitive Platform.
          </h2>

          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            From statutory discovery to live interview readiness, every RegMate product is purpose-built to accelerate your legal and compliance proficiency.
          </p>
        </div>

        {/* 6 Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="group relative bg-white rounded-3xl p-7 border border-line card-shadow hover-lift flex flex-col justify-between transition-all duration-300 hover:border-forest/40"
              >
                <div>
                  {/* Top Bar: Icon + Eyebrow */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-13 h-13 rounded-2xl bg-mint text-forest group-hover:bg-forest group-hover:text-white transition-colors duration-300 flex items-center justify-center shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-gold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      {p.eyebrow}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3 className="text-2xl font-display font-bold text-forest mb-2 group-hover:text-leaf transition-colors">
                    {p.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-sm text-ink-soft leading-relaxed mb-6">
                    {p.tagline}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2 mb-6 border-t border-gray-100">
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-ink-soft">
                        <CheckCircle2 className="w-3.5 h-3.5 text-leaf flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Stats & CTA */}
                <div className="pt-4 border-t border-line/60 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-500">
                    {p.stats}
                  </span>

                  <Link
                    to={p.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-forest group-hover:text-leaf transition-colors"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-forest-deep via-forest to-forest-deep text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
              Ready to master Indian financial regulations?
            </h3>
            <p className="text-sm text-mint max-w-xl">
              Access master courses, interactive statute readers, practice mocks, and compliance tools with one all-access pass.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/membership"
              className="px-6 py-3.5 rounded-xl bg-gold hover:bg-amber-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer"
            >
              Get All-Access Membership
            </Link>
            <Link
              to="/learn"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition-all cursor-pointer"
            >
              Explore Free Courses
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
