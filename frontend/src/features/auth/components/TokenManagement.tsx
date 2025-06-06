import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { api } from "@/shared/lib/api-client";
import { Trash2, RefreshCw } from "lucide-react";

interface Token {
  id: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
}

const TokenManagement: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTokens = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await api.auth.getTokens();
      setTokens(response.data);
    } catch (err) {
      setError("トークンの取得に失敗しました");
      console.error("Failed to fetch tokens:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const revokeToken = async (tokenId: string) => {
    try {
      await api.auth.revokeToken(tokenId);
      setTokens(tokens.filter((token) => token.id !== tokenId));
    } catch (err) {
      setError("トークンの削除に失敗しました");
      console.error("Failed to revoke token:", err);
    }
  };

  const revokeAllTokens = async () => {
    try {
      await api.auth.revokeAllTokens();
      setTokens([]);
    } catch (err) {
      setError("全トークンの削除に失敗しました");
      console.error("Failed to revoke all tokens:", err);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="card-glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          アクセストークン管理
        </h3>
        <button
          onClick={fetchTokens}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
          {error}
        </div>
      )}

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
                <p className="text-white font-medium">{token.name}</p>
                <p className="text-gray-400 text-sm">
                  作成日:{" "}
                  {new Date(token.created_at).toLocaleDateString("ja-JP")}
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
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {tokens.length > 1 && (
            <button
              onClick={revokeAllTokens}
              className="btn btn-danger w-full mt-4"
            >
              全てのトークンを削除
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenManagement;
