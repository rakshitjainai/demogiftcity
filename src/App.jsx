import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import QuickAccessBar from './components/QuickAccessBar';
import StatsBand from './components/StatsBand';
import ContentGrid from './components/ContentGrid';
import ToolsScroller from './components/ToolsScroller';
import TrustNewsletterBand from './components/TrustNewsletterBand';
import Footer from './components/Footer';

// Modals
import ArticleModal from './components/ArticleModal';
import ToolModal from './components/ToolModal';
import CustomiseDashboardModal from './components/CustomiseDashboardModal';
import SearchModal from './components/SearchModal';
import AuthModal from './components/AuthModal';

import { QUICK_ACCESS_ITEMS, LATEST_BLOGS, LATEST_UPDATES } from './data/mockData';

export default function App() {
  // Modal states
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedToolTitle, setSelectedToolTitle] = useState(null);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | null

  // Dashboard state
  const [visibleQuickItems, setVisibleQuickItems] = useState(QUICK_ACCESS_ITEMS);

  // Search pill or query trigger
  const handleHeroSearch = (query) => {
    setSearchQuery(query);
    setSearchOpen(true);
  };

  const handleSelectPill = (pillText) => {
    setSearchQuery(pillText);
    setSearchOpen(true);
  };

  const handleQuickItemClick = (item) => {
    if (item.category === 'Tools') {
      setSelectedToolTitle(item.label);
    } else if (item.category === 'Updates') {
      setSelectedArticle(LATEST_UPDATES[0]);
    } else {
      setSelectedArticle(LATEST_BLOGS[0]);
    }
  };

  const handleCategorySelect = (cat) => {
    setSearchQuery(cat);
    setSearchOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Header Navbar */}
      <Navbar
        onOpenSearch={() => { setSearchQuery(''); setSearchOpen(true); }}
        onOpenAuth={(mode) => setAuthMode(mode)}
        onSelectCategory={handleCategorySelect}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* 2. Hero Section */}
        <HeroSection
          onSearchSubmit={handleHeroSearch}
          onSelectPill={handleSelectPill}
          onOpenTool={(title) => setSelectedToolTitle(title)}
        />

        {/* 3. Quick Access Bar */}
        <QuickAccessBar
          visibleItems={visibleQuickItems}
          onCustomiseClick={() => setCustomiseOpen(true)}
          onItemClick={handleQuickItemClick}
        />

        {/* 4. Stats Band */}
        <StatsBand />

        {/* 5. Three-Column Content Grid */}
        <ContentGrid
          onSelectArticle={(article) => setSelectedArticle(article)}
          onSelectUpdate={(update) => setSelectedArticle(update)}
          onSelectModule={(module) => setSelectedToolTitle(module.title)}
        />

        {/* 6. Explore Compliance Tools Horizontal Scroller */}
        <ToolsScroller
          onOpenTool={(title) => setSelectedToolTitle(title)}
        />

        {/* 7. Trust & Newsletter Band */}
        <TrustNewsletterBand />

      </main>

      {/* 8. Footer */}
      <Footer
        onOpenAuth={(mode) => setAuthMode(mode)}
        onSelectCategory={handleCategorySelect}
      />

      {/* Modals & Overlays */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {selectedToolTitle && (
        <ToolModal
          toolTitle={selectedToolTitle}
          onClose={() => setSelectedToolTitle(null)}
        />
      )}

      {customiseOpen && (
        <CustomiseDashboardModal
          visibleIds={visibleQuickItems.map(i => i.id)}
          onSave={(newItems) => setVisibleQuickItems(newItems)}
          onClose={() => setCustomiseOpen(false)}
        />
      )}

      {searchOpen && (
        <SearchModal
          initialQuery={searchQuery}
          onClose={() => setSearchOpen(false)}
          onSelectItem={(item) => {
            if (item.tag || item.icon) {
              setSelectedToolTitle(item.title);
            } else {
              setSelectedArticle(item);
            }
          }}
        />
      )}

      {authMode && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
        />
      )}

    </div>
  );
}
