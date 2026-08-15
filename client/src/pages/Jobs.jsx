import React, { useState } from 'react';
import { Briefcase, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LockOverlay from '../components/LockOverlay';

export default function Jobs() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);

    const handleMessage = (e) => {
      if (e.data && e.data.type === 'IFRAME_MOUSE_MOVE') {
        const iframe = document.getElementById('job-iframe');
        if (!iframe) return;
        const rect = iframe.getBoundingClientRect();
        const clientX = e.data.clientX + rect.left;
        const clientY = e.data.clientY + rect.top;

        const mouseEvt = new MouseEvent('mousemove', {
          clientX: clientX,
          clientY: clientY,
          bubbles: true,
          cancelable: true,
          view: window
        });
        window.dispatchEvent(mouseEvt);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <LockOverlay
        type="login"
        title="Login Required for Product Interface"
        message="Accessing RegMate JobReady product interface requires an authenticated account. Please log in or sign up to continue."
        redirectPath="/login"
      />
    );
  }

  const queryParams = new URLSearchParams();
  if (user?.name) queryParams.set('name', user.name);
  if (user?.email) queryParams.set('email', user.email);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const iframeSrc = `/job-interface/index.html${queryString}`;

  return (
    <div className="w-full flex-1 min-h-[calc(100vh-64px)] flex flex-col bg-slate-50 relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs text-slate-800 pointer-events-none">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading RegMate Job Interface...</p>
        </div>
      )}
      <iframe
        id="job-iframe"
        src={iframeSrc}
        title="RegMate Job Interface"
        onLoad={() => setLoading(false)}
        className="w-full flex-1 min-h-[calc(100vh-64px)] border-0"
        style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 64px)' }}
      />
    </div>
  );
}
