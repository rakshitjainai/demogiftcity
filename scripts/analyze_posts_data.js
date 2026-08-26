import fs from 'fs';

const postsJson = JSON.parse(fs.readFileSync('./client/src/data/posts.json', 'utf-8'));
const postsSummary = JSON.parse(fs.readFileSync('./client/src/data/posts-summary.json', 'utf-8'));
const wpPosts = JSON.parse(fs.readFileSync('./server/data/wordpress-posts.json', 'utf-8'));

console.log('posts.json count:', postsJson.length);
console.log('posts-summary.json count:', postsSummary.length);
console.log('wordpress-posts.json count:', wpPosts.length);

console.log('\n--- First 15 posts in posts.json ---');
postsJson.slice(0, 15).forEach((p, i) => {
  console.log(`[${i+1}] ID: ${p.id} | Date: ${p.date} | Slug: ${p.slug} | Title: "${p.title}" | Cats: ${JSON.stringify(p.categories?.map(c => c.name || c))}`);
});

console.log('\n--- Last 15 posts in posts.json ---');
postsJson.slice(-15).forEach((p, i) => {
  console.log(`[${i+1}] ID: ${p.id} | Date: ${p.date} | Slug: ${p.slug} | Title: "${p.title}" | Cats: ${JSON.stringify(p.categories?.map(c => c.name || c))}`);
});
