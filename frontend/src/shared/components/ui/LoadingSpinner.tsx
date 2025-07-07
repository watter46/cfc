import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "success" | "purple";
  className?: string;
  text?: string;
}

/**
 * サイバーパンクテーマの統一ローディングスピナー
 */
export function LoadingSpinner({
  size = "md",
  variant = "default",
  className = "",
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const variantClasses = {
    default: "text-neon-blue",
    primary: "text-neon-blue",
    success: "text-neon-green",
    purple: "text-neon-purple",
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2
        className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`}
      />
      {text && (
        <span className={`text-sm ${variantClasses[variant]}`}>{text}</span>
      )}
    </div>
  );
}

/**
 * フルスクリーンローディングオーバーレイ
 */
interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  variant?: "default" | "primary" | "success" | "purple";
}

export function LoadingOverlay({
  isVisible,
  text = "読み込み中...",
  variant = "primary",
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-space-800/90 backdrop-blur-md border border-space-600 rounded-lg p-8 flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" variant={variant} />
        <p className="text-white text-lg">{text}</p>
      </div>
    </div>
  );
}

/**
 * インライン読み込み状態
 */
interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  variant?: "default" | "primary" | "success" | "purple";
  className?: string;
}

export function LoadingState({
  isLoading,
  children,
  loadingText = "読み込み中...",
  variant = "default",
  className = "",
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={`py-8 ${className}`}>
        <LoadingSpinner
          size="lg"
          variant={variant}
          text={loadingText}
          className="justify-center"
        />
      </div>
    );
  }

  return <>{children}</>;
}
