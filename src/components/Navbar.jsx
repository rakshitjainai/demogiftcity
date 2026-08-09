import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Menu, X, LogIn, Zap } from 'lucide-react';
import { NAV_LINKS } from '../data/mockData';

export default function Navbar({ onOpenSearch, onOpenAuth, onSelectCategory }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-[var(--line)] shadow-sm'
          : 'bg-[var(--paper)] border-b border-[var(--line)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {/* Rounded-square gradient logo mark */}
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[var(--forest)] to-[var(--leaf)] flex items-center justify-center shadow-md shadow-[rgba(11,77,51,0.25)] group-hover:shadow-lg group-hover:shadow-[rgba(11,77,51,0.35)] transition-shadow">
              <span
                className="text-white text-xl leading-none"
                style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700 }}
              >
                R
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className="text-[var(--ink)] text-lg leading-none"
                style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700 }}
              >
                Reg<span className="text-[var(--forest)]">Mate</span>
              </span>
              <span className="text-[10px] font-medium text-[var(--ink-soft)] tracking-wide mt-0.5">
                Navigate Regulations. Stay Ahead.
              </span>
            </div>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <div key={link.label} className="relative group">
                <button
                  onClick={() => link.hasDropdown ? null : null}
                  className={`px-3 py-2 text-[13px] font-semibold rounded-lg flex items-center gap-1 transition-all ${
                    link.active
                      ? 'text-[var(--leaf)] border-b-2 border-[var(--leaf)] rounded-b-none pb-[6px]'
                      : 'text-[var(--ink-soft)] hover:text-[var(--forest)] hover:bg-[var(--mint)]'
                  }`}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
                  )}
                </button>

                {/* Dropdown */}
                {link.hasDropdown && link.subItems && (
                  <div className="absolute top-full left-0 w-56 pt-2 hidden group-hover:block z-50">
                    <div className="bg-white rounded-2xl card-shadow border border-[var(--line)] py-2 px-1">
                      {link.subItems.map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSelectCategory && onSelectCategory(sub)}
                          className="w-full text-left px-3 py-2 text-[12px] font-semibold text-[var(--ink-soft)] hover:bg-[var(--mint)] hover:text-[var(--forest)] rounded-xl transition-colors flex items-center justify-between"
                        >
                          <span>{sub}</span>
                          <span className="text-[var(--gold)] text-xs">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full text-[var(--ink-soft)] hover:text-[var(--forest)] hover:bg-[var(--mint)] transition-colors border border-[var(--line)]"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 text-[13px] font-700 text-[var(--forest)] border border-[var(--forest)] rounded-full hover:bg-[var(--mint)] transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 text-[13px] font-bold text-white bg-[var(--forest)] rounded-full hover:bg-[var(--forest-deep)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(11,77,51,0.3)] transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[var(--gold-soft)]" />
              Get Started
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg text-[var(--ink-soft)] hover:bg-[var(--mint)]"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--ink)] hover:bg-[var(--mint)]"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-[var(--line)] px-4 pt-3 pb-6 space-y-1">
          {NAV_LINKS.map((link) => (
            <div key={link.label}>
              <a
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 text-sm font-semibold rounded-xl ${
                  link.active
                    ? 'bg-[var(--mint)] text-[var(--forest)]'
                    : 'text-[var(--ink-soft)] hover:bg-[var(--mint)] hover:text-[var(--forest)]'
                } transition-colors`}
              >
                {link.label}
              </a>
              {link.hasDropdown && link.subItems && (
                <div className="pl-4 mt-1 space-y-0.5 border-l-2 border-[var(--line)] ml-3">
                  {link.subItems.map((sub, i) => (
                    <button
                      key={i}
                      onClick={() => { onSelectCategory?.(sub); setMobileMenuOpen(false); }}
                      className="block w-full text-left py-1.5 px-2 text-xs text-[var(--ink-soft)] hover:text-[var(--forest)] rounded-lg transition-colors"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-3 border-t border-[var(--line)] grid grid-cols-2 gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
              className="py-2.5 text-center text-sm font-bold text-[var(--forest)] border border-[var(--forest)] rounded-full"
            >
              Login
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
              className="py-2.5 text-center text-sm font-bold text-white bg-[var(--forest)] rounded-full"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
