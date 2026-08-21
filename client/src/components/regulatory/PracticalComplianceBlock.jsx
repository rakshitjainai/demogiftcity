import React from 'react';
import { CheckSquare, UserCheck, Clock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function PracticalComplianceBlock({ provision }) {
  const hasComplianceInfo = 
    provision?.practical_point || 
    provision?.compliance_point || 
    provision?.compliance_frequency || 
    provision?.responsible_person || 
    provision?.applicability;

  if (!hasComplianceInfo) return null;

  return (
    <div className="bg-white rounded-2xl border border-line card-shadow p-6 sm:p-7 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-line">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
          <CheckSquare className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-base font-display font-bold text-forest-deep">
            Practical Compliance & Action Points
          </h3>
          <p className="text-xs text-ink-soft">Operational requirements, responsibilities, and timing</p>
        </div>
      </div>

      {/* Grid of Key Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {provision.applicability && (
          <div className="p-3.5 rounded-xl bg-paper border border-line space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              Applicability
            </span>
            <p className="text-xs font-semibold text-ink leading-snug">
              {provision.applicability}
            </p>
          </div>
        )}

        {provision.responsible_person && (
          <div className="p-3.5 rounded-xl bg-paper border border-line space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-forest" />
              Responsible Person
            </span>
            <p className="text-xs font-semibold text-ink leading-snug">
              {provision.responsible_person}
            </p>
          </div>
        )}

        {provision.compliance_frequency && (
          <div className="p-3.5 rounded-xl bg-paper border border-line space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-forest" />
              Filing / Audit Frequency
            </span>
            <p className="text-xs font-semibold text-ink leading-snug">
              {provision.compliance_frequency}
            </p>
          </div>
        )}

        {provision.effective_date && (
          <div className="p-3.5 rounded-xl bg-paper border border-line space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-forest" />
              Effective Date
            </span>
            <p className="text-xs font-semibold text-ink leading-snug">
              {provision.effective_date}
            </p>
          </div>
        )}
      </div>

      {/* Practical Point */}
      {provision.practical_point && (
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-1">
          <strong className="font-bold text-emerald-900 block flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            Compliance Takeaway
          </strong>
          <p className="leading-relaxed">{provision.practical_point}</p>
        </div>
      )}

      {/* Compliance Point */}
      {provision.compliance_point && (
        <div className="p-4 rounded-xl bg-mint border border-mint-deep text-xs sm:text-sm text-forest-deep space-y-1">
          <strong className="font-bold text-forest block">Execution Checklist:</strong>
          <p className="leading-relaxed">{provision.compliance_point}</p>
        </div>
      )}
    </div>
  );
}
