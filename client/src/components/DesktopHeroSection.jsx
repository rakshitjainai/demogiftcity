import React, { useState } from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck, 
  LayoutDashboard, 
  Briefcase, 
  Folder, 
  Bell, 
  Award, 
  HelpCircle, 
  Settings, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  Building,
  Scale,
  Shield,
  Users,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroIllustration from './HeroIllustration';

export default function DesktopHeroSection({ onSearchSubmit, onSelectPill }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const popularTopics = [
    { label: 'IFSCA Regulations', icon: BookOpen },
    { label: 'SEBI Regulations', icon: Scale },
    { label: 'MCA Corporate Laws', icon: Building },
    { label: 'RBI Regulations', icon: Shield },
    { label: 'AML/CFT', icon: CheckCircle2 },
    { label: 'Companies Act 2013', icon: FileText },
    { label: 'Related Party Transactions', icon: Users },
  ];

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="relative bg-[var(--paper)] text-[var(--ink)] overflow-hidden">
      
      {/* ── TOP HERO GRID (Desktop 1024px+) ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        
        {/* Dark Green Diagonal Right Background shape */}
        <div 
          className="absolute top-0 right-[-20vw] w-[65vw] h-full bg-[#042C1D] z-0 hidden lg:block rounded-l-[80px]"
          style={{
            clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        >
          {/* Faint Decorative Watermark Icons */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-12 opacity-10 text-white pointer-events-none">
            {/* Scales of Justice */}
            <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-8 4v2a8 8 0 0016 0V7l-8-4zM4 11l4 6H0l4-6zm16 0l4 6h-8l4-6z" />
            </svg>
            {/* Gavel */}
            <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 2m0 0l-7 7a2 2 0 01-2.828-2.828l7-7m2.828 2.828L20 4M8 12l4 4" />
            </svg>
            {/* Building / Court */}
            <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {/* Document Magnifier */}
            <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Small Pill Badge */}
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[var(--mint)] border border-[var(--mint-deep)] text-[11px] font-bold text-[var(--forest)] uppercase tracking-wider">
              LEGAL INTELLIGENCE • STRUCTURED LEARNING • PRACTICAL COMPLIANCE
            </div>

            {/* Large Serif Headline */}
            <h1 
              className="tracking-tight leading-[1.1]"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700 }}
            >
              <span className="block text-4xl lg:text-[46px] xl:text-[50px] text-[var(--ink)]">
                Understand the Law.
              </span>
              <span className="block text-4xl lg:text-[46px] xl:text-[50px] text-[var(--forest)] my-1">
                Master Compliance.
              </span>
              <span className="block text-4xl lg:text-[46px] xl:text-[50px] text-[var(--ink)]">
                Work Smarter.
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-sm lg:text-[15px] leading-relaxed text-[var(--ink-soft)] max-w-xl">
              RegMate turns complex laws, regulations and regulatory requirements into clear understanding, structured learning and practical compliance intelligence — across GIFT IFSC, SEBI, MCA, RBI and beyond.
            </p>

            {/* Three-Column Feature Row */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              
              {/* Feature 1 */}
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[var(--line)] shadow-xs flex items-center justify-center text-[var(--forest)]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[var(--ink)] leading-tight">
                  Interactive Regulations
                </h3>
                <p className="text-[11px] text-[var(--ink-soft)] leading-snug">
                  Read the law with expert explanations, practical points, examples & more.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[var(--line)] shadow-xs flex items-center justify-center text-[var(--forest)]">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[var(--ink)] leading-tight">
                  Structured Learning
                </h3>
                <p className="text-[11px] text-[var(--ink-soft)] leading-snug">
                  Learn chapter-wise with quizzes, summaries, risk points and real-world insights.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[var(--line)] shadow-xs flex items-center justify-center text-[var(--forest)]">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[var(--ink)] leading-tight">
                  Practical Compliance
                </h3>
                <p className="text-[11px] text-[var(--ink-soft)] leading-snug">
                  Apply knowledge with tools, templates, checklists and compliance resources.
                </p>
              </div>

            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link 
                to="/interactive-regulations" 
                className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-[var(--forest)] hover:bg-[var(--forest-deep)] transition-all shadow-md flex items-center gap-2 hover:-translate-y-0.5"
              >
                Explore RegMate <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/learning" 
                className="px-6 py-3 rounded-xl font-bold text-sm text-[var(--forest)] bg-white border-2 border-[var(--forest)] hover:bg-[var(--mint)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
              >
                Start Learning <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Small Tagline */}
            <p className="text-xs text-[var(--ink-soft)] font-medium">
              Law explained. Knowledge structured. Compliance simplified.
            </p>

          </div>

          {/* ── RIGHT COLUMN: Six-Node Capability Wheel ── */}
          <div className="lg:col-span-6 flex items-center justify-center min-h-[440px]">
            <HeroIllustration />
          </div>

        </div>

      </div>

      {/* ── POPULAR TOPICS ROW ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
        <div className="bg-white rounded-2xl border border-[var(--line)] p-3 px-5 shadow-xs flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[var(--ink)] font-serif mr-1">
            Popular Topics
          </span>

          {popularTopics.map((topic, idx) => {
            const Icon = topic.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPill && onSelectPill(topic.label)}
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[var(--mint)] text-[var(--forest)] border border-[var(--mint-deep)] hover:bg-[var(--mint-deep)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{topic.label}</span>
              </button>
            );
          })}

          {/* More Topics Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[var(--mint)] text-[var(--forest)] border border-[var(--mint-deep)] hover:bg-[var(--mint-deep)] transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>More Topics</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-[var(--line)] p-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-xs font-semibold hover:bg-[var(--mint)] text-[var(--forest)] rounded-lg cursor-pointer">
                  FEMA Regulations
                </div>
                <div className="px-3 py-1.5 text-xs font-semibold hover:bg-[var(--mint)] text-[var(--forest)] rounded-lg cursor-pointer">
                  GIFT City Tax Rules
                </div>
                <div className="px-3 py-1.5 text-xs font-semibold hover:bg-[var(--mint)] text-[var(--forest)] rounded-lg cursor-pointer">
                  IFSCA Circulars
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DARK GREEN TRUST BAND ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-[#042C1D] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          
          {/* Top Half of Trust Band */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
            
            {/* Title */}
            <h3 
              className="text-lg sm:text-xl font-bold max-w-md text-center md:text-left"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              Trusted by Compliance Professionals, Lawyers, CS, CA & Corporates
            </h3>

            {/* Center Avatars */}
            <div className="flex items-center -space-x-3">
              {avatars.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`User ${index + 1}`}
                  className="w-10 h-10 rounded-full border-2 border-[#042C1D] object-cover shadow-sm"
                />
              ))}
            </div>

            {/* Rating badge */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-emerald-700/80 border border-emerald-500/40 font-bold text-white text-base flex items-center justify-center shadow-inner">
                4.8
              </div>
              <div>
                <span className="block text-sm font-bold text-white">4.8/5</span>
                <span className="text-xs text-emerald-100/70 font-medium">from 1,200+ users</span>
              </div>
            </div>

          </div>

          {/* Bottom Half of Trust Band: 4 Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            
            {/* Pillar 1 */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border border-emerald-500/30 bg-emerald-900/40 flex items-center justify-center text-emerald-300 flex-shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Trusted Content</h4>
                <p className="text-[11px] text-emerald-100/70 leading-snug mt-0.5">
                  Curated by experts & industry professionals
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border border-emerald-500/30 bg-emerald-900/40 flex items-center justify-center text-emerald-300 flex-shrink-0 shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Structured Learning</h4>
                <p className="text-[11px] text-emerald-100/70 leading-snug mt-0.5">
                  From basics to advanced regulatory depths
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border border-emerald-500/30 bg-emerald-900/40 flex items-center justify-center text-emerald-300 flex-shrink-0 shadow-sm">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Practical Tools</h4>
                <p className="text-[11px] text-emerald-100/70 leading-snug mt-0.5">
                  Templates, checklists & compliance tools
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border border-emerald-500/30 bg-emerald-900/40 flex items-center justify-center text-emerald-300 flex-shrink-0 shadow-sm">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Always Updated</h4>
                <p className="text-[11px] text-emerald-100/70 leading-snug mt-0.5">
                  Regulatory updates, circulars & notifications
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
