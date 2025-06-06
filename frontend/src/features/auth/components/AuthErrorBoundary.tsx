import React, { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * 認証システム専用のエラーバウンダリー
 * 認証関連のエラーを適切にキャッチして表示
 */
export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-space-900 via-space-800 to-space-700">
          <div className="card-glass p-8 max-w-md mx-auto text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="text-red-400" size={48} />
            </div>
            <h2 className="text-xl font-bold text-white mb-4">
              認証エラーが発生しました
            </h2>
            <p className="text-gray-300 mb-6">
              認証システムで問題が発生しました。もう一度お試しください。
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                再試行
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary w-full"
              >
                ページを再読み込み
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-400">
                  エラー詳細（開発モード）
                </summary>
                <pre className="mt-2 text-xs text-red-300 bg-red-900/20 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 関数コンポーネント版のエラーバウンダリーフック
 */
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <AuthErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </AuthErrorBoundary>
    );
  };
}
