import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = path.join(__dirname, '..', 'data', 'wordpress-posts.json');

let _posts = null;

function getPosts() {
  if (_posts) return _posts;
  if (fs.existsSync(POSTS_FILE)) {
    const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
    _posts = JSON.parse(raw);
  } else {
    _posts = [];
  }
  return _posts;
}

// @route   GET /api/blogs
// @desc    Get all blog posts and regulatory updates
router.get('/', (req, res) => {
  try {
    const posts = getPosts();
    const { reg, category, search, limit = 50 } = req.query;

    let filtered = [...posts];

    if (reg && reg !== 'all') {
      filtered = filtered.filter(p => p.regulatorId === reg.toLowerCase());
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(p => 
        p.category === category || 
        p.categories.includes(category)
      );
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.desc.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      );
    }

    // Paginate/limit results
    const resultLimit = parseInt(limit, 10);
    res.json({
      ok: true,
      count: filtered.length,
      posts: filtered.slice(0, resultLimit)
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// @route   GET /api/blogs/:id
// @desc    Get specific blog post details by id
router.get('/:id', (req, res) => {
  try {
    const posts = getPosts();
    const post = posts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ ok: false, message: 'Post not found' });
    }
    res.json({ ok: true, post });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

export default router;
