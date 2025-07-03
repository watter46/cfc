/**
 * 認証API用の型定義
 * Laravel Sanctum Cookie認証APIレスポンスの型安全性を保証
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
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      email_verified_at?: string;
      created_at?: string;
      updated_at?: string;
    };
  };
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      created_at?: string;
      updated_at?: string;
    };
  };
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

/**
 * サイレント認証（/user/auth/me）のレスポンス型
 * Cookie認証でのユーザー情報取得
 */
export interface SilentAuthResponse {
  data: {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
  };
}

/**
 * 完全な認証レスポンス型（ログイン・新規登録時）
 * Cookie-based認証では、userオブジェクトのみを返す
 */
export interface FullAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
  };
}
