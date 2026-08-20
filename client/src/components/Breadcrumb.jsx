import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb navigation component per Doc 06 §28
 * items: Array<{ label: string, href?: string, active?: boolean }>
 */
export default function Breadcrumb({ items = [], className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-1.5 text-xs sm:text-sm text-ink-soft py-2.5 overflow-x-auto no-scrollbar ${className}`}
    >
      <Link 
        to="/" 
        className="inline-flex items-center gap-1 hover:text-forest transition-colors font-medium flex-shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1 || item.active;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-forest truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link 
                to={item.href} 
                className="hover:text-forest transition-colors font-medium truncate max-w-[150px] sm:max-w-xs flex-shrink-0"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
