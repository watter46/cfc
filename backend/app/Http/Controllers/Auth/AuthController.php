<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Auth\SigninRequest;
use App\Http\Requests\User\Auth\SignupRequest;
use App\Http\Resources\Auth\UserResource;
use App\UseCases\Auth\Signin\SigninAction;
use App\UseCases\Auth\Signup\SignupAction;
use App\UseCases\Auth\Signout\SignoutAction;
use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

final class AuthController extends Controller
{
    public function __construct(
        private readonly SignupAction $signupAction,
        private readonly SigninAction $signinAction,
        private readonly SignoutAction $signoutAction
    ) {}

    public function signup(SignupRequest $request): UserResource|JsonResponse
    {
        try {
            return $this->signupAction->execute($request->validated());

        } catch (ValidationException $e) {
            Log::warning('バリデーションエラー（登録処理）', ['errors' => $e->errors()]);

            return response()->json([
                'message' => 'バリデーションエラーが発生しました。',
                'errors'  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('登録処理中に予期しないエラーが発生', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => '予期しないエラーが発生しました。',
            ], 500);
        }
    }

    public function signin(SigninRequest $request): UserResource|JsonResponse
    {
        try {
            return $this->signinAction->execute($request->validated());

        } catch (AuthenticationException $e) {
            Log::warning('認証失敗', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => '認証に失敗しました。',
            ], 401);
        } catch (Exception $e) {
            Log::error('ログイン処理中に予期しないエラーが発生', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => '予期しないエラーが発生しました。',
            ], 500);
        }
    }

    public function signout(Request $request): JsonResponse
    {
        try {
            $success = $this->signoutAction->execute($request);

            if (!$success) {
                return response()->json([
                    'message' => '既にログアウト済みです。',
                ], 401);
            }

            return response()->json([
                'message' => 'ログアウトが完了しました。',
            ]);
        } catch (Exception $e) {
            Log::error('ログアウト処理に失敗', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'ログアウト処理に失敗しました。',
            ], 500);
        }
    }

    public function me(Request $request): UserResource|JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'message' => 'ユーザーが認証されていません。',
                ], 401);
            }

            return new UserResource($user);

        } catch (Exception $e) {
            Log::error('ユーザー情報取得中にエラーが発生', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => '予期しないエラーが発生しました。',
            ], 500);
        }
    }
}
