import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import QuickAccessBar from '../components/QuickAccessBar';
import StatsBand from '../components/StatsBand';
import ContentGrid from '../components/ContentGrid';
import ToolsScroller from '../components/ToolsScroller';
import TrustNewsletterBand from '../components/TrustNewsletterBand';

import ArticleModal from '../components/ArticleModal';
import ToolModal from '../components/ToolModal';
import CustomiseDashboardModal from '../components/CustomiseDashboardModal';
import PremiumBlock from '../components/PremiumBlock';
import QuizzesSection from '../components/QuizzesSection';

import { QUICK_ACCESS_ITEMS, LATEST_BLOGS, LATEST_UPDATES } from '../data/mockData';

export default function Home() {
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedToolTitle, setSelectedToolTitle] = useState(null);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [visibleQuickItems, setVisibleQuickItems] = useState(QUICK_ACCESS_ITEMS);

  const handleHeroSearch = (query) => {
    // If needed, route to search page or open search modal via context
  };
  const handleSelectPill = (pill) => {
    // Search context
  };
  const handleQuickItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.category === 'Tools') {
      setSelectedToolTitle(item.label);
    } else if (item.category === 'Updates') {
      navigate('/news');
    } else if (item.category === 'Quizzes') {
      navigate('/quizzes');
    } else {
      navigate('/knowledge-hub');
    }
  };

  return (
    <>
      <HeroSection
        onSearchSubmit={handleHeroSearch}
        onSelectPill={handleSelectPill}
        onOpenTool={(t) => setSelectedToolTitle(t)}
      />

      <QuickAccessBar
        visibleItems={visibleQuickItems}
        onCustomiseClick={() => setCustomiseOpen(true)}
        onItemClick={handleQuickItemClick}
      />
      
      <QuizzesSection />

      <StatsBand />

      <ContentGrid
        onSelectArticle={(a) => setSelectedArticle(a)}
        onSelectUpdate={(u) => setSelectedArticle(u)}
        onSelectModule={(m) => setSelectedToolTitle(m.title)}
      />

      <ToolsScroller
        onOpenTool={(t) => setSelectedToolTitle(t)}
      />

      <PremiumBlock />

      <TrustNewsletterBand />

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
    </>
  );
}
