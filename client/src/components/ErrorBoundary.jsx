import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled React error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[350px] my-8 p-6 sm:p-8 max-w-2xl mx-auto bg-white rounded-3xl border border-rose-200 shadow-lg text-center space-y-5 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
              {this.props.title || 'Something Went Wrong'}
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-forest-deep">
              Unable to display this content
            </h2>
            <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
              An error occurred while loading this module. Please try again or return to the course catalog.
            </p>
          </div>

          {this.state.error && (
            <div className="p-3 bg-rose-50/50 rounded-xl text-left border border-rose-100 max-h-32 overflow-y-auto font-mono text-[11px] text-rose-800 leading-relaxed">
              {this.state.error.toString()}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-full bg-forest text-white font-bold text-xs sm:text-sm hover:bg-forest-deep transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <a
              href="/learn"
              className="px-5 py-2.5 rounded-full bg-mint text-forest font-bold text-xs sm:text-sm hover:bg-mint-deep transition-all border border-mint-deep flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to RegLearn
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
