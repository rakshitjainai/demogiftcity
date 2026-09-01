// client/src/utils/learnProgress.js
// RegLearn Progressive Gamification & Learning State Manager

const KEY = (slug) => `regmate_learn_${slug}`;
const MISTAKES_KEY = 'regmate_learn_mistakes_global';
const XP_LEVELS = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3250, 4100, 5000, 6100, 7300, 8600, 10000];

export const MASTERY_LEVELS = {
  0: { id: 0, label: 'Not Started', bg: '#F3F4F6', text: '#6B7280', short: 'Untouched' },
  1: { id: 1, label: 'Learning',    bg: '#EFF6FF', text: '#1D4ED8', short: 'In Progress' },
  2: { id: 2, label: 'Familiar',    bg: '#FFFBEB', text: '#B45309', short: 'Familiar' },
  3: { id: 3, label: 'Practicing',  bg: '#FFF7ED', text: '#C2410C', short: 'Practicing' },
  4: { id: 4, label: 'Proficient',  bg: '#ECFDF5', text: '#065F46', short: 'Proficient' },
  5: { id: 5, label: 'Mastered',    bg: '#0B4D33', text: '#ffffff', short: 'Mastered' },
};

export const AVAILABLE_BADGES = [
  { id: 'first_step', title: 'Statutory Scout', desc: 'Completed your first RegLearn step card', icon: '🌱' },
  { id: 'streak_3', title: 'Daily Disciplined', desc: 'Maintained a 3-day learning streak', icon: '🔥' },
  { id: 'streak_7', title: 'Compliance Torch', desc: 'Maintained a 7-day learning streak', icon: '⚡' },
  { id: 'first_module', title: 'Regulation Master', desc: 'Mastered your first full course module', icon: '🏆' },
  { id: 'mistake_remover', title: 'Flawless Recovery', desc: 'Successfully resolved a mistake in My Mistakes', icon: '🛡️' },
  { id: 'challenge_ace', title: '60-Sec Speedster', desc: 'Completed a 60-Second Challenge with >80% accuracy', icon: '⏱️' },
  { id: 'perfectionist', title: 'First-Attempt Hero', desc: 'Answered 5 consecutive questions correctly on first try', icon: '🎯' },
];

function getDefaultProgress(slug) {
  return {
    courseSlug: slug,
    chapters: {},
    streak: 0,
    lastSessionDate: null,
    totalChallengesCompleted: 0,
    weakChapterIds: [],
    recallDue: [],
    xp: 0,
    level: 1,
    badges: [],
    stepPositions: {}, // { [chNum]: stepIndex }
  };
}

function getDefaultChapter(chId) {
  return {
    chapterId: chId,
    lessonRead: false,
    walkthroughDone: false,
    recallDone: false,
    practiceAttempts: [],
    challengeScores: [],
    masteryLevel: 0,
    lastActivity: null,
    stepProgress: 0,
  };
}

export function getProgress(slug) {
  try {
    const raw = localStorage.getItem(KEY(slug));
    return raw ? { ...getDefaultProgress(slug), ...JSON.parse(raw) } : getDefaultProgress(slug);
  } catch { return getDefaultProgress(slug); }
}

export function saveProgress(slug, data) {
  try { localStorage.setItem(KEY(slug), JSON.stringify(data)); } catch {}
}

export function getChapterProgress(slug, chId) {
  const p = getProgress(slug);
  return { ...getDefaultChapter(chId), ...(p.chapters[chId] || {}) };
}

function updateStreak(p) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (!p.lastSessionDate) p.streak = 1;
  else if (p.lastSessionDate === today) { /* no change */ }
  else if (p.lastSessionDate === yesterday) p.streak = (p.streak || 0) + 1;
  else p.streak = 1;
  p.lastSessionDate = today;

  if (p.streak >= 3 && !p.badges.includes('streak_3')) p.badges.push('streak_3');
  if (p.streak >= 7 && !p.badges.includes('streak_7')) p.badges.push('streak_7');
}

