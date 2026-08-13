import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, FileText, CheckCircle2, AlertCircle, Bookmark, Tag, HelpCircle, Link2, Search, BookOpen, Layers, ArrowLeft } from 'lucide-react';
import { ACTS_DATA, PROVISION_DETAILS, CROSS_REFERENCES_DATA, getActName } from '../data/regulationsData';
import { ParagraphBlock, SubRegulationBlock, ClauseBlock, ExpandableLongText, PractitionerNote } from '../components/statutory/StatutoryBlocks';
import ActionToolbar from '../components/statutory/ActionToolbar';
import { useAuth } from '../context/AuthContext';

// ─── Per-section Key Highlights ──────────────────────────────────────────────
const SECTION_HIGHLIGHTS = {
  'companies-act-2013|1': [
    'Establishes the short title, geographic extent (applies to whole of India), and the commencement date notified by the Central Government.',
    'Lays the constitutional basis upon which all subsequent provisions, rules, and notifications derive their legal force.',
    'Companies incorporated under earlier acts are automatically governed by this Act unless a specific saving clause applies.',
  ],
  'companies-act-2013|2': [
    'Contains over 90 defined terms — e.g., "associate company", "key managerial personnel", "listed company", and "promoter" — each carrying precise statutory weight.',
    'Definitions here control interpretation in every chapter; when a term is used without re-definition, this section governs.',
    'Ambiguities between the definition clause and general law must be resolved in favour of the Companies Act definition.',
  ],
};

const FALLBACK_HIGHLIGHTS = {
  1: [
    'Establishes the short title, territorial extent, and official commencement date of the legislation.',
    'Forms the constitutional bedrock from which all subordinate rules, notifications, and circulars derive authority.',
    'Entities formed before this legislation are automatically subject to its provisions via savings clauses.',
  ],
  2: [
    'Provides precise statutory definitions for all key terms used throughout the legislation.',
    'Resolves interpretive conflicts — when a term is used without re-definition elsewhere, this clause governs.',
    'Definitions align with related legislation to ensure consistent regulatory application across statutes.',
  ],
};

function getHighlights(actSlug, sNum, provisionData) {
  if (provisionData?.key_highlights && provisionData.key_highlights.length > 0) {
    return provisionData.key_highlights;
  }
  const key = `${actSlug}|${sNum}`;
  if (SECTION_HIGHLIGHTS[key]) return SECTION_HIGHLIGHTS[key];
  if (FALLBACK_HIGHLIGHTS[sNum]) return FALLBACK_HIGHLIGHTS[sNum];
  return [
    `Governs provision ${sNum} within the applicable framework — scope and applicability defined by the parent chapter.`,
    'Compliance obligations extend to all regulated entities unless a specific exclusion or exemption applies.',
    'Detailed procedural guidance is issued by the regulatory authority via rules, circulars, and guidance notes.',
  ];
}

