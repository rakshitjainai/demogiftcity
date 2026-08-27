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

// Helper to normalize strings into URL-safe kebab-case slugs
function normalizeSlug(str = '') {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word, non-space, non-hyphen
    .replace(/[\s_]+/g, '-')  // replace spaces and underscores with hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
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
    a: ['href', 'name', 'target', 'rel', 'style', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'style', 'class'],
    span: ['style', 'class'],
    p: ['style', 'class'],
    div: ['style', 'class'],
    h1: ['style', 'class'],
    h2: ['style', 'class'],
    h3: ['style', 'class'],
    h4: ['style', 'class'],
    h5: ['style', 'class'],
    h6: ['style', 'class'],
    table: ['style', 'class', 'border', 'cellpadding', 'cellspacing'],
    tr: ['style', 'class'],
    td: ['colspan', 'rowspan', 'style', 'class'],
    th: ['colspan', 'rowspan', 'style', 'class'],
    blockquote: ['style', 'class']
  },
  allowedStyles: {
    '*': {
      'color': [/^#(0-9a-f]{3,6})$/i, /^rgb\(/, /^hsl\(/, /^[a-z]+$/i],
      'background-color': [/^#(0-9a-f]{3,6})$/i, /^rgb\(/, /^hsl\(/, /^[a-z]+$/i],
      'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      'font-size': [/^\d+(px|em|rem|%)$/],
      'font-weight': [/^\d+$/, /^bold$/, /^normal$/],
      'text-decoration': [/^underline$/, /^line-through$/, /^none$/],
      'border': [/.*$/],
      'border-radius': [/.*$/],
      'margin': [/.*$/],
      'padding': [/.*$/],
      'max-width': [/.*$/],
      'width': [/.*$/],
      'height': [/.*$/]
    }
  },
  selfClosing: ['img', 'br', 'hr'],
  allowedSchemes: ['http', 'https', 'mailto', 'data']
};

// ─── 1. ADMIN-ONLY ROUTES (Must be defined BEFORE parameterized /:slugOrId) ──

// @route   GET /api/blogs/admin/check-slug
// @desc    Validate slug uniqueness in real-time for Create/Edit forms
router.get('/admin/check-slug', requireAdmin, async (req, res) => {
  try {
    const { slug, excludeId } = req.query;
    if (!slug || !slug.trim()) {
      return res.json({ ok: true, available: false, message: 'Slug is empty.' });
    }

    const cleanSlug = normalizeSlug(slug);
    if (!cleanSlug) {
      return res.json({ ok: true, available: false, message: 'Invalid slug pattern.' });
    }

    // Check MongoDB for conflicting slug
    const query = { slug: cleanSlug };
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: excludeId };
    }
    const existingDb = await BlogPost.findOne(query).lean();

    if (existingDb) {
      return res.json({
        ok: true,
        available: false,
        slug: cleanSlug,
        message: 'This slug is already used by another article in the database.'
      });
    }

    // Check static posts
    const staticPosts = getStaticPosts();
    const existingStatic = staticPosts.find(p => p.slug === cleanSlug && (!excludeId || p.id !== excludeId));
    if (existingStatic) {
      return res.json({
        ok: true,
        available: false,
        slug: cleanSlug,
        message: 'This slug is reserved by a published core resource.'
      });
    }

    return res.json({
      ok: true,
      available: true,
      slug: cleanSlug,
      message: 'Slug is available!'
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

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

    if (search && search.trim()) {
      const q = search.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { subtitle: { $regex: escaped, $options: 'i' } },
        { slug: { $regex: escaped, $options: 'i' } },
        { content: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } }
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
      BlogPost.countDocuments({ status: { $ne: 'trash' } }),
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
          (p.desc && p.desc.toLowerCase().includes(q)) ||
          (p.slug && p.slug.toLowerCase().includes(q))
        );
      }
    }

    const formattedDb = dbPosts.map(p => ({
      id: p._id.toString(),
      _id: p._id.toString(),
      isDynamic: true,
      title: p.title,
      subtitle: p.subtitle || '',
      slug: p.slug,
      content: p.content,
      coverImage: p.coverImage || '',
      category: p.category || 'Regulatory Intelligence',
      regulatorId: p.regulatorId || 'general',
      tags: p.tags || [],
      metaTitle: p.metaTitle || '',
      metaDescription: p.metaDescription || '',
      canonicalUrl: p.canonicalUrl || `/free-resources/blogs/${p.slug}`,
      ogTitle: p.ogTitle || '',
      ogDescription: p.ogDescription || '',
      ogImage: p.ogImage || p.coverImage || '',
      author: p.author || { name: 'RegMate Editorial Team' },
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
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   GET /api/blogs/admin/:id
// @desc    Get any article (draft, published, or trash) by ID for admin editing
router.get('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Check static fallback
      const staticPost = getStaticPosts().find(p => p.id === id || p.slug === id);
      if (staticPost) {
        return res.json({ ok: true, post: { ...staticPost, isStatic: true } });
      }
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Blog post not found.' });
    }

    const post = await BlogPost.findById(id).lean();
    if (!post) {
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Blog post not found.' });
    }

    return res.json({
      ok: true,
      post: {
        id: post._id.toString(),
        _id: post._id.toString(),
        isDynamic: true,
        title: post.title,
        subtitle: post.subtitle || '',
        slug: post.slug,
        content: post.content,
        coverImage: post.coverImage || '',
        category: post.category || 'Regulatory Intelligence',
        regulatorId: post.regulatorId || 'general',
        tags: post.tags || [],
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        canonicalUrl: post.canonicalUrl || `/free-resources/blogs/${post.slug}`,
        ogTitle: post.ogTitle || '',
        ogDescription: post.ogDescription || '',
        ogImage: post.ogImage || post.coverImage || '',
        author: post.author,
        status: post.status,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        revisions: post.revisions || []
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   POST /api/blogs/admin/create
// @desc    Create new blog post with server-side validation, sanitization & SEO fields
router.post('/admin/create', requireAdmin, async (req, res) => {
  try {
    const {
      title,
      subtitle,
      slug,
      content,
      coverImage,
      category,
      regulatorId,
      tags,
      metaTitle,
      metaDescription,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      status
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        field: 'title',
        message: 'Article title is required.'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        field: 'content',
        message: 'Article body content is required.'
      });
    }

    const cleanSlug = normalizeSlug(slug || title);
    if (!cleanSlug) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        field: 'slug',
        message: 'Please provide a valid slug or title.'
      });
    }

    // Check slug uniqueness across DB and static posts
    const existingDb = await BlogPost.findOne({ slug: cleanSlug });
    if (existingDb) {
      return res.status(409).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        field: 'slug',
        message: `The slug "${cleanSlug}" is already in use by another article. Please modify the slug.`
      });
    }

    const staticConflict = getStaticPosts().find(p => p.slug === cleanSlug);
    if (staticConflict) {
      return res.status(409).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        field: 'slug',
        message: `The slug "${cleanSlug}" is reserved by an existing core resource. Please modify the slug.`
      });
    }

    const cleanContent = sanitizeHtml(content, SANITIZE_OPTIONS);
    const plainExcerpt = (subtitle || cleanContent.replace(/<[^>]+>/g, '')).slice(0, 160).trim();

    // Auto-generate sensible SEO defaults if not provided
    const finalMetaTitle = (metaTitle || title).trim().slice(0, 70);
    const finalMetaDesc = (metaDescription || plainExcerpt).trim().slice(0, 200);
    const finalCanonicalUrl = (canonicalUrl || `/free-resources/blogs/${cleanSlug}`).trim();
    const finalOgTitle = (ogTitle || finalMetaTitle).trim();
    const finalOgDesc = (ogDescription || finalMetaDesc).trim();
    const finalOgImage = (ogImage || coverImage || '').trim();

    const normalizedTags = Array.isArray(tags)
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : (tags || '').split(',').map(t => t.trim()).filter(Boolean);
    const uniqueTags = Array.from(new Set(normalizedTags));

    const isPublished = status === 'published';

    const post = new BlogPost({
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      slug: cleanSlug,
      content: cleanContent,
      coverImage: coverImage || '',
      category: category || 'Regulatory Intelligence',
      regulatorId: (regulatorId || 'general').toLowerCase(),
      tags: uniqueTags,
      metaTitle: finalMetaTitle,
      metaDescription: finalMetaDesc,
      canonicalUrl: finalCanonicalUrl,
      ogTitle: finalOgTitle,
      ogDescription: finalOgDesc,
      ogImage: finalOgImage,
      author: {
        name: req.user?.name || 'CS Prashant Kumar',
        email: req.user?.email || 'editorial@regmate.com',
        picture: req.user?.picture || ''
      },
      status: isPublished ? 'published' : 'draft',
      publishedAt: isPublished ? new Date() : null,
      revisions: [{
        title: title.trim(),
        subtitle: (subtitle || '').trim(),
        content: cleanContent,
        savedBy: req.user?.name || 'System Admin',
        savedAt: new Date()
      }]
    });

    await post.save();

    return res.status(201).json({
      ok: true,
      message: `Article ${post.status === 'published' ? 'published' : 'saved as draft'} successfully!`,
      post
    });
  } catch (err) {
    console.error('Error creating blog post:', err);
    if (err.code === 11000) {
      return res.status(409).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        field: 'slug',
        message: 'An article with this slug already exists. Please choose a unique slug.'
      });
    }
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   PUT /api/blogs/admin/:id
// @desc    Update existing blog post with slug check, SEO fields & Revision Safety history
router.put('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      slug,
      content,
      coverImage,
      category,
      regulatorId,
      tags,
      metaTitle,
      metaDescription,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      status
    } = req.body;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Blog post not found.' });
    }

    // Slug validation and uniqueness check if slug is changing
    if (slug) {
      const cleanSlug = normalizeSlug(slug);
      if (!cleanSlug) {
        return res.status(400).json({
          ok: false,
          error: 'VALIDATION_ERROR',
          field: 'slug',
          message: 'Please provide a valid slug.'
        });
      }

      if (cleanSlug !== post.slug) {
        const existingDb = await BlogPost.findOne({ slug: cleanSlug, _id: { $ne: id } });
        if (existingDb) {
          return res.status(409).json({
            ok: false,
            error: 'VALIDATION_ERROR',
            field: 'slug',
            message: `The slug "${cleanSlug}" is already in use by another article.`
          });
        }
        const staticConflict = getStaticPosts().find(p => p.slug === cleanSlug && p.id !== id);
        if (staticConflict) {
          return res.status(409).json({
            ok: false,
            error: 'VALIDATION_ERROR',
            field: 'slug',
            message: `The slug "${cleanSlug}" is reserved by an existing resource.`
          });
        }
        post.slug = cleanSlug;
      }
    }

    // Save previous revision state (keeps last 5 snapshots)
    if (post.title && post.content) {
      if (!post.revisions) post.revisions = [];
      post.revisions.unshift({
        title: post.title,
        subtitle: post.subtitle || '',
        content: post.content,
        savedBy: req.user?.name || 'System Admin',
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

    if (tags !== undefined) {
      const rawTags = Array.isArray(tags)
        ? tags.map(t => String(t).trim()).filter(Boolean)
        : (tags || '').split(',').map(t => t.trim()).filter(Boolean);
      post.tags = Array.from(new Set(rawTags));
    }

    // SEO updates
    if (metaTitle !== undefined) post.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) post.metaDescription = metaDescription.trim();
    if (canonicalUrl !== undefined) post.canonicalUrl = canonicalUrl.trim();
    if (ogTitle !== undefined) post.ogTitle = ogTitle.trim();
    if (ogDescription !== undefined) post.ogDescription = ogDescription.trim();
    if (ogImage !== undefined) post.ogImage = ogImage.trim();

    if (status) {
      if (status === 'published' && post.status !== 'published') {
        post.publishedAt = new Date();
      }
      post.status = status;
    }

    await post.save();

    return res.json({
      ok: true,
      message: 'Article updated successfully!',
      post
    });
  } catch (err) {
    console.error('Error updating blog post:', err);
    if (err.code === 11000) {
      return res.status(409).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        field: 'slug',
        message: 'An article with this slug already exists. Please choose a unique slug.'
      });
    }
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   POST /api/blogs/admin/:id/unpublish
// @desc    Unpublish post (revert back to draft without deleting)
router.post('/admin/:id/unpublish', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Blog post not found.' });
    }

    post.status = 'draft';
    await post.save();

    return res.json({
      ok: true,
      message: 'Article unpublished and reverted to draft status.',
      post
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   POST /api/blogs/admin/:id/publish
// @desc    Publish a draft post
router.post('/admin/:id/publish', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Blog post not found.' });
    }

    post.status = 'published';
    if (!post.publishedAt) {
      post.publishedAt = new Date();
    }
    await post.save();

    return res.json({
      ok: true,
      message: 'Article published successfully!',
      post
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   POST /api/blogs/admin/:id/duplicate
// @desc    Duplicate / Clone a post into a new draft template
router.post('/admin/:id/duplicate', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const original = await BlogPost.findById(id);
    if (!original) {
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Source blog post not found.' });
    }

    const newTitle = `${original.title} (Copy)`;
    const newSlug = normalizeSlug(`${original.slug}-copy-${Date.now().toString().slice(-4)}`);

    const clonedPost = new BlogPost({
      title: newTitle,
      subtitle: original.subtitle,
      slug: newSlug,
      content: original.content,
      coverImage: original.coverImage,
      category: original.category,
      regulatorId: original.regulatorId,
      tags: original.tags,
      metaTitle: original.metaTitle,
      metaDescription: original.metaDescription,
      canonicalUrl: `/free-resources/blogs/${newSlug}`,
      ogTitle: original.ogTitle,
      ogDescription: original.ogDescription,
      ogImage: original.ogImage,
      author: {
        name: req.user?.name || 'CS Prashant Kumar',
        email: req.user?.email || 'editorial@regmate.com',
        picture: req.user?.picture || ''
      },
      status: 'draft',
      publishedAt: null,
      revisions: [{
        title: newTitle,
        subtitle: original.subtitle,
        content: original.content,
        savedBy: req.user?.name || 'System Admin',
        savedAt: new Date()
      }]
    });

    await clonedPost.save();

    return res.status(201).json({
      ok: true,
      message: `Article duplicated successfully as new draft "${newTitle}"!`,
      post: clonedPost
    });
  } catch (err) {
    console.error('Error duplicating blog post:', err);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   DELETE /api/blogs/admin/:id (Soft Delete / Move to Trash)
// @desc    Move blog post to Trash state instead of permanent data loss
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Blog post not found.' });
    }

    post.status = 'trash';
    post.deletedAt = new Date();
    await post.save();

    return res.json({
      ok: true,
      message: `Article "${post.title}" moved to Trash.`,
      post
    });
  } catch (err) {
    console.error('Error moving post to trash:', err);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   POST /api/blogs/admin/:id/restore
// @desc    Restore soft-deleted post from Trash back to Draft
router.post('/admin/:id/restore', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Blog post not found.' });
    }

    post.status = 'draft';
    post.deletedAt = null;
    await post.save();

    return res.json({
      ok: true,
      message: `Article "${post.title}" restored back to Draft status.`,
      post
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   DELETE /api/blogs/admin/:id/permanent
// @desc    Permanently delete post from MongoDB
router.delete('/admin/:id/permanent', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Blog post not found.' });
    }

    return res.json({
      ok: true,
      message: `Article "${post.title}" permanently deleted.`
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   POST /api/blogs/admin/bulk-action
// @desc    Bulk actions (trash, permanent-delete, publish, unpublish, restore)
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
      resultMsg = `${ids.length} article(s) moved to Trash.`;
    } else if (action === 'permanent-delete') {
      await BlogPost.deleteMany({ _id: { $in: ids } });
      resultMsg = `${ids.length} article(s) permanently deleted.`;
    } else if (action === 'publish') {
      await BlogPost.updateMany({ _id: { $in: ids } }, { status: 'published', publishedAt: new Date() });
      resultMsg = `${ids.length} article(s) published successfully.`;
    } else if (action === 'unpublish') {
      await BlogPost.updateMany({ _id: { $in: ids } }, { status: 'draft' });
      resultMsg = `${ids.length} article(s) unpublished to Draft.`;
    } else if (action === 'restore') {
      await BlogPost.updateMany({ _id: { $in: ids } }, { status: 'draft', deletedAt: null });
      resultMsg = `${ids.length} article(s) restored from Trash to Draft.`;
    }

    return res.json({ ok: true, message: resultMsg });
  } catch (err) {
    console.error('Error executing bulk action:', err);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// @route   POST /api/blogs/admin/:id/restore-revision/:revisionIndex
// @desc    Restore a past revision from revision safety history
router.post('/admin/:id/restore-revision/:revisionIndex', requireAdmin, async (req, res) => {
  try {
    const { id, revisionIndex } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Blog post not found.' });

    const idx = parseInt(revisionIndex, 10);
    if (!post.revisions || !post.revisions[idx]) {
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Selected revision snapshot not found.' });
    }

    const rev = post.revisions[idx];
    post.title = rev.title;
    post.subtitle = rev.subtitle;
    post.content = rev.content;

    await post.save();

    return res.json({
      ok: true,
      message: `Article restored to revision snapshot from ${new Date(rev.savedAt).toLocaleString()}!`,
      post
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

// ─── 2. PUBLIC ENDPOINTS ───────────────────────────────────────────────────

// @route   GET /api/blogs
// @desc    Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const { reg, category, search, limit = 100 } = req.query;

    let dbPosts = [];
    try {
      dbPosts = await BlogPost.find({ status: 'published' }).sort({ publishedAt: -1, createdAt: -1 }).lean();
    } catch (dbErr) {
      console.warn('MongoDB disconnected or empty, using static posts only:', dbErr.message);
    }

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
      metaTitle: p.metaTitle || p.title,
      metaDescription: p.metaDescription || p.subtitle || '',
      canonicalUrl: p.canonicalUrl || `/free-resources/blogs/${p.slug}`,
      ogTitle: p.ogTitle || p.title,
      ogDescription: p.ogDescription || p.subtitle || '',
      ogImage: p.ogImage || p.coverImage || '',
      author: p.author?.name || 'CS Prashant Kumar',
      date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      publishedAt: p.publishedAt,
      status: p.status,
      createdAt: p.createdAt
    }));

    const staticPosts = getStaticPosts();
    let allPosts = [...formattedDbPosts, ...staticPosts];

    // Deduplicate by canonical slug
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
        (p.content && p.content.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q))
      );
    }

    const resultLimit = parseInt(limit, 10);
    return res.json({
      ok: true,
      count: allPosts.length,
      posts: allPosts.slice(0, resultLimit)
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
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
          { slug: slugOrId.toLowerCase() },
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
            tags: dbPost.tags || [],
            metaTitle: dbPost.metaTitle || dbPost.title,
            metaDescription: dbPost.metaDescription || dbPost.subtitle || '',
            canonicalUrl: dbPost.canonicalUrl || `/free-resources/blogs/${dbPost.slug}`,
            ogTitle: dbPost.ogTitle || dbPost.title,
            ogDescription: dbPost.ogDescription || dbPost.subtitle || '',
            ogImage: dbPost.ogImage || dbPost.coverImage || '',
            author: dbPost.author?.name || 'CS Prashant Kumar',
            date: dbPost.publishedAt ? new Date(dbPost.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            publishedAt: dbPost.publishedAt,
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
      return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Blog post not found.' });
    }

    return res.json({
      ok: true,
      post: {
        ...post,
        metaTitle: post.metaTitle || post.title,
        metaDescription: post.metaDescription || post.desc || '',
        canonicalUrl: post.canonicalUrl || `/free-resources/blogs/${post.slug || post.id}`,
        ogTitle: post.ogTitle || post.title,
        ogDescription: post.ogDescription || post.desc || '',
        ogImage: post.ogImage || post.coverImage || post.image || ''
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: err.message });
  }
});

export default router;
