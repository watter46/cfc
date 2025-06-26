/**
 * 認証トークン管理ユーティリティ
 * LocalStorageでのトークン管理を一元化
 */

const AUTH_TOKEN_KEY = 'auth_token';

/**
 * 認証トークンを保存
 */
export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    console.log('💾 認証トークンを保存しました');
  } catch (error) {
    console.error('❌ トークン保存エラー:', error);
    throw new Error('認証トークンの保存に失敗しました');
  }
}

/**
 * 認証トークンを取得
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('❌ トークン取得エラー:', error);
    return null;
  }
}

/**
 * 認証トークンの存在チェック
 */
export function hasAuthToken(): boolean {
  return !!getAuthToken();
}

/**
 * 認証トークンを削除
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    console.log('🗑️ 認証トークンを削除しました');
  } catch (error) {
    console.error('❌ トークン削除エラー:', error);
  }
}

/**
 * URLからトークンパラメータを取得
 */
export function extractTokenFromUrl(searchParams: URLSearchParams): {
  token: string | null;
  error: string | null;
} {
  return {
    token: searchParams.get('token'),
    error: searchParams.get('error'),
  };
}

/**
 * 認証エラーの判定
 */
export function isAuthenticationError(error: any): boolean {
  return error?.response?.status === 401;
}
