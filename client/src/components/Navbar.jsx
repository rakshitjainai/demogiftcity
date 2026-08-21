import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Menu, X, LogIn, LogOut, User as UserIcon,
  Award, BookOpen, LayoutDashboard, ShieldCheck, ChevronDown,
  GraduationCap, FlaskConical, Wrench, Briefcase, Rss, FolderOpen,
  ChevronRight, Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import logoHeader from '../assets/logoheader.jpeg';

// Product icon mapping
const PRODUCT_ICONS = {
  RegLearn:    <GraduationCap className="w-5 h-5 text-[var(--forest)]" />,
  RegPractice: <FlaskConical className="w-5 h-5 text-[var(--forest)]" />,
  RegTools:    <Wrench className="w-5 h-5 text-[var(--forest)]" />,
  RegReady:    <Briefcase className="w-5 h-5 text-[var(--forest)]" />,
  RegIntel:    <Rss className="w-5 h-5 text-[var(--forest)]" />,
  'Free Resources': <FolderOpen className="w-5 h-5 text-[var(--forest)]" />,
};

// ─── Desktop Mega Menu ─────────────────────────────────────────────────────
function MegaMenuDropdown({ link, onClose }) {
  if (!link.megaMenu) {
    // Simple dropdown (e.g. Free Resources style)
    return (
      <div
        className="absolute top-full left-0 mt-1 w-60 bg-white border border-[var(--line)] rounded-xl shadow-xl py-2 z-50 animate-fade-in-up"
        role="menu"
      >
        <div className="px-3 py-1.5 border-b border-[var(--line)] mb-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)]">
            {link.label}
          </p>
        </div>
        {(link.subItems || []).map((item) => (
          <Link
            key={item.href + item.label}
            to={item.href}
            className="flex items-center px-4 py-2 text-[13px] text-[var(--ink)] hover:bg-[var(--mint)] hover:text-[var(--forest)] font-medium transition-colors"
            role="menuitem"
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  // Full mega menu
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 top-[64px] sm:top-[70px] bg-black/25 backdrop-blur-[2px] z-40 animate-fade-in"
        onClick={onClose}
      />
      <div
        className="fixed left-0 right-0 top-[64px] sm:top-[70px] bg-white border-b border-[var(--line)] shadow-2xl z-50 animate-fade-in-up"
        style={{ backgroundColor: '#ffffff' }}
        role="menu"
        aria-label={`${link.label} menu`}
      >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div
          className="grid gap-6 items-start"
          style={{
            gridTemplateColumns: `240px repeat(${(link.subGroups || []).length}, minmax(160px, 1fr))`
          }}
        >
          {/* Left: Product identity card */}
          <div className="flex flex-col justify-between p-4 bg-[var(--mint)]/60 rounded-xl border border-[var(--line)]/80 h-full">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center border border-[var(--line)]">
                  {PRODUCT_ICONS[link.productName] || <Sparkles className="w-5 h-5 text-[var(--forest)]" />}
                </div>
                <div>
                  <span className="text-[15px] font-bold text-[var(--forest)] block leading-tight">
                    {link.productName}
                  </span>
                  <span className="text-[11px] text-[var(--leaf)] font-medium">RegMate Product</span>
                </div>
              </div>
              <p className="text-[12.5px] text-[var(--ink-soft)] leading-relaxed mt-2">
                {link.productTagline}
              </p>
            </div>

            <Link
              to={link.href}
              className="mt-4 inline-flex items-center justify-between px-3 py-2 bg-white text-[12.5px] font-semibold text-[var(--forest)] rounded-lg border border-[var(--line)] hover:border-[var(--leaf)] hover:text-[var(--leaf)] shadow-sm transition-all group"
              onClick={onClose}
            >
              <span>Explore {link.productName}</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Sub-groups columns */}
          {(link.subGroups || []).map((group) => (
            <div key={group.heading} className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)] mb-2.5 pb-1 border-b border-[var(--line)]/60">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="flex items-center justify-between text-[13px] text-[var(--ink-soft)] hover:text-[var(--forest)] hover:bg-[var(--mint)] rounded-lg px-2.5 py-1.5 transition-colors font-medium"
                      onClick={onClose}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* My Items (e.g. My Learning / My Practice) */}
              {link.myItems && group === link.subGroups[0] && (
                <div className="mt-3 pt-3 border-t border-[var(--line)]/60">
                  {link.myItems.map((mi) => (
                    <Link
                      key={mi.href + mi.label}
                      to={mi.href}
                      className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--leaf)] hover:text-[var(--forest)] transition-colors px-2 py-1 hover:bg-[var(--mint)] rounded-md"
                      onClick={onClose}
                    >
                      <LayoutDashboard size={13} />
                      <span>{mi.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[var(--leaf)] animate-pulse"></span>
            <p className="text-[13px] text-[var(--ink-soft)]">
              <strong className="text-[var(--forest)] font-semibold">Join RegMate All-Access</strong>
              {' '}— unlock complete access to all 6 products, continuous intelligence & certification.
            </p>
          </div>
          <Link
            to="/membership"
            className="px-4 py-1.5 bg-[var(--gold)] hover:bg-[var(--forest)] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors"
            onClick={onClose}
          >
            View Plans & Pricing
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}

// ─── Mobile accordion item ─────────────────────────────────────────────────
function MobileNavItem({ link, onClose }) {
  const [open, setOpen] = useState(false);

  if (!link.hasDropdown) {
    return (
      <Link
        to={link.href}
        className="flex items-center px-4 py-3 text-[15px] font-semibold text-[var(--ink)] border-b border-[var(--line)] hover:bg-[var(--mint)] transition-colors"
        onClick={onClose}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-[var(--line)]">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--mint)] transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {link.label}
          {link.productName && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--mint-deep)] text-[var(--forest)] font-normal">
              {link.productName}
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`text-[var(--ink-soft)] transition-transform duration-200 ${open ? 'rotate-180 text-[var(--leaf)]' : ''}`}
        />
      </button>

      {open && (
        <div className="bg-[var(--mint)]/70 px-4 py-3 border-t border-[var(--line)]/50 space-y-3">
          {link.productTagline && (
            <p className="text-[12px] text-[var(--ink-soft)] italic pb-1">
              {link.productTagline}
            </p>
          )}

          {link.megaMenu ? (
            (link.subGroups || []).map((group) => (
              <div key={group.heading} className="pt-1">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--gold)] mb-1.5">
                  {group.heading}
                </p>
                <div className="space-y-1 pl-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.label + item.href}
                      to={item.href}
                      className="block py-1 text-[13.5px] text-[var(--ink)] hover:text-[var(--leaf)] font-medium"
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-1 pl-1">
              {(link.subItems || []).map((item) => {
                const label = typeof item === 'string' ? item : item.label;
                const href  = typeof item === 'string' ? '#' : item.href;
                return (
                  <Link
                    key={label + href}
                    to={href}
                    className="block py-1 text-[13.5px] text-[var(--ink)] hover:text-[var(--leaf)] font-medium"
                    onClick={onClose}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Explore Product link */}
          <div className="pt-2 border-t border-[var(--line)]">
            <Link
              to={link.href}
              className="flex items-center justify-between text-[13px] font-bold text-[var(--forest)] hover:text-[var(--leaf)] py-1"
              onClick={onClose}
            >
              <span>Explore All {link.productName || link.label}</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────
export default function Navbar({ onOpenSearch, onOpenAuth }) {
  const { user, isAuthenticated, isMember, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const closeTimer = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userDropdownOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-user-dropdown]')) setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userDropdownOpen]);

  const handleNavEnter = (label) => {
    clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  };

  const handleNavLeave = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 180);
  };

  const handleMenuEnter = () => {
    clearTimeout(closeTimer.current);
  };

  const handleMenuLeave = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 180);
  };

  const closeMegaMenu = () => setOpenDropdown(null);

  const isActive = (href) =>
    location.pathname === href ||
    (href !== '/' && location.pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[var(--line)] shadow-sm'
          : 'bg-[var(--paper)] border-b border-[var(--line)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src={logoHeader}
              alt="RegMate"
              className="h-10 sm:h-11 w-auto object-contain rounded-md"
            />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2 ml-4 flex-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => {
              const isOpen = openDropdown === link.label;
              return (
                <div
                  key={link.label}
                  className="relative flex-shrink-0"
                  onMouseEnter={() => handleNavEnter(link.label)}
                  onMouseLeave={handleNavLeave}
                >
                  {link.hasDropdown ? (
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : link.label)}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      className={`whitespace-nowrap px-3 py-1.5 text-[13.5px] font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                        isActive(link.href) || isOpen
                          ? 'text-[var(--leaf)] bg-[var(--mint)]'
                          : 'text-[var(--ink)] hover:text-[var(--forest)] hover:bg-[var(--mint)]'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--leaf)]' : 'text-[var(--ink-soft)]'}`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className={`whitespace-nowrap px-3 py-1.5 text-[13.5px] font-semibold rounded-lg transition-all ${
                        isActive(link.href)
                          ? 'text-[var(--leaf)] bg-[var(--mint)]'
                          : 'text-[var(--ink)] hover:text-[var(--forest)] hover:bg-[var(--mint)]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* Dropdown panel for simple dropdowns (Free Resources) */}
                  {isOpen && link.hasDropdown && !link.megaMenu && (
                    <div
                      onMouseEnter={handleMenuEnter}
                      onMouseLeave={handleMenuLeave}
                    >
                      <MegaMenuDropdown link={link} onClose={closeMegaMenu} />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right side: Search + Auth CTAs */}
          <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={onOpenSearch}
              aria-label="Search regulations, courses, tools..."
              className="p-2 rounded-lg text-[var(--ink-soft)] hover:text-[var(--forest)] hover:bg-[var(--mint)] transition-colors"
            >
              <Search size={18} />
            </button>

            {isAuthenticated ? (
              <div className="relative" data-user-dropdown>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--mint)] transition-colors border border-transparent hover:border-[var(--line)]"
                  aria-expanded={userDropdownOpen}
                >
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-[var(--forest)]" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--forest)] flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <ChevronDown size={13} className={`text-[var(--ink-soft)] transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-[var(--line)] rounded-xl shadow-xl py-2 z-50 animate-fade-in-up">
                    <div className="px-4 py-2.5 border-b border-[var(--line)]">
                      <p className="text-[13px] font-bold text-[var(--ink)] truncate">{user?.name}</p>
                      <p className="text-[11px] text-[var(--ink-soft)] truncate">{user?.email}</p>
                      <div className="mt-1.5">
                        {isMember ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--gold)]/15 text-[var(--gold)] text-[10px] font-bold rounded-full uppercase tracking-wider">
                            <Sparkles size={10} /> All-Access Member
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-[var(--mint-deep)] text-[var(--forest)] text-[10px] font-semibold rounded-full">
                            Free Member
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--ink)] hover:bg-[var(--mint)] hover:text-[var(--forest)] font-medium transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--ink)] hover:bg-[var(--mint)] hover:text-[var(--forest)] font-medium transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <BookOpen size={15} /> My Learning & Practice
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--ink)] hover:bg-[var(--mint)] hover:text-[var(--forest)] font-medium transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Award size={15} /> Certificates
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--ink)] hover:bg-[var(--mint)] hover:text-[var(--forest)] font-medium transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <ShieldCheck size={15} /> Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-[var(--line)] pt-1 mt-1">
                      <button
                        onClick={() => { logout(); setUserDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 font-medium transition-colors"
                      >
                        <LogOut size={15} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 text-[13px] font-semibold text-[var(--ink)] hover:text-[var(--forest)] hover:bg-[var(--mint)] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogIn size={14} /> Login
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-1.5 text-[13px] font-semibold text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                  style={{ background: 'var(--forest)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--leaf)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--forest)')}
                >
                  Join RegMate
                </button>
              </>
            )}
          </div>

          {/* Mobile search + hamburger toggle */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={onOpenSearch}
              aria-label="Search"
              className="p-2 rounded-lg text-[var(--ink-soft)] hover:bg-[var(--mint)] transition-colors"
            >
              <Search size={19} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-lg text-[var(--ink)] hover:bg-[var(--mint)] transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Full-width mega menu overlay for desktop */}
      {openDropdown && NAV_LINKS.find((l) => l.label === openDropdown)?.megaMenu && (
        <div
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <MegaMenuDropdown
            link={NAV_LINKS.find((l) => l.label === openDropdown)}
            onClose={closeMegaMenu}
          />
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--line)] bg-white max-h-[calc(100vh-70px)] overflow-y-auto shadow-2xl">
          {/* Auth header */}
          {!isAuthenticated ? (
            <div className="flex gap-2 p-4 border-b border-[var(--line)] bg-[var(--paper)]">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-[14px] font-semibold text-[var(--forest)] border border-[var(--forest)] rounded-lg hover:bg-[var(--mint)] transition-colors text-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-[14px] font-semibold text-white rounded-lg transition-colors shadow-sm text-center"
                style={{ background: 'var(--forest)' }}
              >
                Join RegMate
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 border-b border-[var(--line)] bg-[var(--mint)]">
              <div className="w-10 h-10 rounded-full bg-[var(--forest)] flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[var(--ink)] truncate">{user?.name}</p>
                <p className="text-[12px] text-[var(--ink-soft)] truncate">{isMember ? 'All-Access Member' : 'Free Account'}</p>
              </div>
              <Link
                to="/dashboard"
                className="px-3 py-1.5 text-[12px] font-semibold text-[var(--forest)] border border-[var(--forest)] rounded-lg bg-white shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </div>
          )}

          {/* Navigation Accordion items */}
          <div className="divide-y divide-[var(--line)]/50">
            {NAV_LINKS.map((link) => (
              <MobileNavItem
                key={link.label}
                link={link}
                onClose={() => setMobileMenuOpen(false)}
              />
            ))}
          </div>

          {/* Member Upgrade CTA if Free */}
          {!isMember && (
            <div className="p-4 border-t border-[var(--line)] bg-[var(--mint)]/40">
              <p className="text-[12.5px] font-bold text-[var(--forest)]">Unlock All 6 Products</p>
              <p className="text-[11.5px] text-[var(--ink-soft)] mt-0.5">
                Join RegMate Membership for complete course access, quizzes & tools.
              </p>
              <Link
                to="/membership"
                className="mt-2.5 block text-center py-2 bg-[var(--gold)] text-white text-[13px] font-bold rounded-lg shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                View Membership Plans
              </Link>
            </div>
          )}

          {/* Sign out */}
          {isAuthenticated && (
            <div className="p-3 border-t border-[var(--line)]">
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[14px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
