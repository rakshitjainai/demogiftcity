import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const summaryPath = path.join(rootDir, 'client', 'src', 'data', 'posts-summary.json');
const postsPath = path.join(rootDir, 'client', 'src', 'data', 'posts.json');
const categoriesPath = path.join(rootDir, 'client', 'src', 'data', 'categories.json');

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

console.log('--- SANITY CHECKS ---');
console.log('1. Total Posts Count:', posts.length, posts.length === 192 ? '✅ PASSED' : '❌ FAILED');
console.log('2. Total Summary Count:', summary.length, summary.length === 192 ? '✅ PASSED' : '❌ FAILED');
console.log('3. Distinct Categories Count:', categories.length, categories.length > 0 ? '✅ PASSED' : '❌ FAILED');

// Spot check slugs
const checkSlugs = [
  'how-art-shapes-the-way-we-experience-everyday-life',
  'everyday-inspiration-how-art-and-design-spark-creativity',
  'from-passion-to-practice-the-journey-of-a-creative-mind'
];

checkSlugs.forEach(slug => {
  const p = posts.find(item => item.slug === slug);
  if (p) {
    console.log(`4. Spot check '${slug}': Found! Title: '${p.title}', Author: '${p.author}', Date: '${p.date}', Content Length: ${p.content.length} chars ✅ PASSED`);
  } else {
    console.log(`4. Spot check '${slug}': ❌ NOT FOUND`);
  }
});

// Check author resolution
const rawLoginsInAuthors = posts.filter(p => p.author === 'prashantmishra1986' || p.author === 'rachnakumar');
console.log('5. Raw login strings remaining in authors:', rawLoginsInAuthors.length, rawLoginsInAuthors.length === 0 ? '✅ PASSED' : '❌ FAILED');

// Check Gutenberg comments removed
const gutenbergCommentsRemaining = posts.filter(p => p.content.includes('<!-- wp:'));
console.log('6. Gutenberg comments remaining in content:', gutenbergCommentsRemaining.length, gutenbergCommentsRemaining.length === 0 ? '✅ PASSED' : '❌ FAILED');

// Check date formatting consistency
const datePattern = /^\d{1,2} [A-Z][a-z]{2} \d{4}$/;
const validDates = posts.filter(p => datePattern.test(p.date));
console.log('7. Valid formatted dates (e.g. "21 Jan 2026"):', validDates.length, 'out of 192', validDates.length === 192 ? '✅ PASSED' : '❌ FAILED');
