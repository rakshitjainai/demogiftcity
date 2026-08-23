import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FileText, ArrowLeft, Save, Send, Image as ImageIcon,
  Sparkles, CheckCircle2, AlertCircle, ShieldAlert, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/admin/RichTextEditor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function BlogEditorPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // If editing existing post

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Regulatory Intelligence');
  const [regulatorId, setRegulatorId] = useState('ifsca');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft'); // 'draft' | 'published'

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Security Check: Enforce admin role
  const isAdmin = user && (user.role === 'admin' || user.email?.toLowerCase().includes('admin'));

  useEffect(() => {
    if (id && isAdmin) {
      // Fetch existing post details for editing
      const fetchPost = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('regmate_token');
          const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.post) {
            setTitle(data.post.title || '');
            setSubtitle(data.post.subtitle || '');
            setCategory(data.post.category || 'Regulatory Intelligence');
            setRegulatorId(data.post.regulatorId || 'ifsca');
            setTags(Array.isArray(data.post.tags) ? data.post.tags.join(', ') : (data.post.tags || ''));
            setCoverImage(data.post.coverImage || '');
            setContent(data.post.content || '');
            setStatus(data.post.status || 'draft');
          }
        } catch (err) {
          setErrorMsg('Failed to load blog post details.');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, isAdmin]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">403 Forbidden Access</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Blog Creation & Editing Panel is strictly restricted to authenticated site administrators. Server-side security checks will reject unauthorized API calls.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-deep text-white font-bold text-xs rounded-xl shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Admin Panel
          </Link>
        </div>
      </div>
    );
  }

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (submitStatus) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please provide an article title.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Please provide article body content using the editor.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('regmate_token');
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        content,
        coverImage,
        category,
        regulatorId,
        tags,
        status: submitStatus
      };

      const endpoint = id
        ? `${API_BASE_URL}/blogs/admin/${id}`
        : `${API_BASE_URL}/blogs/admin/create`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Server error saving blog post.');
      }

      setSuccessMsg(`🎉 Article ${submitStatus === 'published' ? 'published' : 'saved as draft'} successfully!`);
      setTimeout(() => {
        navigate('/admin');
      }, 1400);
    } catch (err) {
      console.error('Save blog error:', err);
      setErrorMsg(err.message || 'Failed to save blog post to MongoDB server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Breadcrumb & Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Panel
            </Link>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-emerald-700" />
              <span>{id ? 'Edit Regulatory Article' : 'Create New Regulatory Article'}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('draft')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 shadow-2xs transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('published')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>{saving ? 'Publishing...' : 'Publish Article'}</span>
            </button>
          </div>
        </div>

        {/* Notification Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-600 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-md animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-600 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-md">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Metadata Form Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Title & Subtitle */}
            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Article Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IFSCA Fund Management Regulations 2025: Key Amendments & Operational Impact"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subtitle / Summary Abstract
                </label>
                <input
                  type="text"
                  placeholder="Brief 1-2 sentence overview for executive search & card summaries..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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

            {/* Cover Image Upload / URL */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Header Cover Image
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-forest mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="cover-file-input"
                      className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span>Upload Cover File from Device</span>
                    </label>
                    <input
                      id="cover-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Cover Image Preview */}
                <div className="w-full h-24 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center relative">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No cover image set</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tags Input */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Search Tags (comma separated)</span>
              </label>
              <input
                type="text"
                placeholder="FME 2025, Fund Manager, Net Worth, Compliance"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-forest"
              />
            </div>

          </div>

        </div>

        {/* Rich Text Editor Section */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 px-1">
            Article Body Content (WYSIWYG Editor) <span className="text-rose-500">*</span>
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write regulatory analysis, embedded images, tables, lists, and statutory citations..."
          />
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Status: {status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('draft')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('published')}
              className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
