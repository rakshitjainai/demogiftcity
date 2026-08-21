import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import TargetCursor from './TargetCursor/TargetCursor';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';

export default function Layout() {
  const [authMode, setAuthMode] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategorySelect = (cat) => {
    setSearchQuery(cat);
    setSearchOpen(true);
  };

  React.useEffect(() => {
    const handleOpenSearch = () => {
      setSearchQuery('');
      setSearchOpen(true);
    };
    window.addEventListener('open-search-modal', handleOpenSearch);
    return () => window.removeEventListener('open-search-modal', handleOpenSearch);
  }, []);

  return (
    <>
      <TargetCursor
        targetSelector=".cursor-target, a, button, input, select, [role='button']"
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
        cursorColor="#0B4D33"
        cursorColorOnTarget="#128A54"
      />
      <Navbar
        onOpenSearch={() => { setSearchQuery(''); setSearchOpen(true); }}
        onOpenAuth={(mode) => setAuthMode(mode)}
        onSelectCategory={handleCategorySelect}
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer
        onOpenAuth={(mode) => setAuthMode(mode)}
        onSelectCategory={handleCategorySelect}
      />

      {searchOpen && (
        <SearchModal
          initialQuery={searchQuery}
          onClose={() => setSearchOpen(false)}
          onSelectItem={(item) => {
             // Will handle navigation dynamically if needed
             setSearchOpen(false);
          }}
        />
      )}
      {authMode && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
        />
      )}
    </>
  );
}
