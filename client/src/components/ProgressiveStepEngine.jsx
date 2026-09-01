import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, X, AlertCircle, Sparkles,
  BookOpen, Brain, Zap, Target, Award, Flame, RotateCcw, Check,
  ChevronRight, Lock, HelpCircle, FileText, Layers, RefreshCw, Volume2, VolumeX, Shield, Timer
} from 'lucide-react';
import {
  recordStepAnswer, recordModuleCompletion, getStepPosition, saveStepPosition,
  playGamificationSound, triggerConfetti, recordMistake, removeMistake,
  isAudioMuted, setAudioMuted
} from '../utils/learnProgress';

export function formatProvision(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (typeof p === 'object') {
    const main = p.provision || p.title || p.authority || p.law || p.section || p.rule || '';
    const extra = p.authority && p.provision ? ` (${p.authority})` : '';
    return `${main}${extra}` || '';
  }
  return String(p);
}

// ─── Strictly Validated Step Transformer Function ───────────────────────────
export function transformChapterToSteps(chapter, courseSlug = 'sebi-aif') {
  if (!chapter) return [];

  const rawSteps = [];

  // Step 1: INTRO (Always present)
  rawSteps.push({
    id: `step-intro-${chapter.num}`,
    type: 'INTRO',
    title: chapter.title || `Chapter ${chapter.num}`,
    subTitle: chapter.band || 'Regulatory Framework',
    content: chapter.description || 'Master the essential regulatory provisions and practitioner compliance rules for this module.',
    conceptsCount: (chapter.concepts || []).length,
    activitiesCount: (chapter.activities || []).length,
  });

  // Step 2: TODAY'S 3 THINGS (Derived from chapter concepts)
  const concepts = chapter.concepts || [];
  let takeaways = [];
  if (concepts.length >= 3) {
    takeaways = concepts.slice(0, 3).map(c => c.title || c.hook).filter(Boolean);
  } else if (concepts.length > 0) {
    takeaways = concepts.map(c => c.title || c.hook).filter(Boolean);
  }
  if (takeaways.length === 0) {
    takeaways = [
      `Understand core statutory provisions for Chapter ${chapter.num}`,
      `Identify statutory eligibility, capital, and reporting thresholds`,
      `Master practical compliance requirements and regulatory obligations`
    ];
  }

  rawSteps.push({
    id: `step-todays3-${chapter.num}`,
    type: 'TODAYS_3_THINGS',
    title: "Today's 3 Key Statutory Takeaways",
    takeaways
  });

  const activities = chapter.activities || [];

  activities.forEach((act, actIdx) => {
    const p = act.payload || {};
    const type = (act.type || act.activity_type || '').toLowerCase();

    // 1. LESSON / STATUTORY CARDS OR FRONT/BACK FLASHCARDS IN CARDS
    const cards = act.cards || p.cards || [];
    if (cards.length > 0) {
      if (cards[0].front && cards[0].back) {
        // High quality flashcards in cards array
        cards.forEach((c, cIdx) => {
          if (c.front && c.back) {
            rawSteps.push({
              id: `step-fc-${act.uid || actIdx}-${cIdx}`,
              type: 'FLASHCARD',
              title: c.front,
              front: c.front,
              back: c.back,
              tag: c.tag || 'Statutory Recall',
              provision: formatProvision(act.provision || ''),
              sourceUid: act.uid,
            });
          }
        });
      } else {
        cards.forEach((c, cIdx) => {
          const cardObj = typeof c === 'string' ? { title: 'Statutory Rule', law: c } : c;
          const law = cardObj.law || cardObj.text || '';
          const means = cardObj.means || cardObj.explain || cardObj.explanation || '';
          const title = cardObj.title || act.title || 'Core Rule';
          const watch = cardObj.watch || '';

          if (law || means) {
            rawSteps.push({
              id: `step-card-${act.uid || actIdx}-${cIdx}`,
              type: law ? 'REGULATION' : 'EXPLANATION',
              title,
              explanation: means,
              statutoryText: law,
              practicalTip: watch,
              tag: cardObj.tag || (law ? 'Statutory Provision' : 'Explanation'),
              provision: formatProvision(act.provision || cardObj.provision || ''),
              effectiveDate: act.effectiveDate || '',
              sourceUid: act.uid,
            });
          }
        });
      }

      if (p.story || act.story) {
        rawSteps.push({
          id: `step-example-${act.uid || actIdx}`,
          type: 'EXAMPLE',
          title: act.title || 'Practitioner Case Study',
          story: p.story || act.story,
          remember: p.remember || p.tip || act.remember || '',
          provision: formatProvision(act.provision || ''),
          sourceUid: act.uid,
        });
      }
    }

    // 2. FLASHCARDS / FLASH_RECALL (Only if cards array didn't already contain front/back)
    const recallCards = act.recallCards || p.recallCards || [];
    const hasHandledCards = cards.length > 0 && cards[0].front && cards[0].back;
    
    if (!hasHandledCards && recallCards.length > 0) {
      recallCards.forEach((rc, rIdx) => {
        if (rc.front && rc.back && rc.front !== 'Key Provision') {
          rawSteps.push({
            id: `step-fc-${act.uid || actIdx}-${rIdx}`,
            type: 'FLASHCARD',
            title: rc.front,
            front: rc.front,
            back: rc.back,
            tag: rc.tag || 'Recall Check',
            provision: formatProvision(act.provision || ''),
            sourceUid: act.uid,
          });
        }
      });
    } else if (!hasHandledCards && type === 'flash_recall' && act.question && (act.correctKey || act.explanation)) {
      rawSteps.push({
        id: `step-fc-${act.uid || actIdx}`,
        type: 'FLASHCARD',
        title: act.title || 'Key Recall Point',
        front: act.question,
        back: act.correctKey || act.explanation,
        tag: 'Statutory Recall',
        provision: formatProvision(act.provision || ''),
        sourceUid: act.uid,
      });
    }

    // 3. MCQ / SPOT_LAPSE / OLD_VS_NEW / TRUEFALSE
    if (['mcq', 'spot_lapse', 'old_vs_new', 'truefalse'].includes(type) || act.options?.length > 0 || p.options?.length > 0 || p.optionsFormatted?.length > 0) {
      const qText = act.question || p.question || act.title || '';
      const optsRaw = act.options || p.optionsFormatted || p.options || [];

      let options = [];
      let correctKey = act.correctKey || p.answer || act.answer?.correct || 'A';

      if (Array.isArray(optsRaw) && optsRaw.length > 0) {
        options = optsRaw.map(o => typeof o === 'string' ? o : o.text || o.t || String(o));
      }

      if (type === 'truefalse' && options.length === 0) {
        options = ['True', 'False'];
      }

      let correctIdx = typeof act.correctIdx === 'number' ? act.correctIdx : -1;
      if (correctIdx === -1 && Array.isArray(optsRaw)) {
        correctIdx = optsRaw.findIndex(o => (typeof o === 'object' ? o.key : null) === correctKey);
      }
      if (correctIdx === -1) {
        if (correctKey === 'true') correctIdx = 0;
        else if (correctKey === 'false') correctIdx = 1;
        else {
          correctIdx = ['A', 'B', 'C', 'D'].indexOf(String(correctKey).toUpperCase());
          if (correctIdx === -1) correctIdx = 0;
        }
      }

      const explanation = act.explanation || p.explanation || act.answer?.explanation || '';

      if (qText && options.length >= 2) {
        let stepType = 'MCQ';
        if (type === 'spot_lapse') stepType = 'SPOT_THE_MISTAKE';
        else if (type === 'old_vs_new') stepType = 'REGULATION_COMPARISON';
        else if (type === 'truefalse') stepType = 'TRUE_FALSE';

        rawSteps.push({
          id: `step-q-${act.uid || actIdx}`,
          type: stepType,
          question: qText,
          options,
          correctIdx,
          correctKey,
          explanation: explanation || 'Refer to the statutory provision for details.',
          provision: formatProvision(act.provision || p.provision || ''),
          uid: act.uid || `q-${actIdx}`,
          chapterNum: chapter.num,
          sourceUid: act.uid,
        });
      }
    }

    // 4. FILL IN THE BLANK
    if (type === 'fill' && act.question) {
      const qText = act.question;
      const answerText = act.explanation || act.answer?.explanation || '';
      if (qText && answerText) {
        rawSteps.push({
          id: `step-fill-${act.uid || actIdx}`,
          type: 'FLASHCARD',
          title: 'Complete the Statutory Phrase',
          front: qText,
          back: answerText,
          tag: 'Fill in the Blank',
          provision: formatProvision(act.provision || ''),
          sourceUid: act.uid,
        });
      }
    }
  });

  // Step N-1: MASTERY LADDER
  rawSteps.push({
    id: `step-mastery-${chapter.num}`,
    type: 'MASTERY_LADDER',
    title: 'Module Mastery Benchmark',
    question: `You have completed all curriculum steps for Chapter ${chapter.num}: ${chapter.title}. Verify your 80%+ benchmark status below:`,
  });

  // Step Final: SUMMARY
  rawSteps.push({
    id: `step-summary-${chapter.num}`,
    type: 'SUMMARY',
    title: 'Module Mastered!',
    chapterNum: chapter.num,
    chapterTitle: chapter.title,
  });

  // ─── STRICT STEP VALIDATOR FILTER ───
  const validatedSteps = [];
  rawSteps.forEach((step, idx) => {
    let isValid = true;
    const missing = [];

    if (!step.type) { isValid = false; missing.push('type'); }
    if (!step.id) { isValid = false; missing.push('id'); }

    if (step.type === 'INTRO') {
      if (!step.title) { isValid = false; missing.push('title'); }
    } else if (step.type === 'TODAYS_3_THINGS') {
      if (!step.takeaways || step.takeaways.length === 0) { isValid = false; missing.push('takeaways'); }
    } else if (step.type === 'REGULATION' || step.type === 'EXPLANATION') {
      if (!step.statutoryText && !step.explanation) { isValid = false; missing.push('statutoryText/explanation'); }
    } else if (step.type === 'FLASHCARD') {
      if (!step.front || !step.back) { isValid = false; missing.push('front/back'); }
    } else if (['MCQ', 'SPOT_THE_MISTAKE', 'REGULATION_COMPARISON', 'TRUE_FALSE'].includes(step.type)) {
      if (!step.question) { isValid = false; missing.push('question'); }
      if (!step.options || step.options.length < 2) { isValid = false; missing.push('options (< 2)'); }
      if (typeof step.correctIdx !== 'number' || step.correctIdx < 0 || step.correctIdx >= (step.options?.length || 0)) {
        isValid = false; missing.push('correctIdx');
      }
    }

    if (isValid) {
      validatedSteps.push(step);
    } else {
      console.error(`[RegLearn] Invalid step filtered out: course=${courseSlug}, chapter=${chapter.num}, stepIdx=${idx}, type=${step.type}, missing=${missing.join(', ')}`);
    }
  });

  return validatedSteps;
}

