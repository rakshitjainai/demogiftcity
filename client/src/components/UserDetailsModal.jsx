import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, ShieldCheck, Crown, BookOpen, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function UserDetailsModal({ user, onClose, onToggleMembership }) {
  const [updating, setUpdating] = useState(false);

  if (!user) return null;

  const isMember = user.membershipStatus === 'active';

  const handleToggle = async () => {
    setUpdating(true);
    try {
      await onToggleMembership(user.id, isMember ? 'free' : 'active', isMember ? 'Free Tier' : 'Premium Member');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>{user.name}</span>
                {user.role === 'admin' && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-extrabold uppercase">
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">User ID: {user.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Contact & Account Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>Email Address</span>
              </div>
              <p className="text-xs font-bold text-slate-900 break-all">{user.email}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phone Number</span>
              </div>
              <p className="text-xs font-bold text-slate-900">{user.phone || 'Not provided'}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Registration Date</span>
              </div>
              <p className="text-xs font-bold text-slate-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Subscription Plan</span>
              </div>
              <p className="text-xs font-bold text-slate-900">{user.subscriptionPlan || 'Free Tier'}</p>
            </div>
          </div>

          {/* Membership Status Badge & Toggle Action */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMember ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Membership Status:</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-black uppercase ${isMember ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                    {isMember ? 'Active Member' : 'Free User'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isMember ? 'Full Knowledge Hub access granted' : 'Restricted Knowledge Hub access (3 questions, 2 chapters)'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={updating}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5 ${
                isMember 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              {updating ? (
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <Crown className="w-3.5 h-3.5" />
                  <span>{isMember ? 'Revoke Membership' : 'Grant Membership'}</span>
                </>
              )}
            </button>
          </div>

          {/* Usage Metrics Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Knowledge Hub Platform Usage
            </h3>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <HelpCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-lg font-black text-emerald-900 block">{user.quizQuestionsAnswered || 0}</span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Quiz Answers</span>
              </div>

              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                <BookOpen className="w-5 h-5 text-emerald-700 mx-auto mb-1" />
                <span className="text-lg font-black text-emerald-950 block">{user.chaptersReadCount || (user.chaptersRead ? user.chaptersRead.length : 0)}</span>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Chapters Read</span>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <span className="text-lg font-black text-purple-900 block">{user.examReadyAttemptsCount || 0}</span>
                <span className="text-[10px] font-bold text-purple-700 uppercase">Exam Attempts</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