export function calculateLevel(xp = 0) {
  let lvl = 1;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i]) lvl = i + 1;
    else break;
  }
  const currentLvlXP = XP_LEVELS[lvl - 1] || 0;
  const nextLvlXP = XP_LEVELS[lvl] || currentLvlXP + 1000;
  const progressInLvl = xp - currentLvlXP;
  const range = nextLvlXP - currentLvlXP;
  const pct = Math.min(100, Math.round((progressInLvl / range) * 100));

  return { level: lvl, currentLvlXP, nextLvlXP, pct };
}

export function addXP(slug, amount, reason = '') {
  const p = getProgress(slug);
  const oldLevel = calculateLevel(p.xp || 0).level;
  p.xp = (p.xp || 0) + amount;
  const newLevelData = calculateLevel(p.xp);
  p.level = newLevelData.level;

  let leveledUp = false;
  if (p.level > oldLevel) {
    leveledUp = true;
    playGamificationSound('levelUp');
  } else if (amount > 0) {
    playGamificationSound('success');
  }

  saveProgress(slug, p);
  return { p, leveledUp, xpAdded: amount, reason };
}

// Sound Mute Toggle Preference
export function isAudioMuted() {
  try {
    return localStorage.getItem('regmate_audio_muted') === 'true';
  } catch { return false; }
}

export function setAudioMuted(muted) {
  try {
    localStorage.setItem('regmate_audio_muted', muted ? 'true' : 'false');
  } catch {}
}

// ─── Web Audio API Synthesizer Sound Effects ──────────────────────────────
export function playGamificationSound(type = 'click') {
  if (isAudioMuted()) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'correct' || type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong' || type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'levelUp' || type === 'badge') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.1);
      osc.frequency.setValueAtTime(659.25, now + 0.2);
      osc.frequency.setValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'flip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {}
}

// ─── Visual Confetti Burst Trigger ─────────────────────────────────────────
export function triggerConfetti() {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 45 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.3,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 6 + 3,
      color: ['#0B4D33', '#059669', '#F59E0B', '#2563EB'][Math.floor(Math.random() * 4)],
      rotation: Math.random() * 360,
    }));

    let frame = 0;
    function anim() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += 4;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      frame++;
      if (frame < 45) requestAnimationFrame(anim);
      else canvas.remove();
    }
    requestAnimationFrame(anim);
  } catch (e) {}
}

