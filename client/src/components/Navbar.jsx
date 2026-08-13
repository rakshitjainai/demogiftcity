import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Menu, X, LogIn, Zap, LogOut, User as UserIcon, Award, BookOpen, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

import logoHeader from '../assets/logoheader.jpeg';

const SUB_ITEM_ROUTES = {
  'Interactive Regulations': '/interactive-regulations',
  'Learning & Diagnostics': '/learning',
  'Quizzes': '/quizzes',
  'Diagnostic Tests': '/diagnostic-tests',
  'My Learning': '/my-learning',
  'My Certificates': '/my-certificates',
  'Compliance Calendar': '/tools/compliance-calendar',
  'Annual Filing Tracker': '/tools/annual-filing-tracker',
  'Board Meeting Planner': '/tools/board-meeting-planner',
  'ESOP Calculator': '/tools/esop-calculator',
  'AML Risk Assessment': '/tools/aml-risk-assessment',
};

export default function Navbar({ onOpenSearch, onOpenAuth }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href) => location.pathname === href || (href !== '/' && location.pathname.startsWith(href));

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
          <Link
            to="/"
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <img
              src={logoHeader}
              alt="RegMate"
              className="h-10 sm:h-11 w-auto object-contain rounded-md"
            />
          </Link>

          {/* Center: Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <div key={link.label} className="relative group">
                {link.hasDropdown ? (
                  <button
                    className={`px-3 py-2 text-[13px] font-semibold rounded-lg flex items-center gap-1 transition-all ${
                      isActive(link.href)
                        ? 'text-[var(--leaf)]'
                        : 'text-[var(--ink-soft)] hover:text-[var(--forest)] hover:bg-[var(--mint)]'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
                  </button>
                ) : (
                  <Link
                    to={link.href}
                    className={`px-3 py-2 text-[13px] font-semibold rounded-lg flex items-center gap-1 transition-all ${
                      isActive(link.href)
                        ? 'text-[var(--leaf)]'
                        : 'text-[var(--ink-soft)] hover:text-[var(--forest)] hover:bg-[var(--mint)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                )}

                {/* Dropdown */}
                {link.hasDropdown && link.subItems && (
                  <div className="absolute top-full left-0 w-56 pt-2 hidden group-hover:block z-50">
                    <div className="bg-white rounded-2xl card-shadow border border-[var(--line)] py-2 px-1">
                      {link.subItems.map((sub, idx) => (
                        <Link
                          key={idx}
                          to={SUB_ITEM_ROUTES[sub] || link.href}
                          className="w-full text-left px-3 py-2 text-[12px] font-semibold text-[var(--ink-soft)] hover:bg-[var(--mint)] hover:text-[var(--forest)] rounded-xl transition-colors flex items-center justify-between"
                        >
                          <span>{sub}</span>
                          <span className="text-[var(--gold)] text-xs">→</span>
                        </Link>
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
              className="p-2 rounded-full text-[var(--ink-soft)] hover:text-[var(--forest)] hover:bg-[var(--mint)] transition-colors border border-[var(--line)] cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-emerald-900 max-w-[100px] truncate">
                    {user?.name || 'My Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      My Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-600" />
                      My Profile
                    </Link>

                    <Link
                      to="/my-learning"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      My Learning Progress
                    </Link>

                    <Link
                      to="/my-certificates"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors"
                    >
                      <Award className="w-4 h-4 text-emerald-600" />
                      My Certificates
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth ? onOpenAuth('login') : null}
                  className="px-4 py-2 text-[13px] font-bold text-[var(--forest)] border border-[var(--forest)] rounded-full hover:bg-[var(--mint)] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </button>

                <button
                  onClick={() => onOpenAuth ? onOpenAuth('register') : null}
                  className="px-4 py-2 text-[13px] font-bold text-white bg-[var(--forest)] rounded-full hover:bg-[var(--forest-deep)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(11,77,51,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[var(--gold-soft)]" />
                  Get Started
                </button>
              </>
            )}
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
              <Link
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 text-sm font-semibold rounded-xl ${
                  isActive(link.href)
                    ? 'bg-[var(--mint)] text-[var(--forest)]'
                    : 'text-[var(--ink-soft)] hover:bg-[var(--mint)] hover:text-[var(--forest)]'
                } transition-colors`}
              >
                {link.label}
              </Link>
              {link.hasDropdown && link.subItems && (
                <div className="pl-4 mt-1 space-y-0.5 border-l-2 border-[var(--line)] ml-3">
                  {link.subItems.map((sub, i) => (
                    <Link
                      key={i}
                      to={SUB_ITEM_ROUTES[sub] || link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-left py-1.5 px-2 text-xs text-[var(--ink-soft)] hover:text-[var(--forest)] rounded-lg transition-colors"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-3 border-t border-[var(--line)] grid grid-cols-2 gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="col-span-2 py-2.5 text-center text-sm font-bold text-red-600 border border-red-300 rounded-full bg-red-50"
              >
                Log Out ({user?.name})
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAuth) onOpenAuth('login');
                  }}
                  className="py-2.5 text-center text-sm font-bold text-[var(--forest)] border border-[var(--forest)] rounded-full"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAuth) onOpenAuth('register');
                  }}
                  className="py-2.5 text-center text-sm font-bold text-white bg-[var(--forest)] rounded-full"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
