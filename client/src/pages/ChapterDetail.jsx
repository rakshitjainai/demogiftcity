import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, BookOpen, Hash } from 'lucide-react';
import RegulationRow from '../components/RegulationRow';
import { ACTS_DATA, getActName } from '../data/regulationsData';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/UpgradeModal';
import LockOverlay from '../components/LockOverlay';
import { useNavigate } from 'react-router-dom';

const ROMAN_MAP = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
  'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12,
  'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16, 'XVII': 17, 'XVIII': 18,
  'XIX': 19, 'XX': 20
};

function parseChapterNum(val) {
  if (val === null || val === undefined) return 1;
  if (typeof val === 'number') return val;
  const str = String(val).replace(/^chapter-/i, '').trim().toUpperCase();
  if (ROMAN_MAP[str]) return ROMAN_MAP[str];
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? 1 : parsed;
}

export default function ChapterDetail() {
  const { actSlug, chapter } = useParams();
  const { user, isAuthenticated, trackUsage } = useAuth();
  const navigate = useNavigate();
  const [showLock, setShowLock] = useState(false);

  // Auth lock check for logged out users
  if (!isAuthenticated) {
    return (
      <LockOverlay
        type="login"
        title="Login Required for Knowledge Hub"
        message="Reading regulatory chapters requires an authenticated RegMate account. Please log in or create an account to access."
        redirectPath="/login"
      />
    );
  }

  const actName = getActName(actSlug);
  const cleanChapter = chapter?.replace('chapter-', '') || '1';
  const chapterNum = parseChapterNum(chapter || cleanChapter);
  const isMember = user?.membershipStatus === 'active';
  const hasRegPass = user?.subscriptions?.includes('interactive_regulations') || user?.subscriptions?.includes('full_access');

  const isChapterLocked = !isMember && !hasRegPass && chapterNum > 2;
  const chapterSlug = `${actSlug}/${chapter}`;

  useEffect(() => {
    if (isAuthenticated) {
      trackUsage('chapter', chapterSlug);
    }
  }, [actSlug, chapter, isAuthenticated]);

  const actData = ACTS_DATA[actSlug];
  if (!actData) {
    return (
      <div className="py-16 px-6 max-w-5xl mx-auto text-center animate-fade-in-up">
        <h2 className="text-2xl font-bold text-forest-deep mb-3">Regulation Not Found</h2>
        <p className="text-ink-soft mb-6">The requested regulation "{actSlug}" could not be found or loaded.</p>
        <Link to="/interactive-regulations" className="cursor-target inline-flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-xl font-bold hover:bg-leaf transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Interactive Regulations
        </Link>
      </div>
    );
  }
  const chapterData = actData?.chapters.find(c => 
    parseChapterNum(c.num) === chapterNum || 
    String(c.num) === String(chapterNum) || 
    String(c.romanNum).toUpperCase() === String(cleanChapter).toUpperCase()
  );
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

      {isChapterLocked && (
        <UpgradeModal
          isOpen={true}
          onClose={() => navigate('/interactive-regulations')}
          sectionKey="interactive_regulations"
          title={`Chapter ${chapterNum} is Premium Content`}
          message={`Chapter 1 and 2 of every regulation are free preview. Upgrade your pass for ₹499 or get full access membership to unlock Chapter ${chapterNum} and all interactive regulations.`}
        />
      )}
    </div>
  );
}
