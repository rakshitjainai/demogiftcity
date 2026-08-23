import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
import BlogPost from '../models/BlogPost.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = path.join(__dirname, '..', 'data', 'wordpress-posts.json');

let _staticPosts = null;

function getStaticPosts() {
  if (_staticPosts) return _staticPosts;
  if (fs.existsSync(POSTS_FILE)) {
    try {
      const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
      _staticPosts = JSON.parse(raw);
    } catch (e) {
      _staticPosts = [];
    }
  } else {
    _staticPosts = [];
  }
  return _staticPosts;
}

// Allowed HTML tags and attributes for rich text sanitization
const SANITIZE_OPTIONS = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe',
    'img', 'span', 'u', 's', 'mark'
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'style', 'class'],
    span: ['style', 'class'],
    p: ['style', 'class'],
    div: ['style', 'class'],
    h1: ['style', 'class'],
    h2: ['style', 'class'],
    h3: ['style', 'class'],
    td: ['colspan', 'rowspan', 'style'],
    th: ['colspan', 'rowspan', 'style']
  },
  allowedStyles: {
    '*': {
      'color': [/^#(0-9a-f]{3,6})$/i, /^rgb\(/, /^hsl\(/, /^[a-z]+$/i],
      'background-color': [/^#(0-9a-f]{3,6})$/i, /^rgb\(/, /^hsl\(/, /^[a-z]+$/i],
      'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      'font-size': [/^\d+(px|em|rem|%)$/],
      'font-weight': [/^\d+$/, /^bold$/, /^normal$/]
    }
  },
  selfClosing: ['img', 'br', 'hr'],
  allowedSchemes: ['http', 'https', 'mailto', 'data']
};

// ─── 1. ADMIN-ONLY ROUTES (Must be defined BEFORE parameterized /:slugOrId) ──

// @route   GET /api/blogs/admin/all
// @desc    Get all blog posts including drafts for Admin Panel
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    let dbPosts = [];
    try {
      dbPosts = await BlogPost.find({}).sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.warn('DB fetch error in admin/all:', e.message);
    }
    const staticPosts = getStaticPosts().map(sp => ({ ...sp, status: 'published', isStatic: true }));

    const formattedDb = dbPosts.map(p => ({
      id: p._id.toString(),
      _id: p._id.toString(),
      isDynamic: true,
      title: p.title,
      subtitle: p.subtitle,
      slug: p.slug,
      content: p.content,
      coverImage: p.coverImage,
      category: p.category,
      regulatorId: p.regulatorId,
      tags: p.tags,
      author: p.author,
      status: p.status,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return res.json({
      ok: true,
      count: formattedDb.length + staticPosts.length,
      posts: [...formattedDb, ...staticPosts]
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   POST /api/blogs/admin/create
// @desc    Create new blog post with server-side HTML sanitization
router.post('/admin/create', requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, content, coverImage, category, regulatorId, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ ok: false, message: 'Title and content are required fields.' });
    }

    // Server-side HTML Sanitization (Prevents Stored XSS)
    const cleanContent = sanitizeHtml(content, SANITIZE_OPTIONS);

    // Generate clean slug
    const cleanSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const post = new BlogPost({
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      slug: cleanSlug,
      content: cleanContent,
      coverImage: coverImage || '',
      category: category || 'Regulatory Intelligence',
      regulatorId: (regulatorId || 'general').toLowerCase(),
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim()).filter(Boolean),
      author: {
        name: req.user.name || 'System Admin',
        email: req.user.email,
        picture: req.user.picture || ''
      },
      status: status === 'published' ? 'published' : 'draft',
      publishedAt: status === 'published' ? new Date() : null
    });

    await post.save();

    return res.status(201).json({
      ok: true,
      message: `Blog post ${post.status === 'published' ? 'published' : 'saved as draft'} successfully!`,
      post
    });
  } catch (err) {
    console.error('Error creating blog post:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   PUT /api/blogs/admin/:id
// @desc    Update existing blog post by MongoDB ID
router.put('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, coverImage, category, regulatorId, tags, status } = req.body;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    if (title) post.title = title.trim();
    if (subtitle !== undefined) post.subtitle = subtitle.trim();
    if (content) post.content = sanitizeHtml(content, SANITIZE_OPTIONS);
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (category) post.category = category;
    if (regulatorId) post.regulatorId = regulatorId.toLowerCase();
    if (tags) post.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);

    if (status) {
      if (status === 'published' && post.status !== 'published') {
        post.publishedAt = new Date();
      }
      post.status = status;
    }

    await post.save();

    return res.json({
      ok: true,
      message: 'Blog post updated successfully!',
      post
    });
  } catch (err) {
    console.error('Error updating blog post:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   DELETE /api/blogs/admin/:id
// @desc    Delete blog post by MongoDB ID
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    return res.json({
      ok: true,
      message: 'Blog post deleted successfully!'
    });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// ─── 2. PUBLIC ENDPOINTS ───────────────────────────────────────────────────

// @route   GET /api/blogs
// @desc    Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const { reg, category, search, limit = 50 } = req.query;

    let dbPosts = [];
    try {
      dbPosts = await BlogPost.find({ status: 'published' }).sort({ publishedAt: -1, createdAt: -1 }).lean();
    } catch (dbErr) {
      console.warn('MongoDB disconnected or empty, using static posts only:', dbErr.message);
    }

    const formattedDbPosts = dbPosts.map(p => ({
      id: p._id.toString(),
      _id: p._id.toString(),
      isDynamic: true,
      title: p.title,
      subtitle: p.subtitle || '',
      desc: p.subtitle || (p.content ? p.content.replace(/<[^>]+>/g, '').slice(0, 160) + '...' : ''),
      slug: p.slug,
      content: p.content,
      coverImage: p.coverImage || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
      category: p.category || 'Regulatory Intelligence',
      categories: [p.category || 'Regulatory Intelligence'],
      regulatorId: p.regulatorId || 'general',
      tags: p.tags || [],
      author: p.author?.name || 'RegMate Editorial Team',
      date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      status: p.status,
      createdAt: p.createdAt
    }));

    const staticPosts = getStaticPosts();
    let allPosts = [...formattedDbPosts, ...staticPosts];

    if (reg && reg !== 'all') {
      allPosts = allPosts.filter(p => (p.regulatorId || '').toLowerCase() === reg.toLowerCase());
    }

    if (category && category !== 'All') {
      allPosts = allPosts.filter(p =>
        p.category === category ||
        (Array.isArray(p.categories) && p.categories.includes(category))
      );
    }

    if (search) {
      const q = search.toLowerCase();
      allPosts = allPosts.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q))
      );
    }

    const resultLimit = parseInt(limit, 10);
    return res.json({
      ok: true,
      count: allPosts.length,
      posts: allPosts.slice(0, resultLimit)
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   GET /api/blogs/:slugOrId
// @desc    Get single blog post details by slug or ID
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;

    // Check MongoDB first
    try {
      let dbPost = await BlogPost.findOne({
        $or: [
          { slug: slugOrId },
          { _id: mongoose.Types.ObjectId.isValid(slugOrId) ? slugOrId : null }
        ]
      }).lean();

      if (dbPost && dbPost.status === 'published') {
        return res.json({
          ok: true,
          post: {
            id: dbPost._id.toString(),
            _id: dbPost._id.toString(),
            isDynamic: true,
            title: dbPost.title,
            subtitle: dbPost.subtitle || '',
            desc: dbPost.subtitle || '',
            slug: dbPost.slug,
            content: dbPost.content,
            coverImage: dbPost.coverImage,
            category: dbPost.category,
            categories: [dbPost.category],
            regulatorId: dbPost.regulatorId,
            tags: dbPost.tags,
            author: dbPost.author?.name || 'RegMate Editorial Team',
            date: dbPost.publishedAt ? new Date(dbPost.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            status: dbPost.status
          }
        });
      }
    } catch (e) {
      // Continue to static lookup
    }

    // Static fallback lookup
    const staticPosts = getStaticPosts();
    const post = staticPosts.find(p => p.id === slugOrId || p.slug === slugOrId);
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    return res.json({ ok: true, post });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

export default router;
