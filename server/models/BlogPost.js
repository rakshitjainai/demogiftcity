import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true
    },
    subtitle: {
      type: String,
      default: '',
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Blog slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Blog content is required']
    },
    coverImage: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'Regulatory Intelligence',
      trim: true
    },
    regulatorId: {
      type: String,
      default: 'general',
      lowercase: true,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    metaTitle: {
      type: String,
      default: '',
      trim: true
    },
    metaDescription: {
      type: String,
      default: '',
      trim: true
    },
    canonicalUrl: {
      type: String,
      default: '',
      trim: true
    },
    ogTitle: {
      type: String,
      default: '',
      trim: true
    },
    ogDescription: {
      type: String,
      default: '',
      trim: true
    },
    ogImage: {
      type: String,
      default: ''
    },
    author: {
      name: { type: String, default: 'RegMate Editorial Team' },
      email: { type: String, default: '' },
      picture: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'trash'],
      default: 'draft',
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    publishedAt: {
      type: Date,
      default: null
    },
    revisions: [
      {
        title: String,
        subtitle: String,
        content: String,
        savedBy: String,
        savedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Auto-generate slug from title if not provided or clean custom slug
blogPostSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  } else if (this.slug) {
    this.slug = this.slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;

