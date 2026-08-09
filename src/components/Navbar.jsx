import React, { useState } from 'react';
import { Search, ChevronDown, Menu, X, Shield, BookOpen, Layers, Award, Sparkles, User, LogIn } from 'lucide-react';
import { NAV_LINKS } from '../data/mockData';

export default function Navbar({ onOpenSearch, onOpenAuth, onSelectCategory }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (label) => {
    if (activeDropdown === label) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(label);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs backdrop-blur-md bg-white/95 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-12 h-12 rounded-full bg-reg-green flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-2xl tracking-tighter flex items-center justify-center">
                R
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-reg-green transition-colors">
                  Reg<span className="text-reg-green">Mate</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 tracking-wide -mt-0.5">
                Navigate Regulations. Stay Ahead.
              </span>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-2">
            {NAV_LINKS.map((link) => (
              <div key={link.label} className="relative group">
                <button
                  onClick={() => link.hasDropdown ? toggleDropdown(link.label) : null}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center space-x-1 transition-all ${
                    link.active
                      ? 'text-reg-green bg-emerald-50/80 font-bold border-b-2 border-reg-green rounded-b-none'
                      : 'text-slate-700 hover:text-reg-green hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.hasDropdown && (
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-reg-green transition-transform group-hover:rotate-180" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {link.hasDropdown && link.subItems && (
                  <div className="absolute top-full left-0 w-56 pt-2 hidden group-hover:block z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 py-2 px-1">
                      {link.subItems.map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSelectCategory && onSelectCategory(sub)}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-reg-green rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span>{sub}</span>
                          <span className="text-[10px] text-slate-400 font-normal">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right: Actions (Search, Login, Get Started) */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={onOpenSearch}
              className="p-2.5 rounded-full text-slate-600 hover:text-reg-green hover:bg-slate-100 transition-colors border border-slate-200"
              title="Search Regulations & Articles"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 text-sm font-bold text-reg-green border border-reg-green rounded-lg hover:bg-emerald-50 transition-all flex items-center space-x-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 text-sm font-bold text-white bg-reg-green rounded-lg hover:bg-reg-green-dark shadow-sm shadow-emerald-900/20 transition-all transform active:scale-95 flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Get Started</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <div key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-semibold rounded-lg ${
                    link.active ? 'bg-emerald-50 text-reg-green font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </a>
                {link.hasDropdown && link.subItems && (
                  <div className="pl-4 space-y-1 my-1 border-l-2 border-emerald-100">
                    {link.subItems.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onSelectCategory && onSelectCategory(sub);
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left py-1 text-xs text-slate-600 hover:text-reg-green"
                      >
                        • {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
              className="w-full py-2.5 text-center text-sm font-bold text-reg-green border border-reg-green rounded-lg"
            >
              Login
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
              className="w-full py-2.5 text-center text-sm font-bold text-white bg-reg-green rounded-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
