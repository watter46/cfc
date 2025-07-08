<?php

declare(strict_types=1);

namespace Tests\Unit\Exceptions;

use App\Exceptions\ValidationException;
use Exception;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

/**
 * ValidationExceptionのユニットテスト
 */
class ValidationExceptionTest extends TestCase
{
    /**
     * 例外クラスの継承構造テスト
     */
    public function test_extends_user_friendly_exception(): void
    {
        $this->assertTrue(is_subclass_of(ValidationException::class, \App\Exceptions\UserFriendlyException::class));
    }

    /**
     * コンストラクタの引数設定テスト
     */
    public function test_constructor_parameters(): void
    {
        $reflection = new ReflectionClass(ValidationException::class);
        $constructor = $reflection->getConstructor();

        $this->assertNotNull($constructor);
        $this->assertSame(2, $constructor->getNumberOfParameters());

        $parameters = $constructor->getParameters();
        $this->assertSame('errors', $parameters[0]->getName());
        $this->assertSame('code', $parameters[1]->getName());
        $this->assertSame(422, $parameters[1]->getDefaultValue());
    }

    /**
     * クラスメタデータの確認
     */
    public function test_class_metadata(): void
    {
        $reflection = new ReflectionClass(ValidationException::class);

        $this->assertSame('App\Exceptions', $reflection->getNamespaceName());
        $this->assertSame('ValidationException', $reflection->getShortName());
        $this->assertFalse($reflection->isFinal());
    }

    /**
     * 例外が適切に定義されていることを確認
     */
    public function test_is_exception_class(): void
    {
        $this->assertTrue(is_subclass_of(ValidationException::class, Exception::class));
    }
}
