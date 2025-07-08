<?php

declare(strict_types=1);

namespace Tests\Unit\Traits;

use App\Traits\Loggable;
use Exception;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

/**
 * Loggableトレイトのユニットテスト
 *
 * ログ出力機能の基本的な構造とメソッドの存在確認を行います。
 */
class LoggableTest extends TestCase
{
    /**
     * Loggableトレイトを使用するテスト用クラス
     */
    private object $testInstance;

    private ReflectionClass $reflection;

    protected function setUp(): void
    {
        parent::setUp();

        // テスト用の匿名クラスを作成してLoggableトレイトを使用
        $this->testInstance = new class
        {
            use Loggable;

            public function getTestClassName(): string
            {
                return self::class;
            }

            // テスト用のpublicメソッドを追加
            public function callLogStart(array $context = []): void
            {
                $this->logStart($context);
            }

            public function callLogComplete(array $stats = []): void
            {
                $this->logComplete($stats);
            }

            public function callLogError(Exception $exception, array $context = []): void
            {
                $this->logError($exception, $context);
            }
        };

        $this->reflection = new ReflectionClass($this->testInstance);
    }

    /**
     * Loggableトレイトが正しくインポートされていることを確認
     */
    public function test_loggable_trait_is_used(): void
    {
        $traits = $this->reflection->getTraitNames();

        $this->assertContains(Loggable::class, $traits);
    }

    /**
     * 必要なログメソッドが存在することを確認
     */
    public function test_required_log_methods_exist(): void
    {
        $requiredMethods = [
            'logStart',
            'logComplete',
            'logWarning',
            'logError',
            'logInfo',
            'logDebug',
            'logSecurityEvent',
            'logValidationError',
            'logAuthenticationError',
            'logSystemError',
            'logUserFriendlyException',
        ];

        foreach ($requiredMethods as $method) {
            $this->assertTrue(
                $this->reflection->hasMethod($method),
                "Method {$method} should exist in Loggable trait",
            );
        }
    }

    /**
     * logStartメソッドの可視性とパラメータを確認
     */
    public function test_log_start_method_signature(): void
    {
        $method = $this->reflection->getMethod('logStart');

        $this->assertTrue($method->isProtected());
        $this->assertSame(1, $method->getNumberOfParameters());

        $parameters = $method->getParameters();
        $this->assertSame('context', $parameters[0]->getName());
        $this->assertTrue($parameters[0]->hasType());
        $this->assertSame('array', $parameters[0]->getType()->getName());
    }

    /**
     * logErrorメソッドの可視性とパラメータを確認
     */
    public function test_log_error_method_signature(): void
    {
        $method = $this->reflection->getMethod('logError');

        $this->assertTrue($method->isProtected());
        $this->assertSame(2, $method->getNumberOfParameters());

        $parameters = $method->getParameters();
        $this->assertSame('exception', $parameters[0]->getName());
        $this->assertSame('context', $parameters[1]->getName());
    }

    /**
     * logDebugメソッドの可視性とパラメータを確認
     */
    public function test_log_debug_method_signature(): void
    {
        $method = $this->reflection->getMethod('logDebug');

        $this->assertTrue($method->isProtected());
        $this->assertGreaterThanOrEqual(2, $method->getNumberOfParameters());
    }

    /**
     * logSecurityEventメソッドの可視性とパラメータを確認
     */
    public function test_log_security_event_method_signature(): void
    {
        $method = $this->reflection->getMethod('logSecurityEvent');

        $this->assertTrue($method->isProtected());
        $this->assertSame(2, $method->getNumberOfParameters());
    }

    /**
     * logValidationErrorメソッドの可視性とパラメータを確認
     */
    public function test_log_validation_error_method_signature(): void
    {
        $method = $this->reflection->getMethod('logValidationError');

        $this->assertTrue($method->isProtected());
        $this->assertSame(2, $method->getNumberOfParameters());
    }

    /**
     * logAuthenticationErrorメソッドの可視性とパラメータを確認
     */
    public function test_log_authentication_error_method_signature(): void
    {
        $method = $this->reflection->getMethod('logAuthenticationError');

        $this->assertTrue($method->isProtected());
        $this->assertSame(2, $method->getNumberOfParameters());
    }

    /**
     * logSystemErrorメソッドの可視性とパラメータを確認
     */
    public function test_log_system_error_method_signature(): void
    {
        $method = $this->reflection->getMethod('logSystemError');

        $this->assertTrue($method->isProtected());
        $this->assertSame(2, $method->getNumberOfParameters());
    }

    /**
     * 全メソッドが適切にprotectedで定義されていることを確認
     */
    public function test_all_log_methods_are_protected(): void
    {
        $logMethods = [
            'logStart', 'logComplete', 'logWarning', 'logError', 'logInfo',
            'logDebug', 'logSecurityEvent', 'logValidationError',
            'logAuthenticationError', 'logSystemError', 'logUserFriendlyException',
        ];

        foreach ($logMethods as $methodName) {
            $method = $this->reflection->getMethod($methodName);
            $this->assertTrue(
                $method->isProtected(),
                "Method {$methodName} should be protected",
            );
        }
    }

    /**
     * テスト用publicメソッドが実際に呼び出し可能であることを確認
     */
    public function test_public_wrapper_methods_are_callable(): void
    {
        $this->assertTrue(is_callable([$this->testInstance, 'callLogStart']));
        $this->assertTrue(is_callable([$this->testInstance, 'callLogComplete']));
        $this->assertTrue(is_callable([$this->testInstance, 'callLogError']));
    }
}
