import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const possiblePaths = [
  path.join(rootDir, 'Wordpress data.txt'),
  path.join(rootDir, 'Wordpress_data.txt'),
  path.join(rootDir, 'client', 'Wordpress_data.txt'),
  path.join(rootDir, 'client', 'Wordpress data.txt')
];

let sourcePath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    sourcePath = p;
    break;
  }
}

if (!sourcePath) {
  console.error('CRITICAL ERROR: Wordpress_data.txt or Wordpress data.txt not found!');
  process.exit(1);
}

console.log(`Found WordPress export at: ${sourcePath}`);

const rawData = fs.readFileSync(sourcePath, 'utf8');
let data;
try {
  data = JSON.parse(rawData);
} catch (err) {
  console.error('CRITICAL ERROR: Failed to parse JSON:', err.message);
  process.exit(1);
}

if (!data || !data.rss || !data.rss.channel || !data.rss.channel.item) {
  console.error('CRITICAL ERROR: Invalid structure in WordPress JSON (missing rss.channel.item)');
  process.exit(1);
}

const allItems = data.rss.channel.item;
const courseTypes = [
  'rlcmi_course', 'rlcmi_chapter', 'rlcmi_lesson', 'rlcmi_question',
  'rlaif_course', 'rlaif_chapter', 'rlaif_lesson', 'rlaif_question'
];

const courseItems = allItems.filter(item => courseTypes.includes(item['wp:post_type']));
console.log(`Processing ${courseItems.length} course items...`);

const courseMap = {
  'ifsca-cmi': {
    id: 'mod-cmi',
    code: 'IFSCA-CMI',
    slug: 'ifsca-cmi',
    title: 'IFSCA (Capital Market Intermediaries) Regulations, 2025',
    description: 'In-depth guide covering regulatory approvals, net worth thresholds, governance, client onboarding, and statutory returns for GIFT City intermediaries.',
    chapters: {}
  },
  'sebi-aif': {
    id: 'mod-sebi-aif',
    code: 'SEBI-AIF',
    slug: 'sebi-aif',
    title: 'SEBI (Alternative Investment Funds) Regulations, 2012',
    description: 'Comprehensive 14-chapter interactive course covering Category I, II & III AIFs, Angel Funds, PPM structuring, accredited investors, valuation, and GARUDA filings.',
    chapters: {}
  }
};

