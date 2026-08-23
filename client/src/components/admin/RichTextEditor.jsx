import React, { useRef, useEffect, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
  Quote, Undo, Redo, RemoveFormatting, Code,
  Eye, Edit3, Palette, Type, ChevronDown, Check
} from 'lucide-react';

/**
 * Production-Grade WYSIWYG Rich Text Editor Component
 * Supports Headings, Bold, Italic, Underline, Strikethrough, Alignments, Font Size, Text Color, Highlight Color,
 * Bullet/Ordered Lists, Blockquote, Image Upload & Inline Embedding, Hyperlink Modal, and Live Preview mode.
 * Responsive toolbar designed for 375px mobile viewports.
 */
export default function RichTextEditor({ value, onChange, placeholder = 'Start writing your regulatory article...' }) {
  const editorRef = useRef(null);
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [selectedFontSize, setSelectedFontSize] = useState('3'); // 1 to 7

  // Sync external value to editor HTML on mount or when switched to write tab
  useEffect(() => {
    if (editorRef.current && activeTab === 'write') {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [activeTab]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  const applyFormatBlock = (tag) => {
    exec('formatBlock', tag);
  };

  const applyColor = (color) => {
    exec('foreColor', color);
    setShowColorPicker(false);
  };

  const applyBgColor = (color) => {
    exec('hiliteColor', color);
    setShowBgColorPicker(false);
  };

  const applyFontSize = (size) => {
    setSelectedFontSize(size);
    exec('fontSize', size);
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!linkUrl) return;
    if (editorRef.current) {
      editorRef.current.focus();
      const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') ? linkUrl : `https://${linkUrl}`;
      if (linkText && window.getSelection().toString() === '') {
        const a = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #0B4D33; text-decoration: underline;">${linkText}</a>`;
        document.execCommand('insertHTML', false, a);
      } else {
        document.execCommand('createLink', false, url);
      }
      handleInput();
    }
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  const handleInsertImage = (e) => {
    e.preventDefault();
    if (!imageUrl) return;
    if (editorRef.current) {
      editorRef.current.focus();
      const imgHtml = `<img src="${imageUrl}" alt="${imageAlt || 'Inline Image'}" style="max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0; border: 1px solid #e2e8f0; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />`;
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();
    }
    setImageUrl('');
    setImageAlt('');
    setShowImageModal(false);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Src = reader.result;
      if (editorRef.current) {
        editorRef.current.focus();
        const imgHtml = `<img src="${base64Src}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0; border: 1px solid #e2e8f0;" />`;
        document.execCommand('insertHTML', false, imgHtml);
        handleInput();
      }
      setShowImageModal(false);
    };
    reader.readAsDataURL(file);
  };

  const COLOR_PALETTE = [
    '#0B4D33', '#042C1D', '#10B981', '#0284C7',
    '#6366F1', '#8B5CF6', '#D97706', '#DC2626',
    '#1E293B', '#64748B', '#000000', '#FFFFFF'
  ];

  const BG_PALETTE = [
    '#FEF08A', '#BBF7D0', '#BAE6FD', '#E0E7FF',
    '#FBCFE8', '#FED7AA', '#F3F4F6', '#E2E8F0'
  ];

  return (
    <div className="border border-slate-300 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">

      {/* Editor Header: Tab Switcher (Write vs Live Preview) */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'write'
                ? 'bg-white text-forest-deep shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>WYSIWYG Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-forest-deep shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Article Preview</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
          Rich HTML Output • Auto-Sanitized on Server
        </div>
      </div>

      {activeTab === 'write' ? (
        <>
          {/* Editor Toolbar (Responsive for Desktop & 375px Mobile) */}
          <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1 flex-wrap overflow-x-auto select-none">

            {/* Undo / Redo */}
            <div className="flex items-center border-r border-slate-300 pr-1.5 mr-1 gap-0.5">
              <button
                type="button"
                onClick={() => exec('undo')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => exec('redo')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Headings Dropdown */}
            <div className="border-r border-slate-300 pr-1.5 mr-1">
              <select
                onChange={(e) => applyFormatBlock(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-forest"
                defaultValue="<p>"
              >
                <option value="<h1>">Heading 1 (H1)</option>
                <option value="<h2>">Heading 2 (H2)</option>
                <option value="<h3>">Heading 3 (H3)</option>
                <option value="<p>">Paragraph (P)</option>
                <option value="<blockquote">Quote Block</option>
              </select>
            </div>

            {/* Font Style Controls */}
            <div className="flex items-center border-r border-slate-300 pr-1.5 mr-1 gap-0.5">
              <button
                type="button"
                onClick={() => exec('bold')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 font-bold transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => exec('italic')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => exec('underline')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => exec('strikeThrough')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </div>

            {/* Alignment Controls */}
            <div className="flex items-center border-r border-slate-300 pr-1.5 mr-1 gap-0.5">
              <button
                type="button"
                onClick={() => exec('justifyLeft')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => exec('justifyCenter')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => exec('justifyRight')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => exec('justifyFull')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            {/* Colors Dropdown / Picker */}
            <div className="relative flex items-center border-r border-slate-300 pr-1.5 mr-1 gap-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowColorPicker(!showColorPicker); setShowBgColorPicker(false); }}
                  className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 flex items-center gap-1 transition-colors"
                  title="Text Color"
                >
                  <Palette className="w-4 h-4 text-emerald-700" />
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                {showColorPicker && (
                  <div className="absolute left-0 top-full mt-1 p-2 bg-white rounded-xl shadow-xl border border-slate-200 grid grid-cols-4 gap-1.5 z-50 w-36 animate-fade-in-up">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => applyColor(c)}
                        className="w-6 h-6 rounded-md border border-slate-300 shadow-2xs hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowBgColorPicker(!showBgColorPicker); setShowColorPicker(false); }}
                  className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 flex items-center gap-1 transition-colors"
                  title="Highlight Color"
                >
                  <span className="px-1 bg-amber-200 text-amber-900 rounded font-bold text-xs">A</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                {showBgColorPicker && (
                  <div className="absolute left-0 top-full mt-1 p-2 bg-white rounded-xl shadow-xl border border-slate-200 grid grid-cols-4 gap-1.5 z-50 w-36 animate-fade-in-up">
                    {BG_PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => applyBgColor(c)}
                        className="w-6 h-6 rounded-md border border-slate-300 shadow-2xs hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lists Controls */}
            <div className="flex items-center border-r border-slate-300 pr-1.5 mr-1 gap-0.5">
              <button
                type="button"
                onClick={() => exec('insertUnorderedList')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => exec('insertOrderedList')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            {/* Insert Media & Links */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Insert Hyperlink"
              >
                <LinkIcon className="w-4 h-4 text-sky-700" />
              </button>

              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
                title="Embed Image"
              >
                <ImageIcon className="w-4 h-4 text-emerald-700" />
              </button>

              <button
                type="button"
                onClick={() => exec('removeFormat')}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors ml-1"
                title="Clear Formatting"
              >
                <RemoveFormatting className="w-4 h-4 text-rose-600" />
              </button>
            </div>
          </div>

          {/* Editable Content Workspace */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="p-6 sm:p-8 min-h-[360px] sm:min-h-[440px] focus:outline-none text-slate-900 leading-relaxed font-sans prose max-w-none text-sm sm:text-base"
            style={{ minHeight: '380px' }}
          />
        </>
      ) : (
        /* Live Preview Mode */
        <div className="p-6 sm:p-10 min-h-[440px] bg-slate-50 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
            <div
              className="prose prose-emerald max-w-none text-slate-900 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: value || '<p className="text-slate-400 italic">No content written yet...</p>' }}
            />
          </div>
        </div>
      )}

      {/* Hyperlink Insertion Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-emerald-700" /> Insert Hyperlink
            </h3>

            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/legal-update"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link Display Text (Optional)</label>
                <input
                  type="text"
                  placeholder="Click here for official Gazette notification"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-forest hover:bg-forest-deep rounded-xl shadow-xs"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Insertion Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-700" /> Embed Inline Image
            </h3>

            <div className="space-y-4">
              {/* Option A: Direct File Upload */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  id="editor-image-upload"
                  className="hidden"
                />
                <label htmlFor="editor-image-upload" className="cursor-pointer block">
                  <ImageIcon className="w-8 h-8 text-emerald-700 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-800 block">Upload Image from Device</span>
                  <span className="text-[11px] text-slate-500">Supports PNG, JPG, WebP</span>
                </label>
              </div>

              <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-wider">OR</div>

              {/* Option B: Image URL */}
              <form onSubmit={handleInsertImage} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alt Text (Accessibility)</label>
                  <input
                    type="text"
                    placeholder="Chart showing IFSCA fund structure"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!imageUrl}
                    className="px-4 py-2 text-xs font-bold text-white bg-forest hover:bg-forest-deep rounded-xl shadow-xs disabled:opacity-50"
                  >
                    Embed Image URL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
