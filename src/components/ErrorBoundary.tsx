import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { STORAGE_KEY } from '../constants';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold">系統發生渲染錯誤</h2>
            <p className="text-xs text-slate-400 break-words">{this.state.error?.toString()}</p>
            <button
              onClick={() => {
                try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
                window.location.reload();
              }}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-xl text-xs font-semibold transition"
            >
              重設快取並重新載入
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
