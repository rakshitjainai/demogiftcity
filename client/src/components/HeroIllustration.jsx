import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Zap,
  Wrench,
  Briefcase,
  Rss,
  ShieldCheck
} from 'lucide-react';

/**
 * 6-Node Capability Wheel Component
 * Central shield radiating to 6 core product engines:
 * RegLearn, RegLens, RegPractice, RegTools, RegReady, RegIntel
 */
export default function HeroIllustration() {
  const nodes = [
    {
      id: 'reglearn',
      name: 'RegLearn',
      label: 'Master Courses',
      icon: GraduationCap,
      href: '/learn',
      borderHover: 'hover:border-[#0B4D33]',
      textHover: 'group-hover:text-[#0B4D33]',
      bgIcon: 'bg-[#EAF4EF]',
      textIcon: 'text-[#0B4D33]',
      bgHover: 'group-hover:bg-[#0B4D33]'
    },
    {
      id: 'reglens',
      name: 'RegLens',
      label: 'Statutory Text',
      icon: BookOpen,
      href: '/understand',
      borderHover: 'hover:border-emerald-600',
      textHover: 'group-hover:text-emerald-700',
      bgIcon: 'bg-emerald-50',
      textIcon: 'text-emerald-700',
      bgHover: 'group-hover:bg-emerald-700'
    },
    {
      id: 'regpractice',
      name: 'RegPractice',
      label: 'Quizzes & Mocks',
      icon: Zap,
      href: '/practice',
      borderHover: 'hover:border-blue-600',
      textHover: 'group-hover:text-blue-700',
      bgIcon: 'bg-blue-50',
      textIcon: 'text-blue-700',
      bgHover: 'group-hover:bg-blue-700'
    },
    {
      id: 'regready',
      name: 'RegReady',
      label: 'Interview Prep',
      icon: Briefcase,
      href: '/prepare',
      borderHover: 'hover:border-sky-600',
      textHover: 'group-hover:text-sky-700',
      bgIcon: 'bg-sky-50',
      textIcon: 'text-sky-700',
      bgHover: 'group-hover:bg-sky-700'
    },
    {
      id: 'regtools',
      name: 'RegTools',
      label: 'Compliance Tools',
      icon: Wrench,
      href: '/tools',
      borderHover: 'hover:border-amber-600',
      textHover: 'group-hover:text-amber-700',
      bgIcon: 'bg-amber-50',
      textIcon: 'text-amber-700',
      bgHover: 'group-hover:bg-amber-700'
    },
    {
      id: 'regintel',
      name: 'RegIntel',
      label: 'Regulatory Radar',
      icon: Rss,
      href: '/regintel',
      borderHover: 'hover:border-emerald-600',
      textHover: 'group-hover:text-emerald-800',
      bgIcon: 'bg-emerald-50',
      textIcon: 'text-emerald-800',
      bgHover: 'group-hover:bg-emerald-800'
    }
  ];

  return (
    <div className="relative w-full max-w-[480px] mx-auto select-none p-4 flex flex-col items-center">
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(11,77,51,0.12) 0%, rgba(238,246,240,0.5) 60%, transparent 80%)',
        }}
      />

      {/* SVG Connecting Lines Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        viewBox="0 0 480 380"
        fill="none"
      >
        <defs>
          <linearGradient id="wheelLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B4D33" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#B48A52" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Center: (240, 160) */}
        {/* Radiating dashed lines to 6 positions */}
        <line x1="240" y1="160" x2="90" y2="50" stroke="url(#wheelLineGrad)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="240" y1="160" x2="390" y2="50" stroke="url(#wheelLineGrad)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="240" y1="160" x2="410" y2="160" stroke="url(#wheelLineGrad)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="240" y1="160" x2="390" y2="270" stroke="url(#wheelLineGrad)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="240" y1="160" x2="90" y2="270" stroke="url(#wheelLineGrad)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="240" y1="160" x2="70" y2="160" stroke="url(#wheelLineGrad)" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* Concentric rings */}
        <circle cx="240" cy="160" r="110" stroke="#0B4D33" strokeOpacity="0.12" strokeWidth="1.5" strokeDasharray="5 5" />
        <circle cx="240" cy="160" r="150" stroke="#B48A52" strokeOpacity="0.1" strokeWidth="1" />
      </svg>

      {/* 6-Node Grid & Center Badge Container */}
      <div className="relative z-10 w-full grid grid-cols-2 gap-y-6 gap-x-4 items-center justify-items-center min-h-[320px] pt-1">

        {/* Node 1: RegLearn (Top-Left) */}
        <Link
          to="/learn"
          className="justify-self-start bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex items-center gap-2 group hover:-translate-y-0.5 max-w-[160px] sm:max-w-[170px] w-full"
        >
          <div className="w-8 h-8 rounded-xl bg-[#EAF4EF] text-[#0B4D33] group-hover:bg-[#0B4D33] group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-[#0B4D33] truncate">
              RegLearn
            </div>
            <div className="text-[10px] text-slate-500 truncate leading-tight">
              Master Courses
            </div>
          </div>
        </Link>

        {/* Node 2: RegLens (Top-Right) */}
        <Link
          to="/understand"
          className="justify-self-end bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex items-center gap-2 group hover:-translate-y-0.5 max-w-[160px] sm:max-w-[170px] w-full"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-700 truncate">
              RegLens
            </div>
            <div className="text-[10px] text-slate-500 truncate leading-tight">
              Statutory Text
            </div>
          </div>
        </Link>

        {/* Node 6: RegIntel (Mid-Left) */}
        <Link
          to="/regintel"
          className="justify-self-start bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex items-center gap-2 group hover:-translate-y-0.5 max-w-[160px] sm:max-w-[170px] w-full"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
            <Rss className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-800 truncate">
              RegIntel
            </div>
            <div className="text-[10px] text-slate-500 truncate leading-tight">
              Regulatory Radar
            </div>
          </div>
        </Link>

        {/* Node 3: RegPractice (Mid-Right) */}
        <Link
          to="/practice"
          className="justify-self-end bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex items-center gap-2 group hover:-translate-y-0.5 max-w-[160px] sm:max-w-[170px] w-full"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-700 truncate">
              RegPractice
            </div>
            <div className="text-[10px] text-slate-500 truncate leading-tight">
              Quizzes & Mocks
            </div>
          </div>
        </Link>

        {/* Node 5: RegReady (Bottom-Left) */}
        <Link
          to="/prepare"
          className="justify-self-start bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex items-center gap-2 group hover:-translate-y-0.5 max-w-[160px] sm:max-w-[170px] w-full"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-700 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-sky-700 truncate">
              RegReady
            </div>
            <div className="text-[10px] text-slate-500 truncate leading-tight">
              Interview Prep
            </div>
          </div>
        </Link>

        {/* Node 4: RegTools (Bottom-Right) */}
        <Link
          to="/tools"
          className="justify-self-end bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex items-center gap-2 group hover:-translate-y-0.5 max-w-[160px] sm:max-w-[170px] w-full"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-amber-700 truncate">
              RegTools
            </div>
            <div className="text-[10px] text-slate-500 truncate leading-tight">
              Compliance Tools
            </div>
          </div>
        </Link>
      </div>

      {/* ABSOLUTE CENTER SHIELD BADGE */}
      <div className="absolute top-[135px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="bg-gradient-to-br from-[#0B4D33] to-[#042C1D] text-white p-3 sm:p-4 rounded-3xl shadow-2xl border-2 border-[#DCC79A]/40 flex flex-col items-center justify-center text-center w-28 h-28 sm:w-32 sm:h-32 transform hover:scale-105 transition-transform duration-300 pointer-events-auto">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-1 shadow-inner">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#DCC79A]" />
          </div>
          <span className="font-display font-bold text-xs sm:text-sm tracking-wide text-white leading-tight">
            RegMate
          </span>
          <span className="text-[9px] text-[#DCC79A] font-semibold uppercase tracking-wider mt-0.5">
            Core Platform
          </span>
        </div>
      </div>

      {/* One-Line Tagline Beneath */}
      <div className="relative z-10 mt-6 text-center w-full">
        <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xs text-[11px] sm:text-xs font-semibold text-slate-700">
          Six Specialized Engines • One Unified Regulatory Platform
        </span>
      </div>
    </div>
  );
}
