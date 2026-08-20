import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldCheck, Mail, MapPin } from 'lucide-react';
import logoFooter from '../assets/logofotter.jpeg';
import { useAuth } from '../context/AuthContext';

const FOOTER_NAV = [
  {
    heading: 'Products',
    links: [
      { label: 'RegLearn — Courses', href: '/learn' },
      { label: 'RegLens — Regulations', href: '/understand' },
      { label: 'RegPractice — Tests & Quizzes', href: '/practice' },
      { label: 'RegTools — Compliance Tools', href: '/tools' },
      { label: 'RegReady — Role Preparation', href: '/prepare' },
      { label: 'RegIntel — Updates & Tracker', href: '/regintel' },
    ]
  },
  {
    heading: 'Free Resources',
    links: [
      { label: 'Regulatory Blogs & Analysis', href: '/free-resources/blogs' },
      { label: 'Board Formats & Templates', href: '/free-resources/templates' },
      { label: 'Compliance Checklists', href: '/tools' },
      { label: 'Regulatory Calendar', href: '/tools/compliance-calendar' },
      { label: 'Adjudication Orders', href: '/news' },
    ]
  },
  {
    heading: 'Platform',
    links: [
      { label: 'About RegMate', href: '/about' },
      { label: 'All-Access Membership', href: '/membership' },
      { label: 'Member Dashboard', href: '/dashboard' },
      { label: 'Admin Console', href: '/admin', reqAdmin: true },
    ]
  }
];

export default function Footer({ onOpenAuth }) {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user && (user.role === 'admin' || user.email?.toLowerCase().includes('admin'));

  return (
    <footer style={{ background: 'var(--forest-deep)' }}>
      {/* Top hairline */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Brand column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
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

            <p className="text-[12.5px] leading-relaxed max-w-[320px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
              India & GIFT IFSC's premier regulatory learning, compliance automation, examination simulation, and role preparation platform.
            </p>

            {/* Social & Contact Icons */}
            <div className="pt-2 flex items-center gap-3">
              {/* WhatsApp Chat Icon */}
              <a
                href="https://wa.me/919821008011"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/20 hover:scale-105 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                title="Chat on WhatsApp"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-white/90" />
              </a>

              {/* LinkedIn Icon */}
              <a
                href="http://linkedin.com/in/csprashantkumar"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/20 hover:scale-105 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                title="LinkedIn Profile"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-4 h-4 fill-current text-white/90" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_NAV.map((column) => (
            <div key={column.heading} className="space-y-4">
              <h4
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--gold-soft)', opacity: 0.9 }}
              >
                {column.heading}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((item) => {
                  if (item.reqAdmin && !isAdmin) return null;

                  if (item.href) {
                    return (
                      <li key={item.label}>
                        <Link
                          to={item.href}
                          className="text-xs transition-colors hover:text-white flex items-center gap-1.5"
                          style={{ color: 'rgba(255,255,255,0.65)' }}
                        >
                          {item.reqAdmin && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  }

                  return null;
                })}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <p>© {new Date().getFullYear()} RegMate. All rights reserved. Professional Regulatory Intelligence & Learning.</p>
          <div className="flex items-center gap-5">
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/membership" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/interactive-regulations" className="hover:text-white transition-colors">Disclaimers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
