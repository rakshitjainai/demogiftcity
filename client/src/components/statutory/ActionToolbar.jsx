import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bookmark, Share2, Link as LinkIcon, Printer, Check } from 'lucide-react';

export default function ActionToolbar({
  textToSpeak = '',
  itemKey = '',
  itemTitle = '',
  fontSize = 'md',
  setFontSize = () => {},
  variant = 'bar' // 'bar' | 'compact' | 'top'
}) {
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Check bookmark status from localStorage
  useEffect(() => {
    if (!itemKey) return;
    const bookmarks = JSON.parse(localStorage.getItem('regmate_bookmarks') || '[]');
    setBookmarked(bookmarks.some(b => b.key === itemKey));
  }, [itemKey]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeak = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-Speech is not supported in your browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak || itemTitle);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('regmate_bookmarks') || '[]');
    let updated = [];
    if (bookmarked) {
      updated = bookmarks.filter(b => b.key !== itemKey);
    } else {
      updated = [...bookmarks, { key: itemKey, title: itemTitle, url: window.location.pathname, date: new Date().toISOString() }];
    }
    localStorage.setItem('regmate_bookmarks', JSON.stringify(updated));
    setBookmarked(!bookmarked);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: itemTitle || 'RegMate Provision',
          url: window.location.href
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (variant === 'top') {
    return (
      <div className="flex items-center gap-3">
        {/* Font size controls */}
        <div className="flex items-center bg-paper border border-line rounded-lg p-1 text-xs">
          <button
            onClick={() => setFontSize('sm')}
            className={`px-2 py-1 rounded font-bold transition-colors ${fontSize === 'sm' ? 'bg-forest text-white' : 'text-ink-soft hover:text-forest'}`}
            title="Small font size"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize('md')}
            className={`px-2 py-1 rounded font-bold transition-colors ${fontSize === 'md' ? 'bg-forest text-white' : 'text-ink-soft hover:text-forest'}`}
            title="Medium font size"
          >
            A
          </button>
          <button
            onClick={() => setFontSize('lg')}
            className={`px-2 py-1 rounded font-bold transition-colors ${fontSize === 'lg' ? 'bg-forest text-white' : 'text-ink-soft hover:text-forest'}`}
            title="Large font size"
          >
            A+
          </button>
        </div>

        {/* Listen */}
        <button
          onClick={handleToggleSpeak}
          className={`cursor-target p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            speaking ? 'bg-mint text-forest border-mint-deep' : 'bg-paper border-line text-ink-soft hover:text-forest'
          }`}
          title="Listen to section (Text-to-speech)"
        >
          {speaking ? <VolumeX className="w-4 h-4 text-leaf" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{speaking ? 'Stop' : 'Listen'}</span>
        </button>

        {/* Save */}
        <button
          onClick={handleToggleBookmark}
          className={`cursor-target p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            bookmarked ? 'bg-gold/20 text-gold border-gold/40' : 'bg-paper border-line text-ink-soft hover:text-forest'
          }`}
          title="Save to bookmarks"
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-gold text-gold' : ''}`} />
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="cursor-target p-2 rounded-lg bg-paper border border-line text-ink-soft hover:text-forest text-xs font-medium"
          title="Share provision"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-paper border border-line rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleSpeak}
          className={`cursor-target px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
            speaking ? 'bg-mint text-forest border-mint-deep' : 'bg-white border-line text-forest hover:bg-mint/30'
          }`}
        >
          {speaking ? <VolumeX className="w-4 h-4 text-leaf" /> : <Volume2 className="w-4 h-4 text-leaf" />}
          <span>{speaking ? 'Stop Listening' : 'Listen (TTS)'}</span>
        </button>

        <button
          onClick={handleToggleBookmark}
          className={`cursor-target px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
            bookmarked ? 'bg-gold/20 text-forest border-gold/40' : 'bg-white border-line text-ink-soft hover:text-forest'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-gold text-gold' : ''}`} />
          <span>{bookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          className="cursor-target px-3 py-2 bg-white border border-line rounded-lg text-xs font-medium text-ink-soft hover:text-forest hover:border-forest flex items-center gap-1.5 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="cursor-target px-3 py-2 bg-white border border-line rounded-lg text-xs font-medium text-ink-soft hover:text-forest hover:border-forest flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-leaf" /> : <LinkIcon className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="cursor-target px-3 py-2 bg-white border border-line rounded-lg text-xs font-medium text-ink-soft hover:text-forest hover:border-forest flex items-center gap-1.5 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
}
