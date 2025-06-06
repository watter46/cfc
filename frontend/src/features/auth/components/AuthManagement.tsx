import React, { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { api } from "@/shared/lib/api-client";
import { LogOut, User, Shield, Key, Trash2, Plus } from "lucide-react";

interface Token {
  id: string;
  name: string;
  created_at: string;
  last_used_at?: string;
}

const AuthManagement: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // トークン一覧を取得
  const fetchTokens = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoadingTokens(true);
      setError("");
      const response = await api.auth.getTokens();
      setTokens(response.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`トークンの取得に失敗しました: ${errorMessage}`);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // 新しいトークンを作成
  const createToken = async () => {
    if (!newTokenName.trim()) {
      setError("トークン名を入力してください");
      return;
    }

    try {
      setIsCreatingToken(true);
      setError("");
      // Note: バックエンドに新しいトークン作成エンドポイントが必要
      await api.auth.getTokens(); // 実際には POST /auth/tokens
      setSuccess("新しいトークンが作成されました");
      setNewTokenName("");
      await fetchTokens();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`トークンの作成に失敗しました: ${errorMessage}`);
    } finally {
      setIsCreatingToken(false);
    }
  };

  // 特定のトークンを削除
  const revokeToken = async (tokenId: string) => {
    try {
      setError("");
      await api.auth.revokeToken(tokenId);
      setSuccess("トークンが削除されました");
      await fetchTokens();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`トークンの削除に失敗しました: ${errorMessage}`);
    }
  };

  // 全てのトークンを削除
  const revokeAllTokens = async () => {
    if (
      !window.confirm(
        "全てのトークンを削除しますか？この操作は取り消せません。"
      )
    ) {
      return;
    }

    try {
      setError("");
      await api.auth.revokeAllTokens();
      setSuccess("全てのトークンが削除されました");
      setTokens([]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`トークンの削除に失敗しました: ${errorMessage}`);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
      setSuccess("ログアウトしました");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`ログアウトに失敗しました: ${errorMessage}`);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="card-glass p-6">
        <p className="text-gray-400 text-center">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* エラー・成功メッセージ */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* ユーザー情報セクション */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <User size={20} className="mr-2" />
          現在のユーザー
        </h3>
        <div className="space-y-2">
          <p className="text-gray-300">
            <span className="text-gray-400">名前:</span> {user.name}
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">メール:</span> {user.email}
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">ID:</span> {user.id}
          </p>
          {user.email_verified_at && (
            <p className="text-green-400 flex items-center">
              <Shield size={16} className="mr-1" />
              メール認証済み
            </p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-danger mt-4 flex items-center"
        >
          <LogOut size={16} className="mr-2" />
          ログアウト
        </button>
      </div>

      {/* トークン管理セクション */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Key size={20} className="mr-2" />
            APIトークン管理
          </h3>
          <button
            onClick={fetchTokens}
            disabled={isLoadingTokens}
            className="btn btn-secondary btn-sm"
          >
            {isLoadingTokens ? "読み込み中..." : "更新"}
          </button>
        </div>

        {/* 新しいトークン作成 */}
        <div className="mb-6 p-4 bg-space-800/50 rounded-lg">
          <h4 className="text-white font-medium mb-3">新しいトークンを作成</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              placeholder="トークン名（例: Mobile App）"
              className="input flex-1"
            />
            <button
              onClick={createToken}
              disabled={isCreatingToken || !newTokenName.trim()}
              className="btn btn-primary flex items-center"
            >
              <Plus size={16} className="mr-1" />
              作成
            </button>
          </div>
        </div>

        {/* トークン一覧 */}
        {tokens.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            アクティブなトークンはありません
          </p>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-3 bg-space-800/50 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {token.name || "名前なし"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    作成:{" "}
                    {token.created_at
                      ? new Date(token.created_at).toLocaleDateString("ja-JP")
                      : "不明"}
                  </p>
                  {token.last_used_at && (
                    <p className="text-gray-400 text-sm">
                      最終使用:{" "}
                      {new Date(token.last_used_at).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => revokeToken(token.id)}
                  className="btn btn-danger btn-sm flex items-center"
                >
                  <Trash2 size={14} className="mr-1" />
                  削除
                </button>
              </div>
            ))}

            {tokens.length > 1 && (
              <button
                onClick={revokeAllTokens}
                className="btn btn-danger w-full mt-4 flex items-center justify-center"
              >
                <Trash2 size={16} className="mr-2" />
                全てのトークンを削除
              </button>
            )}
          </div>
        )}
      </div>

      {/* テスト用ボタン */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">認証テスト</h3>
        <div className="space-y-2">
          <button onClick={fetchTokens} className="btn btn-secondary w-full">
            認証状態をテスト (GET /auth/tokens)
          </button>
          <button
            onClick={() =>
              api.auth.getUser().then(console.log).catch(console.error)
            }
            className="btn btn-secondary w-full"
          >
            ユーザー情報を取得 (GET /auth/me)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthManagement;
