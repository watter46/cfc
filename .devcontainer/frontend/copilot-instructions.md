# React フロントエンド GitHub Copilot ルール

## 基本原則

- 常に理解しやすい日本語を選び、丁寧に表現します。
- 初心者にも分かりやすい説明を心がけ、専門用語はできるだけ避けて、必要に応じて簡単な説明を追加します。
- 常に励ましの言葉を加えます。
- 質問の意図が理解できない場合は、その旨を伝えます。
- 関数型・宣言型プログラミングパターンを使用し、適切な場合にクラスを使用します。
- コードの重複を避け、再利用性とモジュール性を優先します。
- 補助動詞を使った説明的な変数名を使用します（`isLoading`, `hasError` など）。
- 必要に応じて RORO パターン（オブジェクトを受け取り、オブジェクトを返すパターン）を使用します。
- 提案する際は、変更を個別のステップに分解し、各ステップで進捗を確認するための小さなテストを提案します。
- コードを書く前に、既存のコードを深くレビューし、動作を説明します。
- ソリューションがどのようにホスト、管理、監視、保守されるかを考慮し、運用上の懸念事項を強調します。
- フィードバックに基づいてアプローチを調整し、プロジェクトのニーズとともに提案が進化することを確実にします。
- すべてのステップでデータが侵害されたり、新しい脆弱性が導入されたりしないことを確実にします。
- 潜在的なセキュリティリスクがある場合は、追加のレビューを実施します。
- サンプルコードを提供する際は、各行のコードの目的を詳細なコメントで説明し、実行結果を示します。
- 良いコーディング慣行やベストプラクティスがある場合は、時々アドバイスします。
- エラーメッセージの後には、そのエラーメッセージが何を意味するかの説明と、ステップバイステップのデバッグ手順を続けます。
- 複雑な問題は小さなステップに分解し、一つずつ説明します。

## 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: React 標準の状態管理（useState、useReducer、useContext）
- **データフェッチ**: TanStack Query (React Query)
- **ルーティング**: React Router
- **フォームバリデーション**: React Hook Form + Zod
- **テスト**: Vitest + React Testing Library
- **型安全性**: TypeScript strict mode

## コードスタイルと構造

- 簡潔で技術的な TypeScript コードを正確な例とともに書く
- エクスポートされたコンポーネント、サブコンポーネント、ヘルパー、静的コンテンツ、型でファイルを構成
- 小文字のディレクトリ名をダッシュ付きで使用（例：`components/auth-wizard`）
- コンポーネントは名前付きエクスポートを使用。コンポーネント名にはケバブケースを使用（例：`my-component.tsx`）
- 純粋関数には`function`キーワードを使用
- 単純な文には簡潔な構文を使用
- 宣言的な JSX を書く
- 条件文で不要な括弧を避け、1 行の文では省略
- セミコロンを省略（ただし、文の曖昧さを避けるために必要な場合は使用）
- 複雑なロジックには明確で簡潔にコメント
- IDE intellisense を向上させるため、関数とコンポーネントに JSDoc コメントを使用

## UI とスタイリング

- コンポーネントとスタイリングには Tailwind CSS を使用
- Tailwind CSS でレスポンシブデザインを実装し、モバイルファーストアプローチを採用
- セマンティック HTML 要素を使用し、適切な ARIA 属性を実装し、キーボードナビゲーションをサポート

## 状態管理とデータフェッチ

- ローカル状態管理には React の`useState`と`useReducer`を使用
- データフェッチ、キャッシュ、同期には TanStack Query を使用
- グローバル状態が必要な場合は、Context API または軽量な状態管理ライブラリの使用を検討
- URL サーチパラメータの管理には React Router の機能を活用

## フォームとバリデーション

- フォーム入力には制御コンポーネントを使用
- 適切なクライアントサイドフォームバリデーションを実装
- 複雑なフォームには`react-hook-form`の使用を検討
- スキーマバリデーションには Zod を使用
- フォーム送信時に適切にローディング状態とエラーハンドリングを実装

## エラーハンドリングとセキュリティ

- エラーハンドリングとエッジケースを優先
- エラー条件には早期リターンを使用し、前提条件と無効な状態を迅速に処理するガードクローズを実装
- 適切なエラーログとユーザーフレンドリーなエラーメッセージを実装
- API 呼び出しの期待されるエラーを戻り値としてモデル化
- 予期しないエラーにはエラーバウンダリを使用
- XSS 攻撃を防ぐためにユーザー入力をサニタイズ
- `dangerouslySetInnerHTML`は控えめに使用し、サニタイズされたコンテンツでのみ使用

## 最適化とパフォーマンス

- Web Vitals（LCP、CLS、FID）を最適化
- 非重要なコンポーネントには動的ローディングを使用
- 適切な画像形式を使用し、サイズデータを含め、遅延読み込みを実装
- Vite でバンドル最適化とコード分割を実装
- グローバルスタイルの使用を最小限に抑え、モジュラーでスコープ化されたスタイルを使用

## テスト

- Vitest と React Testing Library を使用してコンポーネントの単体テストを書く
- 重要なユーザーフローには統合テストを実装

## 主な規約（フロントエンド）

- React Router を使用したクライアントサイドルーティングを活用
- 効率的なデータフェッチと状態管理に TanStack Query を使用
- Vite の HMR（Hot Module Replacement）機能を最大限活用
- TypeScript strict mode で型安全性を確保

## コンポーネント作成規約

### **関数コンポーネントの使用**

```typescript
/**
 * ゲーム一覧を表示するコンポーネント
 * TanStack Queryを使用してゲームデータを取得・表示します
 */
export function GameList(): JSX.Element {
  const { data: games, isLoading, error } = useGames();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {games?.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
```

