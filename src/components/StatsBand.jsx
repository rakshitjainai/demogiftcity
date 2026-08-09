import React from 'react';
import { Scale, FileCode, BookMarked, CheckSquare, Users } from 'lucide-react';
import { STATS } from '../data/mockData';

const iconMap = {
  Scale,
  FileCode,
  BookMarked,
  CheckSquare,
  Users
};

export default function StatsBand() {
  return (
    <section className="bg-gradient-to-r from-[#074025] via-[#0B5C36] to-[#0F6B3F] text-white py-10 shadow-inner relative overflow-hidden">
      
      {/* Background Decorative Ripples */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 items-center text-center">
          
          {STATS.map((stat, idx) => {
            const IconComp = iconMap[stat.icon] || Scale;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-3 space-y-2.5 group cursor-default"
              >
                <div className="w-13 h-13 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/20 flex items-center justify-center text-emerald-300 group-hover:text-amber-300 transition-all group-hover:scale-110 shadow-md">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-emerald-200 transition-colors">
                    {stat.count}
                  </div>
                  <div className="text-xs font-semibold text-emerald-100/80 mt-1 max-w-[140px] mx-auto leading-snug">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
