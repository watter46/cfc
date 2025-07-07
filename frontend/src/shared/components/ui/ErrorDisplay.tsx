import { X } from "lucide-react";
import { getUserFriendlyErrorMessage } from "@/shared/utils/errorHandling";

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
  variant?: "default" | "compact" | "inline";
}

/**
 * 統一されたエラー表示コンポーネント
 * サイバーパンクテーマに合わせたスタイリング
 */
export function ErrorDisplay({
  error,
  onRetry,
  onClose,
  className = "",
  variant = "default",
}: ErrorDisplayProps) {
  if (!error) return null;

  const {
    title,
    message,
    icon: Icon,
    actionText,
  } = getUserFriendlyErrorMessage(error);

  const baseClasses = "border border-red-500/30 bg-red-500/10 backdrop-blur-sm";
  const variantClasses = {
    default: "p-4 rounded-lg",
    compact: "p-3 rounded-md",
    inline: "p-2 rounded",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon
            size={variant === "compact" ? 16 : 20}
            className="text-red-400"
          />
        </div>

        <div className="flex-1 min-w-0">
          {variant !== "inline" && (
            <h3 className="text-red-300 font-medium mb-1 text-sm">{title}</h3>
          )}
          <p className="text-red-200 text-sm leading-relaxed">{message}</p>

          {onRetry && actionText && variant === "default" && (
            <button
              onClick={onRetry}
              className="mt-3 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded text-red-300 text-sm transition-colors"
            >
              {actionText}
            </button>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
            aria-label="エラーを閉じる"
          >
            <X size={variant === "compact" ? 14 : 16} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 複数のバリデーションエラーを表示するコンポーネント
 */
interface ValidationErrorsProps {
  errors: Record<string, string[]>;
  className?: string;
}

export function ValidationErrors({
  errors,
  className = "",
}: ValidationErrorsProps) {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {errorEntries.map(([field, messages]) => (
        <div
          key={field}
          className="p-2 bg-red-500/10 border border-red-500/20 rounded text-sm"
        >
          <div className="text-red-300 font-medium capitalize mb-1">
            {field.replace("_", " ")}
          </div>
          <ul className="text-red-200 text-xs space-y-0.5">
            {messages.map((message, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-red-400 mt-1">•</span>
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
