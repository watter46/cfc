<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\UseCases\Fixtures\ImportFixtureUseCase;
use Illuminate\Console\Command;

final class ImportFixtureCommand extends Command
{
    /**
     * コンソールコマンドの名前と説明
     *
     * @var string
     */
    protected $signature = 'app:import-fixture
                            {fixture_id : The fixture ID to import}
                            {--json : Import from JSON file instead of API}';

    /**
     * コマンドの説明
     *
     * @var string
     */
    protected $description = 'Import fixture data from API Football or JSON file';

    /**
     * コマンドの実行
     */
    public function handle(ImportFixtureUseCase $importFixtureUseCase): int
    {
        $fixtureId = $this->argument('fixture_id');
        $fromJson = $this->option('json');

        $this->info("Importing fixture: {$fixtureId}".($fromJson ? ' from JSON file' : ' from API'));

        if ($fromJson) {
            $success = $importFixtureUseCase->executeFromJsonFile((string) $fixtureId);
        } else {
            $success = $importFixtureUseCase->execute((int) $fixtureId);
        }

        if ($success) {
            $this->info('Fixture imported successfully!');

            return Command::SUCCESS;
        } else {
            $this->error('Failed to import fixture. Check logs for details.');

            return Command::FAILURE;
        }
    }
}
