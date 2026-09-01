// scripts/test-scoring-accuracy.js
// Dedicated Automated Scoring & Accuracy Test Harness for RegLearn ProgressiveStepEngine

import puppeteer from 'puppeteer';

function calculateMastery(totalScored, correctFirstAttempts) {
  const accuracyPct = totalScored > 0 ? Math.round((correctFirstAttempts / totalScored) * 100) : 100;
  let masteryLevel = 1;
  if (accuracyPct >= 80) masteryLevel = 5;
  else if (accuracyPct >= 65) masteryLevel = 4;
  else if (accuracyPct >= 50) masteryLevel = 3;
  else if (accuracyPct >= 30) masteryLevel = 2;
  else masteryLevel = 1;

  const bonusXP = accuracyPct >= 80 ? 100 : accuracyPct >= 65 ? 50 : accuracyPct >= 50 ? 30 : 15;
  const totalEarnedXP = (correctFirstAttempts * 25) + bonusXP;

  return { accuracyPct, masteryLevel, totalEarnedXP, bonusXP };
}

function runUnitScoringTests() {
  console.log('=== RUNNING UNIT SCORING MATHEMATICAL TESTS ===\n');

  const testCases = [
    { total: 10, correct: 10, expectedPct: 100, expectedLvl: 5, expectedXP: 350, desc: '0 wrong out of 10 -> 100% Mastered' },
    { total: 10, correct: 9,  expectedPct: 90,  expectedLvl: 5, expectedXP: 325, desc: '1 wrong out of 10 -> 90% Mastered' },
    { total: 10, correct: 7,  expectedPct: 70,  expectedLvl: 4, expectedXP: 225, desc: '3 wrong out of 10 -> 70% Proficient' },
    { total: 10, correct: 5,  expectedPct: 50,  expectedLvl: 3, expectedXP: 155, desc: '5 wrong out of 10 -> 50% Practicing' },
    { total: 10, correct: 3,  expectedPct: 30,  expectedLvl: 2, expectedXP: 90,  desc: '7 wrong out of 10 -> 30% Familiar' },
    { total: 10, correct: 0,  expectedPct: 0,   expectedLvl: 1, expectedXP: 15,  desc: 'All 10 wrong -> 0% Needs Review' },
    { total: 3,  correct: 2,  expectedPct: 67,  expectedLvl: 4, expectedXP: 100, desc: 'SEBI AIF 1 wrong (2/3) -> 67% Proficient' },
    { total: 3,  correct: 0,  expectedPct: 0,   expectedLvl: 1, expectedXP: 15,  desc: 'SEBI AIF all wrong (0/3) -> 0% Needs Review' },
    { total: 12, correct: 6,  expectedPct: 50,  expectedLvl: 3, expectedXP: 180, desc: 'IFSCA CMI 6 wrong (6/12) -> 50% Practicing' },
    { total: 14, correct: 12, expectedPct: 86,  expectedLvl: 5, expectedXP: 400, desc: 'IFSCA FME 2 wrong (12/14) -> 86% Mastered' },
  ];

  let passed = 0;
  testCases.forEach((tc, idx) => {
    const res = calculateMastery(tc.total, tc.correct);
    const passPct = res.accuracyPct === tc.expectedPct;
    const passLvl = res.masteryLevel === tc.expectedLvl;
    const passXP = res.totalEarnedXP === tc.expectedXP;

    if (passPct && passLvl && passXP) {
      console.log(`✅ Test ${idx + 1} PASS: ${tc.desc} [acc=${res.accuracyPct}%, lvl=${res.masteryLevel}, xp=+${res.totalEarnedXP}]`);
      passed++;
    } else {
      console.error(`❌ Test ${idx + 1} FAIL: ${tc.desc} [Expected pct=${tc.expectedPct}, lvl=${tc.expectedLvl}, xp=${tc.expectedXP} | Got pct=${res.accuracyPct}, lvl=${res.masteryLevel}, xp=${res.totalEarnedXP}]`);
    }
  });

  console.log(`\nUnit Tests Result: ${passed} / ${testCases.length} Passed.\n`);
  if (passed !== testCases.length) process.exit(1);
}

