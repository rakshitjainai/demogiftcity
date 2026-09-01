import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, X, AlertCircle, Sparkles,
  BookOpen, Brain, Zap, Target, Award, Flame, RotateCcw, Check,
  ChevronRight, Lock, HelpCircle, FileText, Layers, RefreshCw, Volume2, VolumeX, Shield, Timer, Search, HelpCircle as QuestionIcon
} from 'lucide-react';
import {
  recordStepAnswer, getStepPosition, saveStepPosition,
  playGamificationSound, triggerConfetti, recordMistake, removeMistake,
  isAudioMuted, setAudioMuted
} from '../utils/learnProgress';

function formatProvision(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (typeof p === 'object') {
    const main = p.provision || p.title || p.authority || p.law || p.section || p.rule || '';
    const extra = p.authority && p.provision ? ` (${p.authority})` : '';
    return `${main}${extra}` || '';
  }
  return String(p);
}

// ─── Step Transformer Function ──────────────────────────────────────────────
export function transformChapterToSteps(chapter, courseSlug = 'sebi-aif') {
  if (!chapter) return [];

  const steps = [];

  // Step 1: INTRO
  steps.push({
    id: `step-intro-${chapter.num}`,
    type: 'INTRO',
    title: chapter.title || `Chapter ${chapter.num}`,
    subTitle: chapter.band || 'Regulatory Framework',
    content: chapter.description || 'Master the essential regulatory provisions and practitioner compliance rules for this module.',
    conceptsCount: (chapter.concepts || []).length,
    activitiesCount: (chapter.activities || []).length,
  });

  // Step 2: TODAY'S 3 THINGS
  steps.push({
    id: `step-todays3-${chapter.num}`,
    type: 'TODAYS_3_THINGS',
    title: "Today's 3 Key Statutory Takeaways",
    takeaways: [
      `Understand statutory eligibility requirements under Chapter ${chapter.num}`,
      `Identify net worth, corpus, and investment threshold rules`,
      `Master practitioner filing timelines and compliance reporting obligations`
    ]
  });

  const activities = chapter.activities || [];

  // Process concepts & activities into structured step cards
  activities.forEach((act, actIdx) => {
    const p = act.payload || {};
    const type = act.type || act.activity_type || 'lesson';

    // 1. FLASHCARD / SMART_FLIP_CARDS step
    if (act.recallCards && act.recallCards.length > 0) {
      act.recallCards.forEach((rc, rIdx) => {
        steps.push({
          id: `step-fc-${act.uid || actIdx}-${rIdx}`,
          type: 'FLASHCARD',
          title: rc.front || 'Key Term / Definition',
          front: rc.front,
          back: rc.back,
          tag: rc.tag || 'Recall',
          provision: act.provision || act.prov || '',
        });
      });
    }

    // 2. EXPLANATION / REGULATION / EXAMPLE steps
    if (type === 'lesson' || p.cards || p.story || p.provision_text) {
      const cards = act.cards || p.cards || [];
      if (cards.length > 0) {
        cards.forEach((c, cIdx) => {
          const cardObj = typeof c === 'string' ? { title: 'Statutory Rule', law: c } : c;
          steps.push({
            id: `step-card-${act.uid || actIdx}-${cIdx}`,
            type: cardObj.law ? 'REGULATION' : 'EXPLANATION',
            title: cardObj.title || act.title || 'Core Rule',
            explanation: cardObj.means || cardObj.explain || '',
            statutoryText: cardObj.law || '',
            tag: cardObj.tag || 'Rule',
            provision: act.provision || '',
            effectiveDate: act.effectiveDate || '',
          });
        });
      } else if (p.story) {
        steps.push({
          id: `step-example-${act.uid || actIdx}`,
          type: 'EXAMPLE',
          title: act.title || 'Practitioner Case Study',
          story: p.story,
          remember: p.remember || p.tip || '',
          provision: act.provision || '',
        });
      }
    }

    // 3. BUILD THE REGULATION step
    if (p.law_fragments || (act.provision && act.provision.length > 30 && actIdx % 3 === 0)) {
      const ruleText = act.provision || "An AIF scheme shall maintain the minimum required corpus and investor limit";
      const fragments = ruleText.split(' ').filter(Boolean);
      if (fragments.length >= 4) {
        const chunkSize = Math.ceil(fragments.length / 4);
        const pieces = [];
        for (let i = 0; i < fragments.length; i += chunkSize) {
          pieces.push(fragments.slice(i, i + chunkSize).join(' '));
        }
        steps.push({
          id: `step-build-${act.uid || actIdx}`,
          type: 'BUILD_THE_REGULATION',
          title: 'Build the Regulation',
          instruction: 'Tap the fragmented statutory clauses in the correct legal sequence:',
          correctPieces: pieces,
          provision: act.provision || '',
        });
      }
    }

    // 4. COMPLETE THE RULE step
    if (p.rule_clause || (act.title && act.explanation && actIdx % 2 === 1)) {
      steps.push({
        id: `step-complete-${act.uid || actIdx}`,
        type: 'COMPLETE_THE_RULE',
        title: 'Complete the Statutory Rule',
        clause: act.title || 'Minimum corpus requirement per scheme',
        options: ['twenty crore rupees', 'five crore rupees', 'fifty crore rupees'],
        correctIdx: 0,
        explanation: act.explanation || 'Statutory floor attaches to each scheme individually.',
        provision: act.provision || '',
      });
    }

    // 5. SNAPSHOT (15s) step
    if (actIdx === 2 || p.snapshot) {
      steps.push({
        id: `step-snap-${act.uid || actIdx}`,
        type: 'SNAPSHOT_15S',
        title: 'Snapshot (15s Memory Drill)',
        statutoryFact: act.provision || 'Continuous net worth must be maintained at all times during registration validity.',
        question: 'What is the continuous compliance requirement mentioned in the snapshot?',
        options: ['Maintained at all times', 'Checked only annually', 'Checked only on renewal'],
        correctIdx: 0,
        explanation: 'Statutory compliance is a continuous obligation, not a periodic event.',
      });
    }

    // 6. SPOT THE TRAP step
    if (actIdx === 3 || p.trap) {
      steps.push({
        id: `step-trap-${act.uid || actIdx}`,
        type: 'SPOT_THE_TRAP',
        title: 'Spot the Compliance Trap',
        scenario: 'Review these two similar regulatory statements and identify the deceptive trap:',
        statementA: 'Unified registration consolidates registration certificates across desks.',
        statementB: 'Unified registration consolidates and dilutes Chapter IV compliance obligations.',
        trapIndex: 1, // Statement B is the trap
        explanation: 'Unified registration consolidates the certificate, NOT the compliance. Each desk retains its full obligations.',
        provision: act.provision || '',
      });
    }

    // 7. TEACH THE JUNIOR step
    if (actIdx === 4 || p.junior_query) {
      steps.push({
        id: `step-teach-${act.uid || actIdx}`,
        type: 'TEACH_THE_JUNIOR',
        title: 'Teach the Junior Colleague',
        query: 'Junior Ask: "Can a Category I AIF invest in listed equities beyond the prescribed cap without prior SEBI approval?"',
        options: [
          'No, Category I AIFs must adhere strictly to investment concentration limits.',
          'Yes, investment managers can override caps at their discretion.',
          'Yes, as long as investors give verbal consent.'
        ],
        correctIdx: 0,
        explanation: 'Advise your junior colleague that statutory investment limits are binding laws.',
      });
    }

    // 8. EXPLAIN LIKE A PROFESSIONAL step
    if (actIdx === 5 || p.professional_points) {
      steps.push({
        id: `step-prof-${act.uid || actIdx}`,
        type: 'EXPLAIN_LIKE_A_PROFESSIONAL',
        title: 'Explain Like a Professional',
        prompt: 'Select the 3 essential compliance points you must highlight to the Board:',
        points: [
          { text: 'Verify continuous liquid net worth requirements', isCorrect: true },
          { text: 'File PPM changes prior to launching new scheme', isCorrect: true },
          { text: 'Ensure mandatory dematerialisation of scheme units', isCorrect: true },
          { text: 'Ignore periodic compliance audit filings', isCorrect: false },
        ]
      });
    }

    // 9. MCQ / QUICK_CHECK step
    if (type === 'mcq' || (act.options && act.options.length > 0)) {
      const optsRaw = act.options || p.optionsFormatted || p.options || [];
      const options = optsRaw.map(o => typeof o === 'string' ? o : o.text || o.t || String(o));
      const correctKey = act.correctKey || act.answer?.correct || p.answer || 'A';
      
      let correctIdx = typeof act.correctIdx === 'number'
        ? act.correctIdx
        : optsRaw.findIndex(o => (typeof o === 'object' ? o.key : null) === correctKey);
      if (correctIdx === -1) {
        correctIdx = ['A', 'B', 'C', 'D'].indexOf(correctKey);
        if (correctIdx === -1) correctIdx = 0;
      }

      steps.push({
        id: `step-mcq-${act.uid || actIdx}`,
        type: 'MCQ',
        question: act.question || p.question || act.title || '',
        options,
        correctIdx,
        correctKey,
        explanation: act.explanation || p.explanation || act.answer?.explanation || '',
        provision: act.provision || p.provision || '',
        uid: act.uid || `q-${actIdx}`,
        chapterNum: chapter.num,
      });
    }

    // 10. TRUE_FALSE step
    if (type === 'truefalse') {
      steps.push({
        id: `step-tf-${act.uid || actIdx}`,
        type: 'TRUE_FALSE',
        question: act.question || p.question || act.title || '',
        options: ['True', 'False'],
        correctIdx: (p.answer === 'true' || act.answer?.correct === 'true' || act.answer?.correct === 'A') ? 0 : 1,
        explanation: act.explanation || p.explanation || '',
        provision: act.provision || '',
        uid: act.uid || `tf-${actIdx}`,
        chapterNum: chapter.num,
      });
    }

    // 11. SPOT THE MISTAKE step
    if (type === 'find_the_mistake' || p.lapses) {
      steps.push({
        id: `step-mistake-${act.uid || actIdx}`,
        type: 'SPOT_THE_MISTAKE',
        title: 'Spot the Compliance Lapse',
        scenario: p.scenario || act.question || 'Identify which statement or action violates regulatory requirements.',
        statements: p.statements || p.options || [],
        correctIdx: p.correctIdx || 0,
        explanation: p.explanation || 'One or more of the above actions violates statutory provisions.',
        provision: act.provision || '',
        uid: act.uid || `m-${actIdx}`,
        chapterNum: chapter.num,
      });
    }

    // 12. PUT IN ORDER step
    if (type === 'put_in_order' || p.process_steps) {
      const initialItems = p.process_steps || p.items || ['Filing Application', 'Authority Observation', 'Final Disclosure'];
      steps.push({
        id: `step-order-${act.uid || actIdx}`,
        type: 'PUT_IN_ORDER',
        title: 'Put Compliance Process in Order',
        instruction: 'Arrange the statutory steps in correct chronological sequence.',
        correctOrder: initialItems,
        explanation: p.explanation || 'Regulatory filings follow strict sequential timelines.',
        provision: act.provision || '',
        uid: act.uid || `ord-${actIdx}`,
        chapterNum: chapter.num,
      });
    }

    // 13. REGULATION COMPARISON step
    if (type === 'old_vs_new' || p.comparison) {
      steps.push({
        id: `step-comp-${act.uid || actIdx}`,
        type: 'REGULATION_COMPARISON',
        title: act.title || 'Regulatory Comparison (2022 vs 2025/2026)',
        oldRule: p.oldRule || 'Former Provision Requirement',
        newRule: p.newRule || 'Current Amended Framework',
        question: p.question || 'Which framework applies to the scenario described?',
        options: ['Former Framework', 'Amended Framework'],
        correctIdx: p.correctIdx || 1,
        explanation: p.explanation || 'Framework amendments updated statutory compliance expectations.',
        provision: act.provision || '',
        uid: act.uid || `comp-${actIdx}`,
        chapterNum: chapter.num,
      });
    }
  });

  // Step N-2: BOSS LEVEL CHALLENGE
  steps.push({
    id: `step-boss-${chapter.num}`,
    type: 'BOSS_LEVEL',
    title: `Boss Level — Chapter ${chapter.num} Comprehensive Challenge`,
    subtitle: 'High-stakes statutory scenario test before module completion.',
    question: `A multi-activity entity in GIFT IFSC operates across desks. What is the supreme compliance mandate?`,
    options: [
      'Each activity desk must comply with its respective Chapter IV obligations independently.',
      'Unified registration waives desk-specific conduct codes.',
      'Only the primary desk requires statutory reporting.'
    ],
    correctIdx: 0,
    explanation: 'Unified registration unifies the certificate, NOT compliance. Chapter IV obligations attach desk by desk.'
  });

  // Step N-1: MASTERY LADDER
  steps.push({
    id: `step-mastery-${chapter.num}`,
    type: 'MASTERY_LADDER',
    title: 'Module Mastery Ladder',
    question: `You have reached Level 5 on the Mastery Ladder for Chapter ${chapter.num}: ${chapter.title}. Verify your 80%+ benchmark status below:`,
  });

  // Step Final: SUMMARY
  steps.push({
    id: `step-summary-${chapter.num}`,
    type: 'SUMMARY',
    title: 'Module Mastered!',
    chapterNum: chapter.num,
    chapterTitle: chapter.title,
  });

  return steps;
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
  const currentSlot = stepStates[currentStep.id] || { selected: null, submitted: false, isCorrect: false };

  // Flashcard flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // Snapshot 15s Timer State
  const [snapTime, setSnapTime] = useState(15);
  const [snapHidden, setSnapHidden] = useState(false);

  useEffect(() => {
    if (currentStep.type === 'SNAPSHOT_15S') {
      setSnapTime(15);
      setSnapHidden(false);
      const timer = setInterval(() => {
        setSnapTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setSnapHidden(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    setIsFlipped(false);
  }, [currentStep]);

  // Build Regulation State
  const [builtPieces, setBuiltPieces] = useState([]);
  const [availablePieces, setAvailablePieces] = useState([]);

  useEffect(() => {
    if (currentStep.type === 'BUILD_THE_REGULATION' && currentStep.correctPieces) {
      setBuiltPieces([]);
      setAvailablePieces([...currentStep.correctPieces].sort(() => Math.random() - 0.5));
    }
  }, [currentStep]);

  // Explain Like a Professional Points Selection State
  const [selectedProfPoints, setSelectedProfPoints] = useState([]);

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

    if (['MCQ', 'TRUE_FALSE', 'REGULATION_COMPARISON', 'SPOT_THE_MISTAKE', 'SNAPSHOT_15S', 'SPOT_THE_TRAP', 'TEACH_THE_JUNIOR', 'BOSS_LEVEL', 'COMPLETE_THE_RULE'].includes(currentStep.type)) {
      isCorrect = currentSlot.selected === (currentStep.correctIdx ?? currentStep.trapIndex ?? 0);
    } else if (currentStep.type === 'PUT_IN_ORDER') {
      isCorrect = true; // Auto-validated
    } else if (currentStep.type === 'BUILD_THE_REGULATION') {
      isCorrect = JSON.stringify(builtPieces) === JSON.stringify(currentStep.correctPieces);
    } else if (currentStep.type === 'EXPLAIN_LIKE_A_PROFESSIONAL') {
      isCorrect = selectedProfPoints.length >= 2;
    } else if (currentStep.type === 'TODAYS_3_THINGS') {
      isCorrect = true;
    }

    setStepStates(prev => ({
      ...prev,
      [currentStep.id]: { ...(prev[currentStep.id] || {}), submitted: true, isCorrect }
    }));

    // Record answer progress & XP
    recordStepAnswer(courseSlug, chapter.num, isCorrect, { isFirstAttempt: true });

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

  // Move to Next Step
  const handleNext = () => {
    if (isLastStep) {
      triggerConfetti();
      playGamificationSound('levelUp');
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
  const progressPct = Math.round(((currentStepIdx + 1) / steps.length) * 100);

  // Check if primary CTA is enabled
  const isQuestionType = ['MCQ', 'TRUE_FALSE', 'SPOT_THE_MISTAKE', 'PUT_IN_ORDER', 'REGULATION_COMPARISON', 'SNAPSHOT_15S', 'BUILD_THE_REGULATION', 'COMPLETE_THE_RULE', 'SPOT_THE_TRAP', 'TEACH_THE_JUNIOR', 'EXPLAIN_LIKE_A_PROFESSIONAL', 'BOSS_LEVEL'].includes(currentStep.type);
  const isNextDisabled = isQuestionType && !currentSlot.submitted;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-4 pb-28">
      
      {/* ─── Top Progress Header ─── */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-forest/10 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-forest-deep">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-forest/10 text-forest font-mono font-bold">
              Chapter {chapter.num}
            </span>
            <span className="text-ink-soft truncate max-w-[160px] sm:max-w-xs">{chapter.title}</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs font-bold text-forest">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleMute}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title={muted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-forest" />}
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
        
        {/* Internal Scrollable Content Box (Fixes Mobile Overflow Issue F1) */}
        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-5">
          
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
                <Sparkles className="w-3.5 h-3.5" /> Today's 3 Things
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
                <div className="bg-amber-50/60 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Verbatim Statutory Rule
                  </div>
                  <p className="text-sm font-serif text-amber-950 leading-relaxed italic">
                    "{currentStep.statutoryText}"
                  </p>
                </div>
              )}

              {currentStep.explanation && (
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {currentStep.explanation}
                </p>
              )}
            </div>
          )}

          {/* STEP TYPE 4: SNAPSHOT (15s) */}
          {currentStep.type === 'SNAPSHOT_15S' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" /> Snapshot 15s Drill
                </span>
                <span className="font-mono text-sm font-bold text-purple-600 bg-purple-100 px-3 py-0.5 rounded-full">
                  {snapTime}s
                </span>
              </div>

              <h3 className="text-lg font-bold text-forest-deep">{currentStep.title}</h3>

              {!snapHidden ? (
                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-sm sm:text-base leading-relaxed font-serif italic">
                  "{currentStep.statutoryFact}"
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold">
                    🔒 Snapshot hidden! Answer from memory:
                  </div>
                  <p className="text-sm font-bold text-forest-deep">{currentStep.question}</p>
                  <div className="space-y-2">
                    {currentStep.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={currentSlot.submitted}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold ${
                          currentSlot.selected === idx ? 'border-purple-600 bg-purple-50 text-purple-900' : 'border-gray-200 bg-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP TYPE 5: BUILD THE REGULATION */}
          {currentStep.type === 'BUILD_THE_REGULATION' && (
            <div className="space-y-5 animate-fadeIn">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                Build the Regulation
              </span>
              <h3 className="text-base font-bold text-forest-deep">{currentStep.title}</h3>
              <p className="text-xs text-gray-600">{currentStep.instruction}</p>

              {/* Assembled Area */}
              <div className="p-4 min-h-[70px] bg-paper rounded-2xl border-2 border-dashed border-emerald-300 flex flex-wrap gap-2">
                {builtPieces.map((p, idx) => (
                  <span
                    key={idx}
                    onClick={() => {
                      setBuiltPieces(prev => prev.filter((_, i) => i !== idx));
                      setAvailablePieces(prev => [...prev, p]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    {p} ✕
                  </span>
                ))}
              </div>

              {/* Available Area */}
              <div className="flex flex-wrap gap-2">
                {availablePieces.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAvailablePieces(prev => prev.filter((_, i) => i !== idx));
                      setBuiltPieces(prev => [...prev, p]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-emerald-600 text-xs font-medium text-gray-800"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP TYPE 6: SPOT THE TRAP */}
          {currentStep.type === 'SPOT_THE_TRAP' && (
            <div className="space-y-5 animate-fadeIn">
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
                Spot the Trap
              </span>
              <h3 className="text-lg font-bold text-forest-deep">{currentStep.title}</h3>
              <p className="text-xs text-gray-600">{currentStep.scenario}</p>

              <div className="space-y-3">
                <button
                  onClick={() => handleSelectOption(0)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all text-xs font-semibold ${
                    currentSlot.selected === 0 ? 'border-rose-500 bg-rose-50' : 'border-gray-200'
                  }`}
                >
                  Statement A: {currentStep.statementA}
                </button>

                <button
                  onClick={() => handleSelectOption(1)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all text-xs font-semibold ${
                    currentSlot.selected === 1 ? 'border-rose-500 bg-rose-50' : 'border-gray-200'
                  }`}
                >
                  Statement B: {currentStep.statementB}
                </button>
              </div>
            </div>
          )}

          {/* STEP TYPE 7: TEACH THE JUNIOR */}
          {currentStep.type === 'TEACH_THE_JUNIOR' && (
            <div className="space-y-5 animate-fadeIn">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                Teach the Junior Colleague
              </span>
              <h3 className="text-lg font-bold text-forest-deep">{currentStep.title}</h3>
              
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 font-semibold leading-relaxed">
                {currentStep.query}
              </div>

              <div className="space-y-2">
                {currentStep.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={currentSlot.submitted}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold ${
                      currentSlot.selected === idx ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-gray-200 bg-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP TYPE 8: BOSS LEVEL */}
          {currentStep.type === 'BOSS_LEVEL' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-900 to-slate-900 text-white space-y-2">
                <span className="px-2.5 py-0.5 rounded bg-red-500 text-white font-mono font-bold text-[10px] uppercase">
                  BOSS LEVEL (+150 XP)
                </span>
                <h3 className="text-lg font-bold">{currentStep.title}</h3>
                <p className="text-xs text-white/80">{currentStep.subtitle}</p>
              </div>

              <p className="text-sm font-bold text-forest-deep">{currentStep.question}</p>

              <div className="space-y-2">
                {currentStep.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={currentSlot.submitted}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold ${
                      currentSlot.selected === idx ? 'border-red-600 bg-red-50 text-red-950' : 'border-gray-200 bg-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP TYPE 9: MASTERY LADDER */}
          {currentStep.type === 'MASTERY_LADDER' && (
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl font-bold">
                🪜
              </div>
              <h3 className="text-xl font-bold text-forest-deep">{currentStep.title}</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">{currentStep.question}</p>

              <div className="space-y-2 max-w-xs mx-auto text-xs font-mono">
                {['Level 5 — Mastered (80%+)', 'Level 4 — Proficient', 'Level 3 — Practicing', 'Level 2 — Familiar', 'Level 1 — Learning'].map((l, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border ${i === 0 ? 'bg-emerald-700 text-white font-bold' : 'bg-gray-50 text-gray-600'}`}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP TYPE 10: FLASHCARD */}
          {currentStep.type === 'FLASHCARD' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
                  Smart Flip Card
                </span>
                <span className="text-xs text-ink-soft">Tap card to flip</span>
              </div>

              <div
                onClick={() => { setIsFlipped(!isFlipped); playGamificationSound('flip'); }}
                className="cursor-pointer bg-gradient-to-br from-paper to-white p-8 rounded-2xl border-2 border-forest/20 shadow-md min-h-[200px] flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-forest"
              >
                {!isFlipped ? (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-forest uppercase tracking-wider">FRONT</div>
                    <h4 className="text-lg sm:text-xl font-bold text-forest-deep">{currentStep.front}</h4>
                    <span className="inline-block mt-4 text-xs text-forest underline font-semibold">Click to reveal answer ↺</span>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">BACK</div>
                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{currentStep.back}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP TYPE 11: MCQ & QUICK_CHECK */}
          {currentStep.type === 'MCQ' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  Quick Recall Check
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
                        {String.fromCharCode(65 + idx)}
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

          {/* STEP TYPE 12: SUMMARY */}
          {currentStep.type === 'SUMMARY' && (
            <div className="text-center space-y-5 py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-500 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                🏆
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-forest-deep">Module Mastered!</h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                Congratulations! You have completed all interactive step cards for Chapter {chapter.num}: {chapter.title}.
              </p>

              <div className="flex items-center justify-center gap-6 py-3 bg-paper rounded-2xl border border-forest/10 max-w-sm mx-auto">
                <div>
                  <div className="text-xs text-ink-soft font-medium">XP Earned</div>
                  <div className="text-xl font-bold font-mono text-emerald-600">+100 XP</div>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <div className="text-xs text-ink-soft font-medium">Status</div>
                  <div className="text-xl font-bold font-mono text-forest">80%+ Mastered</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ─── Sticky Bottom Navigation Bar ─── */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4 mt-4 flex-shrink-0">
          
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
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
              disabled={currentSlot.selected === null && currentStep.type !== 'BUILD_THE_REGULATION'}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                currentSlot.selected === null && currentStep.type !== 'BUILD_THE_REGULATION'
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-forest text-white hover:bg-forest-deep shadow-md'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
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
