import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import StatsBand from '../components/StatsBand';
import EcosystemSection from '../components/EcosystemSection';
import ContentGrid from '../components/ContentGrid';
import ToolsScroller from '../components/ToolsScroller';
import TrustNewsletterBand from '../components/TrustNewsletterBand';

import ArticleModal from '../components/ArticleModal';
import ToolModal from '../components/ToolModal';
import QuizzesSection from '../components/QuizzesSection';

export default function Home() {
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedToolTitle, setSelectedToolTitle] = useState(null);

  const handleHeroSearch = (query) => {
    navigate(`/understand?search=${encodeURIComponent(query)}`);
  };

  const handleSelectPill = (pill) => {
    navigate(`/understand?search=${encodeURIComponent(pill)}`);
  };

  return (
    <>
      <HeroSection
        onSearchSubmit={handleHeroSearch}
        onSelectPill={handleSelectPill}
        onOpenTool={(t) => setSelectedToolTitle(t)}
      />

      {/* 6 Named Products Ecosystem Grid per Spec & Mockup */}
      <EcosystemSection />

      <QuizzesSection />

      <StatsBand />

      <ContentGrid
        onSelectArticle={(a) => setSelectedArticle(a)}
        onSelectUpdate={(u) => setSelectedArticle(u)}
        onSelectModule={(m) => navigate(`/learn?course=${m.slug}`)}
      />

      <ToolsScroller
        onOpenTool={(t) => setSelectedToolTitle(t)}
      />

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
    </>
  );
}
