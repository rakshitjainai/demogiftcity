import React from 'react';
import { Sparkles, HelpCircle, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ExplanationPanel({ provision }) {
  if (!provision?.simple_explanation && !provision?.regmate_comment) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-line card-shadow p-6 sm:p-7 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-line">
        <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center text-forest">
          <Sparkles className="w-4 h-4 text-leaf" />
        </div>
        <div>
          <h3 className="text-base font-display font-bold text-forest-deep">
            RegMate Simple Explanation
          </h3>
          <p className="text-xs text-ink-soft">Plain-English breakdown and conceptual interpretation</p>
        </div>
      </div>

      {provision.simple_explanation && (
        <div className="text-sm sm:text-[15px] leading-relaxed text-ink space-y-3 font-sans">
          <p>{provision.simple_explanation}</p>
        </div>
      )}

      {provision.regmate_comment && (
        <div className="p-4 rounded-xl bg-mint/50 border border-mint-deep text-xs sm:text-sm text-forest-deep space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-forest">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>RegMate Expert Note</span>
          </div>
          <p className="leading-relaxed">{provision.regmate_comment}</p>
        </div>
      )}

      {provision.example && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-950 space-y-1">
          <strong className="font-bold text-amber-900 block">Practical Example:</strong>
          <p className="leading-relaxed">{provision.example}</p>
        </div>
      )}
    </div>
  );
}
