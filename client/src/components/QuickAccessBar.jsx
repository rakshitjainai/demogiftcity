import React from 'react';
import { Settings, BookOpen, GraduationCap, Calendar, Calculator, FileText, HelpCircle, Gavel, Bell } from 'lucide-react';
import { QUICK_ACCESS_ITEMS } from '../data/mockData';

const iconMap = { BookOpen, GraduationCap, Calendar, Calculator, FileText, HelpCircle, Gavel, Bell };

export default function QuickAccessBar({ onCustomiseClick, onItemClick, visibleItems }) {
  const items = visibleItems || QUICK_ACCESS_ITEMS;

  return (
    <section
      className="py-10 border-b"
      style={{ background: 'white', borderColor: 'var(--line)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-xl sm:text-2xl leading-none"
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              Quick Access
            </h2>
          </div>

          <button
            onClick={onCustomiseClick}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:bg-[var(--mint)]"
            style={{ color: 'var(--leaf)', border: '1px solid var(--line)' }}
          >
            <Settings className="w-3.5 h-3.5" />
            Customise Dashboard
          </button>
        </div>

        {/* 8-column → 4 → 2 grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {items.map((item) => {
            const IconComp = iconMap[item.icon] || BookOpen;
            return (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className="group bg-white rounded-2xl p-4 border flex flex-col items-center gap-3 text-center transition-all hover-lift card-shadow focus-visible:outline-none focus-visible:ring-2"
                style={{
                  borderColor: 'var(--line)',
                  '--tw-ring-color': 'var(--leaf)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--leaf)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(11,77,51,0.1), 0 16px 40px -12px rgba(11,77,51,0.28)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Mint icon tile */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: 'var(--mint)' }}
                >
                  <IconComp
                    className="w-5 h-5 transition-colors"
                    style={{ color: 'var(--forest)' }}
                  />
                </div>
                <span
                  className="text-xs font-bold leading-snug"
                  style={{ color: 'var(--ink)' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
