<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync;

use App\Models\Player;
use App\Repositories\Images\PlayerImageRepository;
use App\Traits\Loggable;
use App\UseCases\Admin\Game\FlashLiveSportsRepositoryInterface;
use App\UseCases\Admin\Game\Sync\Service\PlayerMatchingService;
use Exception;
use Illuminate\Support\Collection;

/**
 * プレイヤー画像同期処理のユースケースクラス
 *
 * FlashLiveSportsから取得したプレイヤー画像を保存し、
 * データベースの画像保有フラグを更新します。
 */
final readonly class SyncPlayerImagesAction
{
    use Loggable;

    public function __construct(
        private PlayerImageRepository $playerImage,
        private FlashLiveSportsRepositoryInterface $flashLiveSportsRepository,
        private PlayerMatchingService $playerMatchingService,
    ) {}

    /**
     * プレイヤー画像同期処理を実行
     *
     * @param  Collection  $players  未保存のプレイヤーデータのコレクション
     * @return Collection 処理結果の統計情報
     */
    public function execute(Collection $players): Collection
    {
        $this->logStart(['total_players' => $players->count()]);

        $stats = collect(['success' => 0, 'fail' => 0, 'no_image' => 0]);

        try {
            $players->each(function ($player) use (&$stats) {
                $this->logDebug('ループ処理開始', context: [
                    'player_id'     => $player->get('id'),
                    'api_player_id' => $player->get('api_player_id'),
                ]);

                $id = $player->get('id');
                $apiPlayerId = $player->get('api_player_id');
                $flashImageId = $player->get('flash_image_id');

                if (! $flashImageId) {
                    $searchResult = $this->flashLiveSportsRepository->searchByName($player);

                    if (! $searchResult->hasCandidates()) {
                        $stats->increment('no_image');
                        $this->logWarning('APIレスポンスからのデータが空です', [
                            'player_id'     => $id,
                            'api_player_id' => $apiPlayerId,
                        ]);

                        return true;
                    }

                    $matched = $this->playerMatchingService->matchPlayer(
                        $searchResult,
                        $player,
                    );

                    if ($matched === null) {
                        $stats->increment('no_image');
                        $this->logWarning('APIレスポンスからのデータに該当する選手はいません', [
                            'player_id'     => $id,
                            'api_player_id' => $apiPlayerId,
                        ]);

                        return true;
                    }

                    $player->put('flash_id', $matched->get('flash_id'));
                    $player->put('flash_image_id', $matched->get('flash_image_id'));

                    Player::find($id)->update([
                        'flash_id'       => $matched->get('flash_id'),
                        'flash_image_id' => $matched->get('flash_image_id'),
                        'is_fetched'     => true,
                    ]);
                }

                $this->processPlayerImage($player, $stats);
            });

            $this->logComplete($stats->toArray());

            return $stats;

        } catch (Exception $e) {
            $this->logError($e, $stats->toArray());
            throw $e;
        }
    }

    /**
     * 個別プレイヤー画像処理
     *
     * @param  Collection  $player  プレイヤーデータ
     * @param  Collection  $stats  統計情報の参照
     */
    private function processPlayerImage(Collection $player, Collection &$stats): void
    {
        $id = $player->get('id');
        $apiPlayerId = $player->get('api_player_id');
        $flashImageId = $player->get('flash_image_id');

        try {
            $binaryData = $this->flashLiveSportsRepository->fetchPlayerImage($player);

            if (! $binaryData) {
                $stats->increment('no_image');

                $this->logWarning('プレイヤー画像データが取得できませんでした', [
                    'player_id'      => $id,
                    'api_player_id'  => $apiPlayerId,
                    'flash_image_id' => $flashImageId,
                ]);

                return;
            }

            $success = $this->playerImage->save($apiPlayerId, $binaryData);

            if ($success) {
                Player::find($id)->update(['has_image' => true]);

                $stats->increment('success');

            } else {
                $stats->increment('fail');

                $this->logWarning('プレイヤー画像保存に失敗しました', [
                    'player_id'     => $id,
                    'api_player_id' => $apiPlayerId,
                ]);
            }

        } catch (Exception $e) {
            $stats->increment('fail');

            $this->logError($e, [
                'player_id'      => $id,
                'api_player_id'  => $apiPlayerId,
                'flash_image_id' => $flashImageId,
            ]);
        }
    }
}
