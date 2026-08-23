import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, BookOpen, HelpCircle, ArrowLeft, ArrowRight, ShieldAlert, Sparkles, Award, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CourseViewerModal({ course, onClose }) {
  const { user, toggleCourseItem, answerCourseMcq } = useAuth();
  
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [activeItem, setActiveItem] = useState(null); // { type: 'lesson'|'mcq', data, chapterNo }
  
  // MCQ state
  const [selectedOption, setSelectedOption] = useState(null);
  const [submittedAnswer, setSubmittedAnswer] = useState(null); // { option, isCorrect }

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const courseSlug = course?.slug;

  // Get completed UIDs for this course
  const getCompletedItems = () => {
    if (user && user.courseProgress) {
      const entry = user.courseProgress.find(c => c.courseSlug === courseSlug);
      if (entry) return entry.completedItems || [];
    }
    // Guest fallback
    const guestProgress = JSON.parse(localStorage.getItem('regmate_guest_course_progress') || '{}');
    return guestProgress[courseSlug]?.completedItems || [];
  };

  const completedItems = getCompletedItems();
  const totalItems = course?.totalItems || 1;
  const progressPct = Math.round((completedItems.length / totalItems) * 100);

  const handleToggleLessonComplete = async (uid) => {
    await toggleCourseItem(courseSlug, uid);
  };

  const handleSelectOption = (key) => {
    if (submittedAnswer) return; // locked once submitted
    setSelectedOption(key);
  };

  const handleSubmitMcq = async (mcq) => {
    if (!selectedOption || submittedAnswer) return;
    const correctKey = mcq.answer?.correct || mcq.payload?.answer?.correct || mcq.payload?.options?.[0]?.k;
    const isCorrect = selectedOption === correctKey;
    setSubmittedAnswer({ option: selectedOption, isCorrect });
    await answerCourseMcq(courseSlug, mcq.uid, selectedOption, isCorrect);
  };

  const handleOpenItem = (item, type, chNo) => {
    setActiveItem({ type, data: item, chapterNo: chNo });
    setSelectedOption(null);
    setSubmittedAnswer(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="bg-white w-full md:max-w-4xl h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-forest-deep text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-line/20 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <span className="px-2.5 py-0.5 bg-mint/20 text-mint font-bold text-xs rounded-full uppercase flex-shrink-0">
              {course.code}
            </span>
            <h2 className="text-base sm:text-xl font-display text-paper font-semibold truncate">
              {course.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-target p-2.5 rounded-full hover:bg-white/10 text-paper/80 hover:text-white transition-colors flex-shrink-0 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close course viewer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Course Progress Sub-header */}
        <div className="bg-paper border-b border-line px-6 py-3 flex items-center justify-between text-xs font-medium text-ink-soft">
          <div className="flex items-center gap-4">
            <span>{course.totalChapters} Chapters</span>
            <span>•</span>
            <span>{course.totalLessons} Lessons</span>
            <span>•</span>
            <span>{course.totalQuestions} Practice MCQs</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Progress: <strong className="text-forest font-bold">{user ? `${progressPct}%` : '0%'}</strong> ({completedItems.length}/{totalItems})</span>
            <div className="w-24 bg-line h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${progressPct === 100 ? 'bg-leaf-bright' : 'bg-leaf'}`}
                style={{ width: user ? `${progressPct}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Content Body: Left Syllabus / Right Item Viewer */}
        <div className="flex-grow flex overflow-hidden">

          {/* Left Column: Syllabus List */}
          <div className="w-1/3 min-w-[300px] border-r border-line overflow-y-auto bg-paper/50 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft px-2 mb-2">
              Syllabus &amp; Modules
            </h3>

            {course.chapters?.map((ch) => {
              const isChExpanded = selectedChapter === ch.num || (!selectedChapter && ch.num === 1);
              const chLessonDone = ch.lessons?.filter(l => completedItems.includes(l.uid)).length || 0;
              const chMcqDone = ch.questions?.filter(q => completedItems.includes(q.uid)).length || 0;
              const chTotal = (ch.lessons?.length || 0) + (ch.questions?.length || 0);

              return (
                <div key={ch.num} className="border border-line rounded-xl bg-white overflow-hidden shadow-sm">
                  {/* Chapter Header */}
                  <button
                    onClick={() => setSelectedChapter(isChExpanded ? null : ch.num)}
                    className="w-full px-4 py-3 text-left flex items-start justify-between hover:bg-paper/80 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-leaf uppercase tracking-wider block">
                        Chapter {ch.num} {ch.band ? `• ${ch.band}` : ''}
                      </span>
                      <h4 className="font-semibold text-forest-deep text-xs leading-snug mt-0.5">
                        {ch.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold text-ink-soft bg-paper px-2 py-0.5 rounded-full flex-shrink-0 mt-1">
                      {chLessonDone + chMcqDone}/{chTotal}
                    </span>
                  </button>

                  {/* Chapter Items List */}
                  {isChExpanded && (
                    <div className="border-t border-line bg-paper/30 divide-y divide-line/60">
                      {/* Lessons */}
                      {ch.lessons?.map((les) => {
                        const isDone = completedItems.includes(les.uid);
                        const isActive = activeItem?.data?.uid === les.uid;

                        return (
                          <button
                            key={les.uid}
                            onClick={() => handleOpenItem(les, 'lesson', ch.num)}
                            className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                              isActive ? 'bg-mint/50 font-semibold text-forest-deep border-l-4 border-leaf' : 'hover:bg-paper text-ink'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <BookOpen className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                              <span className="truncate">{les.title}</span>
                            </div>
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-leaf flex-shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-ink-soft/40 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}

                      {/* Questions */}
                      {ch.questions?.map((q) => {
                        const isDone = completedItems.includes(q.uid);
                        const isActive = activeItem?.data?.uid === q.uid;

                        return (
                          <button
                            key={q.uid}
                            onClick={() => handleOpenItem(q, 'mcq', ch.num)}
                            className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                              isActive ? 'bg-gold/20 font-semibold text-forest-deep border-l-4 border-gold' : 'hover:bg-paper text-ink'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <HelpCircle className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                              <span className="truncate">{q.title}</span>
                            </div>
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-leaf flex-shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-ink-soft/40 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Item Renderer */}
          <div className="flex-grow p-6 overflow-y-auto bg-white flex flex-col">
            {activeItem ? (
              activeItem.type === 'lesson' ? (
                /* LESSON RENDERER */
                <div className="space-y-6">
                  {/* Metadata Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-line">
                    <div>
                      <span className="text-xs font-bold text-leaf uppercase tracking-wider">
                        Chapter {activeItem.chapterNo} • Lesson
                      </span>
                      <h2 className="text-2xl font-display text-forest-deep mt-1 font-semibold">
                        {activeItem.data.title}
                      </h2>
                      {activeItem.data.provision && (
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-paper border border-line text-ink-soft text-xs rounded-full">
                          Provision: {activeItem.data.provision}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleLessonComplete(activeItem.data.uid)}
                      className={`cursor-target px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                        completedItems.includes(activeItem.data.uid)
                          ? 'bg-mint text-forest border border-mint-deep'
                          : 'bg-forest text-white hover:bg-leaf'
                      }`}
                    >
                      {completedItems.includes(activeItem.data.uid) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-leaf" /> Completed
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" /> Mark as Complete
                        </>
                      )}
                    </button>
                  </div>

                  {/* Lesson Hook */}
                  {activeItem.data.payload?.hook && (
                    <div className="p-4 bg-paper/80 border-l-4 border-forest rounded-r-xl text-sm italic text-forest-deep leading-relaxed">
                      "{activeItem.data.payload.hook}"
                    </div>
                  )}

                  {/* Cards List */}
                  {activeItem.data.payload?.cards?.map((card, idx) => (
                    <div key={idx} className="bg-white border border-line rounded-xl p-5 card-shadow space-y-4">
                      <div className="flex items-center justify-between">
                        {card.tag && (
                          <span className="px-2.5 py-0.5 bg-mint text-forest font-bold text-[10px] rounded-full uppercase tracking-wider">
                            {card.tag}
                          </span>
                        )}
                        {card.title && (
                          <h3 className="font-semibold text-forest-deep text-base">
                            {card.title}
                          </h3>
                        )}
                      </div>

                      {/* Statutory Law Card */}
                      {card.law && (
                        <div className="bg-mint/20 border border-mint-deep/30 rounded-lg p-4 font-mono text-xs text-forest-deep leading-relaxed">
                          <strong className="block text-leaf text-[10px] uppercase font-sans mb-1 font-bold">
                            Statutory Mandate:
                          </strong>
                          {card.law}
                        </div>
                      )}

                      {/* Practical Meaning */}
                      {card.means && (
                        <div className="text-sm text-ink leading-relaxed">
                          <strong className="text-forest-deep font-semibold">What this means: </strong>
                          {card.means}
                        </div>
                      )}

                      {/* Watch / Practitioner Caution */}
                      {card.watch && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3">
                          <ShieldAlert className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold uppercase tracking-wider block mb-0.5 text-amber-800">
                              Practitioner Note:
                            </strong>
                            {card.watch}
                          </div>
                        </div>
                      )}

                      {/* Link Context */}
                      {card.link && (
                        <div className="text-xs text-ink-soft italic pt-2 border-t border-line/50">
                          Link to: {card.link}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Summary */}
                  {activeItem.data.payload?.summary && (
                    <div className="bg-paper border border-line rounded-xl p-5">
                      <h4 className="font-semibold text-forest-deep text-xs uppercase tracking-wider mb-2">
                        Summary
                      </h4>
                      <p className="text-sm text-ink leading-relaxed">
                        {activeItem.data.payload.summary}
                      </p>
                    </div>
                  )}

                  {/* Tip */}
                  {activeItem.data.payload?.tip && (
                    <div className="bg-leaf/10 border border-leaf/30 rounded-xl p-5 text-sm text-forest-deep flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-leaf flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block mb-1">Key Takeaway &amp; Action Tip:</strong>
                        {activeItem.data.payload.tip}
                      </div>
                    </div>
                  )}

                  {/* Footer Action */}
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => handleToggleLessonComplete(activeItem.data.uid)}
                      className="cursor-target px-6 py-2.5 bg-forest text-white font-semibold text-sm rounded-xl hover:bg-leaf transition-colors flex items-center gap-2"
                    >
                      {completedItems.includes(activeItem.data.uid) ? 'Mark Incomplete' : 'Mark Lesson Complete & Continue'}
                    </button>
                  </div>
                </div>
              ) : (
                /* MCQ RENDERER */
                <div className="space-y-6">
                  <div className="pb-4 border-b border-line">
                    <span className="text-xs font-bold text-gold uppercase tracking-wider">
                      Chapter {activeItem.chapterNo} • Practice MCQ
                    </span>
                    <h2 className="text-xl font-display text-forest-deep mt-1 font-semibold">
                      {activeItem.data.payload?.q || activeItem.data.title}
                    </h2>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {activeItem.data.payload?.options?.map((opt) => {
                      const isSelected = selectedOption === opt.k;
                      const correctKey = activeItem.data.answer?.correct || activeItem.data.payload?.answer?.correct || activeItem.data.payload?.options?.[0]?.k;
                      const isCorrectOption = opt.k === correctKey;

                      let optStyle = 'bg-paper border-line text-ink hover:border-forest';
                      if (submittedAnswer) {
                        if (isCorrectOption) {
                          optStyle = 'bg-mint border-leaf text-forest font-semibold';
                        } else if (isSelected && !isCorrectOption) {
                          optStyle = 'bg-rose-50 border-rose-300 text-rose-800';
                        }
                      } else if (isSelected) {
                        optStyle = 'bg-forest/10 border-forest text-forest font-semibold';
                      }

                      return (
                        <button
                          key={opt.k}
                          onClick={() => handleSelectOption(opt.k)}
                          disabled={!!submittedAnswer}
                          className={`w-full p-4 rounded-xl border text-left text-sm flex items-start gap-3 transition-all ${optStyle}`}
                        >
                          <span className="px-2.5 py-1 bg-white border border-line rounded-lg font-bold text-xs flex-shrink-0">
                            {opt.k}
                          </span>
                          <span className="pt-0.5 leading-relaxed">{opt.t}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit / Status */}
                  {!submittedAnswer ? (
                    <button
                      onClick={() => handleSubmitMcq(activeItem.data)}
                      disabled={!selectedOption}
                      className={`cursor-target w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                        selectedOption
                          ? 'bg-forest text-white hover:bg-leaf'
                          : 'bg-line text-ink-soft cursor-not-allowed'
                      }`}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
                        submittedAnswer.isCorrect ? 'bg-mint text-forest' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {submittedAnswer.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-leaf flex-shrink-0" />
                            <span>Correct! Excellent analysis.</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
                            <span>Incorrect. Review statutory explanation below.</span>
                          </>
                        )}
                      </div>

                      {/* Explanation */}
                      {(activeItem.data.answer?.explanation || activeItem.data.payload?.explanation) && (
                        <div className="bg-paper border border-line rounded-xl p-5 text-xs text-ink leading-relaxed">
                          <strong className="font-bold text-forest-deep block mb-1 uppercase tracking-wider text-[10px]">
                            Statutory Explanation:
                          </strong>
                          {activeItem.data.answer?.explanation || activeItem.data.payload?.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-ink-soft">
                <BookOpen className="w-12 h-12 text-leaf/40 mb-3" />
                <h3 className="font-semibold text-forest-deep text-lg mb-1">Select a Lesson or Quiz</h3>
                <p className="text-xs max-w-sm">
                  Choose any lesson or practice MCQ from the syllabus on the left to start learning with real structured statutory content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
