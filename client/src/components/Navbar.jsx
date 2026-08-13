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
  const [openDropdown, setOpenDropdown] = useState(null); // label of open desktop dropdown
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e) => {
      if (!e.target.closest('[data-nav-dropdown]')) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [openDropdown]);

  // Close dropdowns on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
            {NAV_LINKS.map((link) => {
              const isDropdownOpen = openDropdown === link.label;
              return (
                <div key={link.label} className="relative" data-nav-dropdown>
                  {link.hasDropdown ? (
                    <button
                      onClick={() => setOpenDropdown(isDropdownOpen ? null : link.label)}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                      className={`px-3 py-2 text-[13px] font-semibold rounded-lg flex items-center gap-1 transition-all ${
                        isActive(link.href) || isDropdownOpen
                          ? 'text-[var(--leaf)] bg-[var(--mint)]'
                          : 'text-[var(--ink-soft)] hover:text-[var(--forest)] hover:bg-[var(--mint)]'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 opacity-100' : ''}`} />
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

                  {/* Dropdown — click-toggled, works on mouse AND touch */}
                  {link.hasDropdown && link.subItems && isDropdownOpen && (
                    <div className="absolute top-full left-0 w-56 pt-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="bg-white rounded-2xl card-shadow border border-[var(--line)] py-2 px-1">
                        {link.subItems.map((sub, idx) => (
                          <Link
                            key={idx}
                            to={SUB_ITEM_ROUTES[sub] || link.href}
                            onClick={() => setOpenDropdown(null)}
                            className="w-full text-left px-3 py-2.5 text-[12px] font-semibold text-[var(--ink-soft)] hover:bg-[var(--mint)] hover:text-[var(--forest)] rounded-xl transition-colors flex items-center justify-between min-h-[40px]"
                          >
                            <span>{sub}</span>
                            <span className="text-[var(--gold)] text-xs">→</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Desktop Actions */}
          <div className="hidden xl:flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full text-[var(--ink-soft)] hover:text-[var(--forest)] hover:bg-[var(--mint)] transition-colors border border-[var(--line)] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer min-h-[40px]"
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
                      className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors min-h-[40px]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      My Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors min-h-[40px]"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-600" />
                      My Profile
                    </Link>

                    <Link
                      to="/my-learning"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors min-h-[40px]"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      My Learning Progress
                    </Link>

                    <Link
                      to="/my-certificates"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors min-h-[40px]"
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
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer min-h-[40px]"
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
                  className="px-4 py-2 text-[13px] font-bold text-[var(--forest)] border border-[var(--forest)] rounded-full hover:bg-[var(--mint)] transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </button>

                <button
                  onClick={() => onOpenAuth ? onOpenAuth('register') : null}
                  className="px-4 py-2 text-[13px] font-bold text-white bg-[var(--forest)] rounded-full hover:bg-[var(--forest-deep)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(11,77,51,0.3)] transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <Zap className="w-3.5 h-3.5 text-[var(--gold-soft)]" />
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Actions & Hamburger */}
          <div className="flex xl:hidden items-center gap-1.5">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg text-[var(--ink-soft)] hover:bg-[var(--mint)] min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Mobile Auth Button in Header */}
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-900 min-h-[44px] min-w-[44px]"
                aria-label="User Profile"
              >
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </Link>
            ) : (
              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : null}
                className="px-3 py-1.5 text-xs font-bold text-[var(--forest)] border border-[var(--forest)] rounded-full hover:bg-[var(--mint)] transition-all flex items-center gap-1 cursor-pointer min-h-[44px]"
                aria-label="Login"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--ink)] hover:bg-[var(--mint)] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-[var(--line)] px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2">
          {/* User Account Card / Mobile Auth Entry */}
          {isAuthenticated ? (
            <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-2.5 mb-3 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border border-emerald-300 shadow-xs flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-emerald-950 truncate">{user?.name || 'RegMate User'}</p>
                    <p className="text-xs text-emerald-700 truncate">{user?.email || ''}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0 min-h-[36px] cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>

              {/* Quick links for logged-in mobile user */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/70 text-xs font-bold">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-white text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-2 hover:bg-emerald-100 transition-colors min-h-[44px]"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-white text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-2 hover:bg-emerald-100 transition-colors min-h-[44px]"
                >
                  <UserIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/my-learning"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-white text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-2 hover:bg-emerald-100 transition-colors min-h-[44px]"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Learning</span>
                </Link>
                <Link
                  to="/my-certificates"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-white text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-2 hover:bg-emerald-100 transition-colors min-h-[44px]"
                >
                  <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Certificates</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-[var(--paper)] border border-[var(--line)] rounded-2xl flex items-center gap-2.5 mb-3 shadow-xs">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth('login');
                }}
                className="flex-1 min-h-[44px] py-2.5 text-center text-xs font-bold text-[var(--forest)] border border-[var(--forest)] rounded-xl bg-white hover:bg-[var(--mint)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth('register');
                }}
                className="flex-1 min-h-[44px] py-2.5 text-center text-xs font-bold text-white bg-[var(--forest)] rounded-xl hover:bg-[var(--forest-deep)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-[var(--gold-soft)]" />
                <span>Get Started</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          {NAV_LINKS.map((link) => (
            <div key={link.label}>
              <Link
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-3 text-sm font-semibold rounded-xl min-h-[44px] flex items-center ${
                  isActive(link.href)
                    ? 'bg-[var(--mint)] text-[var(--forest)] font-bold'
                    : 'text-[var(--ink-soft)] hover:bg-[var(--mint)] hover:text-[var(--forest)]'
                } transition-colors`}
              >
                {link.label}
              </Link>
              {link.hasDropdown && link.subItems && (
                <div className="pl-4 mt-1 space-y-1 border-l-2 border-[var(--line)] ml-3">
                  {link.subItems.map((sub, i) => (
                    <Link
                      key={i}
                      to={SUB_ITEM_ROUTES[sub] || link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-left py-2 px-2.5 text-xs text-[var(--ink-soft)] hover:text-[var(--forest)] rounded-lg transition-colors min-h-[40px] flex items-center"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Bottom Logout Button if logged in */}
          {isAuthenticated && (
            <div className="pt-3 border-t border-[var(--line)]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full min-h-[44px] py-3 text-center text-xs font-bold text-red-600 border border-red-300 rounded-xl bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({user?.name || 'Account'})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
