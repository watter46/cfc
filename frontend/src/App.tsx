import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth/contexts/AuthContext.tsx";
import { AppRouter } from "./app";

/**
 * ルートアプリケーションコンポーネント
 * 認証プロバイダーとルーターでアプリケーション全体をラップ
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
