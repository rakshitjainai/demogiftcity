import React from 'react';
import { useAuth } from '../context/AuthContext';
import LockOverlay from './LockOverlay';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in -> Show Login Lock Overlay
  if (!user) {
    return (
      <LockOverlay
        type="login"
        title="Login to Continue"
        message="This section of RegMate requires an authenticated account. Please log in or create an account to access."
        redirectPath="/login"
      />
    );
  }

  // Admin route check
  if (requireAdmin && user.role !== 'admin') {
    return (
      <LockOverlay
        type="login"
        title="Admin Access Only"
        message="You do not have administrative privileges to view this page. Redirecting to home."
        redirectPath="/"
      />
    );
  }

  return children;
}

export default ProtectedRoute;
