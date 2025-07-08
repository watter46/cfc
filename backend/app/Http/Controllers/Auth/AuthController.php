<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Auth\SigninRequest;
use App\Http\Requests\User\Auth\SignupRequest;
use App\Http\Resources\Auth\UserResource;
use App\Services\Logging\LogService;
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
        private readonly SignoutAction $signoutAction,
        private readonly LogService $logService
    ) {}

    public function signup(SignupRequest $request): UserResource|JsonResponse
    {
        try {
            $result = $this->signupAction->execute($request->validated());
            
            // セキュリティログ: ユーザー登録成功
            $this->logService->logSecurityEvent('user_registration_success', [
                'user_id' => $result->resource->id,
                'email' => $request->validated()['email'],
            ]);

            return $result;

        } catch (ValidationException $e) {
            Log::warning('バリデーションエラー（登録処理）', ['errors' => $e->errors()]);
            
            // セキュリティログ: 登録失敗（バリデーションエラー）
            $this->logService->logSecurityEvent('user_registration_validation_failed', [
                'email' => $request->input('email'),
                'errors' => $e->errors(),
            ]);

            return response()->json([
                'message' => 'バリデーションエラーが発生しました。',
                'errors'  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('登録処理中に予期しないエラーが発生', ['error' => $e->getMessage()]);
            
            // セキュリティログ: 登録失敗（システムエラー）
            $this->logService->logSecurityEvent('user_registration_system_error', [
                'email' => $request->input('email'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => '予期しないエラーが発生しました。',
            ], 500);
        }
    }

    public function signin(SigninRequest $request): UserResource|JsonResponse
    {
        try {
            $result = $this->signinAction->execute($request->validated());
            
            // セキュリティログ: ログイン成功
            $this->logService->logSecurityEvent('user_login_success', [
                'user_id' => $result->resource->id,
                'email' => $request->validated()['email'],
            ]);

            return $result;

        } catch (AuthenticationException $e) {
            Log::warning('認証失敗', ['error' => $e->getMessage()]);
            
            // セキュリティログ: ログイン失敗
            $this->logService->logSecurityEvent('user_login_failed', [
                'email' => $request->input('email'),
                'reason' => 'authentication_failed',
            ]);

            return response()->json([
                'message' => '認証に失敗しました。',
            ], 401);
        } catch (Exception $e) {
            Log::error('ログイン処理中に予期しないエラーが発生', ['error' => $e->getMessage()]);
            
            // セキュリティログ: ログインシステムエラー
            $this->logService->logSecurityEvent('user_login_system_error', [
                'email' => $request->input('email'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => '予期しないエラーが発生しました。',
            ], 500);
        }
    }

    public function signout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $success = $this->signoutAction->execute($request);

            if (!$success) {
                return response()->json([
                    'message' => '既にログアウト済みです。',
                ], 401);
            }

            // セキュリティログ: ログアウト成功
            $this->logService->logSecurityEvent('user_logout_success', [
                'user_id' => $user?->id,
            ]);

            return response()->json([
                'message' => 'ログアウトが完了しました。',
            ]);
        } catch (Exception $e) {
            Log::error('ログアウト処理に失敗', ['error' => $e->getMessage()]);
            
            // セキュリティログ: ログアウト失敗
            $this->logService->logSecurityEvent('user_logout_failed', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);

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
