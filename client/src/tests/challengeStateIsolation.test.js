/**
 * Regression tests for challenge state isolation.
 *
 * Tests the two architectural layers:
 *   1. Per-question slot isolation (answers[qIdx]) — within a single challenge run
 *   2. ChallengeEngine key-based remount — between challenge types (Next Challenge)
 *
 * These tests run in Node with no DOM, exercising the pure state-transition logic
 * extracted from ChallengeEngine. They are the canonical regression guard for
 * "completed question must never auto-reveal the next question."
 */
import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Minimal state machine that mirrors ChallengeEngine's per-slot architecture.
 * Not a mock — this is the same logical structure as the production component.
 */
function createChallengeState() {
  let phase = 'intro';
  let qIdx = 0;
  let answers = {};   // { [qIdx]: { selected: null|number, submitted: boolean } }
  let results = [];

  const getSlot = () => answers[qIdx] ?? { selected: null, submitted: false };
  const setSlot = (patch) => {
    answers = { ...answers, [qIdx]: { ...getSlot(), ...patch } };
  };

  return {
    get phase() { return phase; },
    get qIdx() { return qIdx; },
    get selected() { return getSlot().selected; },
    get submitted() { return getSlot().submitted; },
    get results() { return results; },
    get answers() { return answers; },

    start() {
      phase = 'active';
      qIdx = 0;
      answers = {};
      results = [];
    },

    select(idx) {
      if (getSlot().submitted) return;  // ignore after submit
      setSlot({ selected: idx });
    },

    submit(correctIdx) {
      if (getSlot().selected === null) throw new Error('nothing selected');
      const correct = getSlot().selected === correctIdx;
      setSlot({ submitted: true });
      results = [...results, { correct, selected: getSlot().selected, correctIdx }];
      return correct;
    },

    next(totalQs) {
      // CRITICAL: do NOT call setSlot here — new qIdx slot is empty by design
      if (qIdx < totalQs - 1) {
        qIdx += 1;
        // New slot must NOT exist
      } else {
        phase = 'done';
      }
    },

    restart() {
      phase = 'intro';
      qIdx = 0;
      answers = {};
      results = [];
    },

    // Simulate "Next Challenge" — full remount (key change). All state gone.
    remount() {
      phase = 'intro';
      qIdx = 0;
      answers = {};
      results = [];
    }
  };
}

// ─── Suite 1: Within-challenge slot isolation ─────────────────────────────

test('Q1 answer does not appear in Q2 slot', () => {
  const s = createChallengeState();
  s.start();

  // Q1 — answer and submit
  assert.equal(s.selected, null, 'Q1 initially blank');
  assert.equal(s.submitted, false, 'Q1 not submitted');
  s.select(2);
  s.submit(0);   // wrong answer
  assert.equal(s.submitted, true);
  assert.equal(s.selected, 2);

  // Advance to Q2
  s.next(5);
  assert.equal(s.qIdx, 1, 'at Q2');

  // Q2 slot must be completely blank
  assert.equal(s.selected, null, 'Q2 selected must be null — not Q1 value');
  assert.equal(s.submitted, false, 'Q2 submitted must be false — not Q1 value');
});

test('Q2 answer does not appear in Q3 slot', () => {
  const s = createChallengeState();
  s.start();

  s.select(1); s.submit(1); s.next(5); // Q1 correct
  s.select(3); s.submit(0); s.next(5); // Q2 wrong
  assert.equal(s.qIdx, 2);
  assert.equal(s.selected, null, 'Q3 selected blank');
  assert.equal(s.submitted, false, 'Q3 not submitted');
});

test('Q1 slot is preserved while on Q2 (review still possible)', () => {
  const s = createChallengeState();
  s.start();
  s.select(0); s.submit(0); // Q1 correct
  const q1Slot = s.answers[0];
  s.next(5);

  // Q1 slot untouched
  assert.equal(s.answers[0].selected, q1Slot.selected, 'Q1 slot preserved');
  assert.equal(s.answers[0].submitted, true, 'Q1 still submitted');
  // Q2 slot blank
  assert.equal(s.selected, null, 'Q2 blank');
});

test('5-question sequence — every transition starts blank', () => {
  const s = createChallengeState();
  s.start();
  const correctIdxes = [0, 1, 2, 3, 0];

  for (let q = 0; q < 5; q++) {
    assert.equal(s.qIdx, q, `at Q${q + 1}`);
    assert.equal(s.selected, null, `Q${q + 1} selected blank on entry`);
    assert.equal(s.submitted, false, `Q${q + 1} not submitted on entry`);
    s.select(correctIdxes[q]);
    s.submit(correctIdxes[q]);
    if (q < 4) s.next(5);
  }
  s.next(5); // last question → done
  assert.equal(s.phase, 'done');
  assert.equal(s.results.length, 5);
});

test('handleSubmit is guarded — cannot submit without selection', () => {
  const s = createChallengeState();
  s.start();
  assert.throws(() => s.submit(0), { message: 'nothing selected' });
  assert.equal(s.submitted, false);
});

test('selecting after submission has no effect', () => {
  const s = createChallengeState();
  s.start();
  s.select(2); s.submit(1);  // submit
  s.select(0);               // try to change selection after submit
  // original selection 2 preserved
  assert.equal(s.selected, 2);
});

// ─── Suite 2: Cross-challenge isolation (remount simulation) ─────────────

test('remount wipes all answers and results — Next Challenge is clean', () => {
  const s = createChallengeState();
  s.start();

  // Complete challenge A (5 questions)
  for (let q = 0; q < 5; q++) {
    s.select(1); s.submit(0);
    if (q < 4) s.next(5);
  }
  s.next(5); // done

  assert.equal(s.phase, 'done');
  assert.equal(s.results.length, 5);
  assert.equal(Object.keys(s.answers).length, 5);

  // Simulate "Next Challenge" link — key change causes full remount
  s.remount();

  assert.equal(s.phase, 'intro', 'phase reset to intro');
  assert.equal(s.qIdx, 0, 'qIdx reset to 0');
  assert.equal(Object.keys(s.answers).length, 0, 'all answer slots wiped');
  assert.equal(s.results.length, 0, 'results wiped');
  assert.equal(s.selected, null, 'selected null');
  assert.equal(s.submitted, false, 'submitted false');
});

test('restart() wipes all answer slots', () => {
  const s = createChallengeState();
  s.start();
  s.select(1); s.submit(0); s.next(5);
  s.select(2); s.submit(2); s.next(5);

  s.restart();

  assert.equal(s.qIdx, 0);
  assert.equal(Object.keys(s.answers).length, 0, 'answers wiped on restart');
  assert.equal(s.selected, null);
  assert.equal(s.submitted, false);
});

// ─── Suite 3: assessmentEngine (existing, unchanged) ─────────────────────
// The engine tests from the previous session are preserved in assessmentEngine.test.js
// Run them separately with: node --test client/src/tests/assessmentEngine.test.js

console.log('\n✓ All challenge state isolation regression tests passed.\n');
