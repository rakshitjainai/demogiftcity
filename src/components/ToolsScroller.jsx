import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sliders, ShieldAlert, CheckCircle2, HelpCircle, FileCheck, ArrowUpRight } from 'lucide-react';
import { COMPLIANCE_TOOLS } from '../data/mockData';

const iconMap = {
  Calendar,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  FileCheck
};

export default function ToolsScroller({ onOpenTool }) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Left/Right Scroll Controls */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚡</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Explore Powerful Compliance Tools
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Interactive calculators, diagnostics, and statutory generators built for corporate professionals.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenTool && onOpenTool(COMPLIANCE_TOOLS[0].title)}
              className="hidden sm:inline-flex text-xs font-bold text-reg-green hover:underline items-center space-x-1"
            >
              <span>View All Tools</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleScroll('left')}
                className="p-2 rounded-full border border-slate-200 hover:border-reg-green hover:bg-emerald-50 text-slate-600 hover:text-reg-green transition-all shadow-xs"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2 rounded-full border border-slate-200 hover:border-reg-green hover:bg-emerald-50 text-slate-600 hover:text-reg-green transition-all shadow-xs"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex space-x-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {COMPLIANCE_TOOLS.map((tool) => {
            const IconComp = iconMap[tool.icon] || Calendar;
            return (
              <div
                key={tool.id}
                onClick={() => onOpenTool && onOpenTool(tool.title)}
                className="snap-start flex-shrink-0 w-72 sm:w-80 bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-reg-green shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100/80 group-hover:bg-reg-green text-reg-green group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white group-hover:bg-emerald-50 text-slate-700 group-hover:text-reg-green border border-slate-200">
                      {tool.tag}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {tool.category}
                  </span>
                  
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-reg-green transition-colors leading-snug">
                    {tool.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-reg-green group-hover:translate-x-1 transition-transform">
                  <span>Launch Tool</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
