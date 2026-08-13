import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, BookOpen, Hash } from 'lucide-react';
import RegulationRow from '../components/RegulationRow';
import { ACTS_DATA, getActName } from '../data/regulationsData';

export default function ChapterDetail() {
  const { actSlug, chapter } = useParams();
  const actName = getActName(actSlug);
  const chapterNum = parseInt(chapter?.replace('chapter-', '') || '1', 10);

  const actData = ACTS_DATA[actSlug];
  const chapterData = actData?.chapters.find(c => c.num === chapterNum);
  const sections = chapterData?.sections || [];
  const chapterTitle = chapterData?.title || `Chapter ${chapterNum}`;

  // Prev / next chapter
  const allChapters = actData?.chapters || [];
  const chapterIdx = allChapters.findIndex(c => c.num === chapterNum);
  const prevChapter = chapterIdx > 0 ? allChapters[chapterIdx - 1] : null;
  const nextChapter = chapterIdx < allChapters.length - 1 ? allChapters[chapterIdx + 1] : null;

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto animate-fade-in-up">
      {/* Back link */}
      <Link to="/interactive-regulations" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Interactive Regulations
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="eyebrow block">§ {actName}</span>
          {actData?.versionDate ? (
            <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-full font-medium">
              Verified · {actData.versionDate.includes('Consolidated') ? actData.versionDate.replace('Consolidated as amended up to ', 'Consolidated to ') : actData.versionDate}
            </span>
          ) : null}
        </div>
        <h1 className="text-3xl md:text-4xl font-display text-forest-deep mb-2">Chapter {chapterNum}</h1>
        <p className="text-xl text-ink font-medium mb-3">{chapterTitle}</p>
        <p className="text-ink-soft">
          {sections.length} regulation{sections.length !== 1 ? 's' : ''} in this chapter
        </p>
      </div>

      {/* Sections list */}
      <div className="bg-white border border-line rounded-2xl overflow-hidden card-shadow">
        <div className="px-6 py-4 bg-mint border-b border-line flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-forest" />
          <h3 className="font-semibold text-forest-deep">Sections in Chapter {chapterNum} — {chapterTitle}</h3>
        </div>
        <div className="divide-y divide-line">
          {sections.length > 0 ? sections.map(sec => (
            <RegulationRow
              key={sec.num}
              to={`/interactive-regulations/${actSlug}/${chapter}/section-${sec.num}`}
              icon={FileText}
              title={`Section ${sec.num}`}
              subtitle={sec.title}
            />
          )) : (
            <div className="px-6 py-8 text-center text-ink-soft text-sm">
              Section data for this chapter is being structured. Check back soon.
            </div>
          )}
        </div>
      </div>

      {/* Chapter Prev / Next */}
      <div className="flex items-center justify-between pt-8">
        {prevChapter ? (
          <Link
            to={`/interactive-regulations/${actSlug}/chapter-${prevChapter.num}`}
            className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-paper border border-line rounded-xl text-forest font-medium hover:bg-mint transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Ch. {prevChapter.num}: {prevChapter.title.length > 35 ? prevChapter.title.slice(0, 35) + '…' : prevChapter.title}
          </Link>
        ) : <div />}

        {nextChapter ? (
          <Link
            to={`/interactive-regulations/${actSlug}/chapter-${nextChapter.num}`}
            className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-white rounded-xl font-medium hover:bg-leaf transition-colors shadow-sm"
          >
            Ch. {nextChapter.num}: {nextChapter.title.length > 30 ? nextChapter.title.slice(0, 30) + '…' : nextChapter.title} →
          </Link>
        ) : <div />}
      </div>

      {/* Coming Soon notice */}
      <div className="mt-6 bg-mint-deep border border-leaf/20 rounded-xl p-5 text-center">
        <p className="text-ink-soft text-sm">
          <strong className="text-forest-deep">Full annotated text coming soon.</strong>{' '}
          We are structuring the complete legal text with cross-references and practitioner notes by CS Prashant Kumar.
        </p>
      </div>
    </div>
  );
}
