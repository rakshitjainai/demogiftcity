import React from 'react';
import { Link2, ArrowRight, BookOpen } from 'lucide-react';

export default function RelatedProvisions({ relatedProvisions = [], onSelectProvision }) {
  if (!relatedProvisions || relatedProvisions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-line card-shadow p-5 space-y-3">
      <div className="flex items-center gap-2 border-b border-line pb-2.5">
        <Link2 className="w-4 h-4 text-leaf" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-forest">
          Related Provisions & Cross-References
        </h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {relatedProvisions.map((relNum, idx) => (
          <button
            key={idx}
            onClick={() => onSelectProvision && onSelectProvision(null, relNum)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-mint hover:bg-mint-deep text-forest text-xs font-semibold border border-mint-deep transition-colors"
          >
            <span>Regulation {relNum}</span>
            <ArrowRight className="w-3 h-3 text-leaf" />
          </button>
        ))}
      </div>
    </div>
  );
}
