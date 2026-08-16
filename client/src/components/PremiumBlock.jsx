import React from 'react';
import { CheckCircle, Crown, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PremiumBlock() {
  const navigate = useNavigate();
  const { user, isMember, initiateCheckout } = useAuth();

  const handleBecomeMember = () => {
    if (!user) {
      navigate('/membership');
      return;
    }
    initiateCheckout({
      productType: 'membership',
      productId: 'full_access',
      onSuccess: () => navigate('/membership')
    });
  };

  return (
    <section className="py-16 bg-white px-4 sm:px-6">
      <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden card-shadow bg-gradient-to-br from-[#142B1A] via-[#1b3822] to-[#0D2000] flex flex-col lg:flex-row border border-[#2A4832] relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="p-8 sm:p-10 md:p-12 flex-1 relative z-10 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-gold/20 border border-gold/30 rounded-full text-gold text-xs font-bold uppercase tracking-wider mb-4 w-fit">
            <Crown className="w-4 h-4 fill-gold text-gold" /> § RegMate Membership
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 leading-tight">
            Get Full Access to RegMate — ₹1,999/year
          </h2>
          
          <p className="text-base sm:text-lg text-white/80 mb-8 max-w-xl leading-relaxed font-medium">
            Unlock the complete regulatory compliance workspace — all compliance tools, interactive regulations, knowledge hub, mock tests, and interview modules.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-white/90 text-xs sm:text-sm font-medium mb-8">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <span><strong>All Compliance Tools</strong> &amp; Filing Trackers</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <span><strong>Interactive Regulations</strong> (All Chapters)</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <span><strong>Knowledge Hub</strong> &amp; Formats Library</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <span><strong>ExamReady Mock Tests</strong> &amp; Quizzes</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <span><strong>Job &amp; Interview Ready</strong> Modules</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <span><strong>Practitioner Guidance</strong> by CS Prashant Kumar</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={handleBecomeMember}
              className="cursor-target px-8 py-4 bg-gradient-to-r from-gold via-amber-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[52px]"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isMember ? 'Membership Active ✓' : 'Become a Member — ₹1,999/yr'}</span>
            </button>
            
            <button
              onClick={() => navigate('/membership')}
              className="cursor-target px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm border border-white/20 min-h-[52px]"
            >
              <span>View All Membership Perks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-forest-deep/90 p-8 sm:p-10 md:p-12 w-full lg:w-80 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10 relative z-10 text-center lg:text-left">
          <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-2">Annual All-Access Pass</span>
          <div className="text-white text-4xl sm:text-5xl font-display font-bold mb-2">₹1,999<span className="text-lg text-white/60 font-sans font-medium"> / year</span></div>
          <p className="text-white/60 text-xs sm:text-sm mb-6">Equal to ~₹166 / month • Cancel anytime</p>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 text-xs text-white/80 text-left">
            <div className="flex items-center gap-2 text-gold font-bold">
              <ShieldCheck className="w-4 h-4" /> 100% Full RegMate Access
            </div>
            <p className="leading-relaxed text-white/70">
              Get immediate, unrestricted access across all current regulations, compliance tools, and future updates.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
