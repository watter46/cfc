import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRegister } from "../hooks/useAuthQuery";
import { getErrorMessage } from "../utils/errorHandling";
import SocialLoginButtons from "./SocialLoginButtons";

const RegisterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  const registerMutation = useRegister();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");
    setDebugInfo("");

    // フロントエンドバリデーション
    if (password !== confirmPassword) {
      setValidationError("パスワードが一致しません。");
      return;
    }

    if (password.length < 6) {
      setValidationError("パスワードは6文字以上で入力してください。");
      return;
    }

    setDebugInfo("登録処理を開始中...");

    try {
      // 登録データをログ出力（パスワードは除く）
      console.log("Registration attempt:", {
        name,
        email,
        passwordLength: password.length,
      });
      setDebugInfo(
        `送信データ: 名前=${name}, メール=${email}, パスワード長=${password.length}`
      );

      const result = await registerMutation.mutateAsync({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      console.log("Registration successful:", result);

      setSuccessMessage(
        "アカウントが正常に作成されました！ログインしています..."
      );
      setDebugInfo(`登録成功 - トークン受信: ${result.token ? "✓" : "✗"}`);

      // 短い遅延後にホームページにリダイレクト
      setTimeout(() => {
        setDebugInfo("ホームページへ移動...");
        navigate("/");
      }, 1500);
    } catch (error: unknown) {
      console.error("Registration failed:", error);

      // より詳細なエラー情報を表示
      let errorDetails = "詳細不明";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response: { status: number; data: unknown };
        };
        errorDetails = `ステータス: ${axiosError.response.status}, データ: ${JSON.stringify(axiosError.response.data)}`;
      } else if (error && typeof error === "object" && "message" in error) {
        errorDetails = (error as { message: string }).message;
      }

      setDebugInfo(`登録エラー: ${errorDetails}`);
    }
  };

  const apiErrorMessage = registerMutation.error
    ? getErrorMessage(registerMutation.error)
    : "";
  const errorMessage = validationError || apiErrorMessage;
  const isLoading = registerMutation.isPending;

  return (
    <div className="card-glass p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        アカウント作成
      </h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 text-sm">
          {successMessage}
        </div>
      )}

      {debugInfo && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-400 text-sm">
          デバッグ: {debugInfo}
        </div>
      )}

      <SocialLoginButtons />

      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-space-600"></div>
        <span className="px-4 text-sm text-gray-400">
          またはメールアドレスで登録
        </span>
        <div className="flex-grow h-px bg-space-600"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <User size={18} />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="お名前"
            className="input pl-10 w-full"
            required
          />
        </div>

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
            placeholder="パスワード（6文字以上）"
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

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock size={18} />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="パスワード確認"
            className="input pl-10 w-full pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            className="rounded bg-space-700 border-space-600 text-neon-blue focus:ring-neon-blue mr-2"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-300">
            <Link to="/terms" className="text-neon-blue hover:underline">
              利用規約
            </Link>
            と
            <Link to="/privacy" className="text-neon-blue hover:underline">
              プライバシーポリシー
            </Link>
            に同意します
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full py-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">
            {isLoading ? "登録中..." : "アカウント作成"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        すでにアカウントをお持ちですか？{" "}
        <Link to="/login" className="text-neon-blue hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
