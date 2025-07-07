import type {
  GamePlayer,
  FormationPlayer,
  FieldPosition,
} from "../types/match-detail";

/**
 * gridからフィールドポジションを解析
 * @param grid フォーメーションポジション文字列（例: "4:2"）
 * @returns FieldPosition（row: 行, col: 列）
 */
export function parseGridPosition(grid: string | null): FieldPosition {
  if (!grid) {
    return { row: 0, col: 0 };
  }

  const [rowStr, colStr] = grid.split(":");
  const row = parseInt(rowStr, 10) || 0;
  const col = parseInt(colStr, 10) || 0;

  return { row, col };
}

/**
 * 選手名からファーストネームを取得
 * @param fullName フルネーム
 * @returns ファーストネーム
 */
export function extractFirstName(fullName: string): string {
  const names = fullName.trim().split(" ");
  return names[0] || fullName;
}

/**
 * GamePlayerをFormationPlayerに変換
 * @param players GamePlayerの配列
 * @returns FormationPlayerの配列
 */
export function convertToFormationPlayers(
  players: GamePlayer[]
): FormationPlayer[] {
  return players.map((player) => ({
    ...player,
    fieldPosition: parseGridPosition(player.grid),
    firstName: extractFirstName(player.player.name),
  }));
}

/**
 * スターターとサブ選手を分離
 * @param players FormationPlayerの配列
 * @returns { starters: FormationPlayer[], substitutes: FormationPlayer[] }
 */
export function separateStartersAndSubs(players: FormationPlayer[]) {
  const starters = players.filter((player) => player.is_starter);
  const substitutes = players.filter((player) => !player.is_starter);

  return { starters, substitutes };
}

/**
 * ポジション順にスターター選手をソート
 * @param starters スターター選手の配列
 * @returns ソートされたスターター選手の配列
 */
export function sortStartersByPosition(
  starters: FormationPlayer[]
): FormationPlayer[] {
  return starters.sort((a, b) => {
    // 行でソート（1行目が最前面）
    if (a.fieldPosition.row !== b.fieldPosition.row) {
      return a.fieldPosition.row - b.fieldPosition.row;
    }
    // 同じ行の場合は列でソート
    return a.fieldPosition.col - b.fieldPosition.col;
  });
}

/**
 * フィールドレイアウト用のCSS Grid配置を計算
 * @param position FieldPosition
 * @returns CSS Grid用のスタイルオブジェクト
 */
export function getGridStyle(position: FieldPosition) {
  return {
    gridRow: position.row,
    gridColumn: position.col,
  };
}
