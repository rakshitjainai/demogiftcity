import React from 'react';
import { Scale, FileCode, BookMarked, CheckSquare, Users } from 'lucide-react';
import { STATS } from '../data/mockData';

const iconMap = { Scale, FileCode, BookMarked, CheckSquare, Users };

export default function StatsBand() {
  return (
    <section className="py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-[22px] py-10 px-6 sm:px-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-deep) 100%)',
          }}
        >
          {/* Radial glow corner decoration */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none animate-pulse-glow"
            style={{ background: 'radial-gradient(circle, rgba(18,138,84,0.3) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(220,199,154,0.12) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 text-center">
            {STATS.map((stat, idx) => {
              const IconComp = iconMap[stat.icon] || Scale;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-3 group cursor-default"
                >
                  {/* Circular outlined icon */}
                  <div
                    className="w-13 h-13 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1.5px solid rgba(255,255,255,0.18)',
                      width: 52,
                      height: 52,
                    }}
                  >
                    <IconComp className="w-5 h-5" style={{ color: 'var(--gold-soft)' }} />
                  </div>

                  {/* Big serif number in gold-soft */}
                  <div
                    style={{
                      fontFamily: 'Fraunces, Georgia, serif',
                      fontWeight: 600,
                      fontSize: '1.875rem',
                      color: 'var(--gold-soft)',
                      lineHeight: 1,
                    }}
                  >
                    {stat.count}
                  </div>

                  {/* Label */}
                  <div
                    className="text-xs font-medium leading-snug max-w-[120px] mx-auto"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
