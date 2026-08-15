import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  FileText,
  HelpCircle,
  FileSpreadsheet,
  ShieldCheck,
  Target,
  ArrowRight,
  Phone,
  MessageCircle,
  Sparkles,
  Users,
  Scale,
  Building2,
  ChevronRight,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import profileImg from '../assets/profile.png';

export default function About() {
  const [activeTab, setActiveTab] = useState('all');

  const approachSteps = [
    {
      num: '01',
      title: 'Understand it',
      tagline: 'Deep Conceptual Clarity',
      desc: 'Go beyond statutory provisions. We combine statutory texts with RegMate Explanation, Practical Guidance, Examples, Risk Points, Key Figures, and Practitioner Focus.',
      bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      num: '02',
      title: 'Practise it',
      tagline: 'Active Assessment',
      desc: 'Strengthen regulatory knowledge and test understanding with interactive mock tests, quizzes, and diagnostic evaluations to identify knowledge gaps.',
      bgLight: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      num: '03',
      title: 'Apply it',
      tagline: 'Practical Execution',
      desc: 'Move from understanding requirements to actually applying them using ready formats, templates, compliance tools, FAQs, and guidance notes.',
      bgLight: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      num: '04',
      title: 'Master it',
      tagline: 'Career Acceleration',
      desc: 'Build deep subject-matter understanding and interview confidence in hours through RegLearn pathways and RegMate Interview Pro.',
      bgLight: 'bg-emerald-100/70 text-forest-deep border-emerald-300'
    }
  ];

  const products = [
    {
      id: 'interactive-regulations',
      category: 'core',
      title: 'Interactive Regulations',
      icon: BookOpen,
      badge: 'Core Feature',
      tagline: 'Go beyond reading regulatory text',
      description:
        'RegMate combines the statutory provision with RegMate Explanation, Practical Guidance, Examples, Compliance Requirements, Risk Points, Key Figures and Practitioner & Exam Focus to help users understand how a provision actually works.',
      highlights: [
        'Statutory Provision & Interpretation',
        'RegMate Detailed Explanation',
        'Practical Guidance & Real Examples',
        'Compliance Requirements & Risk Points',
        'Key Figures & Metrics',
        'Practitioner & Exam Focus'
      ],
      link: '/interactive-regulations'
    },
    {
      id: 'reglearn',
      category: 'learning',
      title: 'RegLearn',
      icon: GraduationCap,
      badge: 'Structured Learning',
      tagline: 'Master regulations systematically',
      description:
        'Structured learning experiences that help users master regulations and regulatory subjects systematically.',
      highlights: [
        'Curated Subject Modules',
        'Systematic Subject Mastery',
        'Step-by-Step Learning Progression',
        'Self-Paced Professional Training'
      ],
      link: '/learning'
    },
    {
      id: 'interview-pro',
      category: 'career',
      title: 'RegMate Interview Pro',
      icon: Briefcase,
      badge: 'Career Accelerator',
      tagline: 'Prepare in hours rather than months',
      description:
        'A focused preparation platform for professionals preparing for legal, compliance and regulatory roles. It helps candidates build deep subject-matter understanding, practical knowledge and interview confidence in hours rather than months of preparation through targeted regulatory learning and practice.',
      highlights: [
        'Targeted Regulatory Learning',
        'Role-Specific Practical Q&A',
        'Deep Subject-Matter Confidence',
        'Hours vs Months Preparation'
      ],
      link: '/exam-ready'
    },
    {
      id: 'mock-tests',
      category: 'learning',
      title: 'Mock Tests & Quizzes',
      icon: Target,
      badge: 'Interactive Assessments',
      tagline: 'Test understanding & identify gaps',
      description:
        'Interactive assessments designed to strengthen regulatory knowledge, test understanding and identify knowledge gaps.',
      highlights: [
        'Topic-Wise Practice Quizzes',
        'Instant Feedback & Insights',
        'Diagnostic Skill Gap Analytics',
        'Role & Exam Preparedness'
      ],
      link: '/quizzes'
    },
    {
      id: 'articles-insights',
      category: 'insights',
      title: 'Articles & Deep-Dive Insights',
      icon: FileText,
      badge: 'Thought Leadership',
      tagline: 'Explore practical implications',
      description:
        'High-quality, structured articles and regulatory insights that go beyond the text of the law and explore practical and professional implications.',
      highlights: [
        'Expert Legal Analysis',
        'Practical Business Implications',
        'Regulatory Trend Breakdown',
        'Structured Deep-Dives'
      ],
      link: '/blog'
    },
    {
      id: 'faqs-guidance',
      category: 'core',
      title: 'FAQs & Guidance Notes',
      icon: HelpCircle,
      badge: 'Practical Guidance',
      tagline: 'Clear answers for daily work',
      description:
        'Clear answers and practical guidance on questions professionals commonly encounter while working with regulations and compliance requirements.',
      highlights: [
        'Real-world Common Scenarios',
        'Actionable Compliance Clarifications',
        'Step-by-Step Guidance Notes',
        'Day-to-day Solutions'
      ],
      link: '/knowledge-hub'
    },
    {
      id: 'formats-tools',
      category: 'tools',
      title: 'Formats, Templates & Compliance Tools',
      icon: FileSpreadsheet,
      badge: 'Practical Resources',
      tagline: 'Move from understanding to application',
      description:
        'Practical resources designed to help professionals move from understanding a requirement to actually applying it.',
      highlights: [
        'Ready-to-Use Statutory Formats',
        'Interactive Compliance Tools',
        'Actionable Execution Templates',
        'Compliance Checklists'
      ],
      link: '/templates'
    }
  ];

  const targetAudiences = [
    {
      role: 'Legal Professionals & Advocates',
      desc: 'Gain instant clarity on statutory provisions, explanations, practical guidance, and practitioner focus.',
      icon: Scale,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      role: 'Compliance Officers & CS',
      desc: 'Streamline statutory compliance, access actionable checklists, FAQs, formats, and guidance notes.',
      icon: ShieldCheck,
      color: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      role: 'Finance & Tax Professionals',
      desc: 'Master risk points, key figures, corporate governance, and regulatory requirements with speed.',
      icon: Building2,
      color: 'bg-cyan-50 text-cyan-800 border-cyan-200'
    },
    {
      role: 'Candidates & Role Seekers',
      desc: 'Build interview confidence in hours with RegMate Interview Pro, mock tests, and structured learning.',
      icon: Users,
      color: 'bg-amber-50 text-amber-900 border-amber-200'
    }
  ];

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen pb-20 animate-fade-in-up">
      {/* ─── Hero Header Banner ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest-deep text-white py-16 sm:py-24 px-4 sm:px-6 mb-16 rounded-3xl mx-2 sm:mx-6 shadow-2xl">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.4) 1px, transparent 0)',
            backgroundSize: '28px 28px'
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-leaf/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-gold-soft text-xs sm:text-sm font-semibold tracking-wider uppercase mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-gold animate-pulse" />
            <span>§ About RegMate</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold leading-tight mb-6 tracking-tight">
            Understand Regulations Faster. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-gold-soft">
              Apply Them With Confidence.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/90 max-w-3xl mx-auto leading-relaxed mb-10">
            RegMate is a professional regulatory knowledge, learning and assessment platform designed to help legal, compliance and finance professionals understand regulations faster and apply them with confidence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-emerald-100 font-medium">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Regulatory Content</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Practical Insights</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Structured Learning</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Assessments &amp; Tools</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ─── Our Approach Section ──────────────────────────────── */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <span className="eyebrow block mb-3">§ Core Philosophy</span>
            <h2 className="text-3xl sm:text-4xl font-display text-forest-deep font-bold mb-4">
              Our Approach
            </h2>
            <div className="w-16 h-1 bg-gold mx-auto rounded-full mb-6" />

            <div className="max-w-3xl mx-auto bg-mint/90 border border-leaf/30 rounded-3xl p-6 sm:p-8 card-shadow">
              <blockquote className="text-xl sm:text-2xl font-display text-forest-deep font-bold italic mb-4 leading-snug">
                "RegMate is built around a simple idea: <br />
                <span className="text-leaf">Don't just read the regulation. Understand it. Practise it. Apply it. Master it."</span>
              </blockquote>
              <p className="text-ink-soft text-sm sm:text-base leading-relaxed">
                We focus on making complex regulatory subjects structured, practical, relevant and easier to learn — without losing the depth that professionals need.
              </p>
            </div>
          </div>

          {/* 4 Steps Process Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approachSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-3xl p-6 border border-line transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl bg-white card-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold font-display text-emerald-800/40 group-hover:text-leaf transition-colors">
                      {step.num}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${step.bgLight}`}>
                      {step.tagline}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-forest-deep mb-2">
                    {step.title}
                  </h3>
                  <p className="text-ink-soft text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-line/60 flex items-center gap-2 text-xs font-bold text-leaf">
                  <span>Step {step.num} Pathway</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Products & Features Section ──────────────────────── */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <span className="eyebrow block mb-2">§ Ecosystem Overview</span>
              <h2 className="text-3xl sm:text-4xl font-display text-forest-deep font-bold mb-3">
                Our Products &amp; Features
              </h2>
              <p className="text-ink-soft text-base max-w-2xl">
                RegMate brings together regulatory content, practical insights, structured learning and assessments in one platform.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
              {[
                { key: 'all', label: 'All Features' },
                { key: 'core', label: 'Core Platform' },
                { key: 'learning', label: 'Learning & Quizzes' },
                { key: 'career', label: 'Career Prep' },
                { key: 'tools', label: 'Tools & Formats' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-forest-deep text-white shadow-sm'
                      : 'text-ink-soft hover:text-forest-deep hover:bg-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(prod => {
              const IconComp = prod.icon;
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl border border-line p-6 sm:p-8 card-shadow hover-lift flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-mint rounded-bl-full -z-0 opacity-70 group-hover:scale-110 transition-transform" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-mint-deep flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-colors shadow-sm">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {prod.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-display font-bold text-forest-deep mb-1 group-hover:text-leaf transition-colors">
                      {prod.title}
                    </h3>
                    <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-3">
                      {prod.tagline}
                    </p>

                    <p className="text-ink-soft text-sm leading-relaxed mb-6">
                      {prod.description}
                    </p>

                    {/* Highlights bullet points */}
                    <div className="space-y-2 mb-6 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                      {prod.highlights.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-ink-soft">
                          <CheckCircle2 className="w-3.5 h-3.5 text-leaf shrink-0 mt-0.5" />
                          <span className="font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-line/60 flex items-center justify-between">
                    <Link
                      to={prod.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-leaf transition-colors"
                    >
                      <span>Explore Feature</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Target Audience Section ──────────────────────────── */}
        <section className="mb-24 bg-gradient-to-b from-mint/50 to-paper rounded-3xl p-8 sm:p-12 border border-line">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow block mb-2">§ Designed for Professionals</span>
            <h2 className="text-3xl font-display text-forest-deep font-bold mb-3">
              Who RegMate Is For
            </h2>
            <p className="text-ink-soft text-sm sm:text-base">
              Engineered to help legal, compliance, and finance professionals master regulations and apply them with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetAudiences.map((aud, idx) => {
              const AudIcon = aud.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-line card-shadow hover:shadow-lg transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${aud.color}`}>
                    <AudIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-display font-bold text-forest-deep mb-2">
                    {aud.role}
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {aud.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Founder & Leadership Section ────────────────────── */}
        <section className="mb-16">
          <div className="bg-white border border-line rounded-3xl p-6 sm:p-10 md:p-12 card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/70 rounded-full blur-3xl -z-0 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 sm:gap-12 items-center md:items-start">
              {/* Profile Image Container - Completely Clean & Seamless */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-transparent relative group">
                  <img
                    src={profileImg}
                    alt="CS Prashant Kumar"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Bio & Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  <span className="eyebrow block mb-1">§ Leadership &amp; Vision</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest-deep">
                    Founder — CS Prashant Kumar
                  </h2>
                  <p className="text-leaf font-bold text-sm sm:text-base">
                    Company Secretary &amp; Regulatory Professional
                  </p>
                </div>

                <div className="space-y-3.5 text-ink-soft text-sm sm:text-base leading-relaxed mb-6">
                  <p>
                    CS Prashant Kumar, FCS is a Company Secretary and regulatory professional with 13+ years of experience across corporate law, compliance, corporate governance, capital markets and regulatory matters.
                  </p>
                  <p>
                    He has worked closely with complex regulatory frameworks and brings a practitioner’s perspective to understanding and applying regulations.
                  </p>
                  <p className="font-medium text-forest-deep">
                    RegMate was founded with a simple objective: to make regulatory knowledge more accessible, structured and practical for professionals — helping them understand regulations faster and apply them with greater confidence.
                  </p>
                </div>

                {/* Expertise Badges */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                  {[
                    'Corporate Law',
                    'Compliance Management',
                    'Corporate Governance',
                    'Capital Markets',
                    'Regulatory Advisory'
                  ].map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-mint text-forest-deep text-xs font-semibold border border-leaf/20"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Contact & Social Links */}
                <div className="flex flex-wrap items-center gap-3 pt-4 justify-center md:justify-start border-t border-line/60">
                  <a
                    href="tel:+919821008011"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
                  >
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>+91-9821008011</span>
                  </a>

                  <a
                    href="https://wa.me/919821008011"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 text-emerald-950 border border-[#25D366]/30 hover:bg-[#25D366]/20 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href="http://linkedin.com/in/csprashantkumar"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66C2]/10 text-emerald-950 border border-[#0A66C2]/30 hover:bg-[#0A66C2]/20 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
                    title="LinkedIn Profile"
                  >
                    <svg className="w-4 h-4 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA Banner ─────────────────────────────────── */}
        <section className="bg-forest-deep text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest to-forest-deep opacity-90" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-display font-bold mb-4">
              Ready to Master Regulatory Compliance?
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-8">
              Explore interactive regulations, practice with mock tests, or prepare for high-impact roles with RegMate Interview Pro.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/interactive-regulations"
                className="px-6 py-3.5 rounded-xl bg-gold hover:bg-gold-soft text-forest-deep font-bold text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                Explore Regulations
              </Link>
              <Link
                to="/learning"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/25 transition-all cursor-pointer"
              >
                Browse RegLearn
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

