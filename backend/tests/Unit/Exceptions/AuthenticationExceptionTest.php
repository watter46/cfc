<?php

declare(strict_types=1);

namespace Tests\Unit\Exceptions;

use App\Exceptions\AuthenticationException;
use Exception;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

/**
 * AuthenticationExceptionのユニットテスト
 */
class AuthenticationExceptionTest extends TestCase
{
    /**
     * 例外クラスの継承構造テスト
     */
    public function test_extends_user_friendly_exception(): void
    {
        $this->assertTrue(is_subclass_of(AuthenticationException::class, \App\Exceptions\UserFriendlyException::class));
    }

    /**
     * コンストラクタの引数設定テスト
     */
    public function test_constructor_parameters(): void
    {
        $reflection = new ReflectionClass(AuthenticationException::class);
        $constructor = $reflection->getConstructor();

        $this->assertNotNull($constructor);
        $this->assertSame(1, $constructor->getNumberOfParameters());

        $parameters = $constructor->getParameters();
        $this->assertSame('code', $parameters[0]->getName());
        $this->assertSame(401, $parameters[0]->getDefaultValue());
    }

    /**
     * クラスメタデータの確認
     */
    public function test_class_metadata(): void
    {
        $reflection = new ReflectionClass(AuthenticationException::class);

        $this->assertSame('App\Exceptions', $reflection->getNamespaceName());
        $this->assertSame('AuthenticationException', $reflection->getShortName());
        $this->assertFalse($reflection->isFinal());
    }

    /**
     * 例外が適切に定義されていることを確認
     */
    public function test_is_exception_class(): void
    {
        $this->assertTrue(is_subclass_of(AuthenticationException::class, Exception::class));
    }
}
