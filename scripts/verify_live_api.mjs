import fs from 'fs';

async function verifyLiveApi() {
  const forbidden = [
    'correct_key',
    'correct_text',
    'explanation',
    'correct_answer',
    'pairs',
    'blanks'
  ];

  console.log('================================================================');
  console.log('1. VERIFYING REGULATORY MASTER ENDPOINTS (Live HTTP GET)');
  console.log('================================================================');

  const courses = ['ifsca-cmi', 'sebi-aif', 'ifsca-fme'];
  const sampleQuestionsByCourse = {};

  for (const course of courses) {
    const url = `http://localhost:5000/api/regulatory-master/${course}/items`;
    console.log(`\n--> Fetching: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`HTTP error ${res.status} for ${course}`);
      continue;
    }
    const rawJson = await res.text();
    const parsed = JSON.parse(rawJson);
    console.log(`HTTP Status: ${res.status} OK | Total Items: ${parsed.items.length}`);

    // Check raw JSON for forbidden keys
    let foundForbidden = 0;
    for (const key of forbidden) {
      const re = new RegExp(`"${key}"\\s*:`, 'g');
      const matches = rawJson.match(re);
      if (matches) {
        console.error(`  ❌ SECURITY LEAK: Found forbidden key "${key}" ${matches.length} time(s)`);
        foundForbidden += matches.length;
      }
    }
    if (foundForbidden === 0) {
      console.log(`  ✅ Clean! No forbidden keys ("${forbidden.join('", "')}") found in raw JSON for ${course}.`);
    }

    // Inspect at least 3 distinct sample questions
    const questionItems = parsed.items.filter(i => i.itemType !== 'lesson' && i.type !== 'lesson');
    sampleQuestionsByCourse[course] = questionItems;
    console.log(`  (Found ${questionItems.length} question items in ${course})`);

    const sampleIndices = [0, Math.floor(questionItems.length / 2), questionItems.length - 1];
    sampleIndices.forEach(idx => {
      const q = questionItems[idx];
      if (q) {
        console.log(`\n  [Sample Question from ${course} at index ${idx}] UID: ${q.uid} | Type: ${q.type || q.itemType}`);
        console.log('  Keys present in raw response:', Object.keys(q));
        console.log('  Sample Question Body:');
        console.log(JSON.stringify(q, null, 2).split('\n').map(l => '    ' + l).join('\n'));
      }
    });
  }

  console.log('\n================================================================');
  console.log('2. VERIFYING EXAM READY ENDPOINT (Live HTTP GET)');
  console.log('================================================================');

  const examUrl = 'http://localhost:5000/api/exam-ready/questions';
  console.log(`\n--> Fetching: ${examUrl}`);
  const resExam = await fetch(examUrl);
  const rawExamJson = await resExam.text();
  const parsedExam = JSON.parse(rawExamJson);
  console.log(`HTTP Status: ${resExam.status} OK | Total Questions: ${parsedExam.questions.length}`);

  let foundForbiddenExam = 0;
  for (const key of forbidden) {
    const re = new RegExp(`"${key}"\\s*:`, 'g');
    const matches = rawExamJson.match(re);
    if (matches) {
      console.error(`  ❌ SECURITY LEAK: Found forbidden key "${key}" ${matches.length} time(s)`);
      foundForbiddenExam += matches.length;
    }
  }
  if (foundForbiddenExam === 0) {
    console.log(`  ✅ Clean! No forbidden keys ("${forbidden.join('", "')}") found in ExamReady questions.`);
  }

  [0, 24, 74].forEach(idx => {
    const q = parsedExam.questions[idx];
    if (q) {
      console.log(`\n  [ExamReady Sample Question at index ${idx}] Code: ${q.question_code} | Topic: ${q.topic_name}`);
      console.log('  Keys present in raw response:', Object.keys(q));
      console.log('  Sample Question Body:');
      console.log(JSON.stringify(q, null, 2).split('\n').map(l => '    ' + l).join('\n'));
    }
  });

  console.log('\n================================================================');
  console.log('3. VERIFYING SUBMISSION ENDPOINTS (Answers & Explanations Revealed POST-SUBMISSION ONLY)');
  console.log('================================================================');

  // Login test user
  console.log('\n--> Logging in test user...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'verify_real_user@example.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Logged in successfully. User ID:', loginData.user.id);

  // 3a. Submit MCQ (CMI: M1-MCQ-001)
  console.log('\n--> Testing MCQ Submission (CMI: M1-MCQ-001)...');
  const cmiSubmitRes = await fetch('http://localhost:5000/api/regulatory-master/ifsca-cmi/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ uid: 'M1-MCQ-001', answer: 'A' })
  });
  const cmiSubmitData = await cmiSubmitRes.json();
  console.log('HTTP Status:', cmiSubmitRes.status);
  console.log('Regulatory Master CMI (MCQ) Submit Response Body:');
  console.log(JSON.stringify(cmiSubmitData, null, 2));

  // 3b. Submit True/False (CMI: X1-TF-001)
  console.log('\n--> Testing True/False Submission (CMI: X1-TF-001)...');
  const tfSubmitRes = await fetch('http://localhost:5000/api/regulatory-master/ifsca-cmi/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ uid: 'X1-TF-001', answer: 'false' })
  });
  const tfSubmitData = await tfSubmitRes.json();
  console.log('HTTP Status:', tfSubmitRes.status);
  console.log('Regulatory Master CMI (True/False) Submit Response Body:');
  console.log(JSON.stringify(tfSubmitData, null, 2));

  // 3c. Submit Fill-in-the-blank (CMI: X1-FB-001)
  console.log('\n--> Testing Fill-in-the-blank Submission (CMI: X1-FB-001)...');
  const fillSubmitRes = await fetch('http://localhost:5000/api/regulatory-master/ifsca-cmi/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ uid: 'X1-FB-001', answer: '11' })
  });
  const fillSubmitData = await fillSubmitRes.json();
  console.log('HTTP Status:', fillSubmitRes.status);
  console.log('Regulatory Master CMI (Fill) Submit Response Body:');
  console.log(JSON.stringify(fillSubmitData, null, 2));

  // 3d. Submit AIF MCQ (AIF: M1-MCQ-001)
  console.log('\n--> Testing AIF MCQ Submission (AIF: M1-MCQ-001)...');
  const aifSubmitRes = await fetch('http://localhost:5000/api/regulatory-master/sebi-aif/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ uid: 'M1-MCQ-001', answer: 'A' })
  });
  const aifSubmitData = await aifSubmitRes.json();
  console.log('HTTP Status:', aifSubmitRes.status);
  console.log('Regulatory Master AIF Submit Response Body:');
  console.log(JSON.stringify(aifSubmitData, null, 2));

  // 3e. Submit FME MCQ (FME: M1-MC-001)
  console.log('\n--> Testing FME MCQ Submission (FME: M1-MC-001)...');
  const fmeSubmitRes = await fetch('http://localhost:5000/api/regulatory-master/ifsca-fme/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ uid: 'M1-MC-001', answer: 'A' })
  });
  const fmeSubmitData = await fmeSubmitRes.json();
  console.log('HTTP Status:', fmeSubmitRes.status);
  console.log('Regulatory Master FME Submit Response Body:');
  console.log(JSON.stringify(fmeSubmitData, null, 2));

  // 3f. Mark Lesson Complete
  console.log('\n--> Testing Mark Lesson Complete (CMI: les-cmi-01)...');
  const markLessonRes = await fetch('http://localhost:5000/api/regulatory-master/ifsca-cmi/mark-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ uid: 'les-cmi-01', markAs: 'complete' })
  });
  const markLessonData = await markLessonRes.json();
  console.log('Mark Lesson HTTP Status:', markLessonRes.status, markLessonData.message);

  // 3g. Submit ExamReady Test
  console.log('\n--> Submitting test to ExamReady (POST /api/exam-ready/submit-test)...');
  const examSubmitRes = await fetch('http://localhost:5000/api/exam-ready/submit-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      answers: [
        { question_code: 'CMI-S001', selected: 'A' }, // Correct (+1)
        { question_code: 'CMI-S002', selected: 'D' }, // Wrong (-0.25)
        { question_code: 'CMI-S003', selected: 'C' }  // Correct (+1)
      ]
    })
  });
  const examSubmitData = await examSubmitRes.json();
  console.log('HTTP Status:', examSubmitRes.status);
  console.log('ExamReady Summary Score:', {
    rawScore: examSubmitData.rawScore,
    maxScore: examSubmitData.maxScore,
    percentage: examSubmitData.percentage,
    passed: examSubmitData.passed,
    correct: examSubmitData.correct,
    wrong: examSubmitData.wrong,
    unanswered: examSubmitData.unanswered,
    attemptSaved: examSubmitData.attemptSaved
  });

  console.log('\n================================================================');
  console.log('4. VERIFYING MONGODB ATLAS PERSISTENCE (GET /api/auth/me)');
  console.log('================================================================');
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log('User Course Progress persisted in Atlas:', JSON.stringify(meData.user.courseProgress, null, 2));
  console.log('User ExamReady Attempts persisted in Atlas:', JSON.stringify(meData.user.examReadyAttempts, null, 2));
}

verifyLiveApi().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
