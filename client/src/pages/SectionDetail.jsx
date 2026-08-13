import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Sparkles, ShieldCheck, 
  FileText, CheckCircle2, AlertCircle, Bookmark, Tag, HelpCircle, Link2, 
  Search, BookOpen, Layers, ArrowLeft, Volume2, Share2, Printer, Download,
  Check, CheckSquare, Zap
} from 'lucide-react';
import { ACTS_DATA, PROVISION_DETAILS, CROSS_REFERENCES_DATA, getActName } from '../data/regulationsData';
import ActionToolbar from '../components/statutory/ActionToolbar';
import { useAuth } from '../context/AuthContext';

// ─── Per-section Key Highlights ──────────────────────────────────────────────
const SECTION_HIGHLIGHTS = {
  'ifsca-fme-2025|2|6': [
    'Ensures that the applicant and its key personnel have a clean and credible track record.',
    'Regulator will consider past conduct, integrity, reputation and dealings in financial markets.',
    'Material adverse history including penalties, defaults or regulatory action is relevant.'
  ],
  'companies-act-2013|1|1': [
    'Establishes short title, territorial extent (applies to whole of India), and Central Government commencement date.',
    'Lays the constitutional bedrock from which all subordinate rules, notifications, and circulars derive legal authority.',
    'Companies incorporated under earlier acts are automatically governed by this Act unless a specific saving clause applies.'
  ],
  'companies-act-2013|1|2': [
    'Contains over 90 defined terms — e.g., "associate company", "key managerial personnel", "listed company", and "promoter".',
    'Definitions here control interpretation throughout the statute unless re-defined in a specific chapter.',
    'Ambiguities between definition clauses and general law are resolved in favour of the Companies Act definition.'
  ]
};

const FALLBACK_HIGHLIGHTS = {
  6: [
    'Ensures that the applicant and its key personnel have a clean and credible track record.',
    'Regulator will consider past conduct, integrity, reputation and dealings in financial markets.',
    'Material adverse history including penalties, defaults or regulatory action is relevant.'
  ]
};

