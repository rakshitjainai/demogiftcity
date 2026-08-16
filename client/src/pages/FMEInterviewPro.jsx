import React, { useState } from 'react';
import { Briefcase, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LockOverlay from '../components/LockOverlay';

export default function FMEInterviewPro() {
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
        title="Login Required for FME-InterviewPro"
        message="Accessing the RegMate FME-InterviewPro product interface requires an authenticated account. Please log in or sign up to continue."
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
    <div className="w-full flex-1 min-h-[calc(100vh-64px)] flex flex-col bg-white relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xs text-forest-deep pointer-events-none">
          <div className="w-10 h-10 border-3 border-forest border-t-gold rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-forest-deep">Loading RegMate FME-InterviewPro...</p>
        </div>
      )}
      <iframe
        id="job-iframe"
        src={iframeSrc}
        title="RegMate FME-InterviewPro"
        onLoad={() => setLoading(false)}
        className="w-full flex-1 min-h-[calc(100vh-64px)] border-0 bg-white"
        style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 64px)' }}
      />
    </div>
  );
}
