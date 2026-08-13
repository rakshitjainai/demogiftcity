import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import logoFooter from '../assets/logofotter.jpeg';

const FOOTER_LINKS = {
  Knowledge: ['Interactive Regulations', 'Quizzes', 'Learning'],
  Resources: ['Compliance Tools', 'Templates', 'Blog', 'News'],
  Account: ['Membership', 'Dashboard', 'My Profile'],
};

export default function Footer({ onOpenAuth, onSelectCategory }) {
  return (
    <footer style={{ background: 'var(--forest-deep)' }}>
      {/* Top hairline */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

        {/* 5-column grid: brand (2 cols) + 4 link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 pb-12"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Brand column (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img
                src={logoFooter}
                alt="RegMate"
                className="h-12 sm:h-14 w-auto object-contain rounded-md"
              />
            </div>

            <p className="text-[12px] leading-relaxed max-w-[260px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Regulatory intelligence, learning and practical compliance resources for professionals.
            </p>

            {/* Circular social icons */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Follow & Share
              </span>
              <div className="flex items-center gap-2">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/20"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  aria-label="LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
                {/* X / Twitter */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/20"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  aria-label="X / Twitter"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/20"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="space-y-4">
              <h4
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--leaf-bright)', opacity: 0.85 }}
              >
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                      onClick={(e) => { e.preventDefault(); onSelectCategory?.(link); }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          <p>© 2026 RegMate. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
