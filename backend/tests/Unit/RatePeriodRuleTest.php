<?php

declare(strict_types = 1);

namespace Tests\Unit;

use App\Models\Game;
use App\UseCases\Admin\Game\Services\Rateable\RatePeriodRule;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\TestCase;

class RatePeriodRuleTest extends TestCase
{
    private RatePeriodRule $rule;

    public function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2024-11-11 00:00');

        $this->rule = new RatePeriodRule();
    }

    public function test_評価可能期間ならtrueを返す(): void
    {
        $game = new Game();
        $game->finished_at = '2024-11-08 00:01';

        $result = $this->rule->check($game);

        $this->assertTrue($result);
    }

    public function test_評価不可能期間ならfalseを返す(): void
    {
        $game = new Game();
        $game->finished_at = '2024-11-08 00:00';

        $result = $this->rule->check($game);

        $this->assertFalse($result);
    }
}
