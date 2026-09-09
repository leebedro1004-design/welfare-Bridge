import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CareBridge ErrorBoundary Caught Error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleSoftReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-stone-100 dark:bg-[#191412] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-[#231C18] rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                {this.props.fallbackTitle || '화면을 표시하는 중 일시적인 문제가 발생했습니다'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                데이터 처리 중 예기치 않은 오류가 발생했습니다. 아래 버튼을 눌러 화면을 다시 복원해 주세요.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-stone-50 dark:bg-[#1B1513] p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 text-left">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>오류 세부 내용</span>
                </div>
                <p className="text-[11px] font-mono text-stone-700 dark:text-stone-300 break-all">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleSoftReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors"
              >
                화면 다시 시도
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>새로고침하여 복원</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
