import { Routes, Route, Navigate } from "react-router-dom";
import { generateRoutes } from "./routes";

/**
 * アプリケーションのメインルーター
 * React Routerを使用してSPAのルーティングを管理
 */
export function AppRouter() {
  return (
    <Routes>
      {/* 定義されたルートを生成 */}
      {generateRoutes()}

      {/* 404ページ - 存在しないルートは全てホームページにリダイレクト */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
