import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, FileText, CheckCircle2, AlertCircle, Bookmark, Tag, HelpCircle, Link2 } from 'lucide-react';
import { ACTS_DATA, PROVISION_DETAILS, CROSS_REFERENCES_DATA, getActName } from '../data/regulationsData';

// ─── Per-section Key Highlights ──────────────────────────────────────────────
// Keyed as `actSlug|sectionNum`. Falls back to number-keyed generic bullets.

const SECTION_HIGHLIGHTS = {
  // ══ Companies Act, 2013 ══
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

// Fallback per section number (act-agnostic)
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
    return provisionData.key_highlights.map(h => `Key highlight parameter: ${h}`);
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

// ─────────────────────────────────────────────────────────────────────────────

export default function SectionDetail() {
  const { actSlug, chapter, sectionNum } = useParams();

  const actName = getActName(actSlug);
  const cleanChapter = chapter?.replace('chapter-', '') || '1';
  const chapterNum = parseInt(cleanChapter, 10) || 1;
  const cleanSection = sectionNum?.replace('section-', '') || '1';
  const sNum = cleanSection;

  // Get real section title from data
  const actData = ACTS_DATA[actSlug];
  const chapterData = actData?.chapters.find(c => String(c.num) === String(chapterNum));
  const chapterTitle = chapterData?.title || `Chapter ${chapterNum}`;
  const sectionData = chapterData?.sections.find(s => String(s.num) === String(sNum));
  const sectionTitle = sectionData?.title || `Regulation ${sNum}`;

  // Provision details from content package (if available)
  const provisionData = PROVISION_DETAILS[`${actSlug}|${chapterNum}|${cleanSection}`]
                     || PROVISION_DETAILS[`${actSlug}|${cleanSection}`]
                     || null;

  // Prev/Next sections within this chapter
  const allSections = chapterData?.sections || [];
  const secIdx = allSections.findIndex(s => String(s.num) === String(sNum));
  const prevSec = secIdx > 0 ? allSections[secIdx - 1] : null;
  const nextSec = secIdx < allSections.length - 1 ? allSections[secIdx + 1] : null;

  const highlights = getHighlights(actSlug, sNum, provisionData);

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-ink-soft mb-8 flex-wrap">
        <Link to="/interactive-regulations" className="cursor-target hover:text-leaf font-medium">
          Interactive Regulations
        </Link>
        <span>/</span>
        <Link to={`/interactive-regulations/${actSlug}/${chapter}`} className="cursor-target hover:text-leaf font-medium">
          {actName} — Ch. {chapterNum}
        </Link>
        <span>/</span>
        <span className="text-forest-deep font-semibold">Regulation {sNum}</span>
      </div>

      {/* Header */}
      <div className="mb-10 bg-white border border-line rounded-2xl p-8 card-shadow">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full uppercase tracking-wider">
            {actName}
          </span>
          <span className="px-3 py-1 bg-gold/20 text-forest font-semibold text-xs rounded-full">
            Chapter {chapterNum} — {chapterTitle}
          </span>
          {provisionData?.requirement_type && (
            <span className="px-3 py-1 bg-forest/10 text-forest-deep font-medium text-xs rounded-full">
              {provisionData.requirement_type}
            </span>
          )}
          {actSlug === 'ifsca-fme-2025' && (
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-medium text-xs rounded-full">
              Draft — pending legal review
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-display text-forest-deep mb-3">
          Regulation {sNum}
        </h1>
        <p className="text-xl text-ink font-medium mb-4">{sectionTitle}</p>

        {/* Topic Tags */}
        {provisionData?.topic_tags && provisionData.topic_tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <Tag className="w-4 h-4 text-leaf" />
            {provisionData.topic_tags.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-0.5 bg-paper border border-line text-ink-soft text-xs rounded-md font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Key Highlights */}
        {highlights.length > 0 && (
          <div className="bg-paper border border-line rounded-xl p-6">
            <h3 className="font-semibold text-forest-deep text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" /> Key Highlights &amp; Scope
            </h3>
            <ul className="space-y-3 text-sm text-ink-soft">
              {highlights.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-leaf font-bold mt-0.5 flex-shrink-0">•</span>
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Statutory Text & RegMate Editorial Layer */}
        {provisionData ? (
          <div className="space-y-6">
            {/* Statutory Text Card */}
            <div className="bg-white border border-line rounded-2xl p-8 card-shadow">
              <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-leaf" />
                  <h3 className="text-xl font-semibold text-forest-deep">Statutory Text</h3>
                </div>
                <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full">
                  Official Gazette Text
                </span>
              </div>
              <div className="bg-paper border border-line rounded-xl p-6 text-forest-deep text-sm leading-relaxed whitespace-pre-line font-serif">
                {provisionData.statutory_text}
              </div>
            </div>

            {/* RegMate Editorial & Practical Guidance */}
            <div className="bg-white border border-line rounded-2xl p-8 card-shadow space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-line">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-forest" />
                  <h3 className="text-xl font-semibold text-forest-deep">RegMate Editorial &amp; Practical Layer</h3>
                </div>
                <span className="px-3 py-1 bg-gold/20 text-forest font-semibold text-xs rounded-full">
                  CS Prashant Kumar Analysis
                </span>
              </div>

              {/* Explanation */}
              {provisionData.regmate_explanation && (
                <div>
                  <h4 className="font-semibold text-forest-deep mb-2 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-leaf" /> Regulatory Explanation
                  </h4>
                  <p className="text-sm text-ink leading-relaxed bg-mint-deep/40 border border-line p-4 rounded-xl">
                    {provisionData.regmate_explanation}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Practical Point */}
                {provisionData.practical_point && (
                  <div className="bg-paper border border-line p-5 rounded-xl">
                    <h5 className="font-semibold text-forest-deep text-sm mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-leaf" /> Practical Guidance
                    </h5>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {provisionData.practical_point}
                    </p>
                  </div>
                )}

                {/* Compliance Point */}
                {provisionData.compliance_point && (
                  <div className="bg-paper border border-line p-5 rounded-xl">
                    <h5 className="font-semibold text-forest-deep text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gold" /> Compliance Checkpoint
                    </h5>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {provisionData.compliance_point}
                    </p>
                  </div>
                )}
              </div>

              {/* Examples & Action Required */}
              {(provisionData.examples || provisionData.action_required) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {provisionData.examples && (
                    <div className="bg-mint-deep/30 border border-line p-5 rounded-xl">
                      <h5 className="font-semibold text-forest-deep text-sm mb-2 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-forest" /> Illustration / Examples
                      </h5>
                      <p className="text-xs text-ink-soft leading-relaxed">
                        {provisionData.examples}
                      </p>
                    </div>
                  )}

                  {provisionData.action_required && (
                    <div className="bg-mint-deep/30 border border-line p-5 rounded-xl">
                      <h5 className="font-semibold text-forest-deep text-sm mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-leaf" /> Action Required
                      </h5>
                      <p className="text-xs text-ink-soft leading-relaxed">
                        {provisionData.action_required}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Statutory Cross-References */}
              {CROSS_REFERENCES_DATA.filter(cr => String(cr.from_provision) === String(sNum)).length > 0 && (
                <div className="bg-mint-deep/20 border border-line rounded-xl p-5">
                  <h5 className="font-semibold text-forest-deep text-sm mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-forest" /> Statutory Cross-References
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {CROSS_REFERENCES_DATA.filter(cr => String(cr.from_provision) === String(sNum)).map((cr, idx) => (
                      <Link
                        key={idx}
                        to={`/interactive-regulations/ifsca-fme-2025/chapter-1/section-${cr.to_provision}`}
                        className="cursor-target inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line rounded-lg text-xs text-forest font-medium hover:bg-mint transition-colors"
                      >
                        <span>Regulation {cr.to_provision}</span>
                        <span className="text-ink-soft">({cr.relation})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-line rounded-2xl p-8 card-shadow">
            <div className="flex items-center justify-between pb-6 border-b border-line mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-leaf" />
                <h3 className="text-xl font-semibold text-forest-deep">Statutory Text &amp; Commentary</h3>
              </div>
              <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full">
                Codex Annotated View
              </span>
            </div>
            <div className="bg-mint-deep border border-leaf/20 rounded-xl p-8 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-forest mx-auto" />
              <h4 className="text-xl font-display text-forest-deep">Full Text &amp; Commentary Coming Soon</h4>
              <p className="text-sm text-ink-soft max-w-xl mx-auto">
                We are actively structuring the complete legal text of{' '}
                <strong>Regulation {sNum} — {sectionTitle}</strong>{' '}
                with cross-references, precedent case law, and practitioner insights by{' '}
                <strong>CS Prashant Kumar</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Prev / Next section navigation (real titles) */}
        <div className="flex items-center justify-between pt-2">
          {prevSec ? (
            <Link
              to={`/interactive-regulations/${actSlug}/${chapter}/section-${prevSec.num}`}
              className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-paper border border-line rounded-xl text-forest font-medium hover:bg-mint transition-colors text-sm max-w-xs"
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">§ {prevSec.num} — {prevSec.title.length > 35 ? prevSec.title.slice(0, 35) + '…' : prevSec.title}</span>
            </Link>
          ) : (
            <Link
              to={`/interactive-regulations/${actSlug}/${chapter}`}
              className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-paper border border-line rounded-xl text-forest font-medium hover:bg-mint transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Chapter
            </Link>
          )}

          {nextSec ? (
            <Link
              to={`/interactive-regulations/${actSlug}/${chapter}/section-${nextSec.num}`}
              className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-white rounded-xl font-medium hover:bg-leaf transition-colors shadow-sm text-sm max-w-xs"
            >
              <span className="truncate">§ {nextSec.num} — {nextSec.title.length > 35 ? nextSec.title.slice(0, 35) + '…' : nextSec.title}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : (
            <Link
              to={`/interactive-regulations/${actSlug}/${chapter}`}
              className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-white rounded-xl font-medium hover:bg-leaf transition-colors shadow-sm text-sm"
            >
              All Sections <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