// ─── Mistakes Store ────────────────────────────────────────────────────────
export function getMistakes() {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function recordMistake(mistakeData) {
  const list = getMistakes();
  const existingIdx = list.findIndex(m => m.id === mistakeData.id || m.question === mistakeData.question);
  if (existingIdx >= 0) {
    list[existingIdx].wrongCount = (list[existingIdx].wrongCount || 1) + 1;
    list[existingIdx].lastAttemptDate = Date.now();
  } else {
    list.unshift({
      id: mistakeData.id || `m-${Date.now()}`,
      courseSlug: mistakeData.courseSlug || 'sebi-aif',
      chapterNum: mistakeData.chapterNum || 1,
      question: mistakeData.question,
      selectedAnswer: mistakeData.selectedAnswer,
      correctAnswer: mistakeData.correctAnswer,
      explanation: mistakeData.explanation,
      provision: mistakeData.provision || '',
      wrongCount: 1,
      lastAttemptDate: Date.now(),
    });
  }
  try { localStorage.setItem(MISTAKES_KEY, JSON.stringify(list)); } catch {}
  return list;
}

export function removeMistake(idOrQuestion) {
  const list = getMistakes();
  const filtered = list.filter(m => m.id !== idOrQuestion && m.question !== idOrQuestion);
  try { localStorage.setItem(MISTAKES_KEY, JSON.stringify(filtered)); } catch {}
  return filtered;
}

// ─── Centralized Mastery Constants & Calculation ───────────────────────────
export const MASTERY_THRESHOLD = 0.80; // 80% First-Attempt Accuracy Benchmark

/**
 * Authoritative Single Source of Truth for Module Score, Accuracy, and Mastery
 * @param {Object} stepStates - Map of stepId -> { selected, submitted, isCorrect, firstAttemptCorrect }
 * @param {Array} steps - Full array of step objects for the active chapter
 */
export function calculateModuleScore(stepStates = {}, steps = []) {
  // Scored Question Steps Filter
  const scoredSteps = steps.filter(s =>
    ['MCQ', 'SPOT_THE_MISTAKE', 'REGULATION_COMPARISON', 'TRUE_FALSE'].includes(s.type)
  );
  const totalScoredQuestions = scoredSteps.length;

  let attempted = 0;
  let correctFirstAttempts = 0;
  let totalPointsEarned = 0;

  scoredSteps.forEach(s => {
    const slot = stepStates[s.id];
    if (slot && slot.submitted) {
      attempted++;
      if (slot.firstAttemptCorrect) {
        correctFirstAttempts++;
        totalPointsEarned += 25; // 25 XP per first-attempt correct
      }
    }
  });

  const accuracyPct = totalScoredQuestions > 0
    ? Math.round((correctFirstAttempts / totalScoredQuestions) * 100)
    : 100;

  const isMastered = totalScoredQuestions === 0 || accuracyPct >= Math.round(MASTERY_THRESHOLD * 100);

  let masteryLevel = 1;
  let masteryLabel = 'Learning';
  let badgeTitle = 'Module Completed — Needs Review';
  let bonusXP = 15;

  if (accuracyPct >= 80) {
    masteryLevel = 5;
    masteryLabel = 'Mastered';
    badgeTitle = 'Module Mastered!';
    bonusXP = 100;
  } else if (accuracyPct >= 65) {
    masteryLevel = 4;
    masteryLabel = 'Proficient';
    badgeTitle = 'Module Completed — Proficient!';
    bonusXP = 50;
  } else if (accuracyPct >= 50) {
    masteryLevel = 3;
    masteryLabel = 'Practicing';
    badgeTitle = 'Module Completed — Practicing';
    bonusXP = 30;
  } else if (accuracyPct >= 30) {
    masteryLevel = 2;
    masteryLabel = 'Familiar';
    badgeTitle = 'Module Completed — Familiar';
    bonusXP = 15;
  } else {
    masteryLevel = 1;
    masteryLabel = 'Learning';
    badgeTitle = 'Module Completed — Needs Review';
    bonusXP = 15;
  }

  const totalEarnedXP = totalPointsEarned + bonusXP;

  return {
    totalScoredQuestions,
    attempted,
    correctFirstAttempts,
    accuracyPct,
    isMastered,
    masteryLevel,
    masteryLabel,
    badgeTitle,
    bonusXP,
    totalEarnedXP,
  };
}

/**
 * Canonical Sequential Chapter Unlocking Validator
 * @param {string} slug - Course slug (e.g. 'sebi-aif')
 * @param {number} chIndex - Zero-based index of the chapter in course.chapters
 * @param {Array} chapters - Full chapters list from courses.json
 * @param {boolean} isOwned - Whether user has purchased/membership access
 */
export function isModuleUnlocked(slug, chIndex, chapters = [], isOwned = true) {
  // Chapter 1 (index 0) is always unlocked for free/preview
  if (chIndex === 0) {
    return { unlocked: true, reason: 'first_chapter' };
  }

  // Paid gating: if not owned, higher chapters are locked behind paywall
  if (!isOwned) {
    return { unlocked: false, reason: 'membership_required' };
  }

  // Sequential gating: Chapter N requires Chapter N-1 to be completed
  const prevChapter = chapters[chIndex - 1];
  if (!prevChapter) {
    return { unlocked: true, reason: 'no_prev_chapter' };
  }

  const prevProgress = getChapterProgress(slug, prevChapter.num);
  
  // Unlocked only if previous chapter has genuinely been traversed/completed or attempted
  const isPrevCompleted = Boolean(
    prevProgress && (prevProgress.isCompleted || prevProgress.lessonRead || prevProgress.masteryLevel >= 1)
  );

  if (!isPrevCompleted) {
    return {
      unlocked: false,
      reason: 'sequential_locked',
      prevChapterNum: prevChapter.num,
      prevChapterTitle: prevChapter.title,
    };
  }

  return { unlocked: true, reason: 'completed_previous' };
}

// ─── Step Engine Position & Progress Tracking ──────────────────────────────
export function saveStepPosition(slug, chNum, stepIdx) {
  const p = getProgress(slug);
  p.stepPositions = p.stepPositions || {};
  p.stepPositions[chNum] = stepIdx;
  saveProgress(slug, p);
}

export function getStepPosition(slug, chNum) {
  const p = getProgress(slug);
  return (p.stepPositions || {})[chNum] || 0;
}

export function saveChapterStepStates(slug, chNum, stepStates) {
  const p = getProgress(slug);
  const ch = { ...getDefaultChapter(chNum), ...(p.chapters[chNum] || {}) };
  ch.stepStates = stepStates;
  p.chapters[chNum] = ch;
  saveProgress(slug, p);
}

export function getChapterStepStates(slug, chNum) {
  const p = getProgress(slug);
  const ch = p.chapters[chNum];
  return ch?.stepStates || {};
}

export function markLessonRead(slug, chId) {
  const p = getProgress(slug);
  const ch = { ...getDefaultChapter(chId), ...(p.chapters[chId] || {}) };
  ch.lessonRead = true;
  ch.isCompleted = true;
  ch.lastActivity = Date.now();
  if (ch.masteryLevel < 1) ch.masteryLevel = 1;
  p.chapters[chId] = ch;
  updateStreak(p);
  saveProgress(slug, p);
  return p;
}

export function recordStepAnswer(slug, chId, isCorrect, options = {}) {
  const p = getProgress(slug);
  const ch = { ...getDefaultChapter(chId), ...(p.chapters[chId] || {}) };
  ch.practiceAttempts = [...(ch.practiceAttempts || []), { correct: isCorrect, isFirstAttempt: options.isFirstAttempt, timestamp: Date.now() }];
  ch.lastActivity = Date.now();

  p.chapters[chId] = ch;
  updateStreak(p);

  // Award XP (First attempt gets +25 XP, standard gets +10 XP)
  const xpAmount = isCorrect ? (options.isFirstAttempt ? 25 : 10) : 0;
  if (xpAmount > 0) addXP(slug, xpAmount, isCorrect ? 'Correct Answer' : '');

  saveProgress(slug, p);
  return { p, ch };
}

export function recordModuleCompletion(slug, chId, result = {}) {
  const p = getProgress(slug);
  const ch = { ...getDefaultChapter(chId), ...(p.chapters[chId] || {}) };

  const totalQuestions = typeof result.totalQuestions === 'number' ? result.totalQuestions : 0;
  const correctCount = typeof result.correctCount === 'number' ? result.correctCount : 0;
  const accuracyPct = typeof result.accuracyPct === 'number'
    ? result.accuracyPct
    : (totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100);

  const masteryLevel = typeof result.masteryLevel === 'number'
    ? result.masteryLevel
    : (accuracyPct >= 80 ? 5 : accuracyPct >= 65 ? 4 : accuracyPct >= 50 ? 3 : accuracyPct >= 30 ? 2 : 1);

  const isMastered = masteryLevel >= 5;

  ch.lessonRead = true;
  ch.isCompleted = true;
  ch.masteryLevel = masteryLevel;
  ch.accuracyPct = accuracyPct;
  ch.isMastered = isMastered;

  if (result.stepStates) {
    ch.stepStates = result.stepStates;
  }

  ch.lastScore = {
    total: totalQuestions,
    correct: correctCount,
    accuracyPct,
    masteryLevel,
    isMastered,
    timestamp: Date.now(),
  };
  ch.lastActivity = Date.now();

  if (isMastered) {
    p.weakChapterIds = (p.weakChapterIds || []).filter(id => String(id) !== String(chId));
  } else if (masteryLevel <= 2 && totalQuestions > 0) {
    if (!p.weakChapterIds.includes(chId)) p.weakChapterIds.push(chId);
  }

  const bonusXP = typeof result.bonusXP === 'number'
    ? result.bonusXP
    : (accuracyPct >= 80 ? 100 : accuracyPct >= 65 ? 50 : accuracyPct >= 50 ? 30 : 15);

  if (bonusXP > 0) {
    addXP(slug, bonusXP, isMastered ? 'Module Mastered' : 'Module Completed');
  }

  if (isMastered && !p.badges.includes('first_module')) {
    p.badges.push('first_module');
  }

  p.chapters[chId] = ch;
  updateStreak(p);
  saveProgress(slug, p);

  return { p, ch, accuracyPct, masteryLevel, isMastered, bonusXP };
}

export function recordChallengeScore(slug, chId, type, score, total) {
  const p = getProgress(slug);
  const ch = { ...getDefaultChapter(chId), ...(p.chapters[chId] || {}) };
  const pct = total > 0 ? score / total : 0;
  ch.challengeScores = [...(ch.challengeScores || []), { type, score, total, timestamp: Date.now() }];
  ch.lastActivity = Date.now();
  p.totalChallengesCompleted = (p.totalChallengesCompleted || 0) + 1;

  // 80% Single Source of Truth Mastery Threshold Logic
  if (pct >= MASTERY_THRESHOLD) {
    ch.masteryLevel = 5;
    p.weakChapterIds = (p.weakChapterIds || []).filter(id => String(id) !== String(chId));
  } else if (pct >= 0.65) {
    ch.masteryLevel = Math.max(ch.masteryLevel, 4);
  }

  p.chapters[chId] = ch;
  updateStreak(p);

  // Timed challenge XP bonus
  const bonusXP = Math.round(pct * 50) + (score * 5);
  addXP(slug, bonusXP, 'Challenge Completed');

  saveProgress(slug, p);
  return { p, ch };
}

export function getCourseStats(slug, chapters = []) {
  const p = getProgress(slug);
  const total = chapters.length || 1;
  let started = 0, completed = 0, mastered = 0, pts = 0;
  chapters.forEach(ch => {
    const cp = p.chapters[ch.id || ch.num] || {};
    const lvl = cp.masteryLevel || 0;
    pts += lvl;
    if (lvl >= 1 || cp.lessonRead || cp.isCompleted) started++;
    if (lvl >= 3 || cp.lessonRead || cp.isCompleted) completed++;
    if (lvl >= 5 || cp.isMastered) mastered++;
  });

  const levelInfo = calculateLevel(p.xp || 0);

  return {
    total,
    started,
    completed,
    mastered,
    overallPct: Math.round((pts / (total * 5)) * 100),
    streak: p.streak || 0,
    xp: p.xp || 0,
    level: levelInfo.level,
    levelPct: levelInfo.pct,
    nextLvlXP: levelInfo.nextLvlXP,
    badges: p.badges || [],
    weakAreas: (p.weakChapterIds || []).length,
    recallDue: (p.recallDue || []).length,
    totalChallengesCompleted: p.totalChallengesCompleted || 0,
  };
}

export function getCurrentChapter(slug, chapters = []) {
  const p = getProgress(slug);
  for (const ch of chapters) {
    const cp = p.chapters[ch.id || ch.num] || {};
    if ((cp.masteryLevel || 0) < 5) return ch;
  }
  return chapters[0] || null;
}

export function getChapterNextAction(slug, chId) {
  const ch = getChapterProgress(slug, chId);
  if (!ch.lessonRead && !ch.isCompleted) return 'learn';
  if (!ch.walkthroughDone) return 'walkthrough';
  if (!ch.recallDone) return 'recall';
  if (!(ch.practiceAttempts || []).length) return 'practice';
  if (!(ch.challengeScores || []).length) return 'challenge';
  return ch.masteryLevel >= 5 ? 'mastered' : 'review';
}

