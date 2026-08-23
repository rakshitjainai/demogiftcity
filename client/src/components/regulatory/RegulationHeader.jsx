import React from 'react';
import { ShieldCheck, Calendar, FileText, Search, BookOpen, Layers, CheckCircle2, Sparkles, Scale } from 'lucide-react';

export default function RegulationHeader({ 
  regulation, 
  searchTerm, 
  onSearchChange,
  activeView,
  onViewChange 
}) {
  if (!regulation) return null;

  return (
    <div className="bg-white border-b border-line px-4 sm:px-6 lg:px-8 py-5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Title & Metadata */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-mint border border-mint-deep text-forest text-xs font-bold uppercase tracking-wider">
              <Scale className="w-3 h-3 text-leaf" />
              {regulation.regulator || 'IFSCA'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified · {regulation.versionDate || 'Current'}
            </span>
            {regulation.notification_number && (
              <span className="text-xs text-ink-soft hidden sm:inline">
                Gazette: <strong className="text-ink">{regulation.notification_number}</strong>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-forest-deep leading-tight truncate">
            {regulation.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-ink-soft flex-wrap">
            {regulation.commencement_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-leaf" />
                Commencement: <strong className="text-ink font-medium">{regulation.commencement_date}</strong>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-leaf" />
              <span>{regulation.totalChapters || regulation.chapters?.length || 0} Chapters</span>
              <span>·</span>
              <span>{regulation.totalProvisions || regulation.rawProvisions?.length || regulation.chapters?.reduce((t, c) => t + (c.provisions?.length || 0), 0) || 0} Provisions</span>
            </span>
          </div>
        </div>

        {/* Right: Search & View Modes */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search section, term, keyword..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-paper border border-line rounded-xl focus:outline-none focus:border-forest text-ink placeholder:text-ink-soft/70"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
