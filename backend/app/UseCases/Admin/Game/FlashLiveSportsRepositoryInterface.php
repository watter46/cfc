<?php

namespace App\UseCases\Admin\Game;

use App\UseCases\Admin\Game\Sync\Dto\FlashLiveSports\SearchResultDto;
use Illuminate\Support\Collection;

interface FlashLiveSportsRepositoryInterface
{
    /**
     * 選手名でFlashLiveSportsから選手を検索
     *
     * @param  Collection  $player  検索する選手
     * @return SearchResultDto 検索結果のDTO
     */
    public function searchByName(Collection $player): SearchResultDto;

    /**
     * FlashLiveSportsから選手の画像を取得
     *
     * @param  Collection  $player  取得する画像の選手
     * @return string|null 画像URL、または画像が存在しない場合はnull
     */
    public function fetchPlayerImage(Collection $player): ?string;
}
