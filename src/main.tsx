import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Recovered from UI error:', error);
  }

  handleRecover = () => {
    try {
      // Clear any corrupted transient cache if needed and recover state
      this.setState({ hasError: false });
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] text-amber-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#12192b] border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="text-3xl font-bold text-amber-400">ॐ</div>
            <h2 className="text-xl font-bold font-vedic text-amber-100">
              पण्डित जी ऑनलाइन - पेज रीफ्रेश करें
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/85">
              तकनीकी डेटा सिंक के कारण पेज को रीलोड करने की आवश्यकता है। नीचे बटन दबाकर तुरंत ऐप चालू करें।
            </p>
            <button
              type="button"
              onClick={this.handleRecover}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-sm shadow-lg cursor-pointer"
            >
              ऐप तुरंत चालू करें (Reload App)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