### **カスタムフックの活用**

```typescript
/**
 * ゲームデータを取得するカスタムフック
 * TanStack Queryを使用してキャッシュとリフェッチを管理
 */
export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const response = await fetch("/api/games");
      if (!response.ok) {
        throw new Error("ゲーム一覧の取得に失敗しました");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });
}
```

### **型定義の徹底**

```typescript
/**
 * ゲームエンティティの型定義
 */
export interface Game {
  readonly id: string;
  readonly title: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly players?: Player[];
}

/**
 * ゲームカードコンポーネントのProps型
 */
interface GameCardProps {
  readonly game: Game;
  readonly onSelect?: (game: Game) => void;
}

/**
 * ゲームカードコンポーネント
 */
export function GameCard({ game, onSelect }: GameCardProps): JSX.Element {
  const handleClick = useCallback(() => {
    onSelect?.(game);
  }, [game, onSelect]);

  return (
    <div
      className="rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      <h3 className="text-lg font-semibold">{game.title}</h3>
      <p className="text-sm text-gray-600">ステータス: {game.status}</p>
    </div>
  );
}
```

### **フォーム処理の標準化**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * ゲーム作成フォームのバリデーションスキーマ
 */
const gameSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(255, "タイトルは255文字以内で入力してください"),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "ステータスを選択してください" }),
  }),
});

type GameFormData = z.infer<typeof gameSchema>;

/**
 * ゲーム作成フォームコンポーネント
 */
export function GameForm(): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: GameFormData) => {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("ゲームの作成に失敗しました");
      }
      return response.json();
    },
    onSuccess: () => {
      // 成功時の処理
      console.log("ゲームが正常に作成されました");
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          タイトル
        </label>
        <input
          {...register("title")}
          id="title"
          type="text"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          ステータス
        </label>
        <select
          {...register("status")}
          id="status"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">選択してください</option>
          <option value="active">アクティブ</option>
          <option value="inactive">非アクティブ</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "作成中..." : "ゲームを作成"}
      </button>
    </form>
  );
}
```

### **エラーハンドリングの標準化**

```typescript
/**
 * エラーバウンダリコンポーネント
 */
export class ErrorBoundary extends Component<
  PropsWithChildren<{ fallback: ComponentType<{ error: Error }> }>,
  { hasError: boolean; error?: Error }
> {
  constructor(
    props: PropsWithChildren<{ fallback: ComponentType<{ error: Error }> }>
  ) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("予期しないエラーが発生しました:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <this.props.fallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}

/**
 * エラー表示コンポーネント
 */
export function ErrorFallback({ error }: { error: Error }): JSX.Element {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="text-lg font-semibold text-red-800">
        申し訳ございません。エラーが発生しました。
      </h2>
      <p className="mt-2 text-sm text-red-600">
        {error.message ||
          "予期しないエラーが発生しました。しばらく待ってから再度お試しください。"}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        ページを再読み込み
      </button>
    </div>
  );
}
```

## テスト作成規約

### **コンポーネントテスト**

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GameList } from "./game-list";

/**
 * テスト用のQueryClientプロバイダー
 */
function TestQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("GameList", () => {
  beforeEach(() => {
    // APIモックのリセット
    vi.clearAllMocks();
  });

  it("ローディング状態を正しく表示する", () => {
    // モックAPIでローディング状態をシミュレート
    global.fetch = vi.fn(() => new Promise(() => {}));

    render(
      <TestQueryProvider>
        <GameList />
      </TestQueryProvider>
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("ゲーム一覧を正しく表示する", async () => {
    const mockGames = [
      { id: "1", title: "テストゲーム1", status: "active" },
      { id: "2", title: "テストゲーム2", status: "inactive" },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGames),
      })
    );

    render(
      <TestQueryProvider>
        <GameList />
      </TestQueryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("テストゲーム1")).toBeInTheDocument();
      expect(screen.getByText("テストゲーム2")).toBeInTheDocument();
    });
  });

  it("エラー状態を正しく表示する", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    render(
      <TestQueryProvider>
        <GameList />
      </TestQueryProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
    });
  });
});
```

## パフォーマンス最適化規約

### **メモ化の活用**

```typescript
import { memo, useMemo, useCallback } from "react";

/**
 * 重い計算処理をメモ化するコンポーネント
 */
export const GameStats = memo(function GameStats({ games }: { games: Game[] }) {
  // 重い計算処理をメモ化
  const stats = useMemo(() => {
    return {
      total: games.length,
      active: games.filter((g) => g.status === "active").length,
      inactive: games.filter((g) => g.status === "inactive").length,
    };
  }, [games]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold">{stats.total}</p>
        <p className="text-sm text-gray-600">総数</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        <p className="text-sm text-gray-600">アクティブ</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        <p className="text-sm text-gray-600">非アクティブ</p>
      </div>
    </div>
  );
});
```

### **遅延読み込みの実装**

```typescript
import { lazy, Suspense } from "react";

// コンポーネントの遅延読み込み
const GameDetail = lazy(() => import("./game-detail"));

/**
 * 遅延読み込みを使用したルーティング
 */
export function AppRouter(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameList />} />
        <Route
          path="/games/:id"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <GameDetail />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}
```

## 主な規約（React フロントエンド）

- React Router を使用したクライアントサイドルーティングを活用
- 効率的なデータフェッチと状態管理に TanStack Query を使用
- Vite の高速開発サーバーと HMR（Hot Module Replacement）機能を最大限活用
- TypeScript strict mode で型安全性を確保
- Tailwind CSS でレスポンシブデザインを実装
- React Hook Form + Zod でフォーム処理とバリデーションを実装
- Vitest + React Testing Library で包括的なテストを作成
