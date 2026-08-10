import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const ACTS = [
  { id: 1, slug: 'companies-act-2013', title: 'Companies Act, 2013', chapters: 29 },
  { id: 2, slug: 'sebi-lodr-2015', title: 'SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015', chapters: 11 },
  { id: 3, slug: 'fema-1999', title: 'Foreign Exchange Management Act, 1999', chapters: 7 },
  { id: 4, slug: 'ibc-2016', title: 'Insolvency and Bankruptcy Code, 2016', chapters: 5 }
];

export default function InteractiveRegulations() {
  const [expandedAct, setExpandedAct] = useState(null);

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-12">
        <span className="eyebrow block mb-4">§ Knowledge</span>
        <h1 className="text-4xl font-display text-forest-deep mb-4">Interactive Regulations</h1>
        <p className="text-ink-soft text-lg">Browse acts and regulations section by section.</p>
      </div>

      <div className="space-y-4">
        {ACTS.map(act => {
          const previewCount = Math.min(4, act.chapters);
          return (
            <div key={act.id} className="bg-white border border-line rounded-xl overflow-hidden card-shadow">
              <button
                onClick={() => setExpandedAct(expandedAct === act.id ? null : act.id)}
                className="cursor-target w-full text-left px-6 py-5 flex items-center justify-between hover:bg-mint transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-mint-deep flex items-center justify-center">
                    <FileText className="w-5 h-5 text-forest" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-forest-deep">{act.title}</h3>
                    <p className="text-sm text-ink-soft">{act.chapters} Chapters</p>
                  </div>
                </div>
                {expandedAct === act.id ? <ChevronDown className="text-forest" /> : <ChevronRight className="text-ink-soft" />}
              </button>
              {expandedAct === act.id && (
                <div className="px-6 pb-6 pt-2 bg-paper border-t border-line">
                  <ul className="space-y-2 mt-4">
                    {Array.from({ length: previewCount }, (_, i) => i + 1).map(ch => (
                      <li key={ch}>
                        <Link
                          to={`/interactive-regulations/${act.slug}/chapter-${ch}`}
                          className="cursor-target w-full text-left px-4 py-3 rounded-lg hover:bg-mint transition-colors flex items-center justify-between group"
                        >
                          <span className="text-ink group-hover:text-leaf font-medium">Chapter {ch}</span>
                          <ChevronRight className="w-4 h-4 text-line group-hover:text-leaf transition-colors" />
                        </Link>
                      </li>
                    ))}
                    {act.chapters > previewCount && (
                      <li>
                        <Link
                          to={`/interactive-regulations/${act.slug}/chapter-${previewCount + 1}`}
                          className="cursor-target w-full text-center block py-2 text-leaf font-medium hover:underline"
                        >
                          View all {act.chapters} chapters
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
