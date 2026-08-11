import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function RegulationRow({ to, onClick, icon: Icon, title, subtitle, badge }) {
  if (!to && !onClick) {
    throw new Error('RegulationRow requires either a "to" or "onClick" prop for navigation.');
  }

  const content = (
    <div className="flex items-center justify-between w-full px-6 py-4">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-paper border border-line flex items-center justify-center flex-shrink-0 group-hover:bg-mint-deep group-hover:border-leaf transition-colors">
            <Icon className="w-4 h-4 text-ink-soft group-hover:text-leaf transition-colors" />
          </div>
        )}
        <div>
          <span className="font-semibold text-forest-deep group-hover:text-leaf transition-colors">
            {title}
          </span>
          {subtitle && <span className="text-sm text-ink-soft ml-2">— {subtitle}</span>}
          {badge && (
            <span className="ml-3 px-2.5 py-0.5 bg-mint text-forest text-xs font-bold rounded-full">
              {badge}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-line group-hover:text-leaf transition-colors" />
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="cursor-target block w-full hover:bg-mint/40 transition-colors group border-b border-line last:border-b-0">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="cursor-target w-full text-left hover:bg-mint/40 transition-colors group border-b border-line last:border-b-0">
      {content}
    </button>
  );
}
