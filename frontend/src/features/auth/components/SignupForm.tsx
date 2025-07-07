import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import SocialLoginButtons from "./SocialLoginButtons";
import { ErrorDisplay } from "@/shared/components/ui/ErrorDisplay";
import { LoadingSpinner } from "@/shared/components/ui/LoadingSpinner";

const SignupForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");
    setError(null);

    // フロントエンドバリデーション
    if (password !== confirmPassword) {
      setValidationError("パスワードが一致しません。");
      return;
    }

    if (password.length < 6) {
      setValidationError("パスワードは6文字以上で入力してください。");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔄 サインアップ処理を開始します:", { name, email });

      await signup(name, email, password, confirmPassword);

      setSuccessMessage(
        "アカウントが正常に作成されました！ホームページに移動します..."
      );
      console.log("✅ サインアップに成功しました");

      // 短い遅延後にホームページにリダイレクト
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      console.error("❌ サインアップに失敗しました:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-glass p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        アカウント作成
      </h2>

      {validationError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
          {validationError}
        </div>
      )}

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => setError(null)}
          className="mb-4"
        />
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 text-sm">
          {successMessage}
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

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full py-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading && <LoadingSpinner size="sm" variant="default" />}
            {isLoading ? "サインアップ中..." : "アカウント作成"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        すでにアカウントをお持ちですか？{" "}
        <Link to="/signin" className="text-neon-blue hover:underline">
          サインイン
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
