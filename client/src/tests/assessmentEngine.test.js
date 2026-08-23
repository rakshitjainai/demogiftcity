import test from 'node:test';
import assert from 'node:assert/strict';
import dataset from '../data/tools/regmate_regready_dataset.json' with { type: 'json' };

// Direct reference to the computeVerdict algorithm
function computeVerdict(control, ans, fyUnderReview = '2025-26') {
  if (!ans || !ans.primary) {
    return { code: 'un', label: 'Not Assessed' };
  }

  // Primary == 'no' branch
  if (ans.primary === 'no') {
    if (control.nature === 'mandatory') {
      return { code: 'red', label: 'Potential Exception' };
    } else {
      return { code: 'na', label: 'Not Applicable' };
    }
  }

  // Primary == 'yes' branch
  let amberFloor = false;

  // 3a. PA-28 rotation override
  if (control.control_id === 'PA-28' && ans.rotFY) {
    const currentYr = parseInt(String(fyUnderReview).slice(0, 4) || '2026', 10);
    const startYr = parseInt(String(ans.rotFY).slice(0, 4) || '2026', 10);
    const years = currentYr - startYr + 1;
    if (years > 3) {
      return { code: 'red', label: 'Potential Exception' };
    }
    if (years === 3) {
      amberFloor = true;
    }
  }

  // 3b. Critical sufficiency checks
  const critIndices = control.critical_suff || [];
  for (const idx of critIndices) {
    if (ans.suff?.[idx] === 'n') {
      return { code: 'red', label: 'Potential Exception' };
    }
  }

  // 3c. Any sufficiency == 'n'
  const suffValues = Object.values(ans.suff || {});
  if (suffValues.some(v => v === 'n')) {
    return { code: 'amber', label: 'Evidence Gap' };
  }

  // 3d. Evidence check
  const hasEvidence = (ans.ev || []).length > 0;
  if ((control.evidence_options || []).length > 0 && !hasEvidence) {
    return { code: 'amber', label: 'Evidence Gap' };
  }

  // 3e. Incomplete sufficiency set
  const totalSuff = (control.sufficiency_questions || []).length;
  const answeredSuffCount = Object.keys(ans.suff || {}).filter(k => ans.suff[k] === 'y' || ans.suff[k] === 'n').length;
  if (totalSuff > 0 && answeredSuffCount < totalSuff) {
    return { code: 'amber', label: 'Evidence Gap' };
  }

  // 3f. Final green / amber_floor
  if (amberFloor) {
    return { code: 'amber', label: 'Evidence Gap' };
  }

  return { code: 'green', label: 'Likely Compliant' };
}

test('1. computeVerdict returns "un" when unassessed', () => {
  const pa01 = dataset.controls.find(c => c.control_id === 'PA-01');
  const v = computeVerdict(pa01, null);
  assert.equal(v.code, 'un');
});

test('2. computeVerdict returns "red" when mandatory control is answered "no"', () => {
  const pa01 = dataset.controls.find(c => c.control_id === 'PA-01');
  assert.equal(pa01.nature, 'mandatory');
  const v = computeVerdict(pa01, { primary: 'no' });
  assert.equal(v.code, 'red');
});

test('3. computeVerdict returns "na" when event-based control did not arise ("no")', () => {
  const pa22 = dataset.controls.find(c => c.control_id === 'PA-22');
  assert.equal(pa22.nature, 'event');
  const v = computeVerdict(pa22, { primary: 'no' });
  assert.equal(v.code, 'na');
});

test('4. computeVerdict returns "green" when mandatory control is answered "yes", all suff "y", and evidence selected', () => {
  const pa01 = dataset.controls.find(c => c.control_id === 'PA-01');
  const v = computeVerdict(pa01, {
    primary: 'yes',
    suff: { 0: 'y', 1: 'y' },
    ev: [0]
  });
  assert.equal(v.code, 'green');
});

test('5. computeVerdict returns "red" when critical sufficiency check fails', () => {
  const pa01 = dataset.controls.find(c => c.control_id === 'PA-01');
  assert.deepEqual(pa01.critical_suff, [1]);
  const v = computeVerdict(pa01, {
    primary: 'yes',
    suff: { 0: 'y', 1: 'n' }, // critical check index 1 failed
    ev: [0]
  });
  assert.equal(v.code, 'red');
});

test('6. computeVerdict returns "amber" when non-critical sufficiency check fails', () => {
  const pa03 = dataset.controls.find(c => c.control_id === 'PA-03');
  assert.deepEqual(pa03.critical_suff, []);
  const v = computeVerdict(pa03, {
    primary: 'yes',
    suff: { 0: 'n', 1: 'y' },
    ev: [0]
  });
  assert.equal(v.code, 'amber');
});

test('7. computeVerdict returns "amber" when evidence is missing', () => {
  const pa01 = dataset.controls.find(c => c.control_id === 'PA-01');
  const v = computeVerdict(pa01, {
    primary: 'yes',
    suff: { 0: 'y', 1: 'y' },
    ev: [] // no evidence selected
  });
  assert.equal(v.code, 'amber');
});

test('8. PA-28 auditor rotation override: > 3 years gives "red", 3 years gives "amber" floor', () => {
  const pa28 = dataset.controls.find(c => c.control_id === 'PA-28');
  
  // 4 years: 2022-23 to 2025-26 -> red
  const v4 = computeVerdict(pa28, {
    primary: 'yes',
    rotFY: '2022-23',
    suff: { 0: 'y', 1: 'y' },
    ev: [0]
  }, '2025-26');
  assert.equal(v4.code, 'red');

  // 3 years: 2023-24 to 2025-26 -> amber floor
  const v3 = computeVerdict(pa28, {
    primary: 'yes',
    rotFY: '2023-24',
    suff: { 0: 'y', 1: 'y' },
    ev: [0]
  }, '2025-26');
  assert.equal(v3.code, 'amber');

  // 1 year: 2025-26 to 2025-26 -> green
  const v1 = computeVerdict(pa28, {
    primary: 'yes',
    rotFY: '2025-26',
    suff: { 0: 'y', 1: 'y' },
    ev: [0]
  }, '2025-26');
  assert.equal(v1.code, 'green');
});
