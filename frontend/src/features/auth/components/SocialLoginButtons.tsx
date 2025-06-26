import React from "react";
import { useSocialLogin } from "../hooks/useSocialLogin";
import GoogleIcon from "@/shared/components/icons/GoogleIcon";
import XIcon from "@/shared/components/icons/XIcon";

/**
 * ソーシャルログインボタン（Google, X）
 *
 * このコンポーネントは以下の機能を提供します：
 * - Google OAuth認証への遷移
 * - X OAuth認証への遷移
 * - 統一されたUI/UXでのソーシャルログイン体験
 *
 * @component
 * @example
 * ```tsx
 * <SocialLoginButtons />
 * ```
 */
const SocialLoginButtons: React.FC = () => {
  const { handleGoogleLogin, handleXLogin, isLoading, error } = useSocialLogin();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded bg-gray-100 border border-gray-300 px-4 py-2 shadow disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Googleでログイン"
        >
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">認証中...</span>
        </button>
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 rounded bg-gray-800 border border-gray-300 px-4 py-2 shadow disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Xでログイン"
        >
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-300 font-medium">認証中...</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 rounded bg-white border border-gray-300 px-4 py-2 shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Googleでログイン"
      >
        <GoogleIcon className="w-5 h-5" />
        <span className="text-gray-700 font-medium">Googleでログイン</span>
      </button>
      
      <button
        type="button"
        onClick={handleXLogin}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 rounded bg-black border border-gray-300 px-4 py-2 shadow hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Xでログイン"
      >
        <XIcon className="w-5 h-5 fill-white" />
        <span className="text-white font-medium">Xでログイン</span>
      </button>
      
      <div className="text-center text-sm text-gray-500 my-2">
        または
      </div>
    </div>
  );
};

export default SocialLoginButtons;
