const fs = require('fs');
const path = require('path');

const cmiPath = path.join(__dirname, 'reglearn/cmi/reglearn-cmi-content-final.json');
const fmePath = path.join(__dirname, 'reglearn/fme/reglearn-fme-content-final.json');
const aifPath = path.join(__dirname, 'reglearn/sebi-aif/reglearn-sebi-aif-content.json');

const cmiRaw = JSON.parse(fs.readFileSync(cmiPath, 'utf8'));
const fmeRaw = JSON.parse(fs.readFileSync(fmePath, 'utf8'));
const aifRaw = JSON.parse(fs.readFileSync(aifPath, 'utf8'));

function getUnitNum(act) {
  let num = act.chapter || act.module_id || act.chapter_no;
  if (num === 99 || !num) {
    const match = act.uid.match(/^(?:FX|X)(\d+)-/);
    if (match) num = parseInt(match[1], 10);
  }
  return num;
}

function normalizeActivity(act) {
  const type = act.type || act.activity_type;
  const p = act.payload || {};
  const ans = act.answer || {};
  
  let qText = p.question || p.q || p.scenario || act.title || '';
  if (p.provision_text) qText = p.provision_text + '\n\n' + qText;
  
  let options = [];
  let payloadOptions = [];
  
  if (p.options) {
    p.options.forEach((opt, idx) => {
      let key = String.fromCharCode(65 + idx);
      let text = '';
      if (typeof opt === 'string') {
        text = opt;
      } else {
        key = opt.key || opt.k || opt.id || key;
        text = opt.text || opt.t || opt.label || String(opt);
      }
      options.push({ key, text });
      payloadOptions.push(text);
    });
  } else if (type === 'truefalse') {
    options = [
      { key: 'true', text: 'True' },
      { key: 'false', text: 'False' }
    ];
    payloadOptions = ['True', 'False'];
  } else if (type === 'old_vs_new') {
    options = [
      { key: 'old', text: '2022 Framework (Old)' },
      { key: 'new', text: '2025/2026 Framework (New)' }
    ];
    payloadOptions = ['2022 Framework (Old)', '2025/2026 Framework (New)'];
  }

  let correctKey = ans.correct || p.answer;
  if (Array.isArray(correctKey)) correctKey = correctKey[0];
  if (typeof correctKey === 'string') correctKey = correctKey.trim();

  let explanation = ans.explanation || p.explanation || ans.summary || '';
  if (ans.lapses && Array.isArray(ans.lapses)) {
    explanation += '\n' + ans.lapses.map(l => l.title + ': ' + l.detail).join('\n');
  }

  let cards = [];
  if (p.cards && Array.isArray(p.cards)) {
    cards = p.cards.map(c => typeof c === 'string' ? { title: 'Concept Card', law: c } : c);
  } else if (p.story || p.hook_q || p.hook_a || p.remember || p.tip) {
    if (p.hook_q) cards.push({ title: p.hook_q, means: p.hook_a, tag: 'Hook' });
    if (p.story) cards.push({ title: 'Practical Context', law: p.story, tag: 'Story' });
    if (p.remember) cards.push({ title: 'Key Takeaway', means: p.remember, tag: 'Remember' });
    if (p.tip) cards.push({ title: 'Exam/Compliance Tip', means: p.tip, tag: 'Tip' });
  }

  let recallCards = [];
  if (cards.length > 0) {
    recallCards = cards.map(c => ({
      front: c.title || c.tag || 'Key Provision',
      back: c.means || c.law || c.back || 'Key regulatory requirement.',
      tag: c.tag || 'Recall'
    }));
  } else if (p.q && (ans.answer || ans.summary)) {
    recallCards.push({
      front: p.q,
      back: ans.answer || ans.summary,
      tag: 'Recall'
    });
  }

  return {
    uid: act.uid,
    type,
    title: act.title || qText.substring(0, 60),
    provision: act.prov || act.src || act.source || '',
    effectiveDate: act.eff || '',
    question: qText,
    options,
    correctKey,
    correctIdx: ['A', 'B', 'C', 'D'].indexOf(correctKey) !== -1 ? ['A', 'B', 'C', 'D'].indexOf(correctKey) : 0,
    explanation,
    cards,
    recallCards,
    payload: {
      q: qText,
      question: qText,
      options: payloadOptions,
      optionsFormatted: options,
      answer: correctKey,
      explanation,
      cards
    },
    answer: {
      correct: correctKey,
      explanation
    }
  };
}

