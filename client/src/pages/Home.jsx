import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import StatsBand from '../components/StatsBand';
import EcosystemSection from '../components/EcosystemSection';
import ContentGrid from '../components/ContentGrid';
import ToolsScroller from '../components/ToolsScroller';
import TrustNewsletterBand from '../components/TrustNewsletterBand';

import ArticleModal from '../components/ArticleModal';
import ToolModal from '../components/ToolModal';
import QuizzesSection from '../components/QuizzesSection';
import Seo from '../components/Seo';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedToolTitle, setSelectedToolTitle] = useState(null);

  const isAdmin = user && (user.role === 'admin' || user.email?.toLowerCase().includes('admin'));

  const handleHeroSearch = (query) => {
    navigate(`/understand?search=${encodeURIComponent(query)}`);
  };

  const handleSelectPill = (pill) => {
    navigate(`/understand?search=${encodeURIComponent(pill)}`);
  };

  return (
    <>
      <Seo
        title="RegMate — India's Premier Regulatory & Compliance Platform"
        description="RegMate helps financial institutions, GIFT IFSC entities, SEBI AIFs, and compliance officers navigate Indian statutory regulations, statutory audits, and compliance diagnostic tools."
        canonical="https://regmate.in/"
      />
      {isAdmin && (
        <div className="bg-[#042C1D] text-white px-4 py-2.5 border-b border-emerald-800 flex items-center justify-between text-xs font-bold shadow-md z-40 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Admin Session Active ({user?.name || user?.email})</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/blogs/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-2xs text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Create Blog Post</span>
            </Link>
            <Link
              to="/admin"
              className="text-emerald-200 hover:text-white underline text-xs font-medium flex items-center gap-1"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </Link>
          </div>
        </div>
      )}

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