courseItems.forEach(item => {
  const pt = item['wp:post_type'];
  const metas = Array.isArray(item['wp:postmeta']) ? item['wp:postmeta'] : (item['wp:postmeta'] ? [item['wp:postmeta']] : []);
  const metaMap = {};
  metas.forEach(m => {
    if (m && m['wp:meta_key']) {
      metaMap[m['wp:meta_key']] = m['wp:meta_value'];
    }
  });

  const rawSlug = metaMap['_rlcmi_course_slug'] || metaMap['_rlaif_course_slug'];
  const courseSlug = rawSlug === 'ifsca-cmi' || pt.startsWith('rlcmi') ? 'ifsca-cmi' : 'sebi-aif';
  const targetCourse = courseMap[courseSlug];

  if (pt.endsWith('_course')) {
    if (item.title) targetCourse.title = typeof item.title === 'string' ? item.title : item.title['#text'] || targetCourse.title;
  } else if (pt.endsWith('_chapter')) {
    const chNo = parseInt(metaMap['_rlcmi_chapter_no'] || metaMap['_rlaif_chapter_no'] || '1', 10);
    const band = metaMap['_rlcmi_band'] || metaMap['_rlaif_band'] || '';
    if (!targetCourse.chapters[chNo]) {
      targetCourse.chapters[chNo] = {
        num: chNo,
        title: item.title || `Chapter ${chNo}`,
        band,
        lessons: [],
        questions: []
      };
    } else {
      targetCourse.chapters[chNo].title = item.title || targetCourse.chapters[chNo].title;
      targetCourse.chapters[chNo].band = band || targetCourse.chapters[chNo].band;
    }
  } else if (pt.endsWith('_lesson')) {
    const chNo = parseInt(metaMap['_rlcmi_chapter_no'] || metaMap['_rlaif_chapter_no'] || '1', 10);
    const uid = metaMap['_rlcmi_uid'] || metaMap['_rlaif_uid'] || item['wp:post_name'];
    const payloadRaw = metaMap['_rlcmi_payload'] || metaMap['_rlaif_payload'];
    let payload = {};
    try {
      if (typeof payloadRaw === 'string') payload = JSON.parse(payloadRaw);
      else if (typeof payloadRaw === 'object') payload = payloadRaw;
    } catch (e) {
      console.warn(`Warning: Failed to parse lesson payload for ${uid}`, e.message);
    }

    if (!targetCourse.chapters[chNo]) {
      targetCourse.chapters[chNo] = { num: chNo, title: `Chapter ${chNo}`, band: '', lessons: [], questions: [] };
    }

    targetCourse.chapters[chNo].lessons.push({
      uid,
      title: item.title || uid,
      itemType: 'lesson',
      chapterNo: chNo,
      difficulty: metaMap['_rlcmi_difficulty'] || metaMap['_rlaif_difficulty'] || '1',
      source: metaMap['_rlcmi_src'] || metaMap['_rlaif_src'] || '',
      provision: metaMap['_rlcmi_prov'] || metaMap['_rlaif_prov'] || '',
      payload
    });
  } else if (pt.endsWith('_question')) {
    const chNo = parseInt(metaMap['_rlcmi_chapter_no'] || metaMap['_rlaif_chapter_no'] || '1', 10);
    const uid = metaMap['_rlcmi_uid'] || metaMap['_rlaif_uid'] || item['wp:post_name'];
    const payloadRaw = metaMap['_rlcmi_payload'] || metaMap['_rlaif_payload'];
    const answerRaw = metaMap['_rlcmi_answer'] || metaMap['_rlaif_answer'];
    let payload = {};
    let answer = {};
    try {
      if (typeof payloadRaw === 'string') payload = JSON.parse(payloadRaw);
      else if (typeof payloadRaw === 'object') payload = payloadRaw;
    } catch (e) {
      console.warn(`Warning: Failed to parse MCQ payload for ${uid}`, e.message);
    }
    try {
      if (typeof answerRaw === 'string') answer = JSON.parse(answerRaw);
      else if (typeof answerRaw === 'object') answer = answerRaw;
    } catch (e) {
      console.warn(`Warning: Failed to parse MCQ answer for ${uid}`, e.message);
    }

    if (!targetCourse.chapters[chNo]) {
      targetCourse.chapters[chNo] = { num: chNo, title: `Chapter ${chNo}`, band: '', lessons: [], questions: [] };
    }

    targetCourse.chapters[chNo].questions.push({
      uid,
      title: item.title || uid,
      itemType: 'mcq',
      chapterNo: chNo,
      difficulty: metaMap['_rlcmi_difficulty'] || metaMap['_rlaif_difficulty'] || '1',
      source: metaMap['_rlcmi_src'] || metaMap['_rlaif_src'] || '',
      provision: metaMap['_rlcmi_prov'] || metaMap['_rlaif_prov'] || '',
      payload,
      answer
    });
  }
});

// Finalize structure for output
const finalData = {};
for (const slug in courseMap) {
  const c = courseMap[slug];
  const sortedChapterKeys = Object.keys(c.chapters).map(Number).sort((a, b) => a - b);
  const chaptersList = sortedChapterKeys.map(k => c.chapters[k]);
  
  let totalLessons = 0;
  let totalQuestions = 0;
  chaptersList.forEach(ch => {
    totalLessons += ch.lessons.length;
    totalQuestions += ch.questions.length;
  });

  finalData[slug] = {
    id: c.id,
    code: c.code,
    slug: c.slug,
    title: c.title,
    description: c.description,
    totalChapters: chaptersList.length,
    totalLessons,
    totalQuestions,
    totalItems: totalLessons + totalQuestions,
    chapters: chaptersList
  };
}

const targetDir = path.join(rootDir, 'client', 'src', 'data');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const outputPath = path.join(targetDir, 'courses.json');
fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf8');

console.log(`Successfully generated courses.json at ${outputPath}:`);
for (const slug in finalData) {
  const course = finalData[slug];
  console.log(`- ${course.code}: ${course.totalChapters} chapters, ${course.totalLessons} lessons, ${course.totalQuestions} questions (Total: ${course.totalItems} items)`);
}
