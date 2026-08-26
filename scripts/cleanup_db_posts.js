import mongoose from '../server/node_modules/mongoose/index.js';
import dotenv from '../server/node_modules/dotenv/lib/main.js';
import BlogPost from '../server/models/BlogPost.js';

dotenv.config({ path: './server/.env' });

(async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/regmate';
    await mongoose.connect(MONGO_URI);
    const posts = await BlogPost.find({}).lean();
    console.log('Total posts in MongoDB:', posts.length);
    posts.forEach((p, idx) => {
      console.log(`[${idx + 1}] ID: ${p._id} | Slug: ${p.slug} | Title: "${p.title}" | Status: ${p.status}`);
    });
    
    // Remove test posts if they are test fixtures
    const deleteRes = await BlogPost.deleteMany({
      $or: [
        { slug: { $regex: /^bulk-test-post/i } },
        { title: { $regex: /^bulk test post/i } }
      ]
    });
    console.log('Deleted bulk test posts:', deleteRes.deletedCount);

    // Also check for duplicate slugs or duplicate titles in MongoDB and remove duplicates
    const remainingPosts = await BlogPost.find({}).lean();
    const seenSlugs = new Set();
    const seenTitles = new Set();
    for (const post of remainingPosts) {
      if (seenSlugs.has(post.slug) || seenTitles.has(post.title)) {
        console.log(`Removing duplicate post ID: ${post._id} Slug: ${post.slug} Title: "${post.title}"`);
        await BlogPost.deleteOne({ _id: post._id });
      } else {
        seenSlugs.add(post.slug);
        seenTitles.add(post.title);
      }
    }

    const finalPosts = await BlogPost.find({}).lean();
    console.log('\nFinal unique posts in MongoDB:', finalPosts.length);
    finalPosts.forEach((p, idx) => {
      console.log(`[${idx + 1}] ID: ${p._id} | Slug: ${p.slug} | Title: "${p.title}"`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('DB Error:', err.message);
  }
})();
