import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useLogin } from "../hooks/useAuthQuery";
import { getErrorMessage } from "../utils/errorHandling";
import SocialLoginButtons from "./SocialLoginButtons";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginMutation.mutateAsync({ email, password });
      // トークンは自動的にuseLoginフックで保存される
      navigate("/");
    } catch (error) {
      // エラーはuseLoginフックで自動的に処理される
      console.error("Login failed:", error);
    }
  };

  const errorMessage = loginMutation.error
    ? getErrorMessage(loginMutation.error)
    : "";
  const isLoading = loginMutation.isPending;

  return (
    <div className="card-glass p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        おかえりなさい
      </h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
          {errorMessage}
        </div>
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
          <span className="relative z-10">
            {isLoading ? "ログイン中..." : "ログイン"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        アカウントをお持ちでないですか？{" "}
        <Link to="/register" className="text-neon-blue hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