function buildCourseData(slug, raw, meta) {
  let chaptersList = [];

  if (slug === 'ifsca-cmi') {
    chaptersList = raw.chapters.map(c => {
      const chActs = raw.activities.filter(a => getUnitNum(a) === c.no).map(normalizeActivity);
      const chConcepts = raw.concepts.filter(cp => cp.chapter === c.no);
      return {
        num: c.no,
        id: c.no,
        title: c.name,
        description: c.blurb || '',
        band: c.band || 'General',
        concepts: chConcepts,
        activities: chActs,
        lessons: chActs.filter(a => a.type === 'lesson' || a.type === 'deep_dive'),
        recall: chActs.filter(a => a.type === 'flash_recall'),
        questions: chActs.filter(a => a.type !== 'lesson' && a.type !== 'flash_recall')
      };
    });
  } else if (slug === 'ifsca-fme' || slug === 'fme-regulations') {
    const modules = raw.course ? raw.course.modules : [];
    chaptersList = modules.map(m => {
      const modActs = raw.activities.filter(a => getUnitNum(a) === m.module_id).map(normalizeActivity);
      const modConcepts = raw.concepts.filter(cp => cp.module === m.module_id);
      return {
        num: m.module_id,
        id: m.module_id,
        title: m.title,
        description: m.description || ('Module ' + m.module_id + ' of FME Regulations'),
        band: m.band || 'Core Module',
        concepts: modConcepts,
        activities: modActs,
        lessons: modActs.filter(a => a.type === 'lesson'),
        recall: modActs.filter(a => a.type === 'flash_recall'),
        questions: modActs.filter(a => a.type !== 'lesson' && a.type !== 'flash_recall')
      };
    });
  } else if (slug === 'sebi-aif') {
    chaptersList = raw.chapters.map(c => {
      const chActs = raw.activities.filter(a => getUnitNum(a) === c.chapter_no).map(normalizeActivity);
      const chConcepts = raw.concepts.filter(cp => cp.chapter_no === c.chapter_no);
      return {
        num: c.chapter_no,
        id: c.chapter_no,
        title: c.title,
        description: c.description || '',
        band: c.band || 'General',
        concepts: chConcepts,
        activities: chActs,
        lessons: chActs.filter(a => a.type === 'lesson'),
        recall: chActs.filter(a => a.type === 'flash_recall'),
        questions: chActs.filter(a => a.type !== 'lesson' && a.type !== 'flash_recall')
      };
    });
  }

  const totalLessons = chaptersList.reduce((sum, ch) => sum + ch.lessons.length, 0);
  const totalQuestions = chaptersList.reduce((sum, ch) => sum + ch.questions.length, 0);
  const totalActivities = chaptersList.reduce((sum, ch) => sum + ch.activities.length, 0);

  return {
    slug,
    title: meta.title,
    code: meta.code,
    regulator: meta.regulator,
    description: meta.description,
    badge: meta.badge,
    difficulty: meta.difficulty,
    durationHours: meta.durationHours,
    color: meta.color,
    accentColor: meta.accentColor,
    category: meta.category,
    totalChapters: chaptersList.length,
    totalLessons,
    totalQuestions,
    totalActivities,
    chapters: chaptersList
  };
}

const cmiMeta = {
  title: 'IFSCA (Capital Market Intermediaries) Regulations, 2025',
  code: 'IFSCA-CMI', regulator: 'IFSCA',
  description: 'In-depth study of registration, net worth, governance, code of conduct, and enforcement for all 11 CMI categories in GIFT IFSC.',
  badge: 'Updated 2026', difficulty: 'Intermediate', durationHours: 12,
  color: 'from-slate-900 via-slate-800 to-blue-900', accentColor: 'bg-blue-500', category: 'Capital Markets'
};

const fmeMeta = {
  title: 'IFSCA Fund Management (FME) Regulations',
  code: 'IFSCA-FME', regulator: 'IFSCA',
  description: 'Master fund structuring, venture capital schemes, retail schemes, special situation funds, ETFs, custody, and July 2025 & Jan 2026 amendments.',
  badge: 'Amended 2026', difficulty: 'Advanced', durationHours: 15,
  color: 'from-emerald-900 via-emerald-800 to-teal-900', accentColor: 'bg-emerald-500', category: 'Fund Management'
};

const aifMeta = {
  title: 'SEBI (Alternative Investment Funds) Regulations, 2012',
  code: 'SEBI-AIF', regulator: 'SEBI',
  description: 'Comprehensive study of Category I, II, and III AIFs, GARUDA green channel, continuing interest, Category III leverage, and 2022–2026 circulars.',
  badge: 'SEBI Master Circular 2026', difficulty: 'Advanced', durationHours: 14,
  color: 'from-amber-900 via-amber-800 to-orange-900', accentColor: 'bg-amber-500', category: 'Alternative Investments'
};

const cmi = buildCourseData('ifsca-cmi', cmiRaw, cmiMeta);
const fme = buildCourseData('ifsca-fme', fmeRaw, fmeMeta);
const aif = buildCourseData('sebi-aif', aifRaw, aifMeta);

const coursesDataObj = {
  'ifsca-cmi': cmi,
  'ifsca-fme': fme,
  'fme-regulations': fme,
  'sebi-aif': aif
};

const outputPath = path.join(__dirname, 'courses.json');
fs.writeFileSync(outputPath, JSON.stringify(coursesDataObj, null, 2), 'utf8');

console.log('✅ Generated courses.json successfully at:', outputPath);
