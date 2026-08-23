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
 * 6-Node Orbiting Capability Wheel Component
 * Central fixed shield radiating to 6 product nodes that orbit smoothly in a circle.
 * Counter-rotation ensures all text & icons stay perfectly horizontal & readable at all times.
 * Hovering over the orbit container pauses rotation for easy clicking.
 */
export default function HeroIllustration() {
  const nodes = [
    {
      id: 'reglearn',
      name: 'RegLearn',
      label: 'Master Courses',
      icon: GraduationCap,
      href: '/learn',
      angle: 270, // Top
      color: 'border-[#0B4D33]',
      bgIcon: 'bg-[#EAF4EF]',
      textIcon: 'text-[#0B4D33]',
      hoverText: 'group-hover:text-[#0B4D33]'
    },
    {
      id: 'reglens',
      name: 'RegLens',
      label: 'Statutory Text',
      icon: BookOpen,
      href: '/understand',
      angle: 330, // Top-Right
      color: 'border-emerald-600',
      bgIcon: 'bg-emerald-50',
      textIcon: 'text-emerald-700',
      hoverText: 'group-hover:text-emerald-700'
    },
    {
      id: 'regpractice',
      name: 'RegPractice',
      label: 'Quizzes & Mocks',
      icon: Zap,
      href: '/practice',
      angle: 30, // Bottom-Right
      color: 'border-blue-600',
      bgIcon: 'bg-blue-50',
      textIcon: 'text-blue-700',
      hoverText: 'group-hover:text-blue-700'
    },
    {
      id: 'regtools',
      name: 'RegTools',
      label: 'Compliance Tools',
      icon: Wrench,
      href: '/tools',
      angle: 90, // Bottom
      color: 'border-amber-600',
      bgIcon: 'bg-amber-50',
      textIcon: 'text-amber-700',
      hoverText: 'group-hover:text-amber-700'
    },
    {
      id: 'regready',
      name: 'RegReady',
      label: 'Interview Prep',
      icon: Briefcase,
      href: '/prepare',
      angle: 150, // Bottom-Left
      color: 'border-sky-600',
      bgIcon: 'bg-sky-50',
      textIcon: 'text-sky-700',
      hoverText: 'group-hover:text-sky-700'
    },
    {
      id: 'regintel',
      name: 'RegIntel',
      label: 'Regulatory Radar',
      icon: Rss,
      href: '/regintel',
      angle: 210, // Top-Left
      color: 'border-emerald-600',
      bgIcon: 'bg-emerald-50',
      textIcon: 'text-emerald-800',
      hoverText: 'group-hover:text-emerald-800'
    }
  ];

  return (
    <div className="orbit-group relative w-full max-w-[500px] h-[460px] mx-auto select-none p-4 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Radial Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full opacity-60"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(11,77,51,0.15) 0%, rgba(238,246,240,0.4) 55%, transparent 75%)',
        }}
      />

      {/* FIXED CENTRAL SHIELD (Does NOT rotate) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        <div className="bg-gradient-to-br from-[#0B4D33] to-[#042C1D] text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border-2 border-[#DCC79A]/50 flex flex-col items-center justify-center text-center w-32 h-32 sm:w-36 sm:h-36 transform hover:scale-105 transition-transform duration-300">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-1 shadow-inner">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#DCC79A]" />
          </div>
          <span className="font-display font-bold text-xs sm:text-sm tracking-wide text-white leading-tight">
            RegMate
          </span>
          <span className="text-[9px] text-[#DCC79A] font-semibold uppercase tracking-wider mt-0.5">
            Core Engine
          </span>
        </div>
      </div>

      {/* CONTINUOUS ORBIT CONTAINER (Rotates clockwise) */}
      <div className="absolute inset-0 z-20 flex items-center justify-center animate-orbit-ring pointer-events-none">
        
        {/* SVG Radiating Connector Lines (Rotates along with orbit) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 500 460"
          fill="none"
        >
          <defs>
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B4D33" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#B48A52" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Radiating connector spokes from center (250, 230) to orbit radius 160px */}
          {nodes.map((node) => {
            const rad = (node.angle * Math.PI) / 180;
            const x2 = 250 + Math.cos(rad) * 160;
            const y2 = 230 + Math.sin(rad) * 160;
            return (
              <line
                key={node.id}
                x1="250"
                y1="230"
                x2={x2}
                y2={y2}
                stroke="url(#orbitGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            );
          })}

          {/* Orbit Track Rings */}
          <circle cx="250" cy="230" r="160" stroke="#0B4D33" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="250" cy="230" r="115" stroke="#B48A52" strokeOpacity="0.12" strokeWidth="1" />
        </svg>

        {/* 6 ORBITING NODE CARDS (Positioned on circle, Counter-rotating to stay upright) */}
        {nodes.map((node) => {
          const Icon = node.icon;
          // Calculate initial CSS transform angle
          const rad = (node.angle * Math.PI) / 180;
          // Responsive orbit radius: 125px on mobile, 160px on desktop
          const radiusMobile = 120;
          const radiusDesktop = 160;

          const xM = Math.cos(rad) * radiusMobile;
          const yM = Math.sin(rad) * radiusMobile;

          const xD = Math.cos(rad) * radiusDesktop;
          const yD = Math.sin(rad) * radiusDesktop;

          return (
            <div
              key={node.id}
              className="absolute pointer-events-auto transition-transform"
              style={{
                transform: `translate(${xD}px, ${yD}px)`,
              }}
            >
              {/* Counter-rotating inner wrapper ensures text stays perfectly horizontal & upright */}
              <div className="animate-orbit-counter">
                <Link
                  to={node.href}
                  className={`bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200/90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group hover:-translate-y-0.5 max-w-[145px] sm:max-w-[160px] w-full border-l-4 ${node.color}`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${node.bgIcon} ${node.textIcon} group-hover:bg-forest group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold text-slate-900 leading-tight ${node.hoverText} truncate`}>
                      {node.name}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-slate-500 truncate leading-tight">
                      {node.label}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ONE-LINE TAGLINE BENEATH */}
      <div className="absolute bottom-2 z-30 text-center w-full">
        <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-xs text-[11px] sm:text-xs font-semibold text-slate-700">
          Six Specialized Engines • One Unified Regulatory Platform
        </span>
      </div>
    </div>
  );
}
