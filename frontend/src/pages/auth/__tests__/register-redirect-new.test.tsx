import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../../features/auth/contexts/AuthContext";
import RegisterPage from "../register";

// テスト用のQueryClientを作成するヘルパー関数
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

// テスト用ラッパーコンポーネント
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("RegisterPage - 基本機能", () => {
  it("新規登録フォームが表示される", () => {
    const { container } = render(<RegisterPage />, { wrapper: TestWrapper });

    // MainLayoutコンポーネントが含まれていることを確認
    expect(container.querySelector('div[class*="min-h-"]')).toBeInTheDocument();
  });

  it("適切なスタイリングが適用されている", () => {
    const { container } = render(<RegisterPage />, { wrapper: TestWrapper });

    // 背景要素が存在することを確認
    const backgroundElements = container.querySelectorAll(
      'div[class*="absolute"]'
    );
    expect(backgroundElements.length).toBeGreaterThan(0);
  });
});
