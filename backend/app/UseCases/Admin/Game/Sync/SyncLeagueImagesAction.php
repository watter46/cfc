<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync;

use App\Models\League;
use App\Repositories\Images\LeagueImageRepository;
use App\Traits\Loggable;
use App\UseCases\Admin\Game\ApiFootballRepositoryInterface;
use Exception;
use Illuminate\Support\Collection;

/**
 * リーグ画像同期処理のユースケースクラス
 *
 * Loggable Traitを使用して統一されたログ処理を実装します。
 * リーグ画像の確認・取得・保存を管理します。
 */
final readonly class SyncLeagueImagesAction
{
    use Loggable;

    public function __construct(
        private LeagueImageRepository $leagueImage,
        private ApiFootballRepositoryInterface $apiFootball,
    ) {}

    /**
     * リーグ画像の同期処理を実行
     *
     * @param  Collection  $leagues  同期対象のリーグコレクション
     * @return array 処理結果の統計情報
     *
     * @throws Exception 同期処理中に回復不可能なエラーが発生した場合
     */
    public function execute(Collection $leagues): array
    {
        $this->logStart(['total_leagues' => $leagues->count()]);

        $stats = ['success' => 0, 'fail' => 0, 'total' => $leagues->count()];

        try {
            $leagues->each(function (array $league) use (&$stats) {
                $this->syncSingleLeagueImage($league, $stats);
            });

            $this->logComplete($stats);

            return $stats;

        } catch (Exception $e) {
            $this->logError($e, $stats);

            throw new Exception('リーグ画像同期処理でエラーが発生しました: '.$e->getMessage());
        }
    }

    /**
     * 単一リーグの画像同期処理
     *
     * @param  array  $league  リーグ情報
     * @param  array  &$stats  統計情報（参照渡し）
     */
    private function syncSingleLeagueImage(array $league, array &$stats): void
    {
        ['id' => $id, 'api_league_id' => $apiLeagueId] = $league;

        try {
            $binaryData = $this->apiFootball->fetchLeagueImage($apiLeagueId);
            $success = $this->leagueImage->save($apiLeagueId, $binaryData);

            if ($success) {
                League::find($id)->update(['has_image' => true]);

                $stats['success']++;
            } else {
                $stats['fail']++;

                $this->logWarning('リーグ画像保存失敗', [
                    'league_id'     => $id,
                    'api_league_id' => $apiLeagueId,
                ]);
            }

        } catch (Exception $e) {
            $stats['fail']++;

            $this->logError($e, [
                'league_id'     => $id,
                'api_league_id' => $apiLeagueId,
            ]);
        }
    }
}
