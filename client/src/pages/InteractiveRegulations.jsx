import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, BookOpen, BookMarked, FileCheck, X, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import RegulationRow from '../components/RegulationRow';
import { ACTS_DATA, DEFINITIONS_DATA, SCHEDULES_DATA } from '../data/regulationsData';

export default function InteractiveRegulations() {
  const [expandedAct, setExpandedAct] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({}); // { [actSlug]: boolean }
  const [activeModal, setActiveModal] = useState(null); // 'schedules' | 'definitions' | null
  const [searchTerm, setSearchTerm] = useState('');

  const acts = Object.entries(ACTS_DATA).map(([slug, data]) => ({
    slug,
    title: data.title,
    totalChapters: data.totalChapters,
    chapters: data.chapters,
  }));

  const filteredDefs = DEFINITIONS_DATA.filter(d =>
    d.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.definition_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          const isFullyExpanded = !!expandedChapters[act.slug];
          const displayedChapters = isFullyExpanded ? act.chapters : act.chapters.slice(0, 5);

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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-forest-deep leading-tight">{act.title}</h3>
                      {act.slug === 'ifsca-fme-2025' && (
                        <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-full font-medium">
                          Draft — pending legal review
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink-soft mt-0.5">{act.totalChapters} Chapters · {act.chapters.reduce((n, c) => n + c.sections.length, 0)} Provisions</p>
                  </div>
                </div>
                {isOpen ? <ChevronDown className="text-forest flex-shrink-0" /> : <ChevronRight className="text-ink-soft flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-2 bg-paper border-t border-line space-y-4">
                  {act.slug === 'ifsca-fme-2025' && (
                    <div className="flex items-center gap-3 pt-3 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModal('schedules');
                        }}
                        className="cursor-target inline-flex items-center gap-2 px-4 py-2 bg-mint text-forest font-semibold text-xs rounded-lg hover:bg-mint-deep transition-colors"
                      >
                        <BookMarked className="w-4 h-4" /> View 6 Schedules (1st–6th)
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModal('definitions');
                        }}
                        className="cursor-target inline-flex items-center gap-2 px-4 py-2 bg-paper border border-line text-forest font-semibold text-xs rounded-lg hover:bg-mint transition-colors"
                      >
                        <FileCheck className="w-4 h-4" /> Defined Terms Glossary (62 Terms)
                      </button>
                    </div>
                  )}

                  <div className="divide-y divide-line rounded-xl overflow-hidden bg-white border border-line">
                    {displayedChapters.map(ch => (
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
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedChapters(prev => ({
                            ...prev,
                            [act.slug]: !isFullyExpanded
                          }));
                        }}
                        className="cursor-target inline-flex items-center gap-1.5 py-2 px-5 bg-mint text-forest font-medium rounded-lg hover:bg-mint-deep transition-colors text-sm"
                      >
                        {isFullyExpanded ? (
                          <>Show less ↑</>
                        ) : (
                          <>View all {act.totalChapters} chapters →</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Schedules & Definitions Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-line rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col card-shadow">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-mint">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-forest" />
                <h3 className="font-semibold text-forest-deep text-lg">
                  {activeModal === 'schedules' ? 'Schedules — IFSCA (Fund Management) Regulations, 2025' : 'Defined Terms Glossary (62 Terms)'}
                </h3>
              </div>
              <button
                onClick={() => { setActiveModal(null); setSearchTerm(''); }}
                className="cursor-target p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-paper"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {activeModal === 'schedules' && (
                <div className="space-y-6">
                  {SCHEDULES_DATA.map((sch, idx) => (
                    <div key={sch.id || idx} className="bg-paper border border-line rounded-xl p-6">
                      <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full uppercase mb-3 inline-block">
                        Schedule {idx + 1}
                      </span>
                      <h4 className="text-lg font-semibold text-forest-deep mb-3">{sch.title}</h4>
                      <div className="bg-white border border-line rounded-lg p-4 font-serif text-xs leading-relaxed text-forest-deep whitespace-pre-line max-h-60 overflow-y-auto">
                        {sch.statutory_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'definitions' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-ink-soft absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search 62 defined terms (e.g. Accredited investor, FME, Corpus, Net worth)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-line rounded-xl text-sm focus:outline-none focus:border-forest"
                    />
                  </div>

                  <div className="divide-y divide-line bg-paper border border-line rounded-xl max-h-[60vh] overflow-y-auto">
                    {filteredDefs.map(def => (
                      <div key={def.id} className="p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-forest-deep text-sm">“{def.term}”</h5>
                          <span className="text-xs text-ink-soft bg-white border border-line px-2 py-0.5 rounded">
                            {def.defined_in}
                          </span>
                        </div>
                        <p className="text-xs text-ink-soft leading-relaxed font-serif whitespace-pre-line">
                          {def.definition_text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