function getHighlights(actSlug, chapterNum, sNum, provisionData) {
  const key = `${actSlug}|${chapterNum}|${sNum}`;
  if (SECTION_HIGHLIGHTS[key]) return SECTION_HIGHLIGHTS[key];
  if (provisionData?.key_highlights && provisionData.key_highlights.length > 0) {
    return provisionData.key_highlights;
  }
  if (FALLBACK_HIGHLIGHTS[sNum]) return FALLBACK_HIGHLIGHTS[sNum];
  return [
    `Governs provision ${sNum} within the applicable framework — scope defined by parent chapter.`,
    'Compliance obligations extend to all regulated entities unless specific exemptions apply.',
    'Detailed procedural guidance is issued by the regulatory authority via circulars and guidance notes.'
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
  const [statutoryExpanded, setStatutoryExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Load real Act & Provision data
  const actData = ACTS_DATA[actSlug];
  const chapterData = actData?.chapters.find(c => String(c.num) === String(chapterNum));
  const chapterTitle = chapterData?.title || `Registration of FME`;
  const sectionData = chapterData?.sections.find(s => String(s.num) === String(sNum));
  const sectionTitle = sectionData?.title || `Track Record and Reputation of Fairness`;

  const provisionData = PROVISION_DETAILS[`${actSlug}|${chapterNum}|${cleanSection}`]
                     || PROVISION_DETAILS[`${actSlug}|${cleanSection}`]
                     || null;

  // Total sections count across act
  const totalActSections = actData?.chapters?.reduce((n, c) => n + c.sections.length, 0) || 161;

  // Prev/Next sections within this chapter or act
  const allSections = chapterData?.sections || [];
  const secIdx = allSections.findIndex(s => String(s.num) === String(sNum));
  const prevSec = secIdx > 0 ? allSections[secIdx - 1] : null;
  const nextSec = secIdx < allSections.length - 1 ? allSections[secIdx + 1] : null;

  const highlights = getHighlights(actSlug, chapterNum, sNum, provisionData);

  // Related provisions calculation
  const relatedProvisions = CROSS_REFERENCES_DATA.filter(cr => String(cr.from_provision) === String(sNum));
  const defaultRelated = [
    { to_provision: '4', title: 'Eligibility Conditions' },
    { to_provision: '7', title: 'Appointment of Principal Officers and other KMP' },
    { to_provision: '9', title: 'Fit and proper requirements' },
    { to_provision: '10', title: 'Infrastructure Requirements' }
  ];
  const finalRelated = relatedProvisions.length > 0
    ? relatedProvisions.map(cr => ({ to_provision: String(cr.to_provision), title: cr.relation || 'Related Regulation' }))
    : defaultRelated;

  // Key terms calculation
  const keyTerms = [
    { term: 'Track Record', ref: 'See Section 2(1)(xx)' },
    { term: 'Key Personnel', ref: 'See Section 2(1)(yy)' },
    { term: 'Reputation of Fairness', ref: `Regulation ${sNum}(1)` }
  ];

  // Save reading progress on mount
  useEffect(() => {
    saveReadingProgress(actSlug, chapter || `chapter-${chapterNum}`, sNum, sectionTitle);
    localStorage.setItem('regmate_font_size', fontSize);
  }, [actSlug, chapterNum, sNum, sectionTitle, fontSize]);

  const fontSizeClass = fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm';

  const toggleChapterTree = (chNo) => {
    setExpandedChs(prev => ({ ...prev, [chNo]: !prev[chNo] }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handlePrint = () => {
    window.print();
  };

  // Statutory text string
  const statutoryTextContent = provisionData?.statutory_text || 
    `6. (1) The applicant and its key personnel shall have a track record and reputation of fairness.\n(2) While assessing the track record and reputation of fairness, the Authority shall, inter alia, consider past conduct, integrity, honesty, reputation and other dealings in financial markets or otherwise.`;

  return (
    <div className="min-h-screen bg-paper flex flex-col animate-fade-in font-sans">
      
      {/* ─── TOP HEADER BAR (FULL WIDTH ABOVE SIDEBARS & CONTENT) ─────────────── */}
      <header className="bg-white border-b border-line px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 card-shadow">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-ink-soft flex-wrap">
          <Link to="/" className="cursor-target hover:text-leaf transition-colors">Home</Link>
          <span className="text-ink-soft/40">&gt;</span>
          <Link to="/interactive-regulations" className="cursor-target hover:text-leaf font-medium text-forest">
            {actName}
          </Link>
          <span className="text-ink-soft/40">&gt;</span>
          <Link to={`/interactive-regulations/${actSlug}/chapter-${chapterNum}`} className="cursor-target hover:text-leaf">
            Chapter {chapterNum}
          </Link>
          <span className="text-ink-soft/40">&gt;</span>
          <span className="text-forest-deep font-bold">Section {sNum}</span>
        </div>

        {/* Right Controls: Font-size + Pill Icons */}
        <div className="flex items-center gap-4">
          {/* Font Size Selector */}
          <div className="flex items-center bg-paper border border-line rounded-lg p-0.5 text-xs font-bold">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 rounded transition-colors ${fontSize === 'sm' ? 'bg-forest text-white' : 'text-ink-soft hover:text-forest'}`}
              title="Small font size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-1 rounded transition-colors ${fontSize === 'md' ? 'bg-forest text-white' : 'text-ink-soft hover:text-forest'}`}
              title="Medium font size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded transition-colors ${fontSize === 'lg' ? 'bg-forest text-white' : 'text-ink-soft hover:text-forest'}`}
              title="Large font size"
            >
              A+
            </button>
          </div>

          {/* Action Icon Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance(statutoryTextContent);
                  window.speechSynthesis.speak(u);
                }
              }}
              className="cursor-target px-3 py-1.5 bg-paper border border-line rounded-full text-xs font-semibold text-forest hover:bg-mint transition-colors flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-leaf" /> Listen
            </button>

            <button
              onClick={handleToggleBookmark}
              className={`cursor-target px-3 py-1.5 border rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                bookmarked ? 'bg-gold/20 text-gold border-gold' : 'bg-paper border-line text-ink-soft hover:text-forest'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-gold text-gold' : ''}`} /> Save
            </button>

            <button
              onClick={() => {
                if (navigator.share) navigator.share({ title: `Section ${sNum}`, url: window.location.href });
                else handleCopyLink();
              }}
              className="cursor-target px-3 py-1.5 bg-paper border border-line rounded-full text-xs font-semibold text-ink-soft hover:text-forest transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN 3-COLUMN LAYOUT CONTAINER ───────────────────────────────────── */}
      <div className="flex-grow flex flex-col md:flex-row min-w-0">
        
        {/* ─── 1. LEFT SIDEBAR (PERSISTENT ~20% WIDTH) ────────────────────────── */}
        <aside className="w-full md:w-72 lg:w-80 border-r border-line bg-white flex flex-col flex-shrink-0">
          
          {/* Logo & Tagline */}
          <div className="p-4 border-b border-line flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-forest-deep text-mint flex items-center justify-center font-display font-bold text-lg">
              R
            </div>
            <div>
              <h2 className="font-display font-bold text-forest-deep text-base leading-none">RegMate</h2>
              <p className="text-[10px] text-ink-soft mt-0.5">Navigate Regulations. Stay Ahead.</p>
            </div>
          </div>

          {/* Act Summary Card (Solid Dark Green Card matching Mockup) */}
          <div className="m-4 p-4 rounded-xl bg-forest-deep text-white space-y-1 shadow-md">
            <h3 className="font-display font-bold text-sm leading-snug text-paper">
              {actName}
            </h3>
            <p className="text-xs text-mint/80 font-medium">
              {actData?.chapters?.length || 12} Chapters • {totalActSections} Provisions
            </p>
          </div>

          {/* Search Input */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-soft absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search within this regulation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-paper border border-line rounded-lg text-xs text-ink focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Expandable Chapter Tree */}
          <div className="flex-grow overflow-y-auto px-4 pb-4 space-y-2">
            {actData?.chapters?.map((c) => {
              const isCurrentCh = c.num === chapterNum;
              const isExpanded = expandedChs[c.num] || isCurrentCh || !!searchQuery.trim();

              return (
                <div key={c.num} className="rounded-xl overflow-hidden border border-line/60 bg-white">
                  {/* Chapter Header Row */}
                  <button
                    onClick={() => toggleChapterTree(c.num)}
                    className={`w-full px-3 py-2.5 text-left flex items-center justify-between text-xs font-semibold transition-colors ${
                      isCurrentCh ? 'bg-mint/40 text-forest-deep' : 'hover:bg-paper text-ink'
                    }`}
                  >
                    <span className="truncate pr-2">Chapter {c.num} – {c.title}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-ink-soft flex-shrink-0" />
                    )}
                  </button>

                  {/* Section Items Tree */}
                  {isExpanded && (
                    <div className="bg-paper/30 border-t border-line/40 divide-y divide-line/30">
                      {c.sections?.map((sec) => {
                        const isSelectedSec = isCurrentCh && String(sec.num) === String(sNum);

                        return (
                          <Link
                            key={sec.num}
                            to={`/interactive-regulations/${actSlug}/chapter-${c.num}/section-${sec.num}`}
                            className={`block px-4 py-2 text-[11px] leading-snug transition-all ${
                              isSelectedSec
                                ? 'bg-mint text-forest font-bold border-l-4 border-forest shadow-sm'
                                : 'text-ink-soft hover:text-forest hover:bg-white'
                            }`}
                          >
                            Section {sec.num} – {sec.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Download PDF Button at Sidebar Bottom */}
          <div className="p-4 border-t border-line bg-paper/50">
            <button
              onClick={() => alert('Full statutory PDF export coming soon!')}
              className="cursor-target w-full py-2.5 px-3 bg-white border border-line rounded-xl text-xs font-semibold text-forest hover:bg-mint transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-leaf" /> Download Full Regulation (PDF)
            </button>
          </div>
        </aside>

        {/* ─── 2. MAIN COLUMN (~55% WIDTH) ────────────────────────────────────── */}
        <main className="flex-grow p-6 md:p-8 max-w-4xl space-y-6 overflow-y-auto min-w-0">
          
          {/* Act Badge & Titles */}
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-mint text-forest font-bold text-xs rounded-full uppercase tracking-wider">
              {actName}
            </span>
            <div className="text-xs font-bold text-leaf uppercase tracking-wider">
              Chapter {chapterNum} – {chapterTitle}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-forest-deep">
              Section {sNum}
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-ink leading-tight">
              {sectionTitle}
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Requirements regarding the track record and reputation of fairness of the applicant and its key personnel.
            </p>
          </div>

          {/* TOP PREV / NEXT SECTION ROW */}
          <div className="bg-white border border-line rounded-xl p-3 flex items-center justify-between text-xs font-semibold text-forest">
            {prevSec ? (
              <Link
                to={`/interactive-regulations/${actSlug}/${chapter}/section-${prevSec.num}`}
                className="cursor-target hover:text-leaf flex items-center gap-1.5"
              >
                &larr; Section {prevSec.num}
              </Link>
            ) : (
              <span className="text-ink-soft/40">&larr; First Section</span>
            )}

            {nextSec ? (
              <Link
                to={`/interactive-regulations/${actSlug}/${chapter}/section-${nextSec.num}`}
                className="cursor-target hover:text-leaf flex items-center gap-1.5"
              >
                Section {nextSec.num} &rarr;
              </Link>
            ) : (
              <span className="text-ink-soft/40">Last Section &rarr;</span>
            )}
          </div>

          {/* TAB BAR (UNDERLINED TABS MATCHING MOCKUP) */}
          <div className="border-b-2 border-line flex gap-6 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'statutory', label: 'Statutory Text' },
              { id: 'explanation', label: 'RegMate Explanation' },
              { id: 'guidance', label: 'Practical Guidance' },
              { id: 'examples', label: 'Examples' },
              { id: 'related', label: `Related (${finalRelated.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-target pb-3 text-xs font-bold transition-all whitespace-nowrap border-b-2 -mb-0.5 ${
                  activeTab === tab.id
                    ? 'text-forest-deep border-forest'
                    : 'text-ink-soft border-transparent hover:text-forest'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT PANELS */}
          <div className="space-y-6">

            {/* 1. OVERVIEW TAB (2 STACKED CARDS MATCHING MOCKUP EXACTLY) */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* CARD 1: Key Highlights & Scope (Light Mint-tinted Card with Checkmarks) */}
                <div className="bg-mint/30 border border-mint-deep/40 rounded-2xl p-6 card-shadow space-y-4">
                  <h3 className="font-semibold text-forest-deep text-base flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-forest" /> Key Highlights &amp; Scope
                  </h3>
                  <ul className="space-y-3 text-sm text-ink font-medium">
                    {highlights.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-leaf flex-shrink-0 mt-0.5" />
                        <span className={`${fontSizeClass} leading-relaxed`}>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CARD 2: Statutory Text (Warmer Cream/Tan Tinted Card with Listen + Expand) */}
                <div className="bg-[#FAF6EE] border border-amber-200/80 rounded-2xl p-6 card-shadow space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-900" />
                      <h3 className="font-semibold text-amber-950 text-base">Statutory Text</h3>
                    </div>
                    <button
                      onClick={() => {
                        if (window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                          const u = new SpeechSynthesisUtterance(statutoryTextContent);
                          window.speechSynthesis.speak(u);
                        }
                      }}
                      className="cursor-target px-3 py-1 bg-white border border-amber-300 rounded-full text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-800" /> Listen
                    </button>
                  </div>

                  <div className={`${fontSizeClass} text-amber-950 font-serif leading-relaxed space-y-3`}>
                    <p><strong>6. (1)</strong> The applicant and its key personnel shall have a track record and reputation of fairness.</p>
                    {statutoryExpanded && (
                      <p className="animate-fade-in">
                        <strong>(2)</strong> While assessing the track record and reputation of fairness, the Authority shall, inter alia, consider past conduct, integrity, honesty, reputation and other dealings in financial markets or otherwise.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 text-center border-t border-amber-200/50">
                    <button
                      onClick={() => setStatutoryExpanded(!statutoryExpanded)}
                      className="cursor-target text-xs font-bold text-amber-900 hover:text-amber-950 inline-flex items-center gap-1"
                    >
                      {statutoryExpanded ? 'Show less ∧' : 'View full text ∨'}
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* 2. STATUTORY TEXT TAB */}
            {activeTab === 'statutory' && (
              <div className="bg-[#FAF6EE] border border-amber-200 rounded-2xl p-6 md:p-8 card-shadow space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-amber-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-amber-900" />
                    <h3 className="text-xl font-semibold text-amber-950">Statutory Text</h3>
                  </div>
                  <span className="px-3 py-1 bg-amber-200/60 text-amber-900 font-semibold text-xs rounded-full">
                    Official Gazette Text
                  </span>
                </div>
                <div className={`${fontSizeClass} text-amber-950 font-serif leading-relaxed whitespace-pre-line`}>
                  {statutoryTextContent}
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
                    <p className="text-xs text-ink-soft">CS Prashant Kumar Analysis</p>
                  </div>
                </div>
                <p className={`${fontSizeClass} text-ink leading-relaxed p-4 bg-mint/20 border border-mint-deep/40 rounded-xl`}>
                  {provisionData?.regmate_explanation || `Regulation ${sNum} establishes the fit and proper threshold for FME registration. The regulator evaluates past defaults, regulatory disciplinary actions, and market conduct of promoters and key management personnel.`}
                </p>
              </div>
            )}

            {/* 4. PRACTICAL GUIDANCE TAB */}
            {activeTab === 'guidance' && (
              <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-forest-deep flex items-center gap-2 pb-4 border-b border-line">
                  <CheckCircle2 className="w-6 h-6 text-leaf" /> Practical Guidance
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-950 text-xs leading-relaxed space-y-2">
                  <strong className="font-bold text-amber-900 block uppercase">Practitioner Note:</strong>
                  <p>{provisionData?.practical_point || 'Track record assessment is a qualitative test. Any past regulatory action must be disclosed upfront in the registration application.'}</p>
                </div>
              </div>
            )}

            {/* 5. EXAMPLES TAB */}
            {activeTab === 'examples' && (
              <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-forest-deep flex items-center gap-2 pb-4 border-b border-line">
                  <HelpCircle className="w-6 h-6 text-forest" /> Illustration / Examples
                </h3>
                <p className={`${fontSizeClass} text-ink leading-relaxed p-4 bg-paper border border-line rounded-xl`}>
                  {provisionData?.examples || 'Example: An applicant whose director was previously penalized by SEBI for insider trading would fail the reputation of fairness test under Regulation 6.'}
                </p>
              </div>
            )}

            {/* 6. RELATED TAB */}
            {activeTab === 'related' && (
              <div className="bg-white border border-line rounded-2xl p-6 md:p-8 card-shadow space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-forest-deep flex items-center gap-2 pb-4 border-b border-line">
                  <Link2 className="w-6 h-6 text-forest" /> Related Provisions ({finalRelated.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {finalRelated.map((rel, idx) => (
                    <Link
                      key={idx}
                      to={`/interactive-regulations/${actSlug}/${chapter}/section-${rel.to_provision}`}
                      className="p-3 bg-paper border border-line rounded-xl hover:bg-mint/30 transition-colors block text-xs font-semibold text-forest"
                    >
                      Section {rel.to_provision} — {rel.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* BOTTOM ACTION ROW (BELOW MAIN CONTENT CARD MATCHING MOCKUP) */}
          <div className="pt-2 flex items-center gap-4 flex-wrap text-xs text-ink-soft border-t border-line/60">
            <button
              onClick={handleToggleBookmark}
              className="cursor-target flex items-center gap-1.5 hover:text-forest transition-colors font-medium"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-gold text-gold' : ''}`} />
              <span>Bookmark</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) navigator.share({ title: `Section ${sNum}`, url: window.location.href });
                else handleCopyLink();
              }}
              className="cursor-target flex items-center gap-1.5 hover:text-forest transition-colors font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="cursor-target flex items-center gap-1.5 hover:text-forest transition-colors font-medium"
            >
              {copied ? <Check className="w-4 h-4 text-leaf" /> : <Link2 className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="cursor-target flex items-center gap-1.5 hover:text-forest transition-colors font-medium"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>

          {/* BOTTOM PREV / NEXT SECTION ROW (DUPLICATED AT BOTTOM OF READING CONTENT) */}
          <div className="bg-white border border-line rounded-xl p-3 flex items-center justify-between text-xs font-semibold text-forest">
            {prevSec ? (
              <Link
                to={`/interactive-regulations/${actSlug}/${chapter}/section-${prevSec.num}`}
                className="cursor-target hover:text-leaf flex items-center gap-1.5"
              >
                &larr; Section {prevSec.num}
              </Link>
            ) : (
              <span className="text-ink-soft/40">&larr; First Section</span>
            )}

            {nextSec ? (
              <Link
                to={`/interactive-regulations/${actSlug}/${chapter}/section-${nextSec.num}`}
                className="cursor-target hover:text-leaf flex items-center gap-1.5"
              >
                Section {nextSec.num} &rarr;
              </Link>
            ) : (
              <span className="text-ink-soft/40">Last Section &rarr;</span>
            )}
          </div>

        </main>

        {/* ─── 3. RIGHT SIDEBAR (PERSISTENT ~25% WIDTH) ───────────────────────── */}
        <aside className="w-full md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-line bg-white p-5 space-y-5 flex-shrink-0">
          
          {/* CARD 1: Key Terms in this Section */}
          <div className="bg-paper border border-line rounded-2xl p-4 space-y-3 card-shadow">
            <h3 className="font-semibold text-forest-deep text-xs uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-leaf" /> Key Terms in this Section
            </h3>
            
            <div className="space-y-2.5 text-xs">
              {keyTerms.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white border border-line rounded-xl space-y-0.5">
                  <strong className="block text-forest font-bold text-xs">{item.term}</strong>
                  <span className="text-[11px] text-ink-soft">{item.ref}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('Viewing full terms glossary')}
              className="cursor-target text-xs font-bold text-forest hover:text-leaf pt-1 block"
            >
              View all terms (8) &rarr;
            </button>
          </div>

          {/* CARD 2: Related Provisions */}
          <div className="bg-paper border border-line rounded-2xl p-4 space-y-3 card-shadow">
            <h3 className="font-semibold text-forest-deep text-xs uppercase tracking-wider flex items-center gap-2">
              <Link2 className="w-4 h-4 text-forest" /> Related Provisions
            </h3>

            <div className="space-y-2 text-xs">
              {finalRelated.map((rel, idx) => (
                <Link
                  key={idx}
                  to={`/interactive-regulations/${actSlug}/${chapter}/section-${rel.to_provision}`}
                  className="cursor-target block p-2.5 bg-white border border-line rounded-xl hover:bg-mint/40 transition-colors"
                >
                  <strong className="text-forest block">Section {rel.to_provision}</strong>
                  <span className="text-[11px] text-ink-soft truncate block">{rel.title}</span>
                </Link>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('related')}
              className="cursor-target text-xs font-bold text-forest hover:text-leaf pt-1 block"
            >
              View all related ({finalRelated.length}) &rarr;
            </button>
          </div>

          {/* CARD 3: Quick Actions Menu */}
          <div className="bg-paper border border-line rounded-2xl p-4 space-y-3 card-shadow">
            <h3 className="font-semibold text-forest-deep text-xs uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold" /> Quick Actions
            </h3>

            <div className="space-y-2 text-xs font-medium text-forest">
              <button
                onClick={handleToggleBookmark}
                className="cursor-target w-full text-left p-2 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
              >
                <Bookmark className="w-3.5 h-3.5 text-leaf" /> Bookmark this section
              </button>
              <button
                onClick={handleCopyLink}
                className="cursor-target w-full text-left p-2 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
              >
                <Link2 className="w-3.5 h-3.5 text-leaf" /> Copy link
              </button>
              <button
                onClick={() => {
                  if (navigator.share) navigator.share({ title: `Section ${sNum}`, url: window.location.href });
                  else handleCopyLink();
                }}
                className="cursor-target w-full text-left p-2 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5 text-leaf" /> Share this section
              </button>
              <button
                onClick={handlePrint}
                className="cursor-target w-full text-left p-2 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-leaf" /> Print this section
              </button>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
