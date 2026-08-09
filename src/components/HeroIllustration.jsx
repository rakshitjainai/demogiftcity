import React from 'react';

export default function HeroIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center p-2">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-emerald-700/20 blur-3xl rounded-full transform scale-110"></div>
      
      {/* Main SVG Composition */}
      <svg
        viewBox="0 0 600 500"
        className="w-full h-auto drop-shadow-2xl overflow-visible relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B5C36" />
            <stop offset="50%" stopColor="#0F6B3F" />
            <stop offset="100%" stopColor="#063820" />
          </linearGradient>

          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="skylineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="pageGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          <linearGradient id="pageGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <radialGradient id="badgeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Shield Backing with subtle stroke */}
        <path
          d="M300,30 C420,30 500,70 500,160 C500,310 380,410 300,460 C220,410 100,310 100,160 C100,70 180,30 300,30 Z"
          fill="url(#shieldGrad)"
          stroke="#34D399"
          strokeWidth="3"
          strokeDasharray="8 4"
          className="animate-pulse-subtle"
        />

        {/* City Skyline Silhouette behind the book */}
        <g fill="url(#skylineGrad)">
          {/* GIFT City / Modern Skyline */}
          <rect x="170" y="110" width="35" height="110" rx="2" />
          <rect x="210" y="80" width="45" height="140" rx="3" />
          <rect x="260" y="60" width="55" height="160" rx="4" />
          <polygon points="260,60 287.5,35 315,60" fill="#34D399" opacity="0.6" />
          <rect x="320" y="90" width="40" height="130" rx="3" />
          <rect x="365" y="120" width="45" height="100" rx="2" />
          <rect x="415" y="140" width="30" height="80" rx="2" />
          {/* Skyline Windows */}
          <circle cx="287.5" cy="85" r="4" fill="#F59E0B" />
          <circle cx="287.5" cy="105" r="4" fill="#34D399" />
          <rect x="220" y="100" width="8" height="12" fill="#F8FAFC" opacity="0.6" />
          <rect x="235" y="100" width="8" height="12" fill="#F8FAFC" opacity="0.6" />
          <rect x="220" y="125" width="8" height="12" fill="#F8FAFC" opacity="0.6" />
          <rect x="330" y="110" width="8" height="12" fill="#F8FAFC" opacity="0.6" />
        </g>

        {/* Large Open Book Base */}
        <g transform="translate(0, 40)">
          {/* Book Drop Shadow */}
          <ellipse cx="300" cy="340" rx="190" ry="25" fill="#000000" opacity="0.3" />

          {/* Left Page Book Curve */}
          <path
            d="M130,220 C180,200 250,210 300,230 L300,320 C250,300 180,290 130,310 Z"
            fill="url(#pageGradLeft)"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Right Page Book Curve */}
          <path
            d="M470,220 C420,200 350,210 300,230 L300,320 C350,300 420,290 470,310 Z"
            fill="url(#pageGradRight)"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Book Spine Center */}
          <path d="M300,230 L300,320" stroke="#0B5C36" strokeWidth="4" />

          {/* Page Lines Left */}
          <line x1="160" y1="235" x2="270" y2="230" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <line x1="160" y1="255" x2="265" y2="250" stroke="#0B5C36" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="160" y1="275" x2="250" y2="270" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

          {/* Page Lines Right */}
          <line x1="330" y1="230" x2="440" y2="235" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <line x1="335" y1="250" x2="440" y2="255" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="350" y1="270" x2="440" y2="275" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </g>

        {/* Scales of Justice Icon (Gold Accent - Floating Left) */}
        <g transform="translate(110, 100) scale(0.9)">
          <circle cx="50" cy="50" r="42" fill="#074025" stroke="#F59E0B" strokeWidth="3" />
          {/* Scales Icon */}
          <line x1="50" y1="25" x2="50" y2="70" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <line x1="25" y1="35" x2="75" y2="35" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <line x1="25" y1="35" x2="18" y2="55" stroke="#F1F5F9" strokeWidth="2" />
          <line x1="25" y1="35" x2="32" y2="55" stroke="#F1F5F9" strokeWidth="2" />
          <path d="M15,55 Q25,65 35,55 Z" fill="#F59E0B" />
          <line x1="75" y1="35" x2="68" y2="55" stroke="#F1F5F9" strokeWidth="2" />
          <line x1="75" y1="35" x2="82" y2="55" stroke="#F1F5F9" strokeWidth="2" />
          <path d="M65,55 Q75,65 85,55 Z" fill="#F59E0B" />
          <rect x="40" y="68" width="20" height="6" rx="2" fill="#F59E0B" />
        </g>

        {/* Wooden/Gold Gavel Graphic (Floating Right) */}
        <g transform="translate(420, 100) scale(0.85)">
          <circle cx="50" cy="50" r="42" fill="#074025" stroke="#34D399" strokeWidth="3" />
          {/* Gavel Head */}
          <rect x="25" y="30" width="50" height="20" rx="4" fill="url(#goldGrad)" transform="rotate(-25 50 40)" />
          <rect x="20" y="33" width="6" height="14" rx="2" fill="#FFFFFF" transform="rotate(-25 50 40)" />
          <rect x="74" y="33" width="6" height="14" rx="2" fill="#FFFFFF" transform="rotate(-25 50 40)" />
          {/* Gavel Handle */}
          <rect x="46" y="45" width="8" height="45" rx="3" fill="#D97706" transform="rotate(-25 50 40)" />
        </g>

        {/* Central Floating Certified Badge */}
        <g transform="translate(250, 190)">
          <circle cx="50" cy="50" r="38" fill="url(#goldGrad)" stroke="#FFFFFF" strokeWidth="3" className="drop-shadow-lg" />
          <path d="M50,22 L57,36 L72,38 L61,49 L64,64 L50,56 L36,64 L39,49 L28,38 L43,36 Z" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}
