import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import SocialLoginButtons from "./SocialLoginButtons";
import { ErrorDisplay } from "@/shared/components/ui/ErrorDisplay";
import { LoadingSpinner } from "@/shared/components/ui/LoadingSpinner";

const SigninForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await auth.signin(email, password);
      console.log("✅ ログイン成功、/matchesにリダイレクトします");
      navigate("/matches");
    } catch (error: any) {
      console.error("❌ ログイン失敗:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-glass p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        おかえりなさい
      </h2>

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => setError(null)}
          className="mb-4"
        />
      )}

      <SocialLoginButtons />

      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-space-600"></div>
        <span className="px-4 text-sm text-gray-400">
          またはメールアドレスでログイン
        </span>
        <div className="flex-grow h-px bg-space-600"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Mail size={18} />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="input pl-10 w-full"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="input pl-10 w-full pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="rounded bg-space-700 border-space-600 text-neon-blue focus:ring-neon-blue mr-2"
            />
            <span className="text-sm text-gray-300">ログイン状態を保持</span>
          </label>

          <Link
            to="/forgot-password"
            className="text-sm text-neon-blue hover:underline"
          >
            パスワードを忘れましたか？
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full py-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading && <LoadingSpinner size="sm" variant="default" />}
            {isLoading ? "サインイン中..." : "サインイン"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        アカウントをお持ちでないですか？{" "}
        <Link to="/signup" className="text-neon-blue hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  );
};

export default SigninForm;
