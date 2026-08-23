import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, CheckCircle2, X, Check,
  ChevronRight, Zap, Clock, AlertCircle, Play, RotateCcw, Award,
  Target, Lock, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import coursesData from '../data/courses.json';
import {
  getChapterProgress, getChapterNextAction, markLessonRead,
  markWalkthroughDone, recordRecall, recordPracticeAnswer,
  MASTERY_LEVELS
} from '../utils/learnProgress';

const STEPS = [
  { id: 'learn',      label: 'Learn',       icon: BookOpen, desc: 'Read the statutory content' },
  { id: 'walkthrough',label: 'Walkthrough', icon: Target,   desc: 'Practitioner context & notes' },
  { id: 'recall',     label: 'Recall',      icon: Brain,    desc: 'Quick recall check' },
  { id: 'practice',   label: 'Practice',    icon: Zap,      desc: 'Answer practice questions' },
  { id: 'challenge',  label: 'Challenge',   icon: Award,    desc: 'Take a timed challenge' },
];

function normalizeCards(cards) {
  if (!cards || !Array.isArray(cards)) return [];
  return cards;
}

function normalizeOptions(options) {
  if (!options) return [];
  return options.map(o => (typeof o === 'string' ? o : o.t || o.k || String(o)));
}

function renderProvision(p) {
  if (!p) return null;
  if (typeof p === 'string') return p;
  if (typeof p === 'object') {
    const main = p.provision || p.title || p.authority || '';
    const extra = p.authority && p.provision ? ` (${p.authority})` : '';
    return `${main}${extra}`;
  }
  return String(p);
}

