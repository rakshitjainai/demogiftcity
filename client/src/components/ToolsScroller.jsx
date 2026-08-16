import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sliders, ShieldAlert, CheckCircle2, HelpCircle, FileCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMPLIANCE_TOOLS } from '../data/mockData';

const iconMap = { Calendar, Sliders, ShieldAlert, CheckCircle2, HelpCircle, FileCheck };

export default function ToolsScroller({ onOpenTool }) {
  const scrollRef = useRef(null);

  const handleScroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section
      className="py-12"
      style={{ background: 'white', borderBottom: '1px solid var(--line)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mint outer panel per spec */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'var(--mint)', border: '1px solid var(--mint-deep)' }}
        >

          {/* Header row */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              {/* Eyebrow */}
              <div className="eyebrow flex items-center gap-1 mb-1.5">
                <span style={{ color: 'var(--gold)' }}>§</span>
                <span style={{ color: 'var(--gold)' }}>Tools & Utilities</span>
              </div>
              <h2
                className="text-xl sm:text-2xl leading-none"
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontWeight: 600,
                  color: 'var(--ink)',
                }}
              >
                Explore Powerful Compliance Tools
              </h2>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/tools"
                className="hidden sm:flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer"
                style={{ color: 'var(--leaf)', textDecoration: 'none' }}
              >
                View All Tools <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              {/* Prev/Next scroll buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleScroll('left')}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all hover:bg-[var(--forest)] hover:text-white border cursor-pointer"
                  style={{ borderColor: 'var(--line)' }}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all hover:bg-[var(--forest)] hover:text-white border cursor-pointer"
                  style={{ borderColor: 'var(--line)' }}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal scrollable row */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {COMPLIANCE_TOOLS.map((tool) => {
              const IconComp = iconMap[tool.icon] || Calendar;
              return (
                <Link
                  key={tool.id}
                  to={`/tools/${tool.slug}`}
                  className="flex-shrink-0 w-64 sm:w-72 text-left bg-white rounded-2xl p-5 flex flex-col gap-4 transition-all hover-lift card-shadow group block no-underline cursor-pointer"
                  style={{
                    scrollSnapAlign: 'start',
                    border: '1px solid var(--line)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--leaf)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--line)';
                  }}
                >
                  {/* Icon + tag row */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:bg-[var(--forest)]"
                      style={{ background: 'var(--mint)' }}
                    >
                      <IconComp
                        className="w-5 h-5 transition-colors group-hover:text-white"
                        style={{ color: 'var(--forest)' }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--mint-deep)', color: 'var(--forest)' }}
                    >
                      {tool.tag}
                    </span>
                  </div>

                  {/* Category */}
                  <div>
                    <span className="eyebrow" style={{ color: 'var(--gold)' }}>{tool.category}</span>
                    <h3
                      className="text-sm font-semibold leading-snug mt-1 group-hover:text-[var(--forest)] transition-colors"
                      style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--ink)' }}
                    >
                      {tool.title}
                    </h3>
                    <p className="text-[12px] mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--ink-soft)' }}>
                      {tool.description}
                    </p>
                  </div>

                  {/* Launch link */}
                  <div
                    className="flex items-center justify-between text-xs font-semibold pt-3 group-hover:translate-x-1 transition-transform"
                    style={{ color: 'var(--leaf)', borderTop: '1px solid var(--line)' }}
                  >
                    <span>Launch Tool</span>
                    <span>→</span>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