async function getActiveBaseUrl() {
  const ports = [4173, 5173, 5174, 5175];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok) {
        console.log(`📡 Connected to frontend on port ${port}`);
        return `http://localhost:${port}`;
      }
    } catch {}
  }
  return 'http://localhost:4173';
}

async function runBrowserScoringTests() {
  console.log('=== RUNNING BROWSER E2E SCORING TESTS WITH INTENTIONAL WRONG ANSWERS ===\n');

  const baseUrl = await getActiveBaseUrl();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // Test Case 1: SEBI AIF with 1 intentional wrong answer (2 correct out of 3 -> 67% accuracy)
  console.log('🧪 Running Test Case 1: SEBI AIF (1 intentional wrong answer out of 3 questions)...');
  await page.goto(`${baseUrl}/learn`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(`${baseUrl}/learn/sebi-aif/chapter/1`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Click start learning if on hub overview
  const startBtn = await page.$('button[class*="bg-forest"], a[class*="bg-amber-400"]');
  if (startBtn) {
    const text = await page.evaluate(el => el.textContent, startBtn);
    if (text.includes('Start') || text.includes('Continue')) {
      await startBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  let stepCount = 0;
  let questionCount = 0;

  // Q1 correct is 0, Q2 correct is 1, Q3 correct is 2
  // For 1 wrong out of 3: Q1 wrong (choose 3), Q2 right (choose 1), Q3 right (choose 2)
  const choicesCase1 = [3, 1, 2];

  while (stepCount < 25) {
    stepCount++;
    await new Promise(r => setTimeout(r, 300));

    // Check if on Summary Step (last step)
    const summaryHeader = await page.evaluate(() => {
      const h2 = document.querySelector('h2');
      return h2 ? h2.textContent : '';
    });

    if (summaryHeader.includes('Module Mastered') || summaryHeader.includes('Module Completed')) {
      console.log(`🎯 Reached Summary Step: "${summaryHeader}"`);
      break;
    }

    // Check if question step
    const checkBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
      return btns.find(b => b.textContent.includes('Check Answer'));
    });

    if (checkBtn && checkBtn.asElement()) {
      const targetOptIdx = choicesCase1[questionCount] !== undefined ? choicesCase1[questionCount] : 0;
      questionCount++;
      const options = await page.$$('button[class*="border-2"]');
      if (options.length > targetOptIdx) {
        await options[targetOptIdx].click();
        console.log(`   👉 Question ${questionCount}: Clicked option index ${targetOptIdx}`);
        await new Promise(r => setTimeout(r, 200));

        // Click Check Answer
        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
          const b = btns.find(btn => btn.textContent.includes('Check Answer'));
          if (b) b.click();
        });
        await new Promise(r => setTimeout(r, 400));
      }
    }

    // Click Next
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
      const nextBtn = btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Complete Module'));
      if (nextBtn) nextBtn.click();
    });
  }

  // Inspect Final Summary Screen DOM
  const finalSummaryData = await page.evaluate(() => {
    const text = document.body.innerText;
    const h2 = document.querySelector('h2')?.textContent || '';
    return { text, h2 };
  });

  console.log('   Final Header:', finalSummaryData.h2);
  const statusMatches = finalSummaryData.text.match(/Status\s+([0-9]+%[^\n]+)/);
  const statusText = statusMatches ? statusMatches[1] : 'NOT FOUND';
  console.log('   Final Status Displayed:', statusText);

  if (statusText.includes('67%')) {
    console.log('✅ PASS Test Case 1: Final status correctly displays 67% accuracy (NOT hardcoded 80%)!');
  } else {
    console.error('❌ FAIL Test Case 1: Final status did not display 67% accuracy. Displayed:', statusText);
    await browser.close();
    process.exit(1);
  }

  // Test Case 2: SEBI AIF with ALL 3 intentional WRONG answers (0/3 -> 0% accuracy)
  console.log('\n🧪 Running Test Case 2: SEBI AIF (ALL 3 questions answered WRONG)...');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(`${baseUrl}/learn/sebi-aif/chapter/1`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  stepCount = 0;
  questionCount = 0;
  // Q1 correct 0 (choose 3), Q2 correct 1 (choose 3), Q3 correct 2 (choose 0)
  const choicesCase2 = [3, 3, 0];

  while (stepCount < 25) {
    stepCount++;
    await new Promise(r => setTimeout(r, 300));

    const summaryHeader = await page.evaluate(() => {
      const h2 = document.querySelector('h2');
      return h2 ? h2.textContent : '';
    });

    if (summaryHeader.includes('Module Mastered') || summaryHeader.includes('Module Completed')) {
      console.log(`🎯 Reached Summary Step: "${summaryHeader}"`);
      break;
    }

    const checkBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
      return btns.find(b => b.textContent.includes('Check Answer'));
    });

    if (checkBtn && checkBtn.asElement()) {
      const targetOptIdx = choicesCase2[questionCount] !== undefined ? choicesCase2[questionCount] : 0;
      questionCount++;
      const options = await page.$$('button[class*="border-2"]');
      if (options.length > targetOptIdx) {
        await options[targetOptIdx].click();
        console.log(`   👉 Question ${questionCount}: Clicked wrong option index ${targetOptIdx}`);
        await new Promise(r => setTimeout(r, 200));

        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
          const b = btns.find(btn => btn.textContent.includes('Check Answer'));
          if (b) b.click();
        });
        await new Promise(r => setTimeout(r, 400));
      }
    }

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
      const nextBtn = btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Complete Module'));
      if (nextBtn) nextBtn.click();
    });
  }

  const finalSummaryData2 = await page.evaluate(() => {
    const text = document.body.innerText;
    const h2 = document.querySelector('h2')?.textContent || '';
    return { text, h2 };
  });

  console.log('   Final Header:', finalSummaryData2.h2);
  const statusMatches2 = finalSummaryData2.text.match(/Status\s+([0-9]+%[^\n]+)/);
  const statusText2 = statusMatches2 ? statusMatches2[1] : 'NOT FOUND';
  console.log('   Final Status Displayed:', statusText2);

  if (statusText2.includes('0%') && finalSummaryData2.h2.includes('Needs Review')) {
    console.log('✅ PASS Test Case 2: Final status correctly displays 0% Accuracy and "Module Completed — Needs Review"!');
  } else {
    console.error('❌ FAIL Test Case 2: Final status was not 0%. Displayed:', statusText2);
    await browser.close();
    process.exit(1);
  }

  // Test Case 3: SEBI AIF with ALL 3 CORRECT answers (3/3 -> 100% Mastered)
  console.log('\n🧪 Running Test Case 3: SEBI AIF (ALL 3 questions answered CORRECT)...');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(`${baseUrl}/learn/sebi-aif/chapter/1`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  stepCount = 0;
  questionCount = 0;
  // Q1 correct 0, Q2 correct 1, Q3 correct 2
  const choicesCase3 = [0, 1, 2];

  while (stepCount < 25) {
    stepCount++;
    await new Promise(r => setTimeout(r, 300));

    const summaryHeader = await page.evaluate(() => {
      const h2 = document.querySelector('h2');
      return h2 ? h2.textContent : '';
    });

    if (summaryHeader.includes('Module Mastered') || summaryHeader.includes('Module Completed')) {
      console.log(`🎯 Reached Summary Step: "${summaryHeader}"`);
      break;
    }

    const checkBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
      return btns.find(b => b.textContent.includes('Check Answer'));
    });

    if (checkBtn && checkBtn.asElement()) {
      const targetOptIdx = choicesCase3[questionCount] !== undefined ? choicesCase3[questionCount] : 0;
      questionCount++;
      const options = await page.$$('button[class*="border-2"]');
      if (options.length > targetOptIdx) {
        await options[targetOptIdx].click();
        console.log(`   👉 Question ${questionCount}: Clicked correct option index ${targetOptIdx}`);
        await new Promise(r => setTimeout(r, 200));

        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
          const b = btns.find(btn => btn.textContent.includes('Check Answer'));
          if (b) b.click();
        });
        await new Promise(r => setTimeout(r, 400));
      }
    }

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
      const nextBtn = btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Complete Module'));
      if (nextBtn) nextBtn.click();
    });
  }

  const finalSummaryData3 = await page.evaluate(() => {
    const text = document.body.innerText;
    const h2 = document.querySelector('h2')?.textContent || '';
    return { text, h2 };
  });

  console.log('   Final Header:', finalSummaryData3.h2);
  const statusMatches3 = finalSummaryData3.text.match(/Status\s+([0-9]+%[^\n]+)/);
  const statusText3 = statusMatches3 ? statusMatches3[1] : 'NOT FOUND';
  console.log('   Final Status Displayed:', statusText3);

  if (statusText3.includes('100% Mastered') && finalSummaryData3.h2.includes('Module Mastered!')) {
    console.log('✅ PASS Test Case 3: Final status correctly displays "100% Mastered" and "Module Mastered!"!');
  } else {
    console.error('❌ FAIL Test Case 3: Final status was not 100% Mastered. Displayed:', statusText3);
    await browser.close();
    process.exit(1);
  }

  // Test Case 4: IFSCA CMI with 6 CORRECT and 6 WRONG answers (6/12 -> 50% Practicing)
  console.log('\n🧪 Running Test Case 4: IFSCA CMI (6 correct and 6 wrong out of 12 questions -> 50% accuracy)...');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(`${baseUrl}/learn/ifsca-cmi/chapter/1`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  stepCount = 0;
  questionCount = 0;
  // Q1-Q6 correct: [0, 1, 2, 3, 0, 1]
  // Q7-Q12 wrong: [1, 1, 1, 0, 1, 1] (all wrong against actual correct [0, 0, 0, 1, 0, 0])
  const choicesCase4 = [0, 1, 2, 3, 0, 1, 1, 1, 1, 0, 1, 1];

  while (stepCount < 35) {
    stepCount++;
    await new Promise(r => setTimeout(r, 250));

    const summaryHeader = await page.evaluate(() => {
      const h2 = document.querySelector('h2');
      return h2 ? h2.textContent : '';
    });

    if (summaryHeader.includes('Module Mastered') || summaryHeader.includes('Module Completed')) {
      console.log(`🎯 Reached Summary Step: "${summaryHeader}"`);
      break;
    }

    const checkBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
      return btns.find(b => b.textContent.includes('Check Answer'));
    });

    if (checkBtn && checkBtn.asElement()) {
      const targetOptIdx = choicesCase4[questionCount] !== undefined ? choicesCase4[questionCount] : 0;
      questionCount++;
      const options = await page.$$('button[class*="border-2"]');
      if (options.length > targetOptIdx) {
        await options[targetOptIdx].click();
        console.log(`   👉 Question ${questionCount}: Clicked option index ${targetOptIdx}`);
        await new Promise(r => setTimeout(r, 150));

        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
          const b = btns.find(btn => btn.textContent.includes('Check Answer'));
          if (b) b.click();
        });
        await new Promise(r => setTimeout(r, 300));
      }
    }

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('div.sticky.bottom-0 button'));
      const nextBtn = btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Complete Module'));
      if (nextBtn) nextBtn.click();
    });
  }

  const finalSummaryData4 = await page.evaluate(() => {
    const text = document.body.innerText;
    const h2 = document.querySelector('h2')?.textContent || '';
    return { text, h2 };
  });

  console.log('   Final Header:', finalSummaryData4.h2);
  const statusMatches4 = finalSummaryData4.text.match(/Status\s+([0-9]+%[^\n]+)/);
  const statusText4 = statusMatches4 ? statusMatches4[1] : 'NOT FOUND';
  console.log('   Final Status Displayed:', statusText4);

  if (statusText4.includes('50%') && finalSummaryData4.h2.includes('Practicing')) {
    console.log('✅ PASS Test Case 4: Final status correctly displays 50% Accuracy and "Module Completed — Practicing"!');
  } else {
    console.error('❌ FAIL Test Case 4: Final status was not 50% Practicing. Displayed:', statusText4);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
  console.log('\n🎉 ALL DEDICATED SCORING & ACCURACY TESTS (10 UNIT + 4 BROWSER E2E) PASSED SUCCESSFULLY!\n');
}

async function main() {
  runUnitScoringTests();
  await runBrowserScoringTests();
}

main().catch(err => {
  console.error('Error running scoring tests:', err);
  process.exit(1);
});
