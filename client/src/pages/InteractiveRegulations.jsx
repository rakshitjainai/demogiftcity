import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, BookOpen, BookMarked, FileCheck, X, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import RegulationRow from '../components/RegulationRow';
import { ACTS_DATA, getActDefinitions, getActSchedules } from '../data/regulationsData';
import { useAuth } from '../context/AuthContext';
import LockOverlay from '../components/LockOverlay';

export default function InteractiveRegulations() {
  const { user, isAuthenticated } = useAuth();
  const isMember = user?.membershipStatus === 'active';
  const [expandedAct, setExpandedAct] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({}); // { [actSlug]: boolean }
  const [activeModal, setActiveModal] = useState(null); // { type: 'schedules' | 'definitions', actSlug: string } | null
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuthenticated) {
    return (
      <LockOverlay
        type="login"
        title="Login Required for Interactive Regulations"
        message="Browsing regulatory acts, chapters, and official text requires an authenticated account. Please log in or sign up to continue."
        redirectPath="/login"
      />
    );
  }

  const acts = Object.entries(ACTS_DATA).map(([slug, data]) => ({
    slug,
    title: data.title,
    totalChapters: data.totalChapters,
    chapters: data.chapters,
    versionDate: data.versionDate,
    status: data.status,
    definitions: getActDefinitions(slug),
    schedules: getActSchedules(slug),
  }));

  const activeActData = activeModal?.actSlug ? ACTS_DATA[activeModal.actSlug] : null;
  const modalSchedules = activeModal?.actSlug ? getActSchedules(activeModal.actSlug) : [];
  const modalDefinitions = activeModal?.actSlug ? getActDefinitions(activeModal.actSlug) : [];

  const filteredDefs = modalDefinitions.filter(d =>
    (d.term || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.definition_text || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="mb-12">
        <span className="eyebrow block mb-4">§ Knowledge</span>
        <h1 className="text-4xl font-display text-forest-deep mb-4">Interactive Regulations</h1>
        <p className="text-ink-soft text-lg">Browse acts and regulations chapter by chapter, section by section.</p>
      </div>

      <div className="space-y-4">
        {acts.map((act) => {
          const isOpen = expandedAct === act.slug;
          const isFullyExpanded = !!expandedChapters[act.slug];
          const displayedChapters = isFullyExpanded ? act.chapters : act.chapters.slice(0, 5);

          const hasSchedules = act.schedules && act.schedules.length > 0;
          const hasDefinitions = act.definitions && act.definitions.length > 0;

          return (
            <div key={act.slug} className="bg-white border border-line rounded-xl overflow-hidden card-shadow">
              <button
              onClick={() => setExpandedAct(isOpen ? null : act.slug)}
              className="cursor-target w-full text-left px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-mint transition-colors min-h-[64px]"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-mint-deep flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-forest" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-base sm:text-lg text-forest-deep leading-tight">{act.title}</h3>
                    {act.versionDate ? (
                      <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-full font-medium whitespace-nowrap">
                        Verified · {act.versionDate.includes('Consolidated') ? act.versionDate.replace('Consolidated as amended up to ', 'Consolidated to ') : act.versionDate}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-ink-soft mt-0.5">{act.totalChapters} Chapters · {act.chapters.reduce((n, c) => n + c.sections.length, 0)} Provisions</p>
                </div>
              </div>
              {isOpen ? <ChevronDown className="text-forest flex-shrink-0 ml-2" /> : <ChevronRight className="text-ink-soft flex-shrink-0 ml-2" />}
            </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-2 bg-paper border-t border-line space-y-4">
                  {(hasSchedules || hasDefinitions) && (
                    <div className="flex items-center gap-2 sm:gap-3 pt-3 flex-wrap">
                      {hasSchedules && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModal({ type: 'schedules', actSlug: act.slug });
                          }}
                          className="cursor-target inline-flex items-center gap-2 px-4 py-2.5 bg-mint text-forest font-semibold text-xs rounded-lg hover:bg-mint-deep transition-colors min-h-[44px]"
                        >
                          <BookMarked className="w-4 h-4" /> View {act.schedules.length === 1 ? 'Schedule' : `${act.schedules.length} Schedules`}
                        </button>
                      )}
                      {hasDefinitions && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModal({ type: 'definitions', actSlug: act.slug });
                          }}
                          className="cursor-target inline-flex items-center gap-2 px-4 py-2.5 bg-paper border border-line text-forest font-semibold text-xs rounded-lg hover:bg-mint transition-colors min-h-[44px]"
                        >
                          <FileCheck className="w-4 h-4" /> Defined Terms ({act.definitions.length} Terms)
                        </button>
                      )}
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
                        badge={!isMember && ch.num > 2 ? '🔒 Membership Required' : null}
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
                        className="cursor-target inline-flex items-center gap-1.5 py-2.5 px-5 bg-mint text-forest font-medium rounded-lg hover:bg-mint-deep transition-colors text-sm min-h-[44px]"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-line rounded-t-3xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col card-shadow">
            <div className="px-4 sm:px-6 py-4 border-b border-line flex items-center justify-between bg-mint flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <ShieldCheck className="w-5 h-5 text-forest flex-shrink-0" />
                <h3 className="font-semibold text-forest-deep text-base sm:text-lg truncate">
                  {activeModal.type === 'schedules'
                    ? `Schedules — ${activeActData?.title || 'Regulations'}`
                    : `Defined Terms — ${activeActData?.title?.split(' ').slice(0,3).join(' ') || 'Regulations'} (${modalDefinitions.length})`}
                </h3>
              </div>
              <button
                onClick={() => { setActiveModal(null); setSearchTerm(''); }}
                className="cursor-target p-2.5 rounded-xl text-ink-soft hover:text-ink hover:bg-paper flex-shrink-0 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
              {activeModal.type === 'schedules' && (
                <div className="space-y-4 sm:space-y-6">
                  {modalSchedules.map((sch, idx) => (
                    <div key={sch.id || idx} className="bg-paper border border-line rounded-xl p-4 sm:p-6">
                      <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full uppercase mb-3 inline-block">
                        {sch.chapter || `Schedule ${idx + 1}`}
                      </span>
                      <h4 className="text-lg font-semibold text-forest-deep mb-3">{sch.title}</h4>
                      {sch.simple_explanation && (
                        <p className="text-xs text-ink-soft mb-3 bg-white p-3 rounded-lg border border-line">
                          <strong className="text-forest">Summary:</strong> {sch.simple_explanation}
                        </p>
                      )}
                      <div className="bg-white border border-line rounded-lg p-4 font-serif text-xs leading-relaxed text-forest-deep whitespace-pre-line max-h-60 overflow-y-auto">
                        {sch.statutory_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeModal.type === 'definitions' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-ink-soft absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder={`Search ${modalDefinitions.length} defined terms...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 border border-line rounded-xl text-sm focus:outline-none focus:border-forest min-h-[44px]"
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
                    {filteredDefs.length === 0 && (
                      <div className="p-6 text-center text-ink-soft text-sm">
                        No terms matched your search "{searchTerm}".
                      </div>
                    )}
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

