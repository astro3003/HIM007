import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // If it's an external browser extension error (e.g. MetaMask, Wallet, etc.), don't break the UI
    const msg = (error && error.message) || '';
    const lower = msg.toLowerCase();
    if (
      lower.includes('metamask') ||
      lower.includes('ethereum') ||
      lower.includes('failed to connect') ||
      lower.includes('wallet') ||
      lower.includes('web3')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const msg = (error && error.message) || '';
    const lower = msg.toLowerCase();
    if (
      lower.includes('metamask') ||
      lower.includes('ethereum') ||
      lower.includes('failed to connect') ||
      lower.includes('wallet') ||
      lower.includes('web3')
    ) {
      // Silently ignore extension-injected errors
      return;
    }
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F4F1] flex items-center justify-center p-6 text-[#0A0029] font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#E7E7E7] p-8 text-center space-y-6">
            <div className="w-14 h-14 bg-[#E31B23]/10 text-[#E31B23] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-bold tracking-tight">HIM Tactical Command</h1>
              <p className="text-sm text-[#495057] leading-relaxed">
                An unexpected display anomaly occurred. All store states and cart allocations remain secure.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center space-x-2 w-full py-3.5 px-6 bg-[#0A0029] hover:bg-[#E31B23] text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
