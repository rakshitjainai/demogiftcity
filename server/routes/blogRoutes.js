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
const CLIENT_POSTS_FILE = path.join(__dirname, '..', '..', 'client', 'src', 'data', 'posts.json');

let _staticPosts = null;

function getStaticPosts() {
  if (_staticPosts && _staticPosts.length > 0) return _staticPosts;
  const filePath = fs.existsSync(POSTS_FILE) ? POSTS_FILE : (fs.existsSync(CLIENT_POSTS_FILE) ? CLIENT_POSTS_FILE : null);
  if (filePath) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      _staticPosts = parsed.map(p => {
        const derivedSlug = p.slug || (p.link ? p.link.replace(/\/$/, '').split('/').pop() : '') || p.id;
        return {
          ...p,
          slug: derivedSlug
        };
      });
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
// @desc    Get all blog posts with search, filter, status tab, and sorting
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const { status = 'all', search, category, regulator, sort = 'createdAt_desc' } = req.query;

    let filter = {};

    if (status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all' && category !== 'All') {
      filter.category = category;
    }

    if (regulator && regulator !== 'all') {
      filter.regulatorId = regulator.toLowerCase();
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { subtitle: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'createdAt_asc') sortOption = { createdAt: 1 };
    else if (sort === 'publishedAt_desc') sortOption = { publishedAt: -1 };
    else if (sort === 'updatedAt_desc') sortOption = { updatedAt: -1 };
    else if (sort === 'title_asc') sortOption = { title: 1 };
    else if (sort === 'title_desc') sortOption = { title: -1 };

    let dbPosts = [];
    try {
      dbPosts = await BlogPost.find(filter).sort(sortOption).lean();
    } catch (e) {
      console.warn('DB fetch error in admin/all:', e.message);
    }

    // Get count statistics for tabs
    const [totalCount, publishedCount, draftCount, trashCount] = await Promise.all([
      BlogPost.countDocuments({}),
      BlogPost.countDocuments({ status: 'published' }),
      BlogPost.countDocuments({ status: 'draft' }),
      BlogPost.countDocuments({ status: 'trash' })
    ]);

    // Static posts are only included if status === 'all' or 'published'
    let staticPosts = [];
    if (status === 'all' || status === 'published') {
      staticPosts = getStaticPosts().map(sp => ({ ...sp, status: 'published', isStatic: true }));
      if (category && category !== 'all' && category !== 'All') {
        staticPosts = staticPosts.filter(p => p.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        staticPosts = staticPosts.filter(p =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.desc && p.desc.toLowerCase().includes(q))
        );
      }
    }

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
      deletedAt: p.deletedAt,
      publishedAt: p.publishedAt,
      revisions: p.revisions || [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return res.json({
      ok: true,
      counts: {
        all: totalCount + getStaticPosts().length,
        published: publishedCount + getStaticPosts().length,
        draft: draftCount,
        trash: trashCount
      },
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

    const cleanContent = sanitizeHtml(content, SANITIZE_OPTIONS);

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
      publishedAt: status === 'published' ? new Date() : null,
      revisions: [{
        title: title.trim(),
        subtitle: (subtitle || '').trim(),
        content: cleanContent,
        savedBy: req.user.name || 'System Admin',
        savedAt: new Date()
      }]
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
// @desc    Update existing blog post with Revision Safety history
router.put('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, coverImage, category, regulatorId, tags, status } = req.body;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    // Save previous revision state (Revision Safety - keeps last 5 snapshots)
    if (post.title && post.content) {
      if (!post.revisions) post.revisions = [];
      post.revisions.unshift({
        title: post.title,
        subtitle: post.subtitle || '',
        content: post.content,
        savedBy: req.user.name || 'System Admin',
        savedAt: new Date()
      });
      if (post.revisions.length > 5) {
        post.revisions = post.revisions.slice(0, 5);
      }
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

// @route   POST /api/blogs/admin/:id/unpublish
// @desc    Unpublish post (revert back to draft without deleting)
router.post('/admin/:id/unpublish', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    post.status = 'draft';
    await post.save();

    return res.json({
      ok: true,
      message: 'Blog post unpublished and reverted to draft status.',
      post
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   POST /api/blogs/admin/:id/publish
// @desc    Publish a draft post
router.post('/admin/:id/publish', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();

    return res.json({
      ok: true,
      message: 'Blog post published successfully!',
      post
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   POST /api/blogs/admin/:id/duplicate
// @desc    Duplicate / Clone a post into a new draft template
router.post('/admin/:id/duplicate', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const original = await BlogPost.findById(id);
    if (!original) {
      return res.status(404).json({ ok: false, message: 'Source blog post not found.' });
    }

    const newTitle = `[Copy] ${original.title}`;
    const newSlug = original.slug + '-copy-' + Date.now().toString().slice(-4);

    const clonedPost = new BlogPost({
      title: newTitle,
      subtitle: original.subtitle,
      slug: newSlug,
      content: original.content,
      coverImage: original.coverImage,
      category: original.category,
      regulatorId: original.regulatorId,
      tags: original.tags,
      author: {
        name: req.user.name || 'System Admin',
        email: req.user.email,
        picture: req.user.picture || ''
      },
      status: 'draft',
      publishedAt: null,
      revisions: [{
        title: newTitle,
        subtitle: original.subtitle,
        content: original.content,
        savedBy: req.user.name || 'System Admin',
        savedAt: new Date()
      }]
    });

    await clonedPost.save();

    return res.status(201).json({
      ok: true,
      message: `Blog post duplicated successfully as new draft "${newTitle}"!`,
      post: clonedPost
    });
  } catch (err) {
    console.error('Error duplicating blog post:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   DELETE /api/blogs/admin/:id (Soft Delete / Move to Trash)
// @desc    Move blog post to Trash state instead of permanent data loss
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    post.status = 'trash';
    post.deletedAt = new Date();
    await post.save();

    return res.json({
      ok: true,
      message: `Blog post "${post.title}" moved to Trash. It can be restored from the Trash tab.`,
      post
    });
  } catch (err) {
    console.error('Error moving post to trash:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   POST /api/blogs/admin/:id/restore
// @desc    Restore soft-deleted post from Trash back to Draft
router.post('/admin/:id/restore', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    post.status = 'draft';
    post.deletedAt = null;
    await post.save();

    return res.json({
      ok: true,
      message: `Blog post "${post.title}" restored back to Draft status.`,
      post
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   DELETE /api/blogs/admin/:id/permanent
// @desc    Permanently delete post from MongoDB (Double confirmation required)
router.delete('/admin/:id/permanent', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    return res.json({
      ok: true,
      message: `Blog post "${post.title}" permanently deleted.`
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   POST /api/blogs/admin/bulk-action
// @desc    Bulk actions (trash, permanent-delete, publish, unpublish, restore) across selected post IDs
router.post('/admin/bulk-action', requireAdmin, async (req, res) => {
  try {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ ok: false, message: 'Please select at least one post for bulk action.' });
    }

    if (!['trash', 'permanent-delete', 'publish', 'unpublish', 'restore'].includes(action)) {
      return res.status(400).json({ ok: false, message: 'Invalid bulk action requested.' });
    }

    let resultMsg = '';

    if (action === 'trash') {
      await BlogPost.updateMany({ _id: { $in: ids } }, { status: 'trash', deletedAt: new Date() });
      resultMsg = `${ids.length} post(s) moved to Trash.`;
    } else if (action === 'permanent-delete') {
      await BlogPost.deleteMany({ _id: { $in: ids } });
      resultMsg = `${ids.length} post(s) permanently deleted.`;
    } else if (action === 'publish') {
      await BlogPost.updateMany({ _id: { $in: ids } }, { status: 'published', publishedAt: new Date() });
      resultMsg = `${ids.length} post(s) published successfully.`;
    } else if (action === 'unpublish') {
      await BlogPost.updateMany({ _id: { $in: ids } }, { status: 'draft' });
      resultMsg = `${ids.length} post(s) unpublished to Draft.`;
    } else if (action === 'restore') {
      await BlogPost.updateMany({ _id: { $in: ids } }, { status: 'draft', deletedAt: null });
      resultMsg = `${ids.length} post(s) restored from Trash to Draft.`;
    }

    return res.json({ ok: true, message: resultMsg });
  } catch (err) {
    console.error('Error executing bulk action:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   POST /api/blogs/admin/:id/restore-revision/:revisionIndex
// @desc    Restore a past revision from revision safety history
router.post('/admin/:id/restore-revision/:revisionIndex', requireAdmin, async (req, res) => {
  try {
    const { id, revisionIndex } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) return res.status(404).json({ ok: false, message: 'Blog post not found.' });

    const idx = parseInt(revisionIndex, 10);
    if (!post.revisions || !post.revisions[idx]) {
      return res.status(404).json({ ok: false, message: 'Selected revision snapshot not found.' });
    }

    const rev = post.revisions[idx];
    post.title = rev.title;
    post.subtitle = rev.subtitle;
    post.content = rev.content;

    await post.save();

    return res.json({
      ok: true,
      message: `Blog post restored to revision snapshot from ${new Date(rev.savedAt).toLocaleString()}!`,
      post
    });
  } catch (err) {
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

    // Filter out automated test posts and fixtures from DB results
    const cleanDbPosts = (dbPosts || []).filter(p => p && p.slug && !p.slug.startsWith('bulk-test-post'));

    const formattedDbPosts = cleanDbPosts.map(p => ({
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
      author: p.author?.name || 'CS Prashant Kumar',
      date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      status: p.status,
      createdAt: p.createdAt
    }));

    const staticPosts = getStaticPosts();
    let allPosts = [...formattedDbPosts, ...staticPosts];

    // Deduplicate by canonical slug and title so each article is completely unique
    const uniqueMap = new Map();
    for (const post of allPosts) {
      if (post && post.slug && !post.slug.startsWith('bulk-test-post')) {
        if (!uniqueMap.has(post.slug)) {
          uniqueMap.set(post.slug, post);
        }
      }
    }
    allPosts = Array.from(uniqueMap.values());

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
    const post = staticPosts.find(p => 
      p.slug === slugOrId || 
      p.id === slugOrId || 
      p.id === `wp-${slugOrId}` || 
      (p.link && p.link.replace(/\/$/, '').endsWith(`/${slugOrId}`))
    );
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    return res.json({ ok: true, post });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
});

export default router;
