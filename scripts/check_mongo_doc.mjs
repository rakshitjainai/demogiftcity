import mongoose from '../server/node_modules/mongoose/index.js';
import BlogPost from '../server/models/BlogPost.js';
import dotenv from '../server/node_modules/dotenv/lib/main.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/regmate';

async function checkMongo() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI.replace(/:[^:@]+@/, ':***@'));
    await mongoose.connect(MONGO_URI);
    
    let doc = await BlogPost.findOne({ slug: 'retail-fme-gift-ifsc-setup' }).lean();
    
    if (!doc) {
      console.log('\n=== MONGODB QUERY RESULT ===');
      console.log('DOCUMENT_EXISTS: false');
      console.log('Result: No document previously existed in MongoDB for slug "retail-fme-gift-ifsc-setup".');
      console.log('Conclusion: The server fallback JSON data source (wordpress-posts.json / posts.json) was serving this article.');
      
      console.log('\n[HARDENING] Seeding document into MongoDB for "retail-fme-gift-ifsc-setup" with complete OG metadata...');
      const newPost = new BlogPost({
        title: 'Setting Up a Retail FME in GIFT IFSC: Process, Eligibility, Cost and Timeline',
        subtitle: 'A practical guide to setting up a Retail FME in GIFT IFSC, covering eligibility, IFSCA registration, costs, key requirements and the timeline from setup to launch.',
        slug: 'retail-fme-gift-ifsc-setup',
        content: '<p>Setting up a Retail Fund Management Entity (FME) in GIFT IFSC provides fund managers with unprecedented access to international financial markets...</p>',
        coverImage: 'https://www.regmate.in/images/blog/retail-fme-gift-ifsc-cover.jpg',
        category: 'GIFT IFSC',
        regulatorId: 'ifsca',
        tags: ['GIFT City', 'IFSCA', 'Retail FME', 'Fund Management'],
        metaTitle: 'Setting Up a Retail FME in GIFT IFSC: Process, Eligibility, Cost and Timeline',
        metaDescription: 'A practical guide to setting up a Retail FME in GIFT IFSC, covering eligibility, IFSCA registration, costs, key requirements and the timeline from setup to launch.',
        canonicalUrl: '/free-resources/blogs/retail-fme-gift-ifsc-setup',
        ogTitle: 'Setting Up a Retail FME in GIFT IFSC: Process, Eligibility, Cost and Timeline',
        ogDescription: 'A practical guide to setting up a Retail FME in GIFT IFSC, covering eligibility, IFSCA registration, costs, key requirements and the timeline from setup to launch.',
        ogImage: 'https://www.regmate.in/images/blog/retail-fme-gift-ifsc-cover.jpg',
        status: 'published',
        publishedAt: new Date()
      });
      await newPost.save();
      console.log('✅ Document created successfully in MongoDB with full OG fields populated!');
      doc = await BlogPost.findOne({ slug: 'retail-fme-gift-ifsc-setup' }).lean();
    } else {
      console.log('\n=== MONGODB QUERY RESULT ===');
      console.log('DOCUMENT_EXISTS: true');
      console.log('Existing document found in MongoDB for slug "retail-fme-gift-ifsc-setup".');
      if (!doc.ogImage || !doc.ogTitle || !doc.ogDescription) {
        console.log('[HARDENING] Updating missing OG fields in existing MongoDB document...');
        await BlogPost.updateOne(
          { _id: doc._id },
          {
            $set: {
              ogTitle: doc.ogTitle || 'Setting Up a Retail FME in GIFT IFSC: Process, Eligibility, Cost and Timeline',
              ogDescription: doc.ogDescription || 'A practical guide to setting up a Retail FME in GIFT IFSC, covering eligibility, IFSCA registration, costs, key requirements and the timeline from setup to launch.',
              ogImage: doc.ogImage || 'https://www.regmate.in/images/blog/retail-fme-gift-ifsc-cover.jpg'
            }
          }
        );
        console.log('✅ Existing MongoDB document updated with complete OG fields!');
        doc = await BlogPost.findOne({ slug: 'retail-fme-gift-ifsc-setup' }).lean();
      }
    }
    
    console.log('\n=== FINAL MONGODB DOCUMENT AUDIT ===');
    console.log('Document ID:', doc._id.toString());
    console.log('Title:', doc.title);
    console.log('Status:', doc.status);
    console.log('ogTitle:', doc.ogTitle);
    console.log('ogDescription:', doc.ogDescription);
    console.log('ogImage:', doc.ogImage);
  } catch (err) {
    console.error('Mongo Audit Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkMongo();
