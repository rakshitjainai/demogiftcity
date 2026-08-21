import React from 'react';
import { AlertTriangle, HelpCircle, Hash, Lightbulb, ShieldAlert } from 'lucide-react';

export default function RiskInterviewInsights({ provision }) {
  const hasInsights = 
    provision?.risk_point || 
    provision?.interview_point || 
    provision?.important_numbers || 
    provision?.memory_aid;

  if (!hasInsights) return null;

  return (
    <div className="bg-white rounded-2xl border border-line card-shadow p-6 sm:p-7 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-line">
        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h3 className="text-base font-display font-bold text-forest-deep">
            Risk Points, Numbers & Interview Insights
          </h3>
          <p className="text-xs text-ink-soft">Pitfalls to avoid, key numerical limits, and test questions</p>
        </div>
      </div>

      {/* Risk Point Alert */}
      {provision.risk_point && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-950 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>High-Risk Compliance Area / Penalty Trigger</span>
          </div>
          <p className="leading-relaxed">{provision.risk_point}</p>
        </div>
      )}

      {/* Interview Point */}
      {provision.interview_point && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-950 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-blue-800">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Interview / Professional Exam Question</span>
          </div>
          <p className="leading-relaxed">{provision.interview_point}</p>
        </div>
      )}

      {/* Important Numbers */}
      {provision.important_numbers && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs sm:text-sm text-purple-950 space-y-1">
          <strong className="font-bold text-purple-900 block flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-purple-600" />
            Important Statutory Thresholds & Numbers:
          </strong>
          <p className="leading-relaxed">{provision.important_numbers}</p>
        </div>
      )}

      {/* Memory Aid */}
      {provision.memory_aid && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-1">
          <strong className="font-bold text-amber-900 block flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            Memory Aid / Mnemonics:
          </strong>
          <p className="leading-relaxed">{provision.memory_aid}</p>
        </div>
      )}
    </div>
  );
}