export default function ChapterLearning() {
  const { courseSlug, chapterId } = useParams();
  const navigate = useNavigate();
  const { isMember, hasCourseAccess, initiateCheckout } = useAuth();

  const course = coursesData[courseSlug];
  const chapters = course?.chapters || [];
  const chIdx = chapters.findIndex(c => String(c.num) === String(chapterId));
  const chapter = chapters[chIdx];

  const isOwned = Boolean(isMember || hasCourseAccess?.(courseSlug));
  const isLocked = !isOwned && chIdx > 0;

  const [step, setStep] = useState('learn');
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [practiceResults, setPracticeResults] = useState([]);
  const [recallFlipIdx, setRecallFlipIdx] = useState(0);
  const [recallFlipped, setRecallFlipped] = useState(false);

  const cp = useMemo(() => getChapterProgress(courseSlug, chIdx > -1 ? chapter?.num : null), [courseSlug, chapter]);

  // Calculate highest unlocked step index based on progress and current session
  const storedMaxStepIndex = useMemo(() => {
    if ((cp.challengeScores || []).length > 0 || (cp.practiceAttempts || []).length > 0) return 4;
    if (cp.recallDone) return 3;
    if (cp.walkthroughDone) return 2;
    if (cp.lessonRead) return 1;
    return 0;
  }, [cp]);

  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState(storedMaxStepIndex);

  useEffect(() => {
    setMaxUnlockedIndex(prev => Math.max(prev, storedMaxStepIndex));
  }, [storedMaxStepIndex]);

  const unlockStep = useCallback((targetStepIndex) => {
    setMaxUnlockedIndex(prev => Math.max(prev, targetStepIndex));
  }, []);

  // Ensure fresh state per practice question
  useEffect(() => {
    setSelectedOption(null);
    setSubmitted(false);
  }, [practiceIdx]);

  // Extract all activities from courses.json — the actual data model
  const allActivities = chapter?.activities || [];

  // Primary lesson content: first 'lesson' type activity
  const primaryLesson = allActivities.find(a => a.type === 'lesson') || allActivities[0] || {};
  const payload = primaryLesson?.payload || primaryLesson || {};
  const cards = primaryLesson?.cards || normalizeCards(payload.cards || []);

  // MCQ practice questions: all 'mcq' type activities
  const questions = allActivities.filter(a => a.type === 'mcq');
  const currentQuestion = questions[practiceIdx];
  const qPayload = currentQuestion?.payload || {};

  // Normalize option list — courses.json stores options as [{key,text}] objects
  const optionsRaw = currentQuestion?.options || qPayload.optionsFormatted || qPayload.options || [];
  const options = optionsRaw.map(o => typeof o === 'string' ? o : o.text || o.t || String(o));
  const correctKey = currentQuestion?.correctKey || currentQuestion?.answer?.correct || qPayload.answer || 'A';

  // Map correctKey (letter 'A'/'B'/'C'/'D') to index
  let correctIdx = typeof currentQuestion?.correctIdx === 'number'
    ? currentQuestion.correctIdx
    : optionsRaw.findIndex(o => (typeof o === 'object' ? o.key : null) === correctKey);
  if (correctIdx === -1) {
    correctIdx = ['A', 'B', 'C', 'D'].indexOf(correctKey);
    if (correctIdx === -1) correctIdx = 0;
  }

  // Recall items (key terms, thresholds, key numbers from cards / activities)
  const recallItems = useMemo(() => {
    const items = [];
    // Source 1: chapter.concepts[].recallCards[] — the actual data path in courses.json
    if (chapter?.concepts && chapter.concepts.length > 0) {
      chapter.concepts.forEach(concept => {
        if (concept.recallCards && concept.recallCards.length > 0) {
          concept.recallCards.forEach(rc => items.push(rc));
        }
      });
    }
    // Source 2: individual activity recallCards
    if (items.length === 0) {
      allActivities.forEach(act => {
        if (act.recallCards && act.recallCards.length > 0) {
          act.recallCards.forEach(rc => items.push(rc));
        }
      });
    }
    // Source 3: derive from lesson cards
    if (items.length === 0) {
      cards.forEach(card => {
        if (card.title && (card.means || card.law)) {
          items.push({ front: card.title, back: card.means || card.law, tag: card.tag || 'Term' });
        }
      });
    }
    // Source 4: fallback to first MCQ
    if (items.length === 0 && questions[0]) {
      items.push({
        front: `Key provision under ${chapter?.title}`,
        back: questions[0]?.question || questions[0]?.payload?.q || 'Review the statutory requirements for this chapter.',
        tag: 'Chapter',
      });
    }
    return items.slice(0, 8);
  }, [cards, questions, chapter, allActivities]);

  const handleMarkLearnRead = () => {
    markLessonRead(courseSlug, chapter.num);
    unlockStep(1);
    setStep('walkthrough');
  };

  const handleMarkWalkthrough = () => {
    markWalkthroughDone(courseSlug, chapter.num);
    unlockStep(2);
    setStep('recall');
  };

  const handleRecallComplete = () => {
    recordRecall(courseSlug, chapter.num);
    unlockStep(3);
    setStep('practice');
  };

  const handleSubmitPractice = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === correctIdx;
    setSubmitted(true);

    recordPracticeAnswer(courseSlug, chapter.num, isCorrect);

    const newRes = [...practiceResults];
    newRes[practiceIdx] = { selected: selectedOption, correct: isCorrect };
    setPracticeResults(newRes);
  };

  const handleNextQuestion = useCallback(() => {
    if (practiceIdx < questions.length - 1) {
      setPracticeIdx(i => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      unlockStep(4);
      setStep('challenge');
    }
  }, [practiceIdx, questions.length, unlockStep]);

  const prevChapter = chIdx > 0 ? chapters[chIdx - 1] : null;
  const nextChapter = chIdx < chapters.length - 1 ? chapters[chIdx + 1] : null;

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center space-y-4 p-8">
          <h2 className="font-display font-bold text-xl text-forest-deep">Chapter not found</h2>
          <Link to={`/learn/${courseSlug}`} className="text-forest font-semibold text-sm hover:underline flex items-center gap-1 justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to Course
          </Link>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border-2 border-gold/30 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              Premium Chapter {chapter.num}
            </span>
            <h2 className="text-2xl font-display font-bold text-forest-deep">{chapter.title}</h2>
            <p className="text-sm text-ink-soft mt-2">Chapter 1 is free to explore. Unlock all chapters to access this content.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => initiateCheckout({ productType: 'course', productId: courseSlug })}
              className="p-4 rounded-2xl bg-forest text-white font-bold text-sm cursor-pointer hover:bg-forest-deep transition-colors">
              Course Pass — ₹499
            </button>
            <Link to="/membership" className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-sm text-center hover:brightness-105 transition-all">
              All-Access — ₹1,999/yr
            </Link>
          </div>
          <Link to={`/learn/${courseSlug}`} className="text-ink-soft text-xs hover:text-forest flex items-center gap-1 justify-center">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to course
          </Link>
        </div>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex(s => s.id === step);
  const masteryLevel = cp.masteryLevel || 0;

  return (
    <div className="min-h-screen bg-paper">
      {/* ─── Top Bar ─── */}
      <div className="bg-white border-b border-line sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to={`/learn/${courseSlug}`}
            className="flex items-center gap-1.5 text-ink-soft hover:text-forest transition-colors text-sm font-medium flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Course</span>
          </Link>

          <div className="flex-1 min-w-0 text-center">
            <div className="text-xs font-bold text-ink-soft uppercase tracking-wider truncate">
              Chapter {chapter.num} · {chapter.title}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: MASTERY_LEVELS[masteryLevel]?.bg || '#F3F4F6',
                color: MASTERY_LEVELS[masteryLevel]?.text || '#6B7280',
              }}>
              {MASTERY_LEVELS[masteryLevel]?.short || 'Not Started'}
            </span>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-2.5">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {STEPS.map((s, i) => {
              const isDone = i < stepIndex;
              const isActive = s.id === step;
              const isUnlocked = i <= maxUnlockedIndex;

              return (
                <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => isUnlocked && setStep(s.id)}
                    disabled={!isUnlocked}
                    title={isUnlocked ? (isDone ? `Review ${s.label}` : `Go to ${s.label}`) : `${s.label} is locked until previous steps are completed`}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-forest text-white shadow-xs cursor-default'
                        : isUnlocked
                        ? isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                          : 'bg-gray-100 text-gray-700 hover:bg-forest/10 hover:text-forest cursor-pointer'
                        : 'bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed border border-transparent'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : !isUnlocked ? (
                      <Lock className="w-3 h-3 text-gray-400" />
                    ) : (
                      <s.icon className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 sm:w-6 h-px ${i < maxUnlockedIndex ? (isDone ? 'bg-emerald-300' : 'bg-emerald-200') : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">

        {/* ═══ STEP: LEARN ═══ */}
        {step === 'learn' && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Understand
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-forest-deep">{chapter.title}</h1>
              {primaryLesson?.provision && (
                <div className="text-xs font-mono text-ink-soft">{renderProvision(primaryLesson.provision)}</div>
              )}
            </div>

            {/* Hook paragraph */}
            {payload.hook && (
              <div className="bg-mint rounded-2xl p-5 border border-mint-deep">
                <p className="text-sm sm:text-base text-forest leading-relaxed font-medium italic">"{payload.hook}"</p>
              </div>
            )}

            {/* Main explanation */}
            {(payload.meaning || payload.summary) && (
              <div className="bg-white rounded-2xl p-5 border border-line">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-2">Plain English</div>
                <p className="text-sm sm:text-base text-ink leading-relaxed">{payload.meaning || payload.summary}</p>
              </div>
            )}

            {/* Codex Cards */}
            {cards.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-ink-soft">Key Provisions</div>
                {cards.map((card, ci) => (
                  <div key={ci} className="bg-white rounded-2xl border border-line p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-mint border border-mint-deep text-forest text-[10px] font-bold uppercase tracking-wider">
                        {card.tag || `Point ${ci + 1}`}
                      </span>
                      <span className="font-semibold text-sm text-ink">{card.title}</span>
                    </div>
                    {card.law && (
                      <p className="text-xs text-ink-soft italic border-l-2 border-forest pl-3 py-0.5 leading-relaxed">
                        "{card.law}"
                      </p>
                    )}
                    {card.means && (
                      <p className="text-xs sm:text-sm text-ink leading-relaxed">
                        <span className="font-semibold text-forest">In practice: </span>{card.means}
                      </p>
                    )}
                    {card.watch && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
                        <span className="font-bold uppercase text-[9px] tracking-wider text-amber-700 block mb-0.5">⚠ Watch Out</span>
                        {card.watch}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reg Text if no cards */}
            {cards.length === 0 && payload.reg_text && (
              <div className="bg-white rounded-2xl border border-line p-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-2">Statutory Text</div>
                <p className="text-sm text-ink leading-relaxed font-mono">{payload.reg_text}</p>
              </div>
            )}

            {/* Why it matters */}
            {payload.importance && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2">Why This Matters</div>
                <p className="text-sm text-amber-900 leading-relaxed">{payload.importance}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-ink-soft font-mono">
                Chapter {chapter.num} · {chapter.lessons?.length || 0} lessons
              </div>
              <button
                onClick={handleMarkLearnRead}
                className="px-6 py-3 bg-forest text-white font-bold text-sm rounded-2xl hover:bg-forest-deep transition-all shadow-sm flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                Continue to Walkthrough <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP: WALKTHROUGH ═══ */}
        {step === 'walkthrough' && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Practitioner Walkthrough
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest-deep">{chapter.title}</h2>
              {primaryLesson?.provision && (
                <div className="text-xs font-mono text-ink-soft">{renderProvision(primaryLesson.provision)}</div>
              )}
            </div>

            {/* Overview / Explanation / Description */}
            {(chapter.description || payload.meaning || payload.explanation || payload.summary) && (
              <div className="bg-white rounded-2xl border border-line p-5 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-1">Operational Overview</div>
                <p className="text-sm sm:text-base text-ink leading-relaxed font-normal">
                  {chapter.description || payload.meaning || payload.explanation || payload.summary}
                </p>
              </div>
            )}

            {/* Practitioner note */}
            {payload.practitioner_note && (
              <div className="bg-emerald-900/5 rounded-2xl border border-emerald-800/20 p-5 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-forest mb-1">Practitioner Note</div>
                <p className="text-sm sm:text-base text-forest-deep leading-relaxed font-medium">{payload.practitioner_note}</p>
              </div>
            )}

            {/* Tip / practical */}
            {payload.tip && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">Compliance Tip</div>
                <p className="text-sm text-amber-900 leading-relaxed">{payload.tip}</p>
              </div>
            )}

            {/* Takeaway */}
            {payload.takeaway && (
              <div className="bg-mint rounded-2xl border border-mint-deep p-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-forest mb-1">Key Takeaway</div>
                <p className="text-sm sm:text-base text-forest font-semibold leading-relaxed">{payload.takeaway}</p>
              </div>
            )}

            {/* Detailed Practitioner Cards Breakdown (LAW / PLAIN / WATCH / HOOK) */}
            {cards.length > 0 && (
              <div className="space-y-4 pt-1">
                <div className="text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center gap-2">
                  <span>Practitioner Provision Breakdown ({cards.length} Core Modules)</span>
                </div>
                {cards.map((card, ci) => {
                  const cardWatch = card.watch || card.trip || card.tricky || card.watchText;
                  const cardMeans = card.means || card.plain || card.plainText;
                  const cardLink = card.link || card.hook;
                  const cardProv = card.prov || card.provision || card.tag || `Module ${ci + 1}`;

                  return (
                    <div key={ci} className="bg-white rounded-2xl border border-line p-5 sm:p-6 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-line/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-forest text-white text-[10px] font-bold uppercase tracking-wider">
                            {renderProvision(cardProv)}
                          </span>
                          <h3 className="font-bold text-base sm:text-lg text-forest-deep">{card.title}</h3>
                        </div>
                      </div>

                      {/* Statutory Requirement (Law) */}
                      {card.law && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Statutory Obligation</div>
                          <p className="text-xs sm:text-sm text-ink-soft italic border-l-2 border-forest pl-3 py-1 bg-mint/30 rounded-r-lg leading-relaxed">
                            "{card.law}"
                          </p>
                        </div>
                      )}

                      {/* In Practice / Operational Meaning */}
                      {cardMeans && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-forest">Practical Execution & Compliance Impact</div>
                          <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
                            {cardMeans}
                          </p>
                        </div>
                      )}

                      {/* Enforcement Traps & Watch Outs */}
                      {cardWatch && (
                        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 space-y-1 text-amber-950">
                          <div className="font-bold uppercase text-[10px] tracking-wider text-amber-800 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Enforcement Warning & Practitioner Trap
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed">{cardWatch}</p>
                        </div>
                      )}

                      {/* Memory Hook / Statutory Link */}
                      {cardLink && (
                        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[10px] uppercase tracking-wider block text-emerald-800">Practitioner Takeaway</span>
                            <span className="font-medium leading-relaxed">{cardLink}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setStep('learn')}
                className="px-4 py-3 text-ink-soft font-semibold text-sm rounded-2xl hover:bg-mint transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]">
                <ArrowLeft className="w-4 h-4" /> Back to Learn
              </button>
              <button onClick={handleMarkWalkthrough}
                className="px-6 py-3 bg-forest text-white font-bold text-sm rounded-2xl hover:bg-forest-deep transition-all shadow-sm flex items-center gap-2 cursor-pointer min-h-[44px]">
                Continue to Recall <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP: RECALL ═══ */}
        {step === 'recall' && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Quick Recall
              </div>
              <h2 className="text-2xl font-display font-bold text-forest-deep">Test Your Memory</h2>
              <p className="text-sm text-ink-soft">Review these key terms before the practice questions. Click to reveal the answer.</p>
            </div>

            {recallItems.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-ink-soft">
                  <span>Card {recallFlipIdx + 1} of {recallItems.length}</span>
                  <div className="flex items-center gap-1">
                    {recallItems.map((_, i) => (
                      <button key={i} onClick={() => { setRecallFlipIdx(i); setRecallFlipped(false); }}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === recallFlipIdx ? 'bg-forest' : 'bg-mint-deep'}`} />
                    ))}
                  </div>
                </div>

                {/* Flashcard */}
                <button
                  onClick={() => setRecallFlipped(f => !f)}
                  className="w-full bg-white rounded-2xl border-2 border-forest/20 p-6 sm:p-8 text-center min-h-[200px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-forest/40 transition-all"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    {recallFlipped ? recallItems[recallFlipIdx]?.tag : 'Click to reveal'}
                  </span>
                  {!recallFlipped ? (
                    <p className="text-base sm:text-lg font-semibold text-forest-deep leading-snug">
                      {recallItems[recallFlipIdx]?.front}
                    </p>
                  ) : (
                    <p className="text-sm sm:text-base text-ink leading-relaxed">
                      {recallItems[recallFlipIdx]?.back}
                    </p>
                  )}
                  <span className="text-[10px] text-ink-soft mt-1">{recallFlipped ? 'Tap to flip back' : 'Tap to reveal answer'}</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    disabled={recallFlipIdx === 0}
                    onClick={() => { setRecallFlipIdx(i => i - 1); setRecallFlipped(false); }}
                    className="flex-1 py-3 rounded-xl border border-line text-ink-soft font-semibold text-sm disabled:opacity-30 cursor-pointer hover:border-forest hover:text-forest transition-colors min-h-[44px]"
                  >
                    ← Previous
                  </button>
                  {recallFlipIdx < recallItems.length - 1 ? (
                    <button
                      onClick={() => { setRecallFlipIdx(i => i + 1); setRecallFlipped(false); }}
                      className="flex-1 py-3 rounded-xl bg-forest text-white font-bold text-sm cursor-pointer hover:bg-forest-deep transition-colors min-h-[44px]"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={handleRecallComplete}
                      className="flex-1 py-3 rounded-xl bg-forest text-white font-bold text-sm cursor-pointer hover:bg-forest-deep transition-colors min-h-[44px]"
                    >
                      Done — Practice →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-line p-8 text-center space-y-3">
                <Brain className="w-10 h-10 text-forest mx-auto opacity-50" />
                <p className="text-sm text-ink-soft">Recall cards are being prepared for this chapter.</p>
                <button onClick={handleRecallComplete}
                  className="px-6 py-2.5 bg-forest text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-forest-deep">
                  Continue to Practice →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP: PRACTICE ═══ */}
        {step === 'practice' && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Practice
              </div>
              <h2 className="text-2xl font-display font-bold text-forest-deep">Practice Questions</h2>
            </div>

            {questions.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-xs text-ink-soft">
                  <span>Question {practiceIdx + 1} of {questions.length}</span>
                  <span className="flex items-center gap-1 font-semibold">
                    {practiceResults.filter(r => r.correct).length}/{practiceResults.length} correct
                  </span>
                </div>

                {/* Question Navigator */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {questions.map((q, qIdx) => {
                    const isCurrent = qIdx === practiceIdx;
                    const res = practiceResults[qIdx];
                    let btnCls = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
                    if (isCurrent) btnCls = 'bg-forest text-white ring-2 ring-forest/30';
                    else if (res?.correct) btnCls = 'bg-emerald-100 text-emerald-800 font-bold';
                    else if (res && !res.correct) btnCls = 'bg-rose-100 text-rose-800 font-bold';

                    return (
                      <button
                        key={qIdx}
                        onClick={() => {
                          setPracticeIdx(qIdx);
                          setSelectedOption(null);
                          setSubmitted(false);
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${btnCls}`}
                        title={`Question ${qIdx + 1}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-white rounded-2xl border border-line p-5 sm:p-6 space-y-5">
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft mb-2 flex items-center justify-between">
                      <span>{renderProvision(currentQuestion?.provision) || `Chapter ${chapter.num} · ${currentQuestion?.difficulty === '1' ? 'Foundation' : currentQuestion?.difficulty === '2' ? 'Intermediate' : 'Advanced'}`}</span>
                      {currentQuestion?.effectiveDate && (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          w.e.f. {currentQuestion.effectiveDate}
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-ink leading-snug">
                      {currentQuestion?.question || qPayload.q || currentQuestion?.title}
                    </p>
                  </div>

                  <div className="grid gap-2.5">
                    {options.map((opt, idx) => {
                      const label = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === correctIdx;
                      const hasChosen = submitted;
                      const optionText = typeof opt === 'string' ? opt : opt.text;

                      let cls = 'border-line bg-white hover:border-forest/50 hover:bg-mint/30 text-ink cursor-pointer';
                      if (hasChosen) {
                        if (isCorrect) cls = 'border-forest bg-mint text-forest font-bold cursor-default';
                        else if (isSelected) cls = 'border-rose-400 bg-rose-50 text-rose-800 cursor-default';
                        else cls = 'border-line bg-white opacity-50 cursor-default text-ink-soft';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => !submitted && setSelectedOption(idx)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 min-h-[52px] ${cls}`}
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 ${
                            hasChosen && isCorrect ? 'bg-forest text-white'
                            : hasChosen && isSelected && !isCorrect ? 'bg-rose-500 text-white'
                            : isSelected ? 'bg-forest text-white'
                            : 'bg-mint text-forest'
                          }`}>
                            {hasChosen && isCorrect ? <Check className="w-3.5 h-3.5" />
                            : hasChosen && isSelected && !isCorrect ? <X className="w-3.5 h-3.5" />
                            : label}
                          </span>
                          <span className="text-sm leading-snug">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  {submitted && (
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      selectedOption === correctIdx
                        ? 'bg-mint border border-forest/20 text-forest'
                        : 'bg-amber-50 border border-amber-200 text-amber-900'
                    }`}>
                      <div className="font-bold text-[10px] uppercase tracking-wider mb-1">
                        {selectedOption === correctIdx ? '✓ Correct' : '⚠ Explanation'}
                      </div>
                      <p>{currentQuestion?.explanation || qPayload.explanation || qPayload.scenario || qPayload.explain || payload.takeaway || 'Review the statutory text for this provision.'}</p>
                      {currentQuestion?.provision && (
                        <div className="text-[10px] font-mono mt-2 opacity-70">Source: {renderProvision(currentQuestion.provision)}</div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    {!submitted ? (
                      <button
                        onClick={handleSubmitPractice}
                        disabled={selectedOption === null}
                        className="flex-1 py-3 rounded-xl bg-forest text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-forest-deep transition-colors min-h-[44px]"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="flex-1 py-3 rounded-xl bg-forest text-white font-bold text-sm cursor-pointer hover:bg-forest-deep transition-colors min-h-[44px]"
                      >
                        {practiceIdx < questions.length - 1 ? 'Next Question →' : 'Finish Practice →'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-line p-8 text-center space-y-3">
                <Zap className="w-10 h-10 text-forest mx-auto opacity-50" />
                <p className="text-sm text-ink-soft">Practice questions for this chapter are being prepared.</p>
                <button onClick={() => setStep('challenge')}
                  className="px-6 py-2.5 bg-forest text-white font-bold text-sm rounded-xl cursor-pointer hover:bg-forest-deep">
                  Continue to Challenge →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP: CHALLENGE GATEWAY ═══ */}
        {step === 'challenge' && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Chapter Challenge
              </div>
              <h2 className="text-2xl font-display font-bold text-forest-deep">Ready for the Challenge?</h2>
            </div>

            {/* Practice summary */}
            {practiceResults.length > 0 && (
              <div className="bg-white rounded-2xl border border-line p-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mb-3">Practice Summary</div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-forest">{practiceResults.length}</div>
                    <div className="text-xs text-ink-soft">Questions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">{practiceResults.filter(r => r.correct).length}</div>
                    <div className="text-xs text-ink-soft">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-ink">
                      {practiceResults.length > 0
                        ? Math.round((practiceResults.filter(r => r.correct).length / practiceResults.length) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-ink-soft">Accuracy</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-forest rounded-2xl p-6 text-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Chapter Challenge</h3>
                  <p className="text-emerald-200 text-xs">Test your full understanding. Score 80%+ to unlock Mastered status.</p>
                </div>
              </div>
              <Link
                to={`/learn/${courseSlug}/challenge/rapid-recall?chapter=${chapter.num}`}
                className="w-full block py-3 rounded-xl bg-white text-forest font-bold text-sm text-center hover:bg-mint transition-colors"
              >
                Start Chapter Challenge →
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setStep('practice')}
                className="px-4 py-3 text-ink-soft font-semibold text-sm rounded-2xl hover:bg-mint transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]">
                <ArrowLeft className="w-4 h-4" /> Back to Practice
              </button>
              {nextChapter && (
                <Link
                  to={`/learn/${courseSlug}/chapter/${nextChapter.num}`}
                  className="px-5 py-3 bg-forest text-white font-bold text-sm rounded-2xl hover:bg-forest-deep transition-all flex items-center gap-2 min-h-[44px]"
                >
                  Next Chapter <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom Chapter Navigation ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line px-4 py-3 flex items-center justify-between z-20 shadow-lg">
        {prevChapter ? (
          <Link to={`/learn/${courseSlug}/chapter/${prevChapter.num}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-mint text-forest font-semibold text-xs hover:bg-mint-deep transition-colors min-h-[40px]">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ch {prevChapter.num}: </span>
            <span className="truncate max-w-[100px] sm:max-w-[200px]">{prevChapter.title}</span>
          </Link>
        ) : (
          <Link to={`/learn/${courseSlug}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-mint text-forest font-semibold text-xs hover:bg-mint-deep transition-colors min-h-[40px]">
            <ArrowLeft className="w-3.5 h-3.5" /> Course Home
          </Link>
        )}

        <div className="text-xs font-mono text-ink-soft font-semibold">
          {chapter.num} / {chapters.length}
        </div>

        {nextChapter ? (
          <Link to={`/learn/${courseSlug}/chapter/${nextChapter.num}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest text-white font-semibold text-xs hover:bg-forest-deep transition-colors min-h-[40px]">
            <span className="truncate max-w-[100px] sm:max-w-[200px]">{nextChapter.title}</span>
            <span className="hidden sm:inline"> :Ch {nextChapter.num}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link to={`/learn/${courseSlug}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest text-white font-semibold text-xs hover:bg-forest-deep transition-colors min-h-[40px]">
            Course Home <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
