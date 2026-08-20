import React from 'react';
import { Link } from 'react-router-dom';
import { Search, FolderOpen, ArrowRight } from 'lucide-react';

/**
 * EmptyState component with contextual messaging and action buttons per Doc 06
 */
export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'Try adjusting your search criteria or filters to find what you are looking for.',
  actionLabel,
  actionHref,
  onAction,
  className = ''
}) {
  return (
    <div className={`text-center py-12 px-4 max-w-md mx-auto rounded-3xl bg-mint/30 border border-line ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-mint-deep text-forest flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-display font-semibold text-lg sm:text-xl text-forest mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-xs sm:text-sm font-semibold hover:bg-leaf transition-colors cursor-pointer shadow-md"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {actionLabel && !actionHref && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-xs sm:text-sm font-semibold hover:bg-leaf transition-colors cursor-pointer shadow-md"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
