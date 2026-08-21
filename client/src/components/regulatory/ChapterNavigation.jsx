import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, CheckCircle2, Search, Layers, Bookmark } from 'lucide-react';

export default function ChapterNavigation({ 
  chapters = [], 
  activeChapterId, 
  activeProvisionId, 
  onSelectProvision,
  searchTerm = ''
}) {
  const [expandedChapters, setExpandedChapters] = useState({
    [activeChapterId || 'I']: true
  });

  const toggleChapter = (chapId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapId]: !prev[chapId]
    }));
  };

  const filteredChapters = chapters.map(chap => {
    const matchingProvisions = chap.provisions.filter(p => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.number?.toLowerCase().includes(term) ||
        p.heading?.toLowerCase().includes(term) ||
        p.text?.toLowerCase().includes(term) ||
        p.simple_explanation?.toLowerCase().includes(term)
      );
    });

    return {
      ...chap,
      matchingProvisions,
      hasMatch: matchingProvisions.length > 0
    };
  }).filter(chap => !searchTerm || chap.hasMatch);

  return (
    <div className="h-full flex flex-col bg-white border-r border-line overflow-y-auto">
      {/* TOC Header */}
      <div className="p-4 border-b border-line bg-paper/60 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-leaf" />
            Table of Contents
          </span>
          <span className="text-[11px] text-ink-soft bg-mint px-2 py-0.5 rounded-full font-medium">
            {chapters.length} Chapters
          </span>
        </div>
      </div>

      {/* Chapters list */}
      <div className="divide-y divide-line/60 flex-1">
        {filteredChapters.map((chap) => {
          const isExpanded = searchTerm ? true : !!expandedChapters[chap.chapter_id];
          const hasActiveProvision = chap.provisions.some(p => p.number === activeProvisionId);
          const visibleProvisions = searchTerm ? chap.matchingProvisions : chap.provisions;

          return (
            <div key={chap.chapter_id} className="bg-white">
              {/* Chapter Accordion Header */}
              <button
                onClick={() => toggleChapter(chap.chapter_id)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors hover:bg-mint/50 ${
                  hasActiveProvision ? 'bg-mint/30 font-semibold' : ''
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gold block leading-tight">
                    Chapter {chap.chapter_number}
                  </span>
                  <h4 className="text-xs font-bold text-ink leading-tight truncate mt-0.5">
                    {chap.title}
                  </h4>
                  <span className="text-[10px] text-ink-soft">
                    {chap.provisions.length} Provisions
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-forest flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-ink-soft flex-shrink-0" />
                )}
              </button>

              {/* Provisions List */}
              {isExpanded && (
                <div className="bg-paper/40 border-t border-line/40 py-1">
                  {visibleProvisions.map((prov) => {
                    const isActive = prov.number === activeProvisionId;
                    return (
                      <button
                        key={prov.number}
                        onClick={() => onSelectProvision(chap.chapter_id, prov.number)}
                        className={`w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition-all text-xs border-l-2 ${
                          isActive
                            ? 'bg-mint border-forest text-forest font-bold shadow-2xs'
                            : 'border-transparent text-ink-soft hover:bg-mint/40 hover:text-ink'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                          isActive ? 'bg-forest text-white' : 'bg-gray-100 text-ink'
                        }`}>
                          {prov.number}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="leading-snug line-clamp-2">
                            {prov.heading}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
