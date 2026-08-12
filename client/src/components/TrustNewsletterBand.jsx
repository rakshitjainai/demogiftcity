import React, { useState } from 'react';
import { Mail, CheckCircle2, Award, Users, Briefcase, Scale, Shield } from 'lucide-react';

const TRUST_BADGES = [
  { icon: Briefcase, label: 'Company Secretaries' },
  { icon: Scale, label: 'Chartered Accountants' },
  { icon: Users, label: 'Advocates' },
  { icon: Shield, label: 'IFSC Businesses' },
  { icon: Award, label: 'Compliance Officers' },
];

export default function TrustNewsletterBand() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => { setSubscribed(false); setEmail(''); }, 4000);
    }
  };

  return (
    <section
      className="py-12"
      style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ─── Left: Trust panel ─── */}
          <div
            className="rounded-2xl p-6 sm:p-8 card-shadow"
            style={{ background: 'white', border: '1px solid var(--line)' }}
          >
            {/* Gold eyebrow */}
            <div className="eyebrow flex items-center gap-1 mb-3">
              <span style={{ color: 'var(--gold)' }}>§</span>
              <span style={{ color: 'var(--gold)' }}>Since 2013</span>
            </div>

            <h2
              className="text-xl sm:text-2xl leading-snug mb-6"
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              Trusted by professionals<br />across domains
            </h2>

            {/* Badge row */}
            <div className="flex flex-wrap gap-3">
              {TRUST_BADGES.map(({ icon: IconComp, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--mint)',
                    border: '1px solid var(--mint-deep)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--leaf)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--mint-deep)'; }}
                >
                  <IconComp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--forest)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs mt-5 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              Empowering over 10,000+ corporate professionals, law practitioners & GIFT City entities daily with curated compliance intelligence.
            </p>
          </div>

          {/* ─── Right: Newsletter panel ─── */}
          <div
            className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, var(--forest) 0%, var(--forest-deep) 100%)',
            }}
          >
            {/* Corner glow decoration */}
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none animate-pulse-glow"
              style={{ background: 'radial-gradient(circle, rgba(18,138,84,0.4) 0%, transparent 70%)' }}
            />
            <div
              className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(220,199,154,0.12) 0%, transparent 70%)' }}
            />

            <div className="relative z-10 space-y-5">
              {/* Eyebrow */}
              <div className="eyebrow flex items-center gap-1" style={{ color: 'var(--gold-soft)' }}>
                <span>§</span>
                <span>Weekly Regulatory Digest</span>
              </div>

              <h2
                className="text-xl sm:text-2xl leading-snug text-white"
                style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
              >
                Stay ahead.<br />Stay compliant.
              </h2>

              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Subscribe to receive curated circular breakdowns, statutory due-date alerts, and legal insights delivered straight to your inbox.
              </p>

              {subscribed ? (
                <div
                  className="p-3.5 rounded-xl flex items-center gap-2 text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gold-soft)' }} />
                  <span className="font-semibold text-white">
                    Subscribed! You'll receive our next digest shortly.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your professional email…"
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      fontFamily: 'Public Sans, sans-serif',
                    }}
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 flex items-center gap-2 justify-center"
                    style={{
                      background: 'var(--gold)',
                      color: 'white',
                      boxShadow: '0 4px 16px rgba(180,138,82,0.4)',
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
