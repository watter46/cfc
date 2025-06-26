/**
 * 認証API用の型定義
 * Laravel Sanctum APIレスポンスの型安全性を保証
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
  };
  token: string; // トークンベース認証では必須
  token_type?: string; // Bearer
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  user: {
    id: number;
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
  };
  token: string; // トークンベース認証では必須
  token_type?: string; // Bearer
  message?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
  code?: string;
}

export interface TokenInfo {
  id: string;
  name: string;
  abilities: string[];
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTokenRequest {
  name: string;
  abilities?: string[];
}

export interface CreateTokenResponse {
  token: string;
  plainTextToken: string;
  accessToken: TokenInfo;
}

/**
 * サイレント認証（/auth/user、/auth/me）のレスポンス型
 * 実際のバックエンドレスポンス：ユーザー情報のみ
 */
export interface SilentAuthResponse {
  id: string; // ULIDを使用
  name: string;
  email: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 完全な認証レスポンス型（ログイン・新規登録時）
 * バックエンドから返される形式：{ token, token_type, user }
 */
export interface FullAuthResponse {
  token: string;
  token_type: string; // 'Bearer'
  user: {
    id: string;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
  };
}
