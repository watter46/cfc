import { MatchDetailContent } from "@/features/matches/components/user/MatchDetailContent";
import MainLayout from "@/shared/components/layout/MainLayout.tsx";

/**
 * 試合詳細ページ
 * /matches/:matchId ルートで表示される
 */
export function MatchDetailPage() {
  return (
    <MainLayout>
      <MatchDetailContent />
    </MainLayout>
  );
}
