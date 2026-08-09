import React from 'react';
import { Mail, MessageCircle, Shield } from 'lucide-react';

export default function Footer({ onOpenAuth, onSelectCategory }) {
  return (
    <footer className="bg-gradient-to-b from-[#074025] to-[#042817] text-white pt-14 pb-8 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 pb-12 border-b border-emerald-800/60">
          
          {/* Column 1: Logo & Socials (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-full bg-white text-[#074025] flex items-center justify-center font-extrabold text-xl shadow-md">
                R
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white">
                  Reg<span className="text-emerald-300">Mate</span>
                </span>
                <span className="text-[10px] text-emerald-200/80 font-medium">
                  Navigate Regulations. Stay Ahead.
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-100/70 leading-relaxed max-w-sm">
              India's specialized compliance & learning platform for corporate secretaries, auditors, advocates, and GIFT City financial entities.
            </p>

            {/* Social Share Icons */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-emerald-200/60 uppercase tracking-wider block mb-2">
                Follow & Share
              </span>
              <div className="flex items-center space-x-2">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-emerald-900/60 hover:bg-emerald-700 text-emerald-200 hover:text-white flex items-center justify-center transition-colors border border-emerald-800"
                  title="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
                {/* Twitter / X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-emerald-900/60 hover:bg-emerald-700 text-emerald-200 hover:text-white flex items-center justify-center transition-colors border border-emerald-800"
                  title="Twitter / X"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-emerald-900/60 hover:bg-emerald-700 text-emerald-200 hover:text-white flex items-center justify-center transition-colors border border-emerald-800"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-emerald-900/60 hover:bg-emerald-700 text-emerald-200 hover:text-white flex items-center justify-center transition-colors border border-emerald-800"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>


          {/* Column 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-emerald-300 tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li><a href="#knowledge" className="hover:text-white transition-colors">Knowledge Hub</a></li>
              <li><a href="#regulations" className="hover:text-white transition-colors">Interactive Regulations</a></li>
              <li><a href="#learning" className="hover:text-white transition-colors">Learning Modules</a></li>
              <li><a href="#tools" className="hover:text-white transition-colors">Compliance Tools</a></li>
              <li><a href="#templates" className="hover:text-white transition-colors">Templates & Checklists</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-emerald-300 tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li><a href="#news" className="hover:text-white transition-colors">News & Updates</a></li>
              <li><a href="#circulars" className="hover:text-white transition-colors">Circulars</a></li>
              <li><a href="#enforcement" className="hover:text-white transition-colors">Enforcement Orders</a></li>
              <li><a href="#faqs" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#glossary" className="hover:text-white transition-colors">Legal Glossary</a></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-emerald-300 tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#mission" className="hover:text-white transition-colors">Our Mission</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 5: Connect With Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-emerald-300 tracking-wider">
              Connect With Us
            </h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Empowering professionals with knowledge, tools and insights for a compliant tomorrow.
            </p>
            <div className="pt-1">
              <a
                href="mailto:support@regmate.in"
                className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-200 hover:text-white bg-emerald-900/80 px-3 py-2 rounded-lg border border-emerald-700 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>support@regmate.in</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/60 space-y-3 sm:space-y-0">
          <div>
            © 2026 RegMate. All rights reserved. Content based on CS Prashant Kumar editorial insights.
          </div>

          <div className="flex items-center space-x-4">
            <a href="#terms" className="hover:text-white transition-colors">Terms of Use</a>
            <span>|</span>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="#sitemap" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
