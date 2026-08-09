import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import QuickAccessBar from './components/QuickAccessBar';
import StatsBand from './components/StatsBand';
import ContentGrid from './components/ContentGrid';
import ToolsScroller from './components/ToolsScroller';
import TrustNewsletterBand from './components/TrustNewsletterBand';
import Footer from './components/Footer';

// Modals (retained from previous)
import ArticleModal from './components/ArticleModal';
import ToolModal from './components/ToolModal';
import CustomiseDashboardModal from './components/CustomiseDashboardModal';
import SearchModal from './components/SearchModal';
import AuthModal from './components/AuthModal';

import { QUICK_ACCESS_ITEMS, LATEST_BLOGS, LATEST_UPDATES } from './data/mockData';

export default function App() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedToolTitle, setSelectedToolTitle] = useState(null);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState(null);
  const [visibleQuickItems, setVisibleQuickItems] = useState(QUICK_ACCESS_ITEMS);

  const handleHeroSearch = (query) => {
    setSearchQuery(query);
    setSearchOpen(true);
  };
  const handleSelectPill = (pill) => {
    setSearchQuery(pill);
    setSearchOpen(true);
  };
  const handleQuickItemClick = (item) => {
    if (item.category === 'Tools') setSelectedToolTitle(item.label);
    else if (item.category === 'Updates') setSelectedArticle(LATEST_UPDATES[0]);
    else setSelectedArticle(LATEST_BLOGS[0]);
  };
  const handleCategorySelect = (cat) => {
    setSearchQuery(cat);
    setSearchOpen(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'var(--paper)',
        color: 'var(--ink)',
        fontFamily: 'Public Sans, system-ui, sans-serif',
      }}
    >
      {/* 1. Header */}
      <Navbar
        onOpenSearch={() => { setSearchQuery(''); setSearchOpen(true); }}
        onOpenAuth={(mode) => setAuthMode(mode)}
        onSelectCategory={handleCategorySelect}
      />

      <main className="flex-grow">
        {/* 2. Hero */}
        <HeroSection
          onSearchSubmit={handleHeroSearch}
          onSelectPill={handleSelectPill}
          onOpenTool={(t) => setSelectedToolTitle(t)}
        />

        {/* 3. Quick Access */}
        <QuickAccessBar
          visibleItems={visibleQuickItems}
          onCustomiseClick={() => setCustomiseOpen(true)}
          onItemClick={handleQuickItemClick}
        />

        {/* 4. Stats Band */}
        <StatsBand />

        {/* 5. Three-column Content Grid */}
        <ContentGrid
          onSelectArticle={(a) => setSelectedArticle(a)}
          onSelectUpdate={(u) => setSelectedArticle(u)}
          onSelectModule={(m) => setSelectedToolTitle(m.title)}
        />

        {/* 6. Compliance Tools Scroller */}
        <ToolsScroller
          onOpenTool={(t) => setSelectedToolTitle(t)}
        />

        {/* 7. Trust + Newsletter */}
        <TrustNewsletterBand />
      </main>

      {/* 8. Footer */}
      <Footer
        onOpenAuth={(mode) => setAuthMode(mode)}
        onSelectCategory={handleCategorySelect}
      />

      {/* Modals */}
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
            if (item.tag || item.icon) setSelectedToolTitle(item.title);
            else setSelectedArticle(item);
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
