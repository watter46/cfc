<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\UseCases\Fixtures\ImportFixtureUseCase;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class FixtureController extends Controller
{
    /**
     * API Football から試合データをインポート
     */
    public function import(Request $request, ImportFixtureUseCase $importFixtureUseCase)
    {
        $request->validate([
            'fixture_id' => 'required|integer',
            'from_json'  => 'boolean',
        ]);

        $fixtureId = $request->input('fixture_id');
        $fromJson = $request->input('from_json', false);

        try {
            if ($fromJson) {
                $success = $importFixtureUseCase->executeFromJsonFile((string) $fixtureId);
            } else {
                $success = $importFixtureUseCase->execute((int) $fixtureId);
            }

            if ($success) {
                return response()->json([
                    'status'  => 'success',
                    'message' => "Fixture {$fixtureId} imported successfully",
                ]);
            } else {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Failed to import fixture {$fixtureId}",
                ], 500);
            }
        } catch (Exception $e) {
            Log::error("Error importing fixture: {$fixtureId}", [
                'exception' => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => "Error importing fixture: {$e->getMessage()}",
            ], 500);
        }
    }

    /**
     * 既存の試合データを更新
     */
    public function update(Request $request, ImportFixtureUseCase $importFixtureUseCase)
    {
        $request->validate([
            'fixture_id' => 'required|integer',
        ]);

        $fixtureId = $request->input('fixture_id');

        try {
            $success = $importFixtureUseCase->execute((int) $fixtureId);

            if ($success) {
                return response()->json([
                    'status'  => 'success',
                    'message' => "Fixture {$fixtureId} updated successfully",
                ]);
            } else {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Failed to update fixture {$fixtureId}",
                ], 500);
            }
        } catch (Exception $e) {
            Log::error("Error updating fixture: {$fixtureId}", [
                'exception' => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => "Error updating fixture: {$e->getMessage()}",
            ], 500);
        }
    }
}