// ─── Main Component: ProgressiveStepEngine ─────────────────────────────────
export default function ProgressiveStepEngine({
  course,
  chapter,
  courseSlug = 'sebi-aif',
  onComplete,
}) {
  const steps = useMemo(() => transformChapterToSteps(chapter, courseSlug), [chapter, courseSlug]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [muted, setMuted] = useState(isAudioMuted());

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const nextState = !muted;
    setMuted(nextState);
    setAudioMuted(nextState);
  };

  // Restore saved step position
  useEffect(() => {
    const savedPos = getStepPosition(courseSlug, chapter?.num);
    if (savedPos > 0 && savedPos < steps.length) {
      setCurrentStepIdx(savedPos);
    }
  }, [courseSlug, chapter?.num, steps.length]);

  const currentStep = steps[currentStepIdx] || steps[0];
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === steps.length - 1;

  // Interaction State per Step ID
  const [stepStates, setStepStates] = useState({});
  const currentSlot = stepStates[currentStep?.id] || { selected: null, submitted: false, isCorrect: false };

  // Flashcard flip state
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentStep]);

  // Interactive Scored Question Steps Filter
  const scoredSteps = useMemo(() => {
    return steps.filter(s => ['MCQ', 'SPOT_THE_MISTAKE', 'REGULATION_COMPARISON', 'TRUE_FALSE'].includes(s.type));
  }, [steps]);

  const totalScoredQuestions = scoredSteps.length;

  // Handle Option Select
  const handleSelectOption = (idx) => {
    if (currentSlot.submitted) return;
    setStepStates(prev => ({
      ...prev,
      [currentStep.id]: { ...(prev[currentStep.id] || {}), selected: idx }
    }));
  };

  // Handle Answer Check / Submission
  const handleSubmitAnswer = () => {
    let isCorrect = false;

    if (['MCQ', 'TRUE_FALSE', 'REGULATION_COMPARISON', 'SPOT_THE_MISTAKE'].includes(currentStep.type)) {
      isCorrect = currentSlot.selected === (currentStep.correctIdx ?? 0);
    }

    const wasAlreadySubmitted = Boolean(currentSlot.submitted);
    const firstAttemptCorrect = wasAlreadySubmitted ? currentSlot.firstAttemptCorrect : isCorrect;

    setStepStates(prev => ({
      ...prev,
      [currentStep.id]: {
        ...(prev[currentStep.id] || {}),
        selected: currentSlot.selected,
        submitted: true,
        isCorrect,
        firstAttemptCorrect,
      }
    }));

    // Only record answer progress & XP on the first attempt
    if (!wasAlreadySubmitted) {
      recordStepAnswer(courseSlug, chapter.num, isCorrect, { isFirstAttempt: true });
    }

    if (isCorrect) {
      playGamificationSound('correct');
      if (currentStep.uid) removeMistake(currentStep.uid);
    } else {
      playGamificationSound('wrong');
      if (currentStep.question || currentStep.title) {
        recordMistake({
          id: currentStep.uid || `m-${Date.now()}`,
          courseSlug,
          chapterNum: chapter.num,
          question: currentStep.question || currentStep.title,
          selectedAnswer: currentStep.options?.[currentSlot.selected] || '',
          correctAnswer: currentStep.options?.[currentStep.correctIdx] || '',
          explanation: currentStep.explanation,
          provision: currentStep.provision,
        });
      }
    }
  };

  // Live Scored Results Calculation
  const scoredResults = useMemo(() => {
    let attempted = 0;
    let correctFirstAttempts = 0;

    scoredSteps.forEach(s => {
      const slot = stepStates[s.id];
      if (slot && slot.submitted) {
        attempted++;
        if (slot.firstAttemptCorrect) {
          correctFirstAttempts++;
        }
      }
    });

    const accuracyPct = totalScoredQuestions > 0
      ? Math.round((correctFirstAttempts / totalScoredQuestions) * 100)
      : 100;

    let masteryLevel = 1;
    if (accuracyPct >= 80) masteryLevel = 5;
    else if (accuracyPct >= 65) masteryLevel = 4;
    else if (accuracyPct >= 50) masteryLevel = 3;
    else if (accuracyPct >= 30) masteryLevel = 2;
    else masteryLevel = 1;

    const bonusXP = accuracyPct >= 80 ? 100 : accuracyPct >= 65 ? 50 : accuracyPct >= 50 ? 30 : 15;
    const totalEarnedXP = (correctFirstAttempts * 25) + bonusXP;

    return {
      totalScoredQuestions,
      attempted,
      correctFirstAttempts,
      accuracyPct,
      masteryLevel,
      bonusXP,
      totalEarnedXP,
    };
  }, [scoredSteps, stepStates, totalScoredQuestions]);

  // Move to Next Step
  const handleNext = () => {
    if (isLastStep) {
      triggerConfetti();
      playGamificationSound(scoredResults.masteryLevel >= 5 ? 'levelUp' : 'success');
      recordModuleCompletion(courseSlug, chapter.num, {
        totalQuestions: scoredResults.totalScoredQuestions,
        correctCount: scoredResults.correctFirstAttempts,
        accuracyPct: scoredResults.accuracyPct,
        masteryLevel: scoredResults.masteryLevel,
        bonusXP: scoredResults.bonusXP,
      });
      if (onComplete) onComplete();
      return;
    }
    const nextIdx = currentStepIdx + 1;
    setCurrentStepIdx(nextIdx);
    saveStepPosition(courseSlug, chapter.num, nextIdx);
    playGamificationSound('click');
  };

  // Move to Previous Step
  const handlePrevious = () => {
    if (isFirstStep) return;
    const prevIdx = currentStepIdx - 1;
    setCurrentStepIdx(prevIdx);
    saveStepPosition(courseSlug, chapter.num, prevIdx);
    playGamificationSound('click');
  };

  // Calculate Progress %
  const progressPct = steps.length > 0 ? Math.round(((currentStepIdx + 1) / steps.length) * 100) : 0;

  // Check if question type requires answer attempt before Next is unlocked
  const isQuestionType = ['MCQ', 'TRUE_FALSE', 'SPOT_THE_MISTAKE', 'REGULATION_COMPARISON'].includes(currentStep?.type);

  if (!currentStep) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-forest-deep">
        <p>No content available for this module.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-4 pb-36 overflow-x-hidden relative" style={{ minHeight: '100vh' }}>
      
      {/* ─── Top Progress Header ─── */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-forest/10 shadow-sm space-y-3">
        <div className="flex flex-nowrap items-center justify-between text-xs font-semibold text-forest-deep">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-forest/10 text-forest font-mono font-bold">
              Chapter {chapter.num}
            </span>
            <span className="text-ink-soft truncate max-w-[160px] sm:max-w-xs">{chapter.title}</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs font-bold text-forest">
            {/* Audio Toggle */}
            <button onClick={handleToggleMute} className="p-3 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title={muted ? 'Unmute Audio' : 'Mute Audio'} aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}>
              {muted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-forest" />}
            </button>
            <span>Step {currentStepIdx + 1} of {steps.length}</span>
          </div>
        </div>

        {/* Smooth Progress Bar */}
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-forest rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ─── Primary Step Card Container ─── */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-forest/10 shadow-lg min-h-[380px] flex flex-col justify-between relative overflow-hidden transition-all duration-300">
        
        {/* Internal Scrollable Content Box */}
        <div className="max-h-[calc(100vh-140px)] overflow-y-auto overflow-x-hidden pr-1 space-y-5 break-words">
          
          {/* STEP TYPE 1: INTRO */}
          {currentStep.type === 'INTRO' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" /> Module Overview
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest-deep">{currentStep.title}</h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{currentStep.content}</p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="bg-paper p-4 rounded-xl border border-forest/10">
                  <div className="text-xs text-ink-soft font-medium">Core Concepts</div>
                  <div className="text-2xl font-bold font-mono text-forest mt-1">{currentStep.conceptsCount} Concepts</div>
                </div>
                <div className="bg-paper p-4 rounded-xl border border-forest/10">
                  <div className="text-xs text-ink-soft font-medium">Step Activities</div>
                  <div className="text-2xl font-bold font-mono text-forest mt-1">{currentStep.activitiesCount} Activities</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP TYPE 2: TODAY'S 3 THINGS */}
          {currentStep.type === 'TODAYS_3_THINGS' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Today's Key Takeaways
              </div>
              <h3 className="text-xl font-display font-bold text-forest-deep">{currentStep.title}</h3>
              <div className="space-y-3">
                {currentStep.takeaways.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-paper border border-forest/10 flex items-start gap-3 text-sm text-forest-deep">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-semibold">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP TYPE 3: EXPLANATION & REGULATION */}
          {(currentStep.type === 'EXPLANATION' || currentStep.type === 'REGULATION') && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  {currentStep.tag || 'Statutory Provision'}
                </span>
                {currentStep.provision && (
                  <span className="text-xs font-mono text-ink-soft bg-gray-100 px-2.5 py-1 rounded-md">
                    {formatProvision(currentStep.provision)}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-display font-bold text-forest-deep">{currentStep.title}</h3>

              {currentStep.statutoryText && (
                <div className="bg-amber-50/60 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-2 break-words">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Verbatim Statutory Rule
                  </div>
                  <p className="text-sm font-serif text-amber-950 leading-relaxed italic break-words">
                    "{currentStep.statutoryText}"
                  </p>
                </div>
              )}

              {currentStep.explanation && (
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {currentStep.explanation}
                </p>
              )}

              {currentStep.practicalTip && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Compliance Watch: </span>
                    {currentStep.practicalTip}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP TYPE 4: EXAMPLE / CASE STUDY */}
          {currentStep.type === 'EXAMPLE' && (
            <div className="space-y-5 animate-fadeIn">
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider">
                Practitioner Case Study
              </span>
              <h3 className="text-xl font-bold text-forest-deep">{currentStep.title}</h3>
              
              <div className="p-5 rounded-2xl bg-paper border border-forest/10 text-sm text-gray-800 leading-relaxed">
                {currentStep.story}
              </div>

              {currentStep.remember && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium">
                  💡 <span className="font-bold">Key Takeaway:</span> {currentStep.remember}
                </div>
              )}
            </div>
          )}

          {/* STEP TYPE 5: FLASHCARD */}
          {currentStep.type === 'FLASHCARD' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
                  {currentStep.tag || 'Smart Flip Card'}
                </span>
                <span className="text-xs text-ink-soft">Tap card to flip</span>
              </div>

              <div
                onClick={() => { setIsFlipped(!isFlipped); playGamificationSound('flip'); }}
                className="cursor-pointer bg-gradient-to-br from-paper to-white p-8 rounded-2xl border-2 border-forest/20 shadow-md min-h-[200px] max-h-[300px] overflow-y-auto flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-forest"
              >
                {!isFlipped ? (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-forest uppercase tracking-wider">FRONT</div>
                    <h4 className="text-lg sm:text-xl font-bold text-forest-deep">{currentStep.front}</h4>
                    <span className="inline-block mt-4 text-xs text-forest underline font-semibold">Click to reveal answer ↺</span>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">BACK / STATUTORY RECALL</div>
                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{currentStep.back}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP TYPE 6: MCQ / SPOT_THE_MISTAKE / REGULATION_COMPARISON / TRUE_FALSE */}
          {['MCQ', 'SPOT_THE_MISTAKE', 'REGULATION_COMPARISON', 'TRUE_FALSE'].includes(currentStep.type) && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  currentStep.type === 'SPOT_THE_MISTAKE' ? 'bg-red-50 text-red-700' :
                  currentStep.type === 'REGULATION_COMPARISON' ? 'bg-indigo-50 text-indigo-700' :
                  'bg-amber-50 text-amber-800'
                }`}>
                  {currentStep.type === 'SPOT_THE_MISTAKE' ? 'Spot the Compliance Lapse' :
                   currentStep.type === 'REGULATION_COMPARISON' ? 'Regulatory Comparison' :
                   currentStep.type === 'TRUE_FALSE' ? 'True / False Check' : 'Knowledge Check'}
                </span>
                {currentStep.provision && (
                  <span className="text-xs font-mono text-ink-soft bg-gray-100 px-2 py-0.5 rounded">
                    {formatProvision(currentStep.provision)}
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-forest-deep leading-snug">
                {currentStep.question}
              </h3>

              <div className="space-y-3">
                {currentStep.options.map((opt, idx) => {
                  const isSelected = currentSlot.selected === idx;
                  const isCorrect = idx === currentStep.correctIdx;
                  let btnStyle = "border-gray-200 hover:border-forest/40 bg-white text-gray-800";

                  if (currentSlot.submitted) {
                    if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold";
                    else if (isSelected) btnStyle = "border-red-500 bg-red-50 text-red-950 font-semibold";
                  } else if (isSelected) {
                    btnStyle = "border-forest bg-forest/5 text-forest font-semibold";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={currentSlot.submitted}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all text-xs flex items-start gap-3 ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                        {currentStep.type === 'TRUE_FALSE' ? (idx === 0 ? 'T' : 'F') : String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-grow">{opt}</span>
                      {currentSlot.submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                      {currentSlot.submitted && isSelected && !isCorrect && <X className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {currentSlot.submitted && (
                <div className={`p-4 rounded-xl text-xs leading-relaxed border ${currentSlot.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'}`}>
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    {currentSlot.isCorrect ? (
                      <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct! (+25 XP)</>
                    ) : (
                      <><AlertCircle className="w-4 h-4 text-red-600" /> Incorrect — Added to My Mistakes</>
                    )}
                  </div>
                  <p>{currentStep.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP TYPE 7: MASTERY LADDER */}
          {currentStep.type === 'MASTERY_LADDER' && (
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl font-bold">
                🪜
              </div>
              <h3 className="text-xl font-bold text-forest-deep">{currentStep.title}</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                {totalScoredQuestions > 0
                  ? `You have answered ${scoredResults.attempted} of ${totalScoredQuestions} scored questions. Current score: ${scoredResults.accuracyPct}% (${scoredResults.correctFirstAttempts}/${totalScoredQuestions} correct on first attempt).`
                  : `You have completed all curriculum steps for Chapter ${chapter.num}: ${chapter.title}.`
                }
              </p>

              <div className="space-y-2 max-w-xs mx-auto text-xs font-mono">
                {[
                  { lvl: 5, label: 'Level 5 — Mastered (80%+)', active: scoredResults.masteryLevel >= 5 },
                  { lvl: 4, label: 'Level 4 — Proficient (65%–79%)', active: scoredResults.masteryLevel === 4 },
                  { lvl: 3, label: 'Level 3 — Practicing (50%–64%)', active: scoredResults.masteryLevel === 3 },
                  { lvl: 2, label: 'Level 2 — Familiar (30%–49%)', active: scoredResults.masteryLevel === 2 },
                  { lvl: 1, label: 'Level 1 — Learning (<30%)', active: scoredResults.masteryLevel === 1 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      item.active
                        ? 'bg-emerald-700 text-white font-bold shadow-sm border-emerald-800'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.active && (
                      <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold">
                        {scoredResults.accuracyPct}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP TYPE 8: SUMMARY */}
          {currentStep.type === 'SUMMARY' && (
            <div className="text-center space-y-5 py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-500 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                {scoredResults.masteryLevel >= 5 ? '🏆' : scoredResults.masteryLevel === 4 ? '🎯' : scoredResults.masteryLevel === 3 ? '📈' : '🔄'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest-deep">
                {scoredResults.masteryLevel >= 5
                  ? 'Module Mastered!'
                  : scoredResults.masteryLevel === 4
                  ? 'Module Completed — Proficient!'
                  : scoredResults.masteryLevel === 3
                  ? 'Module Completed — Practicing'
                  : 'Module Completed — Needs Review'
                }
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                {totalScoredQuestions > 0
                  ? `You achieved ${scoredResults.accuracyPct}% accuracy (${scoredResults.correctFirstAttempts} of ${totalScoredQuestions} questions correct on first attempt) for Chapter ${chapter.num}: ${chapter.title}.`
                  : `Congratulations! You have completed all interactive step cards for Chapter ${chapter.num}: ${chapter.title}.`
                }
              </p>

              <div className="flex items-center justify-center gap-6 py-3 bg-paper rounded-2xl border border-forest/10 max-w-sm mx-auto">
                <div>
                  <div className="text-xs text-ink-soft font-medium">XP Earned</div>
                  <div className="text-xl font-bold font-mono text-emerald-600">+{scoredResults.totalEarnedXP} XP</div>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <div className="text-xs text-ink-soft font-medium">Status</div>
                  <div className="text-xl font-bold font-mono text-forest">
                    {scoredResults.masteryLevel >= 5
                      ? `${scoredResults.accuracyPct}% Mastered`
                      : `${scoredResults.accuracyPct}% Accuracy`
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ─── Sticky Bottom Navigation Bar ─── */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md pt-4 border-t border-gray-100 flex items-center justify-between gap-4 mt-4 flex-shrink-0 z-10">
          
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            aria-disabled={isFirstStep}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isFirstStep
                ? 'opacity-30 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {/* Primary Action Button */}
          {isQuestionType && !currentSlot.submitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={currentSlot.selected === null}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                currentSlot.selected === null
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-forest text-white hover:bg-forest-deep shadow-md'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              aria-label={isLastStep ? 'Complete Module' : 'Next'}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-forest text-white hover:bg-forest-deep shadow-md transition-all"
            >
              {isLastStep ? 'Complete Module ✓' : 'Next →'}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
