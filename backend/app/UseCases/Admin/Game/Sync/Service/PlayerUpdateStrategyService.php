<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Service;

use App\Models\Player;
use App\UseCases\Utils\Name;
use App\UseCases\Utils\PositionType;
use Illuminate\Support\Collection;

final class PlayerUpdateStrategyService
{
    public function update(?Player $existPlayer, Collection $player)
    {
        if ($existPlayer === null) {
            return $this->normalize($player);
        }

        $result = collect($existPlayer->toArray());

        if ($this->shouldUpdateName($existPlayer)) {
            $result = $result->merge([
                'name'       => $player->get('name'),
                'name_plain' => $player->get('name_plain'),
            ]);
        }

        if ($this->shouldUpdatePosition($existPlayer)) {
            $result = $result->merge([
                'position' => $player->get('position'),
            ]);
        }

        // その他のフィールドは常にAPIの最新データで更新
        $result = $result->merge($player->except(['name', 'name_plain', 'position']));

        return $this->normalize($result);
    }

    /**
     * 名前が短縮されている場合に更新する
     */
    private function shouldUpdateName(Player $existPlayer): bool
    {
        return Name::create($existPlayer->name)->isShorten();
    }

    /**
     * ポジションがnullの場合に更新する
     */
    private function shouldUpdatePosition(Player $existPlayer): bool
    {
        return $existPlayer->position === null;
    }

    /**
     * すべてのフィールドを正規化
     *
     * @return Collection 正規化された選手データ
     */
    private function normalize(Collection $newPlayer): Collection
    {
        $newPlayer->put('name', Name::create($newPlayer->get('name'))->getFullName());
        $newPlayer->put('name_plain', Name::create($newPlayer->get('name'))->getFullNamePlain());
        $newPlayer->put('position', PositionType::tryFromMix($newPlayer->get('position'))->value);

        return $newPlayer;
    }
}
