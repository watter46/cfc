<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync;

use App\Models\Team;
use App\Repositories\Images\TeamImageRepository;
use App\Traits\Loggable;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use Exception;
use Illuminate\Support\Collection;

/**
 * チーム画像同期処理のユースケースクラス
 *
 * Loggable Traitを使用して統一されたログ処理を実装します。
 * チーム画像の確認・取得・保存を管理します。
 */
final readonly class SyncTeamImagesAction
{
    use Loggable;

    public function __construct(
        private TeamImageRepository $teamImage,
        private ApiFootballRepositoryInterface $apiFootball,
    ) {}

    /**
     * チーム画像の同期処理を実行
     *
     * @param  Collection  $teams  同期対象のチームコレクション
     * @return array 処理結果の統計情報
     *
     * @throws Exception 同期処理中に回復不可能なエラーが発生した場合
     */
    public function execute(Collection $teams): array
    {
        $this->logStart(['total_teams' => $teams->count()]);

        $stats = ['success' => 0, 'fail' => 0, 'total' => $teams->count()];

        try {
            $teams->each(function (array $team) use (&$stats) {
                $this->syncSingleTeamImage($team, $stats);
            });

            $this->logComplete($stats);

            return $stats;

        } catch (Exception $e) {
            $this->logError($e, $stats);

            throw new Exception('チーム画像同期処理でエラーが発生しました: '.$e->getMessage());
        }
    }

    /**
     * 単一チームの画像同期処理
     *
     * @param  array  $team  チーム情報
     * @param  array  &$stats  統計情報（参照渡し）
     */
    private function syncSingleTeamImage(array $team, array &$stats): void
    {
        ['id' => $id, 'api_team_id' => $apiTeamId] = $team;

        try {
            $binaryData = $this->apiFootball->fetchTeamImage($apiTeamId);
            $success = $this->teamImage->save($apiTeamId, $binaryData);

            if ($success) {
                Team::find($id)->update(['has_image' => true]);

                $stats['success']++;
            } else {
                $stats['fail']++;

                $this->logWarning('チーム画像保存失敗', [
                    'team_id'     => $id,
                    'api_team_id' => $apiTeamId,
                ]);
            }

        } catch (Exception $e) {
            $stats['fail']++;

            $this->logError($e, [
                'team_id'     => $id,
                'api_team_id' => $apiTeamId,
            ]);
        }
    }
}
