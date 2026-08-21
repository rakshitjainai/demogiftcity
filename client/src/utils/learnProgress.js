// client/src/utils/learnProgress.js
// RegLearn Gamification State Manager
// Mastery is earned through actual quiz performance, not just reading.

const KEY = (slug) => `regmate_learn_${slug}`;

export const MASTERY_LEVELS = {
  0: { id: 0, label: 'Not Started', bg: '#F3F4F6', text: '#6B7280', short: 'Untouched' },
  1: { id: 1, label: 'Learning',    bg: '#EFF6FF', text: '#1D4ED8', short: 'In Progress' },
  2: { id: 2, label: 'Familiar',    bg: '#FFFBEB', text: '#B45309', short: 'Familiar' },
  3: { id: 3, label: 'Practicing',  bg: '#FFF7ED', text: '#C2410C', short: 'Practicing' },
  4: { id: 4, label: 'Proficient',  bg: '#ECFDF5', text: '#065F46', short: 'Proficient' },
  5: { id: 5, label: 'Mastered',    bg: '#0B4D33', text: '#ffffff', short: 'Mastered' },
};

function getDefaultProgress(slug) {
  return { courseSlug: slug, chapters: {}, streak: 0, lastSessionDate: null,
    totalChallengesCompleted: 0, weakChapterIds: [], recallDue: [],
    dailySessionDate: null };
}

function getDefaultChapter(chId) {
  return { chapterId: chId, lessonRead: false, walkthroughDone: false,
    recallDone: false, practiceAttempts: [], challengeScores: [],
    masteryLevel: 0, lastActivity: null };
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
}

export function markLessonRead(slug, chId) {
  const p = getProgress(slug);
  const ch = { ...getDefaultChapter(chId), ...(p.chapters[chId] || {}) };
  ch.lessonRead = true; ch.lastActivity = Date.now();
  if (ch.masteryLevel < 1) ch.masteryLevel = 1;
  p.chapters[chId] = ch; updateStreak(p); saveProgress(slug, p); return p;
}

export function markWalkthroughDone(slug, chId) {
  const p = getProgress(slug);
  const ch = { ...getDefaultChapter(chId), ...(p.chapters[chId] || {}) };
  ch.walkthroughDone = true; ch.lastActivity = Date.now();
  if (ch.masteryLevel < 2) ch.masteryLevel = 2;
  p.chapters[chId] = ch; saveProgress(slug, p); return p;
}

export function recordRecall(slug, chId) {
  const p = getProgress(slug);
  const ch = { ...getDefaultChapter(chId), ...(p.chapters[chId] || {}) };
  ch.recallDone = true; ch.lastActivity = Date.now();
  if (ch.masteryLevel < 2) ch.masteryLevel = 2;
  p.recallDue = (p.recallDue || []).filter(id => id !== chId);
  p.chapters[chId] = ch; updateStreak(p); saveProgress(slug, p); return p;
}

export function recordPracticeAnswer(slug, chId, correct, optionIdx) {
  const p = getProgress(slug);
  const ch = { ...getDefaultChapter(chId), ...(p.chapters[chId] || {}) };
  ch.practiceAttempts = [...(ch.practiceAttempts || []), { correct, optionIdx, timestamp: Date.now() }];
  ch.lastActivity = Date.now();
  const recent = ch.practiceAttempts.slice(-5);
  const acc = recent.filter(a => a.correct).length / recent.length;
  if (acc >= 0.8 && ch.masteryLevel < 4) ch.masteryLevel = Math.max(ch.masteryLevel, 3);
  if (correct && ch.masteryLevel < 3) ch.masteryLevel = Math.max(ch.masteryLevel, 2);
  p.chapters[chId] = ch;
  if (!correct && !p.weakChapterIds.includes(chId)) p.weakChapterIds = [...p.weakChapterIds, chId];
  if (correct && acc >= 0.8) p.weakChapterIds = p.weakChapterIds.filter(id => id !== chId);
  saveProgress(slug, p); return { p, ch };
}

export function recordChallengeScore(slug, chId, type, score, total) {
  const p = getProgress(slug);
  const ch = { ...getDefaultChapter(chId), ...(p.chapters[chId] || {}) };
  const pct = total > 0 ? score / total : 0;
  ch.challengeScores = [...(ch.challengeScores || []), { type, score, total, timestamp: Date.now() }];
  ch.lastActivity = Date.now();
  p.totalChallengesCompleted = (p.totalChallengesCompleted || 0) + 1;
  if (ch.walkthroughDone && ch.recallDone) {
    const rp = (ch.practiceAttempts || []).slice(-5);
    const pa = rp.length > 0 ? rp.filter(a => a.correct).length / rp.length : 0;
    if (pct >= 0.8 && pa >= 0.6) { ch.masteryLevel = 5; p.weakChapterIds = p.weakChapterIds.filter(id => id !== chId); }
    else if (pct >= 0.6) ch.masteryLevel = Math.max(ch.masteryLevel, 4);
    else ch.masteryLevel = Math.max(ch.masteryLevel, 3);
  }
  p.chapters[chId] = ch; updateStreak(p); saveProgress(slug, p); return { p, ch };
}

export function getCourseStats(slug, chapters = []) {
  const p = getProgress(slug);
  const total = chapters.length || 1;
  let started = 0, completed = 0, mastered = 0, pts = 0;
  chapters.forEach(ch => {
    const cp = p.chapters[ch.id || ch.num] || {};
    const lvl = cp.masteryLevel || 0;
    pts += lvl;
    if (lvl >= 1) started++;
    if (lvl >= 3) completed++;
    if (lvl >= 5) mastered++;
  });
  return { total, started, completed, mastered,
    overallPct: Math.round((pts / (total * 5)) * 100),
    streak: p.streak || 0,
    weakAreas: (p.weakChapterIds || []).length,
    recallDue: (p.recallDue || []).length,
    totalChallengesCompleted: p.totalChallengesCompleted || 0 };
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
  if (!ch.lessonRead) return 'learn';
  if (!ch.walkthroughDone) return 'walkthrough';
  if (!ch.recallDone) return 'recall';
  if (!(ch.practiceAttempts || []).length) return 'practice';
  if (!(ch.challengeScores || []).length) return 'challenge';
  return ch.masteryLevel >= 5 ? 'mastered' : 'review';
}
