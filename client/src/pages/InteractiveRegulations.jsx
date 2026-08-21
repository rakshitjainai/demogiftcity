import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  BookOpen, Search, Layers, Scale, ShieldCheck, ChevronRight, 
  Menu, X, Sparkles, FileText, ArrowLeft, Filter, Download, 
  CheckCircle2, Bookmark, ExternalLink 
} from 'lucide-react';
import { getAllRegulations, getRegulationBySlug } from '../utils/regulatoryDataLoader';
import RegulationHeader from '../components/regulatory/RegulationHeader';
import ChapterNavigation from '../components/regulatory/ChapterNavigation';
import ProvisionReader from '../components/regulatory/ProvisionReader';
import ExplanationPanel from '../components/regulatory/ExplanationPanel';
import PracticalComplianceBlock from '../components/regulatory/PracticalComplianceBlock';
import RiskInterviewInsights from '../components/regulatory/RiskInterviewInsights';
import SourceReference from '../components/regulatory/SourceReference';
import RelatedProvisions from '../components/regulatory/RelatedProvisions';
import PreviousNextNavigation from '../components/regulatory/PreviousNextNavigation';
import { useAuth } from '../context/AuthContext';

export default function InteractiveRegulations() {
  const { actSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, saveReadingProgress } = useAuth();

  const [regulationsList, setRegulationsList] = useState([]);
  const [currentReg, setCurrentReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState('I');
  const [activeProvisionId, setActiveProvisionId] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'text' | 'explanation' | 'compliance' | 'risk'
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [bookmarkedProvisions, setBookmarkedProvisions] = useState([]);

  // Selected regulation slug
  const selectedSlug = actSlug || searchParams.get('act') || 'ifsca-cmi-2025';

  // Load all available regulations catalog
  useEffect(() => {
    async function initCatalog() {
      const all = await getAllRegulations();
      setRegulationsList(all);
    }
    initCatalog();
  }, []);

  // Load selected regulation details
  useEffect(() => {
    async function loadReg() {
      setLoading(true);
      const data = await getRegulationBySlug(selectedSlug);
      if (data) {
        setCurrentReg(data);
        // Find default initial provision
        const firstChap = data.chapters?.[0];
        const firstProv = firstChap?.provisions?.[0];
        if (firstChap) setActiveChapterId(firstChap.chapter_id);
        if (firstProv) setActiveProvisionId(firstProv.number);
      }
      setLoading(false);
    }
    loadReg();
  }, [selectedSlug]);

  // Handle provision selection
  const handleSelectProvision = (chapId, provNumber) => {
    if (chapId) setActiveChapterId(chapId);
    if (provNumber) {
      setActiveProvisionId(String(provNumber));
      // Save progress if authenticated
      if (saveReadingProgress && currentReg) {
        saveReadingProgress(currentReg.slug, chapId || activeChapterId, provNumber);
      }
    }
    setMobileDrawerOpen(false);
    // Smooth scroll main content to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find active chapter and provision objects
  const activeChapter = currentReg?.chapters?.find(c => c.chapter_id === activeChapterId) || currentReg?.chapters?.[0];
  
  // Find provision across all chapters (in case provision is accessed by number alone)
  let activeProvision = activeChapter?.provisions?.find(p => String(p.number) === String(activeProvisionId));
  if (!activeProvision && currentReg) {
    for (const chap of currentReg.chapters) {
      const found = chap.provisions.find(p => String(p.number) === String(activeProvisionId));
      if (found) {
        activeProvision = found;
        if (activeChapterId !== chap.chapter_id) {
          setActiveChapterId(chap.chapter_id);
        }
        break;
      }
    }
  }

  // Calculate flatten provisions list for Previous / Next navigation
  const allProvisionsFlat = currentReg?.chapters?.flatMap(c => 
    c.provisions.map(p => ({ ...p, chapter_id: c.chapter_id }))
  ) || [];

  const currentIdx = allProvisionsFlat.findIndex(p => String(p.number) === String(activeProvisionId));
  const prevProvision = currentIdx > 0 ? allProvisionsFlat[currentIdx - 1] : null;
  const nextProvision = currentIdx >= 0 && currentIdx < allProvisionsFlat.length - 1 ? allProvisionsFlat[currentIdx + 1] : null;

  const handleBookmark = (prov) => {
    const key = `${selectedSlug}-${prov.number}`;
    if (bookmarkedProvisions.includes(key)) {
      setBookmarkedProvisions(prev => prev.filter(k => k !== key));
    } else {
      setBookmarkedProvisions(prev => [...prev, key]);
    }
  };

  const isBookmarked = activeProvision ? bookmarkedProvisions.includes(`${selectedSlug}-${activeProvision.number}`) : false;

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans text-ink">
      
      {/* ── Top Regulation Switcher / Breadcrumbs Bar ── */}
      <div className="bg-white border-b border-line px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-ink-soft">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <Link to="/" className="hover:text-forest font-medium">Home</Link>
          <span>/</span>
          <span className="text-forest font-bold">RegLens (Understand)</span>
          <span>/</span>
          <span className="text-ink font-semibold truncate max-w-[200px] sm:max-w-md">
            {currentReg?.short_title || currentReg?.title || 'Regulations'}
          </span>
        </div>

        {/* Regulation Selector Dropdown */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <label htmlFor="reg-select" className="hidden md:inline font-medium text-ink-soft">
            Switch Regulation:
          </label>
          <select
            id="reg-select"
            value={selectedSlug}
            onChange={(e) => navigate(`/understand/${e.target.value}`)}
            className="bg-paper border border-line rounded-lg px-2.5 py-1 text-xs font-semibold text-forest focus:outline-none focus:border-forest"
          >
            {regulationsList.map(r => (
              <option key={r.slug} value={r.slug}>
                {r.short_name || r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Regulation Header & Search ── */}
      {currentReg && (
        <RegulationHeader
          regulation={currentReg}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      {/* ── Mobile Navigation Trigger Bar ── */}
      <div className="lg:hidden bg-white border-b border-line px-4 py-3 flex items-center justify-between sticky top-[64px] z-20 shadow-xs">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mint text-forest text-xs font-bold border border-mint-deep"
        >
          <Layers className="w-4 h-4 text-leaf" />
          <span>Chapters & Provisions ({currentReg?.rawProvisions?.length || 0})</span>
        </button>

        <span className="text-xs font-bold text-forest-deep truncate max-w-[180px]">
          Reg {activeProvision?.number || '1'}
        </span>
      </div>

      {/* ── Main Research 3-Column Layout ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 py-4 lg:py-6 px-0 lg:px-6">
        
        {/* ── LEFT COLUMN (Desktop TOC) ── */}
        <aside className="hidden lg:block lg:col-span-3 h-[calc(100vh-220px)] sticky top-[90px] rounded-2xl overflow-hidden card-shadow bg-white border border-line">
          <ChapterNavigation
            chapters={currentReg?.chapters || []}
            activeChapterId={activeChapterId}
            activeProvisionId={activeProvisionId}
            onSelectProvision={handleSelectProvision}
            searchTerm={searchTerm}
          />
        </aside>

        {/* ── CENTER COLUMN (Main Statutory Reading & Explanation) ── */}
        <main className="col-span-1 lg:col-span-6 px-4 sm:px-6 lg:px-0 space-y-6">
          
          {/* Content View Tabs */}
          <div className="flex items-center gap-1.5 border-b border-line pb-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Complete View' },
              { id: 'text', label: 'Statutory Text' },
              { id: 'explanation', label: 'Explanation' },
              { id: 'compliance', label: 'Compliance Points' },
              { id: 'risk', label: 'Risk & Interview' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-ink-soft hover:bg-mint hover:text-forest'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-soft bg-white rounded-2xl border border-line">
              <div className="w-8 h-8 border-3 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Loading regulatory text...</p>
            </div>
          ) : (
            <>
              {/* 1. Official Statutory Text */}
              {(activeTab === 'all' || activeTab === 'text') && (
                <ProvisionReader
                  provision={activeProvision}
                  chapterTitle={activeChapter?.title}
                  actTitle={currentReg?.title}
                  onBookmark={handleBookmark}
                  isBookmarked={isBookmarked}
                />
              )}

              {/* 2. RegMate Simple Explanation */}
              {(activeTab === 'all' || activeTab === 'explanation') && (
                <ExplanationPanel provision={activeProvision} />
              )}

              {/* 3. Practical Compliance Takeaways */}
              {(activeTab === 'all' || activeTab === 'compliance') && (
                <PracticalComplianceBlock provision={activeProvision} />
              )}

              {/* 4. Risk Points & Interview Insights */}
              {(activeTab === 'all' || activeTab === 'risk') && (
                <RiskInterviewInsights provision={activeProvision} />
              )}

              {/* Previous / Next Provision Navigation Footer */}
              <PreviousNextNavigation
                prevProvision={prevProvision}
                nextProvision={nextProvision}
                onNavigate={handleSelectProvision}
              />
            </>
          )}

        </main>

        {/* ── RIGHT COLUMN (Metadata, Citation & Related Provisions) ── */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5 h-fit sticky top-[90px]">
          <SourceReference
            provision={activeProvision}
            regulation={currentReg}
          />

          <RelatedProvisions
            relatedProvisions={activeProvision?.related_provisions}
            onSelectProvision={handleSelectProvision}
          />

          {/* Quick Access Card to RegPractice & RegTools */}
          <div className="bg-gradient-to-br from-mint to-mint-deep/60 rounded-2xl border border-mint-deep p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-leaf" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest">
                Test Your Understanding
              </h4>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Take practice quizzes on this regulatory chapter or generate automated compliance checklists.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/practice/quizzes"
                className="w-full text-center px-3 py-2 bg-forest hover:bg-forest-deep text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
              >
                Practice Chapter Quizzes
              </Link>
              <Link
                to="/tools"
                className="w-full text-center px-3 py-2 bg-white hover:bg-paper text-forest border border-line text-xs font-bold rounded-xl transition-colors"
              >
                Open Compliance Tools
              </Link>
            </div>
          </div>
        </aside>

      </div>

      {/* ── MOBILE TOC DRAWER ── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={() => setMobileDrawerOpen(false)} 
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-fade-in-up">
            <div className="p-4 border-b border-line flex items-center justify-between bg-paper">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest" />
                <span className="font-display font-bold text-sm text-forest-deep">
                  Navigation & Provisions
                </span>
              </div>
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-ink-soft hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ChapterNavigation
                chapters={currentReg?.chapters || []}
                activeChapterId={activeChapterId}
                activeProvisionId={activeProvisionId}
                onSelectProvision={handleSelectProvision}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
