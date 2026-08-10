import React from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthGated({ pageName }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in-up">
      <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-leaf" />
      </div>
      <h1 className="text-3xl font-display text-forest-deep mb-4">
        {pageName} is Locked
      </h1>
      <p className="text-ink-soft max-w-md mx-auto mb-8 text-lg">
        This area is restricted. Please login to your account or become a RegMate Premium member to access learning modules, dashboards, and certificates.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="cursor-target px-6 py-3 bg-forest text-white rounded-full font-medium hover-lift">
          Login
        </button>
        <Link
          to="/membership"
          className="cursor-target px-6 py-3 border border-forest text-forest rounded-full font-medium hover-lift"
        >
          Become a Member
        </Link>
      </div>
    </div>
  );
}
