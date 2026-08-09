import React from 'react';

/**
 * The "Codex" signature visual:
 * - A tilted dark-green book/card (rotate -2deg) with shield + checkmark icon, serif label + subtitle
 * - 3 floating white tab cards with icons + short labels
 * - Soft radial mint glow behind
 */
export default function CodexVisual() {
  return (
    <div className="relative w-full max-w-[420px] mx-auto select-none" style={{ minHeight: 380 }}>

      {/* Radial mint glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(238,246,240,0.9) 0%, transparent 75%)',
        }}
      />

      {/* ── Main Codex Card ── */}
      <div
        className="absolute left-1/2 top-[12%] animate-float-slow"
        style={{
          transform: 'translateX(-50%) rotate(-2deg)',
          '--rotate': '-2deg',
          width: 220,
          zIndex: 10,
        }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0B4D33 0%, #073321 100%)',
            boxShadow: '0 24px 64px -16px rgba(7,51,33,0.55), 0 4px 16px rgba(7,51,33,0.3)',
          }}
        >
          {/* Top stripe — gold accent */}
          <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #B48A52, #DCC79A, #B48A52)' }} />

          <div className="px-5 py-5">
            {/* Shield + Checkmark icon */}
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 3L4 8v8c0 7.18 5.17 13.89 12 15.87C22.83 29.89 28 23.18 28 16V8L16 3z"
                  fill="rgba(255,255,255,0.15)"
                  stroke="#DCC79A"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 16.5l3.5 3.5 7-7"
                  stroke="#DCC79A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Serif label */}
            <div className="text-center mb-1">
              <span
                className="text-white text-base leading-tight block"
                style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
              >
                RegMate Codex
              </span>
            </div>
            {/* Subtitle */}
            <p
              className="text-center text-[11px] leading-relaxed"
              style={{ color: '#DCC79A' }}
            >
              Statutes · Circulars · Practice
            </p>

            {/* Small divider */}
            <div className="mt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Mini stat row */}
            <div className="mt-3 flex justify-around text-center">
              {[['25+', 'Laws'], ['1500+', 'Topics'], ['10K+', 'Users']].map(([n, l]) => (
                <div key={l}>
                  <div
                    className="text-sm font-bold leading-none"
                    style={{ color: '#DCC79A', fontFamily: 'Fraunces, Georgia, serif' }}
                  >{n}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom strip */}
          <div className="px-5 pb-4 pt-0">
            <div
              className="rounded-lg px-3 py-2 flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(18,138,84,0.4)' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="3" fill="#17A868" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                India's #1 Compliance Platform
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Tab Card 1: Interactive Regulations ── */}
      <div
        className="absolute animate-float-slow"
        style={{
          top: '8%',
          left: '-2%',
          '--rotate': '3deg',
          transform: 'rotate(3deg)',
          zIndex: 20,
          animationDelay: '0.5s',
          width: 158,
        }}
      >
        <div
          className="bg-white rounded-2xl px-3 py-3 flex items-start gap-2.5"
          style={{
            boxShadow: '0 4px 20px rgba(11,77,51,0.12), 0 1px 4px rgba(11,77,51,0.08)',
            border: '1px solid var(--line)',
          }}
        >
          <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: 'var(--mint)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="12" rx="1" fill="var(--forest)" opacity="0.3" />
              <rect x="9" y="2" width="5" height="12" rx="1" fill="var(--forest)" />
              <line x1="3" y1="5" x2="6" y2="5" stroke="white" strokeWidth="0.8" />
              <line x1="3" y1="7" x2="6" y2="7" stroke="white" strokeWidth="0.8" opacity="0.5" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold leading-tight" style={{ color: 'var(--ink)' }}>
              Interactive Regulations
            </div>
            <div className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--ink-soft)' }}>
              Section-wise interpretation
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Tab Card 2: Learning & Quizzes ── */}
      <div
        className="absolute animate-float-medium"
        style={{
          bottom: '22%',
          left: '-6%',
          '--rotate': '-3deg',
          transform: 'rotate(-3deg)',
          zIndex: 20,
          animationDelay: '1s',
          width: 155,
        }}
      >
        <div
          className="bg-white rounded-2xl px-3 py-3 flex items-start gap-2.5"
          style={{
            boxShadow: '0 4px 20px rgba(11,77,51,0.12), 0 1px 4px rgba(11,77,51,0.08)',
            border: '1px solid var(--line)',
          }}
        >
          <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: '#EEF3FF' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L2 5v5c0 3 2.5 5.5 6 6.5 3.5-1 6-3.5 6-6.5V5L8 2z"
                fill="#1E5AA8" opacity="0.15" stroke="#1E5AA8" strokeWidth="0.8" />
              <path d="M6 8l1.5 1.5L10 6.5" stroke="#1E5AA8" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold leading-tight" style={{ color: 'var(--ink)' }}>
              Learning & Quizzes
            </div>
            <div className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--ink-soft)' }}>
              Get certified
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Tab Card 3: Compliance Calendar ── */}
      <div
        className="absolute animate-float-slow"
        style={{
          bottom: '6%',
          right: '-4%',
          '--rotate': '2.5deg',
          transform: 'rotate(2.5deg)',
          zIndex: 20,
          animationDelay: '1.8s',
          width: 158,
        }}
      >
        <div
          className="bg-white rounded-2xl px-3 py-3 flex items-start gap-2.5"
          style={{
            boxShadow: '0 4px 20px rgba(11,77,51,0.12), 0 1px 4px rgba(11,77,51,0.08)',
            border: '1px solid var(--line)',
          }}
        >
          <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: '#FEF3E2' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke="#B48A52" strokeWidth="1" />
              <line x1="5" y1="1.5" x2="5" y2="5" stroke="#B48A52" strokeWidth="1" strokeLinecap="round" />
              <line x1="11" y1="1.5" x2="11" y2="5" stroke="#B48A52" strokeWidth="1" strokeLinecap="round" />
              <line x1="2" y1="7" x2="14" y2="7" stroke="#B48A52" strokeWidth="0.8" />
              <rect x="5.5" y="9" width="2" height="2" rx="0.5" fill="#B48A52" opacity="0.6" />
              <rect x="9" y="9" width="2" height="2" rx="0.5" fill="#B48A52" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold leading-tight" style={{ color: 'var(--ink)' }}>
              Compliance Calendar
            </div>
            <div className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--ink-soft)' }}>
              Never miss a due date
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to set container height */}
      <div style={{ height: 380 }} />
    </div>
  );
}
