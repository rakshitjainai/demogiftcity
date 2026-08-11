import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import RegulationRow from '../components/RegulationRow';
import { ACTS_DATA } from '../data/regulationsData';

export default function InteractiveRegulations() {
  const [expandedAct, setExpandedAct] = useState(null);

  const acts = Object.entries(ACTS_DATA).map(([slug, data]) => ({
    slug,
    title: data.title,
    totalChapters: data.totalChapters,
    chapters: data.chapters,
  }));

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-12">
        <span className="eyebrow block mb-4">§ Knowledge</span>
        <h1 className="text-4xl font-display text-forest-deep mb-4">Interactive Regulations</h1>
        <p className="text-ink-soft text-lg">Browse acts and regulations chapter by chapter, section by section.</p>
      </div>

      <div className="space-y-4">
        {acts.map((act, idx) => {
          const isOpen = expandedAct === act.slug;
          const previewChapters = act.chapters.slice(0, 5);

          return (
            <div key={act.slug} className="bg-white border border-line rounded-xl overflow-hidden card-shadow">
              <button
                onClick={() => setExpandedAct(isOpen ? null : act.slug)}
                className="cursor-target w-full text-left px-6 py-5 flex items-center justify-between hover:bg-mint transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-mint-deep flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-forest" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-forest-deep leading-tight">{act.title}</h3>
                    <p className="text-sm text-ink-soft mt-0.5">{act.totalChapters} Chapters · {act.chapters.reduce((n, c) => n + c.sections.length, 0)} Sections</p>
                  </div>
                </div>
                {isOpen ? <ChevronDown className="text-forest flex-shrink-0" /> : <ChevronRight className="text-ink-soft flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-2 bg-paper border-t border-line">
                  <div className="divide-y divide-line rounded-xl overflow-hidden bg-white border border-line mt-4">
                    {previewChapters.map(ch => (
                      <RegulationRow
                        key={ch.num}
                        to={`/interactive-regulations/${act.slug}/chapter-${ch.num}`}
                        icon={BookOpen}
                        title={`Chapter ${ch.num}`}
                        subtitle={ch.title}
                      />
                    ))}
                  </div>
                  {act.chapters.length > 5 && (
                    <div className="mt-4 text-center">
                      <Link
                        to={`/interactive-regulations/${act.slug}/chapter-1`}
                        className="cursor-target inline-block py-2 px-5 bg-mint text-forest font-medium rounded-lg hover:bg-mint-deep transition-colors text-sm"
                      >
                        View all {act.totalChapters} chapters →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
