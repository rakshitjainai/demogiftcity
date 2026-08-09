import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Award, Sparkles } from 'lucide-react';

export default function TrustNewsletterBand() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  const trustBadges = [
    "Company Secretaries",
    "Chartered Accountants",
    "Advocates",
    "IFSC Businesses",
    "Compliance Officers"
  ];

  return (
    <section className="py-12 bg-slate-100/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Half: Trust Badges (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-reg-green" />
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Trusted by Professionals Across Domains
              </h3>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {trustBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-xs text-slate-700 text-xs font-bold flex items-center space-x-2 hover:border-reg-green transition-all"
                >
                  <Award className="w-3.5 h-3.5 text-reg-green" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 font-medium pt-1">
              Empowering over 10,000+ corporate professionals, law practitioners & GIFT City entities daily.
            </p>
          </div>

          {/* Right Half: Newsletter Card (6 cols) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md relative overflow-hidden">
              
              {/* Decorative Envelope Background Graphic */}
              <div className="absolute right-0 bottom-0 transform translate-x-4 translate-y-4 opacity-10 pointer-events-none text-reg-green">
                <Mail className="w-48 h-48" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-reg-green text-[10px] font-extrabold mb-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Weekly Regulatory Digest</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      Stay Ahead. Stay Compliant.
                    </h3>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-reg-green">
                    <Mail className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Subscribe to receive curated circular breakdowns, statutory due-date alerts, and legal insights delivered straight to your inbox.
                </p>

                {subscribed ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-reg-green flex-shrink-0" />
                    <span>Thank you! You have successfully subscribed to RegMate updates.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your professional email address…"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-reg-green focus:ring-1 focus:ring-reg-green bg-slate-50/50"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-reg-green hover:bg-reg-green-dark text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center space-x-1.5 flex-shrink-0"
                    >
                      <span>Subscribe</span>
                    </button>
                  </form>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
