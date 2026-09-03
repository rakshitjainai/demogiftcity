import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, BookOpen, Lock, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import coursesData from '../data/courses.json';
import { isModuleUnlocked } from '../utils/learnProgress';
import { getClassicStudyContent } from '../utils/courseContentResolver';
import ProgressiveStepEngine from '../components/ProgressiveStepEngine';

export default function ChapterLearning() {
  const { courseSlug, chapterId } = useParams();
  const navigate = useNavigate();
  const { isMember, hasCourseAccess, initiateCheckout } = useAuth();

  const resolvedPackage = useMemo(() => getClassicStudyContent(courseSlug), [courseSlug]);
  const course = coursesData[courseSlug] || (!resolvedPackage.notFound ? resolvedPackage : null);
  const rawChapters = course?.chapters || [];
  const chapters = useMemo(() => {
    return rawChapters.map((c, idx) => {
      const num = c.num || c.chapterNo || c.number || (idx + 1);
      return {
        ...c,
        num,
        chapterNo: num,
        id: c.id || `ch_${num}`,
        title: c.title || `Chapter ${num}`,
        description: c.description || c.understandBody || 'Statutory compliance and operational requirements.',
        band: c.band || 'Regulatory Framework',
      };
    });
  }, [rawChapters]);

  let chIdx = chapters.findIndex(c => String(c.num) === String(chapterId) || String(c.id) === String(chapterId));
  if (chIdx === -1 && !isNaN(Number(chapterId)) && Number(chapterId) >= 1 && Number(chapterId) <= chapters.length) {
    chIdx = Number(chapterId) - 1;
  }
  const chapter = chapters[chIdx];
  const chNum = chapter ? (chapter.num || (chIdx + 1)) : 1;

  const isOwned = Boolean(isMember || hasCourseAccess?.(courseSlug));

  // Canonical Sequential Module Lock Check
  const unlockStatus = isModuleUnlocked(courseSlug, chIdx, chapters, isOwned);
  const isLocked = !unlockStatus.unlocked && unlockStatus.reason === 'membership_required';
  const isSequentialLocked = !unlockStatus.unlocked && unlockStatus.reason === 'sequential_locked';

  const nextChapter = chIdx >= 0 && chIdx < chapters.length - 1 ? chapters[chIdx + 1] : null;
  const nextChNum = nextChapter ? (nextChapter.num || (chIdx + 2)) : null;

  if (!course || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-8">
        <div className="text-center space-y-4">
          <BookOpen className="w-12 h-12 text-forest mx-auto opacity-40" />
          <h2 className="font-display font-bold text-xl text-forest-deep">Module not found</h2>
          <Link to={`/learn/${courseSlug || ''}`} className="inline-flex items-center gap-2 text-forest font-semibold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Course Map
          </Link>
        </div>
      </div>
    );
  }

  // Handle Locked State
  if (!unlockStatus.unlocked) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-forest/10 shadow-xl max-w-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-700 flex items-center justify-center mx-auto text-2xl">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-forest-deep">
            {isLocked ? 'Premium Module Locked' : 'Complete Previous Module First'}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isLocked
              ? `Access to Chapter ${chNum}: "${chapter.title}" requires full course membership.`
              : `RegLearn enforces sequential module mastery. Please complete Chapter ${unlockStatus.prevChapterNum}: "${unlockStatus.prevChapterTitle}" before unlocking this chapter.`}
          </p>
          <div className="pt-2 flex flex-col gap-3">
            {isLocked ? (
              <button
                onClick={() => initiateCheckout?.(courseSlug)}
                className="w-full py-3 rounded-xl bg-forest text-white font-bold text-sm shadow-md hover:bg-forest-deep transition-all"
              >
                Unlock Full Course Access →
              </button>
            ) : (
              <Link
                to={`/learn/${courseSlug}/chapter/${unlockStatus.prevChapterNum}`}
                className="w-full py-3 rounded-xl bg-forest text-white font-bold text-sm shadow-md hover:bg-forest-deep transition-all block text-center"
              >
                Go to Chapter {unlockStatus.prevChapterNum} →
              </Link>
            )}
            <Link to={`/learn/${courseSlug}`} className="text-xs text-forest font-semibold hover:underline">
              Back to Course Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-20">
      
      {/* ─── Top Sticky Chapter Header Bar ─── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-forest/10 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Link to={`/learn/${courseSlug}`} className="text-forest hover:underline flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Course Map
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="font-mono text-ink-soft">Ch {chNum} of {chapters.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/learn/${courseSlug}/challenge/rapid-recall?chapter=${chNum}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" /> Timed Challenge
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Reusable Step Engine ─── */}
      <main className="pt-4">
        <ProgressiveStepEngine
          course={course}
          chapter={chapter}
          courseSlug={courseSlug}
          onComplete={() => {
            if (nextChapter && nextChNum) {
              navigate(`/learn/${courseSlug}/chapter/${nextChNum}`);
            } else {
              navigate(`/learn/${courseSlug}`);
            }
          }}
        />
      </main>
    </div>
  );
}
