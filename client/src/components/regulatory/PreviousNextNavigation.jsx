import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PreviousNextNavigation({ 
  prevProvision, 
  nextProvision, 
  onNavigate 
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-line">
      {/* Previous Button */}
      {prevProvision ? (
        <button
          onClick={() => onNavigate(prevProvision.chapter_id, prevProvision.number)}
          className="group p-4 rounded-xl bg-white border border-line hover:border-forest hover:bg-mint/30 transition-all text-left flex items-center gap-3 card-shadow"
        >
          <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-colors flex-shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
              Previous Provision
            </span>
            <span className="text-xs font-bold text-ink group-hover:text-forest transition-colors truncate block">
              Reg {prevProvision.number}: {prevProvision.heading}
            </span>
          </div>
        </button>
      ) : <div />}

      {/* Next Button */}
      {nextProvision ? (
        <button
          onClick={() => onNavigate(nextProvision.chapter_id, nextProvision.number)}
          className="group p-4 rounded-xl bg-white border border-line hover:border-forest hover:bg-mint/30 transition-all text-right flex items-center justify-end gap-3 card-shadow sm:col-start-2"
        >
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
              Next Provision
            </span>
            <span className="text-xs font-bold text-ink group-hover:text-forest transition-colors truncate block">
              Reg {nextProvision.number}: {nextProvision.heading}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-white transition-colors flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      ) : <div />}
    </div>
  );
}
