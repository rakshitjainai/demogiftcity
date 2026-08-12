import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import CodexVisual from './HeroIllustration';
import { POPULAR_SEARCHES } from '../data/mockData';

export default function HeroSection({ onSearchSubmit, onSelectPill, onOpenTool }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) onSearchSubmit(searchTerm);
  };

  return (
    <section
      className="relative overflow-hidden py-14 lg:py-20"
      style={{ background: 'var(--paper)' }}
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, var(--forest) 0px, var(--forest) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--forest) 0px, var(--forest) 1px, transparent 1px, transparent 40px)',
        }}
      />
      {/* Soft green radial glow top-right */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(238,246,240,0.9) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* ── Left Column (55%) ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Eyebrow */}
            <div className="eyebrow flex items-center gap-2">
              <span style={{ color: 'var(--gold)' }}>§</span>
              <span style={{ color: 'var(--gold)' }}>Regulatory intelligence • learning • compliance</span>
            </div>

            {/* H1 */}
            <h1
              className="leading-[1.1] tracking-tight"
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontWeight: 700,
                fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                color: 'var(--ink)',
              }}
            >
              Understand regulations. Learn faster. Work smarter.
            </h1>

            {/* Subtitle */}
            <p
              className="text-base sm:text-lg leading-relaxed max-w-[540px]"
              style={{ color: 'var(--ink-soft)', fontWeight: 400 }}
            >
              RegMate brings structured regulatory content, learning modules, quizzes, practical resources and compliance tools into one professional platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a href="/knowledge-hub" className="cursor-target px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover-lift" style={{ background: 'var(--forest)', color: 'white', boxShadow: '0 4px 12px rgba(11,77,51,0.3)' }}>
                Explore Knowledge Hub
              </a>
              <a href="/register" className="cursor-target px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover-lift" style={{ background: 'var(--paper)', color: 'var(--forest)', border: '1.5px solid var(--forest)' }}>
                Join RegMate
              </a>
            </div>

            {/* Popular pill tags */}
            <div className="space-y-2 pt-1">
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--ink-soft)' }}
              >
                Popular:
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSearchTerm(pill); onSelectPill(pill); }}
                    className="px-3 py-1 text-xs font-semibold rounded-full transition-all hover:-translate-y-0.5 hover:shadow-sm"
                    style={{
                      background: 'var(--mint)',
                      color: 'var(--forest)',
                      border: '1px solid var(--mint-deep)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--mint-deep)';
                      e.currentTarget.style.borderColor = 'var(--leaf)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--mint)';
                      e.currentTarget.style.borderColor = 'var(--mint-deep)';
                    }}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right Column (45%) — Codex Visual ── */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <CodexVisual />
          </div>

        </div>
      </div>
    </section>
  );
}
