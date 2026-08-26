import mongoose from '../server/node_modules/mongoose/index.js';
import dotenv from '../server/node_modules/dotenv/lib/main.js';
import BlogPost from '../server/models/BlogPost.js';

dotenv.config({ path: './server/.env' });

(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/regmate';
  await mongoose.connect(MONGO_URI);
  const posts = await BlogPost.find({}).lean();
  console.log('Total posts in MongoDB:', posts.length);
  posts.forEach((p, idx) => {
    console.log(`[${idx + 1}] ID: ${p._id} | Slug: ${p.slug} | Title: "${p.title}" | Status: ${p.status} | Content: "${(p.content || '').slice(0, 50)}"`);
  });
  await mongoose.disconnect();
})();
