import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FileText, ArrowLeft, Save, Send, Image as ImageIcon,
  Sparkles, CheckCircle2, AlertCircle, ShieldAlert, Tag,
  Globe, Search, Link as LinkIcon, RefreshCw, X, Eye,
  HelpCircle, AlertTriangle, Layers, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/admin/RichTextEditor';
import { api } from '../utils/api';

// Helper to sanitize strings into URL-safe kebab-case slugs
function toKebabCase(str = '') {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogEditorPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // If editing existing post

  // Core Article Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [category, setCategory] = useState('Regulatory Intelligence');
  const [regulatorId, setRegulatorId] = useState('ifsca');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageError, setCoverImageError] = useState(false);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft'); // 'draft' | 'published'

  // SEO & Social Metadata Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [showSeoSection, setShowSeoSection] = useState(true);

  // Slug Availability State
  const [slugCheckStatus, setSlugCheckStatus] = useState({ state: 'idle', message: '' }); // 'idle' | 'checking' | 'available' | 'taken'

  // UI States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Security Check: Enforce admin role
  const isAdmin = user && (user.role === 'admin' || user.email?.toLowerCase().includes('admin'));

  // Load existing article data if editing
  useEffect(() => {
    if (id && isAdmin) {
      const fetchPost = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
          // Use safe admin endpoint to fetch any post (draft, published, trash)
          const data = await api.get(`/blogs/admin/${id}`);
          if (data.ok && data.post) {
            const p = data.post;
            setTitle(p.title || '');
            setSubtitle(p.subtitle || '');
            setSlug(p.slug || '');
            setIsSlugCustomized(true);
            setCategory(p.category || 'Regulatory Intelligence');
            setRegulatorId(p.regulatorId || 'ifsca');
            setTags(Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''));
            setCoverImage(p.coverImage || '');
            setContent(p.content || '');
            setStatus(p.status || 'draft');
            setMetaTitle(p.metaTitle || '');
            setMetaDescription(p.metaDescription || '');
            setCanonicalUrl(p.canonicalUrl || '');
            setOgTitle(p.ogTitle || '');
            setOgDescription(p.ogDescription || '');
            setOgImage(p.ogImage || '');
          }
        } catch (err) {
          console.error('Failed to fetch post details:', err);
          setErrorMsg(err.message || 'Failed to load article details.');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, isAdmin]);

  // Title change handler with automatic slug generation
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSlugCustomized) {
      const generated = toKebabCase(newTitle);
      setSlug(generated);
      if (!canonicalUrl || canonicalUrl.startsWith('/free-resources/blogs/')) {
        setCanonicalUrl(`/free-resources/blogs/${generated}`);
      }
    }
  };

  // Manual Slug change handler
  const handleSlugChange = (e) => {
    const rawVal = e.target.value;
    const normalized = toKebabCase(rawVal);
    setSlug(normalized);
    setIsSlugCustomized(true);
    setCanonicalUrl(`/free-resources/blogs/${normalized}`);
  };

  // "Generate from title" button action
  const handleRegenerateSlug = () => {
    const generated = toKebabCase(title);
    setSlug(generated);
    setIsSlugCustomized(false);
    setCanonicalUrl(`/free-resources/blogs/${generated}`);
  };

  // Debounced Slug Uniqueness Check
  useEffect(() => {
    if (!slug || !slug.trim()) {
      setSlugCheckStatus({ state: 'idle', message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      setSlugCheckStatus({ state: 'checking', message: 'Checking slug availability...' });
      try {
        const query = new URLSearchParams({ slug });
        if (id) query.append('excludeId', id);
        const res = await api.get(`/blogs/admin/check-slug?${query.toString()}`);
        if (res.ok) {
          if (res.available) {
            setSlugCheckStatus({ state: 'available', message: 'Slug is unique and available' });
          } else {
            setSlugCheckStatus({ state: 'taken', message: res.message || 'Slug is already in use' });
          }
        }
      } catch (e) {
        setSlugCheckStatus({ state: 'idle', message: '' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, id]);

  // Auto-fill SEO metadata from article inputs
  const handleAutofillSeo = () => {
    if (title) setMetaTitle(title.slice(0, 60));
    const cleanExcerpt = subtitle || content.replace(/<[^>]+>/g, '').slice(0, 160).trim();
    if (cleanExcerpt) setMetaDescription(cleanExcerpt);
    if (slug) setCanonicalUrl(`/free-resources/blogs/${slug}`);
    if (title) setOgTitle(title);
    if (cleanExcerpt) setOgDescription(cleanExcerpt);
    if (coverImage) setOgImage(coverImage);
  };

  // Handle Cover Image Upload from Device
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds 10MB. Please select an optimized image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result);
      setCoverImageError(false);
      if (!ogImage) setOgImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Cover Image
  const handleRemoveCover = () => {
    setCoverImage('');
    setCoverImageError(false);
  };

  // Submission handler for both Draft and Published statuses
  const handleSubmit = async (submitStatus) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Front-end validations
    if (!title.trim()) {
      setErrorMsg('Article Title is required.');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg('Article Slug is required.');
      return;
    }
    if (!content.trim() || content === '<p><br></p>') {
      setErrorMsg('Article body content is required. Please write content in the WYSIWYG editor.');
      return;
    }
    if (slugCheckStatus.state === 'taken') {
      setErrorMsg('The current slug is already taken. Please modify the slug before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        slug: toKebabCase(slug),
        content,
        coverImage,
        category,
        regulatorId,
        tags,
        metaTitle: (metaTitle || title).trim(),
        metaDescription: (metaDescription || subtitle || '').trim(),
        canonicalUrl: (canonicalUrl || `/free-resources/blogs/${toKebabCase(slug)}`).trim(),
        ogTitle: (ogTitle || metaTitle || title).trim(),
        ogDescription: (ogDescription || metaDescription || subtitle || '').trim(),
        ogImage: (ogImage || coverImage || '').trim(),
        status: submitStatus
      };

      const endpoint = id ? `/blogs/admin/${id}` : '/blogs/admin/create';
      const response = id ? await api.put(endpoint, payload) : await api.post(endpoint, payload);

      if (response.ok) {
        setSuccessMsg(`🎉 Article ${submitStatus === 'published' ? 'published' : 'saved as draft'} successfully!`);
        setStatus(submitStatus);
        setTimeout(() => {
          navigate('/admin');
        }, 1200);
      } else {
        throw new Error(response.message || 'Server error saving article.');
      }
    } catch (err) {
      console.error('Save article error:', err);
      setErrorMsg(err.message || 'Failed to save article. Please verify your fields.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">403 Forbidden Access</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Article & Blog CMS is strictly restricted to authenticated administrators.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-deep text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Admin Panel
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <RefreshCw className="w-5 h-5 text-emerald-700 animate-spin" />
          <span>Loading article details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline mb-1 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Panel
            </Link>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-emerald-700" />
              <span>{id ? 'Edit Regulatory Article' : 'Create Regulatory Article'}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('draft')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 shadow-2xs transition-all disabled:opacity-50 cursor-pointer min-h-[42px]"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('published')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer min-h-[42px]"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>{saving ? 'Publishing...' : 'Publish Article'}</span>
            </button>
          </div>
        </div>

        {/* Notification Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-600 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-600 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Primary Metadata Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>General Article Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Article Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Aircraft & Ship Leasing in GIFT IFSC: Complete Regulatory & Tax Framework"
                value={title}
                onChange={handleTitleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest shadow-2xs"
              />
            </div>

            {/* Slug Field with Auto-Generation & Validation */}
            <div className="md:col-span-2 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>URL Slug (Canonical Path) <span className="text-rose-500">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw className="w-3 h-3" /> Generate from Title
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">/free-resources/blogs/</span>
                <input
                  type="text"
                  name="slug"
                  required
                  placeholder="aircraft-ship-leasing-in-gift-ifsc"
                  value={slug}
                  onChange={handleSlugChange}
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-mono text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              {/* Slug Validation Feedback */}
              <div className="flex items-center gap-2 text-xs pt-1">
                {slugCheckStatus.state === 'checking' && (
                  <span className="text-slate-500 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Checking slug availability...
                  </span>
                )}
                {slugCheckStatus.state === 'available' && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {slugCheckStatus.message}
                  </span>
                )}
                {slugCheckStatus.state === 'taken' && (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> {slugCheckStatus.message}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 ml-auto">
                  Canonical URL: <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-700 font-mono">/free-resources/blogs/{slug || 'your-slug'}</code>
                </span>
              </div>
            </div>

            {/* Subtitle / Excerpt */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Subtitle / Summary Abstract
              </label>
              <input
                type="text"
                placeholder="Executive 1-2 sentence overview for cards, search results, and meta excerpts..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 bg-white focus:ring-2 focus:ring-forest"
              >
                <option value="Regulatory Intelligence">Regulatory Intelligence</option>
                <option value="Compliance Analysis">Compliance Analysis</option>
                <option value="IFSCA & GIFT City">IFSCA & GIFT City</option>
                <option value="SEBI & Capital Markets">SEBI & Capital Markets</option>
                <option value="Companies Act & Corporate">Companies Act & Corporate</option>
                <option value="Practice Guide">Practice Guide</option>
              </select>
            </div>

            {/* Target Regulator */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Target Regulator
              </label>
              <select
                value={regulatorId}
                onChange={(e) => setRegulatorId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 bg-white focus:ring-2 focus:ring-forest"
              >
                <option value="ifsca">IFSCA (GIFT City)</option>
                <option value="sebi">SEBI (Capital Markets)</option>
                <option value="mca">MCA (Corporate Affairs)</option>
                <option value="rbi">RBI (Banking & FX)</option>
                <option value="general">General Cross-Regulator</option>
              </select>
            </div>

            {/* Cover Image Upload & Preview */}
            <div className="md:col-span-2 space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Header Cover Image
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2 space-y-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-... or data:image/..."
                    value={coverImage}
                    onChange={(e) => { setCoverImage(e.target.value); setCoverImageError(false); }}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-forest"
                  />

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <label
                      htmlFor="cover-file-input"
                      className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span>Upload from Device</span>
                    </label>
                    <input
                      id="cover-file-input"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />

                    {coverImage && (
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Image
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Supports PNG, JPEG, WebP up to 10MB.</p>
                </div>

                {/* Cover Image Preview */}
                <div className="w-full h-32 rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center relative shadow-2xs">
                  {coverImage && !coverImageError ? (
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      onError={() => setCoverImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : coverImageError ? (
                    <div className="p-3 text-center text-xs text-rose-600 font-medium">
                      <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-rose-500" />
                      <span>Image failed to load</span>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-400 font-medium p-3">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                      <span>No cover image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Search Tags (comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Aircraft Leasing, GIFT IFSC, Tax Exemption, IFSCA Circular"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-forest"
              />
            </div>

          </div>
        </div>

        {/* 2. SEO & Social Metadata Section (Accordion / Clean Card) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900">SEO & Social Metadata (Search & Open Graph)</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutofillSeo}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-fill from Article</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Meta Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Meta Title
                </label>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  metaTitle.length >= 50 && metaTitle.length <= 60
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : metaTitle.length > 60
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-slate-400'
                }`}>
                  {metaTitle.length} / 60 chars (Recommended: 50–60)
                </span>
              </div>
              <input
                type="text"
                name="metaTitle"
                placeholder="Search engine title..."
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-forest"
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Canonical URL
              </label>
              <input
                type="text"
                name="canonicalUrl"
                placeholder={`/free-resources/blogs/${slug || 'article-slug'}`}
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono text-slate-800 focus:ring-2 focus:ring-forest"
              />
            </div>

            {/* Meta Description */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Meta Description
                </label>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  metaDescription.length >= 140 && metaDescription.length <= 160
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : metaDescription.length > 160
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-slate-400'
                }`}>
                  {metaDescription.length} / 160 chars (Recommended: 150–160)
                </span>
              </div>
              <textarea
                rows={2}
                name="metaDescription"
                placeholder="Search engine description abstract..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-forest"
              />
            </div>

            {/* Open Graph Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                OG Title (Social Share)
              </label>
              <input
                type="text"
                name="ogTitle"
                placeholder={metaTitle || title || 'Title for LinkedIn & Twitter cards...'}
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-forest"
              />
            </div>

            {/* Open Graph Image */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                OG Image URL
              </label>
              <input
                type="text"
                name="ogImage"
                placeholder={coverImage || 'https://... image for social previews'}
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-forest"
              />
            </div>

          </div>
        </div>

        {/* 3. Rich Text WYSIWYG Editor Section */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 px-1">
            Article Body Content (WYSIWYG Editor & Live Preview) <span className="text-rose-500">*</span>
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write statutory analysis, legal commentaries, embedded charts, regulatory citations..."
          />
        </div>

        {/* 4. Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Current Status: <strong className="text-slate-900">{status.toUpperCase()}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('draft')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all disabled:opacity-50 cursor-pointer min-h-[42px]"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('published')}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer min-h-[42px]"
            >
              {saving ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
