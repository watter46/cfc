<?php

declare(strict_types=1);

namespace Tests\Feature\UseCases\Admin\Game\Sync;

use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('deprecated')]
final class FixturesSyncServiceTest extends TestCase
{
    public function test_api_footballレスポンスからゲームデータを同期できる(): void
    {
        $this->markTestSkipped('FixturesSyncServiceは廃止予定のため、SyncGamesActionを使用してください');
    }

    public function test_重複データを適切に処理できる(): void
    {
        $this->markTestSkipped('FixturesSyncServiceは廃止予定のため、SyncGamesActionを使用してください');
    }
}
