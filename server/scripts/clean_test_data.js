import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function checkAndClean() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const BlogPost = mongoose.model('BlogPost', new mongoose.Schema({
    title: String,
    slug: String,
    content: String,
    status: String
  }, { strict: false }));

  // Search for any QA test artifacts
  const testArticles = await BlogPost.find({
    $or: [
      { title: { $regex: 'ALPHA|BETA|QA TEST|QA Run|FDI & Overseas Direct Investment Under New RBI Framework 2026', $options: 'i' } },
      { slug: { $regex: 'alpha|beta|qa-test|fdi-odi-qa', $options: 'i' } },
      { content: { $regex: 'UNIQUE_ALPHA_CONTENT|UNIQUE_BETA_CONTENT|QA TEST', $options: 'i' } }
    ]
  });

  console.log(`Found ${testArticles.length} test articles.`);
  for (const item of testArticles) {
    console.log(`  - Test Article to Delete: [${item._id}] "${item.title}" (slug: ${item.slug})`);
  }

  if (testArticles.length > 0) {
    const ids = testArticles.map(a => a._id);
    const deleteRes = await BlogPost.deleteMany({ _id: { $in: ids } });
    console.log(`Successfully purged ${deleteRes.deletedCount} test articles.`);
  } else {
    console.log('Zero test articles in database. Clean!');
  }

  // Inspect all remaining real production articles
  const allArticles = await BlogPost.find({}).select('title slug status category publishedAt createdAt');
  console.log(`\nRemaining Real Production Articles in DB (${allArticles.length}):`);
  allArticles.forEach((art, idx) => {
    console.log(`  ${idx + 1}. [${art.status.toUpperCase()}] ${art.title} (slug: /${art.slug})`);
  });

  await mongoose.disconnect();
}

checkAndClean().catch(err => {
  console.error('Error during cleanup check:', err);
  process.exit(1);
});