export default function SectionDetail() {
  const { actSlug, chapter, sectionNum } = useParams();
  const { saveReadingProgress } = useAuth();

  const actName = getActName(actSlug);
  const cleanChapter = chapter?.replace('chapter-', '') || '1';
  const chapterNum = parseInt(cleanChapter, 10) || 1;
  const cleanSection = sectionNum?.replace('section-', '') || '1';
  const sNum = cleanSection;

  // Active Tab & Font Size State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview'|'statutory'|'explanation'|'guidance'|'examples'|'related'
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('regmate_font_size') || 'md');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChs, setExpandedChs] = useState({ [chapterNum]: true });

  // Load real Act & Provision data
  const actData = ACTS_DATA[actSlug];
  const chapterData = actData?.chapters.find(c => String(c.num) === String(chapterNum));
  const chapterTitle = chapterData?.title || `Chapter ${chapterNum}`;
  const sectionData = chapterData?.sections.find(s => String(s.num) === String(sNum));
  const sectionTitle = sectionData?.title || `Regulation ${sNum}`;

  const provisionData = PROVISION_DETAILS[`${actSlug}|${chapterNum}|${cleanSection}`]
                     || PROVISION_DETAILS[`${actSlug}|${cleanSection}`]
                     || null;

  // Prev/Next sections
  const allSections = chapterData?.sections || [];
  const secIdx = allSections.findIndex(s => String(s.num) === String(sNum));
  const prevSec = secIdx > 0 ? allSections[secIdx - 1] : null;
  const nextSec = secIdx < allSections.length - 1 ? allSections[secIdx + 1] : null;

  const highlights = getHighlights(actSlug, sNum, provisionData);
  const relatedProvisions = CROSS_REFERENCES_DATA.filter(cr => String(cr.from_provision) === String(sNum));

  // Save reading progress for Dashboard's Continue Reading
  useEffect(() => {
    saveReadingProgress(actSlug, chapter || `chapter-${chapterNum}`, sNum, sectionTitle);
    localStorage.setItem('regmate_font_size', fontSize);
  }, [actSlug, chapterNum, sNum, sectionTitle, fontSize]);

  const fontSizeClass = fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm';

  const toggleChapterTree = (chNo) => {
    setExpandedChs(prev => ({ ...prev, [chNo]: !prev[chNo] }));
  };

  // Filter chapters/sections for left tree
  const filteredChapters = actData?.chapters?.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const chMatch = c.title.toLowerCase().includes(q) || String(c.num).includes(q);
    const secMatch = c.sections?.some(s => s.title.toLowerCase().includes(q) || String(s.num).includes(q));
    return chMatch || secMatch;
  }) || [];

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row animate-fade-in">
      
      {/* ─── LEFT SIDEBAR (Desktop Persistent Navigation Tree) ────────────────── */}
      <aside className="w-full md:w-80 border-r border-line bg-white flex flex-col flex-shrink-0">
        
        {/* Header / Act Card */}
        <div className="p-5 border-b border-line bg-paper/60 space-y-3">
          <Link to="/interactive-regulations" className="cursor-target inline-flex items-center text-xs font-semibold text-forest hover:text-leaf mb-1">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Regulations
          </Link>
          <div>
            <span className="px-2 py-0.5 bg-mint text-forest font-bold text-[10px] rounded-full uppercase tracking-wider">
              Active Act
            </span>
            <h2 className="font-display font-bold text-forest-deep text-lg leading-tight mt-1">
              {actName}
            </h2>
            <div className="text-xs text-ink-soft mt-1 flex items-center gap-2">
              <span>{actData?.chapters?.length || 0} Chapters</span>
              <span>•</span>
              <span>{actData?.totalSections || 0} Provisions</span>
            </div>
          </div>

          {/* Search Filter Input */}
          <div className="relative pt-1">
            <Search className="w-4 h-4 text-ink-soft absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search chapters/sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-forest"
            />
          </div>
        </div>

        {/* Tree Navigation */}
        <div className="flex-grow overflow-y-auto p-3 space-y-2">
          {filteredChapters.map(c => {
            const isCurrentCh = c.num === chapterNum;
            const isExpanded = expandedChs[c.num] || isCurrentCh || !!searchQuery.trim();

            return (
              <div key={c.num} className="border border-line/60 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleChapterTree(c.num)}
                  className={`w-full px-3 py-2 text-left flex items-start justify-between text-xs transition-colors ${
                    isCurrentCh ? 'bg-mint/40 font-semibold text-forest-deep' : 'hover:bg-paper text-ink'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="text-[10px] font-bold text-leaf uppercase tracking-wider block">
                      Ch. {c.num}
                    </span>
                    <span className="truncate">{c.title}</span>
                  </div>
                  <span className="text-[10px] text-ink-soft mt-0.5 font-bold">
                    {c.sections?.length || 0}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-line/40 bg-paper/30 divide-y divide-line/30 pl-2">
                    {c.sections?.map(sec => {
                      const isSelectedSec = isCurrentCh && String(sec.num) === String(sNum);

                      return (
                        <Link
                          key={sec.num}
                          to={`/interactive-regulations/${actSlug}/chapter-${c.num}/section-${sec.num}`}
                          className={`block px-3 py-2 text-[11px] truncate transition-all ${
                            isSelectedSec
                              ? 'bg-forest text-white font-semibold rounded-l-lg border-l-4 border-gold'
                              : 'text-ink-soft hover:text-forest hover:bg-white'
                          }`}
                        >
                          <span className="font-mono font-bold mr-1.5">§ {sec.num}</span>
                          <span className="truncate">{sec.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ─── MAIN COLUMN + RIGHT SIDEBAR WRAPPER ───────────────────────────── */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* TOP BAR (Breadcrumbs, Font size, TTS/Action icons) */}
        <header className="bg-white border-b border-line px-6 py-3 flex items-center justify-between flex-wrap gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-ink-soft flex-wrap">
            <Link to="/" className="cursor-target hover:text-leaf">Home</Link>
            <span>/</span>
            <Link to="/interactive-regulations" className="cursor-target hover:text-leaf">Regulations</Link>
            <span>/</span>
            <span className="font-semibold text-forest-deep">{actName}</span>
            <span>/</span>
            <span className="text-leaf font-bold">Ch. {chapterNum} § {sNum}</span>
          </div>

          <ActionToolbar
            textToSpeak={provisionData?.statutory_text || `${sectionTitle}. ${highlights.join('. ')}`}
            itemKey={`${actSlug}|${chapterNum}|${sNum}`}
            itemTitle={`Regulation ${sNum}: ${sectionTitle}`}
            fontSize={fontSize}
            setFontSize={setFontSize}
            variant="top"
          />
        </header>

        {/* MAIN BODY: 2 Columns (Main Content + Right Sidebar) */}
        <div className="flex-grow flex flex-col lg:flex-row min-w-0">
          
          {/* MAIN READING COLUMN */}
          <main className="flex-grow p-6 md:p-8 max-w-4xl space-y-6 overflow-y-auto">
            
            {/* Provision Title Header */}
            <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 bg-mint text-forest font-bold text-xs rounded-full uppercase tracking-wider">
                  {actName}
                </span>
                <span className="px-2.5 py-0.5 bg-paper border border-line text-ink-soft text-xs rounded-full">
                  Chapter {chapterNum} — {chapterTitle}
                </span>
                {provisionData?.requirement_type && (
                  <span className="px-2.5 py-0.5 bg-forest/10 text-forest-deep font-semibold text-xs rounded-full">
                    {provisionData.requirement_type}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-semibold text-forest-deep leading-tight">
                Regulation {sNum} — {sectionTitle}
              </h1>

              <p className="text-sm text-ink-soft leading-relaxed">
                Official regulatory provision under {actName}. Use the navigation controls or tabs below to analyze statutory requirements and practitioner insights.
              </p>

              {/* Prev / Next Section Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-line">
                {prevSec ? (
                  <Link
                    to={`/interactive-regulations/${actSlug}/${chapter}/section-${prevSec.num}`}
                    className="cursor-target inline-flex items-center gap-1.5 px-3.5 py-2 bg-paper border border-line rounded-xl text-forest text-xs font-semibold hover:bg-mint transition-colors truncate max-w-[200px]"
                  >
                    <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">§ {prevSec.num} {prevSec.title}</span>
                  </Link>
                ) : <div />}

                {nextSec ? (
                  <Link
                    to={`/interactive-regulations/${actSlug}/${chapter}/section-${nextSec.num}`}
                    className="cursor-target inline-flex items-center gap-1.5 px-3.5 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-leaf transition-colors shadow-sm truncate max-w-[200px]"
                  >
                    <span className="truncate">§ {nextSec.num} {nextSec.title}</span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </Link>
                ) : <div />}
              </div>
            </div>

            {/* TAB BAR (Overview | Statutory Text | RegMate Explanation | Practical Guidance | Examples | Related) */}
            <div className="border-b border-line flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'statutory', label: 'Statutory Text' },
                { id: 'explanation', label: 'RegMate Explanation' },
                { id: 'guidance', label: 'Practical Guidance' },
                { id: 'examples', label: 'Examples' },
                { id: 'related', label: `Related (${relatedProvisions.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-target px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'bg-white text-forest-deep border-forest shadow-sm'
                      : 'text-ink-soft border-transparent hover:text-forest hover:bg-paper'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="space-y-6">

              {/* 1. OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Highlights Card */}
                  <div className="bg-white border border-line rounded-2xl p-6 card-shadow space-y-4">
                    <h3 className="font-semibold text-forest-deep text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gold" /> Key Highlights &amp; Scope
                    </h3>
                    <ul className="space-y-3 text-sm text-ink-soft">
                      {highlights.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-leaf font-bold mt-0.5 flex-shrink-0">•</span>
                          <span className={`${fontSizeClass} leading-relaxed`}>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Statutory Text Card in Overview */}
                  <div className="bg-white border border-line rounded-2xl p-6 card-shadow space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-line">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-leaf" />
                        <h3 className="font-semibold text-forest-deep text-base">Statutory Text Preview</h3>
                      </div>
                      <span className="px-2.5 py-0.5 bg-mint text-forest font-bold text-[10px] rounded-full uppercase">
                        Official Text
                      </span>
                    </div>
                    
                    <div className="bg-mint/15 border border-mint-deep/30 rounded-xl p-5">
                      <ExpandableLongText
                        text={provisionData?.statutory_text || `Full statutory text for Regulation ${sNum} is being compiled.`}
                        fontSizeClass={fontSizeClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. STATUTORY TEXT TAB */}
              {activeTab === 'statutory' && (
                <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between pb-4 border-b border-line">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-leaf" />
                      <h3 className="text-xl font-semibold text-forest-deep">Complete Statutory Text</h3>
                    </div>
                    <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full">
                      Official Gazette Text
                    </span>
                  </div>

                  <div className="bg-paper/80 border border-line rounded-xl p-6 font-serif">
                    <ParagraphBlock
                      text={provisionData?.statutory_text || `Official Gazette text for Regulation ${sNum} is structured and verified against the parent Act.`}
                      fontSizeClass={fontSizeClass}
                    />
                  </div>
                </div>
              )}

              {/* 3. REGMATE EXPLANATION TAB */}
              {activeTab === 'explanation' && (
                <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3 pb-4 border-b border-line">
                    <ShieldCheck className="w-6 h-6 text-forest" />
                    <div>
                      <h3 className="text-xl font-semibold text-forest-deep">RegMate Regulatory Explanation</h3>
                      <p className="text-xs text-ink-soft">Commentary &amp; Statutory Analysis by CS Prashant Kumar</p>
                    </div>
                  </div>

                  {provisionData?.regmate_explanation ? (
                    <div className="p-5 bg-mint/20 border border-mint-deep/40 rounded-xl text-ink leading-relaxed">
                      <ParagraphBlock text={provisionData.regmate_explanation} fontSizeClass={fontSizeClass} />
                    </div>
                  ) : (
                    <p className="text-sm text-ink-soft italic">
                      Detailed practitioner commentary for Regulation {sNum} is currently being updated.
                    </p>
                  )}
                </div>
              )}

              {/* 4. PRACTICAL GUIDANCE TAB */}
              {activeTab === 'guidance' && (
                <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow space-y-6 animate-fade-in">
                  <h3 className="text-xl font-semibold text-forest-deep flex items-center gap-2 pb-4 border-b border-line">
                    <CheckCircle2 className="w-6 h-6 text-leaf" /> Practical Guidance &amp; Checkpoints
                  </h3>

                  {provisionData?.practical_point && (
                    <PractitionerNote title="Practical Guidance Note" text={provisionData.practical_point} />
                  )}

                  {provisionData?.compliance_point && (
                    <div className="bg-paper border border-line p-5 rounded-xl">
                      <h4 className="font-semibold text-forest-deep text-sm mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gold" /> Statutory Compliance Checkpoint
                      </h4>
                      <p className={`${fontSizeClass} text-ink-soft leading-relaxed`}>
                        {provisionData.compliance_point}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 5. EXAMPLES TAB */}
              {activeTab === 'examples' && (
                <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow space-y-4 animate-fade-in">
                  <h3 className="text-xl font-semibold text-forest-deep flex items-center gap-2 pb-4 border-b border-line">
                    <HelpCircle className="w-6 h-6 text-forest" /> Illustrations &amp; Examples
                  </h3>

                  {provisionData?.examples ? (
                    <div className="p-5 bg-mint-deep/30 border border-line rounded-xl text-ink leading-relaxed">
                      <ParagraphBlock text={provisionData.examples} fontSizeClass={fontSizeClass} />
                    </div>
                  ) : (
                    <p className="text-sm text-ink-soft italic">
                      Illustrative case scenarios for Regulation {sNum} will appear here.
                    </p>
                  )}
                </div>
              )}

              {/* 6. RELATED TAB */}
              {activeTab === 'related' && (
                <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow space-y-4 animate-fade-in">
                  <h3 className="text-xl font-semibold text-forest-deep flex items-center gap-2 pb-4 border-b border-line">
                    <Link2 className="w-6 h-6 text-forest" /> Related Statutory Provisions ({relatedProvisions.length})
                  </h3>

                  {relatedProvisions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {relatedProvisions.map((cr, idx) => (
                        <Link
                          key={idx}
                          to={`/interactive-regulations/ifsca-fme-2025/chapter-1/section-${cr.to_provision}`}
                          className="cursor-target p-4 bg-paper border border-line rounded-xl hover:bg-mint/30 transition-colors block space-y-1"
                        >
                          <span className="text-xs font-bold text-leaf uppercase tracking-wider block">
                            Regulation {cr.to_provision}
                          </span>
                          <span className="text-xs text-ink-soft block font-medium">
                            Relation: {cr.relation}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-soft italic">
                      No statutory cross-references mapped for Regulation {sNum}.
                    </p>
                  )}
                </div>
              )}

            </div>

            {/* Bottom Action Toolbar */}
            <div className="pt-4">
              <ActionToolbar
                textToSpeak={provisionData?.statutory_text || sectionTitle}
                itemKey={`${actSlug}|${chapterNum}|${sNum}`}
                itemTitle={`Regulation ${sNum}: ${sectionTitle}`}
                variant="bar"
              />
            </div>

          </main>

          {/* ─── RIGHT SIDEBAR (Desktop Convenience Panel) ──────────────────── */}
          <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-line bg-white p-6 space-y-6 flex-shrink-0">
            
            {/* Key Terms */}
            <div className="bg-paper border border-line rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-forest-deep text-xs uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-leaf" /> Key Terms in Section
              </h3>
              <div className="space-y-2 text-xs text-ink">
                <div className="p-2.5 bg-white border border-line rounded-lg">
                  <strong className="block text-forest font-bold">Fund Management Entity (FME)</strong>
                  <span className="text-[11px] text-ink-soft">An entity registered with IFSCA to initiate and manage fund schemes.</span>
                </div>
                <div className="p-2.5 bg-white border border-line rounded-lg">
                  <strong className="block text-forest font-bold">Corpus Target</strong>
                  <span className="text-[11px] text-ink-soft">Minimum aggregate capital commitment required per scheme.</span>
                </div>
              </div>
            </div>

            {/* Related Provisions */}
            {relatedProvisions.length > 0 && (
              <div className="bg-paper border border-line rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-forest-deep text-xs uppercase tracking-wider flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-forest" /> Related Provisions
                </h3>
                <div className="space-y-2">
                  {relatedProvisions.slice(0, 4).map((cr, idx) => (
                    <Link
                      key={idx}
                      to={`/interactive-regulations/ifsca-fme-2025/chapter-1/section-${cr.to_provision}`}
                      className="cursor-target block p-2.5 bg-white border border-line rounded-lg text-xs font-semibold text-forest hover:bg-mint transition-colors"
                    >
                      § {cr.to_provision} ({cr.relation})
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions Panel */}
            <div className="bg-forest/5 border border-forest/20 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-forest-deep text-xs uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest" /> Quick Actions
              </h3>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => window.print()}
                  className="cursor-target w-full text-left p-2 bg-white border border-line rounded-lg font-medium text-forest hover:bg-mint transition-colors"
                >
                  🖨️ Print Section View
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Section link copied to clipboard!');
                  }}
                  className="cursor-target w-full text-left p-2 bg-white border border-line rounded-lg font-medium text-forest hover:bg-mint transition-colors"
                >
                  🔗 Copy Direct Link
                </button>
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
