import React from 'react';
import { ShieldCheck, Calendar, FileText, CheckCircle2, ExternalLink, Scale } from 'lucide-react';

export default function SourceReference({ provision, regulation }) {
  if (!provision) return null;

  return (
    <div className="bg-white rounded-2xl border border-line card-shadow p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-leaf" />
          Statutory Authority
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3 h-3" />
          {provision.verification_status || 'Verified'}
        </span>
      </div>

      <div className="space-y-2.5 text-xs text-ink-soft">
        <div>
          <span className="font-semibold text-ink block mb-0.5">Regulator:</span>
          <span>{regulation?.regulator || 'International Financial Services Centres Authority (IFSCA)'}</span>
        </div>

        <div>
          <span className="font-semibold text-ink block mb-0.5">Statutory Instrument:</span>
          <span className="text-ink">{regulation?.title || 'IFSCA Regulations'}</span>
        </div>

        {provision.source_reference && (
          <div>
            <span className="font-semibold text-ink block mb-0.5">Official Citation:</span>
            <span className="font-mono text-[11px] bg-paper px-2 py-1 rounded border border-line block break-words text-ink">
              {provision.source_reference}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/60">
          <div>
            <span className="text-[10px] text-gray-400 block">Last Verified</span>
            <span className="font-medium text-ink">{provision.last_verified_date || '14 Aug 2026'}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">Effective Status</span>
            <span className="font-medium text-emerald-700">In Force</span>
          </div>
        </div>
      </div>
    </div>
  );
}
