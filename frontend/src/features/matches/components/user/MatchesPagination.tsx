import { useSearchParams } from "react-router-dom";
import type { MatchesResponse } from "@/features/matches/types/api";

interface MatchesPaginationProps {
  readonly meta: MatchesResponse["meta"];
  readonly className?: string;
}

/**
 * 試合一覧用ページネーションコンポーネント
 * URLパラメータと連動してページ遷移を管理
 */
export function MatchesPagination({
  meta,
  className = "",
}: MatchesPaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = meta.current_page;
  const hasMore = meta.pagination.has_more;

  /**
   * ページを変更
   */
  function changePage(page: number) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  }

  /**
   * 前のページに移動
   */
  function goToPrevPage() {
    if (currentPage > 1) {
      changePage(currentPage - 1);
    }
  }

  /**
   * 次のページに移動
   */
  function goToNextPage() {
    if (hasMore) {
      changePage(currentPage + 1);
    }
  }

  /**
   * ページ番号のリストを生成
   * 現在のページを中心に最大5ページ分表示
   */
  function getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    const halfMax = Math.floor(maxPages / 2);

    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = startPage + maxPages - 1;

    // 最後のページが分からないため、現在のページ + halfMax まで表示
    if (!hasMore) {
      endPage = currentPage;
    } else {
      endPage = Math.min(endPage, currentPage + halfMax);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  const pageNumbers = getPageNumbers();
  const hasPrev = currentPage > 1;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* 前のページボタン */}
      <button
        onClick={goToPrevPage}
        disabled={!hasPrev}
        className={`
          px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${
            hasPrev
              ? "text-neon-blue hover:text-white hover:bg-neon-blue/20 border border-neon-blue/30 hover:border-neon-blue/60"
              : "text-space-500 border border-space-700/50 cursor-not-allowed"
          }
        `}
        aria-label="前のページ"
      >
        ←
      </button>

      {/* ページ番号ボタン */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => changePage(page)}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${
              page === currentPage
                ? "text-white bg-neon-blue/30 border border-neon-blue ring-2 ring-neon-blue/30"
                : "text-neon-blue hover:text-white hover:bg-neon-blue/20 border border-neon-blue/30 hover:border-neon-blue/60"
            }
          `}
          aria-label={`ページ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {/* 省略記号（次にページがある場合） */}
      {hasMore && pageNumbers[pageNumbers.length - 1] < currentPage + 2 && (
        <span className="px-2 text-space-400">...</span>
      )}

      {/* 次のページボタン */}
      <button
        onClick={goToNextPage}
        disabled={!hasMore}
        className={`
          px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${
            hasMore
              ? "text-neon-blue hover:text-white hover:bg-neon-blue/20 border border-neon-blue/30 hover:border-neon-blue/60"
              : "text-space-500 border border-space-700/50 cursor-not-allowed"
          }
        `}
        aria-label="次のページ"
      >
        →
      </button>

      {/* ページ情報 */}
      <div className="ml-4 text-sm text-space-400">
        {meta.from}-{meta.to} / {meta.pagination.count}件
      </div>
    </div>
  );
}
