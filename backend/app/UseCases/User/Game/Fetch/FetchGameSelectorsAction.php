<?php

declare(strict_types=1);

namespace App\UseCases\User\Game\Fetch;

use App\Traits\Loggable;
use App\UseCases\User\Game\Services\GameFilterResolver;
use Exception;

/**
 * ゲームフィルター用セレクター取得処理のユースケースクラス
 *
 * フィルタリング用のシーズン、チーム、リーグの選択肢を取得します。
 */
final readonly class FetchGameSelectorsAction
{
    use Loggable;

    public function __construct(
        private GameFilterResolver $resolver,
    ) {}

    /**
     * セレクター一覧取得処理を実行
     *
     * @param  array  $inputData  リクエストデータ
     * @return array セレクター一覧
     */
    public function execute(array $inputData): array
    {
        $this->logStart($inputData);

        try {
            $result = $this->resolver->resolveSelectors($inputData);

            $this->logComplete(['message' => 'セレクター一覧取得処理が完了しました']);

            return $result;

        } catch (Exception $e) {
            $this->logError($e, ['inputData' => $inputData]);
            throw $e;
        }
    }
}
