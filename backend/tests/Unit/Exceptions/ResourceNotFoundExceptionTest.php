<?php

declare(strict_types=1);

namespace Tests\Unit\Exceptions;

use App\Exceptions\ResourceNotFoundException;
use Exception;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

/**
 * ResourceNotFoundExceptionのユニットテスト
 */
class ResourceNotFoundExceptionTest extends TestCase
{
    /**
     * 例外クラスの継承構造テスト
     */
    public function test_extends_user_friendly_exception(): void
    {
        $this->assertTrue(is_subclass_of(ResourceNotFoundException::class, \App\Exceptions\UserFriendlyException::class));
    }

    /**
     * コンストラクタの引数設定テスト
     */
    public function test_constructor_parameters(): void
    {
        $reflection = new ReflectionClass(ResourceNotFoundException::class);
        $constructor = $reflection->getConstructor();

        $this->assertNotNull($constructor);
        $this->assertSame(3, $constructor->getNumberOfParameters());

        $parameters = $constructor->getParameters();
        $this->assertSame('resourceName', $parameters[0]->getName());
        $this->assertSame('resourceId', $parameters[1]->getName());
        $this->assertSame('code', $parameters[2]->getName());
        $this->assertSame(404, $parameters[2]->getDefaultValue());
    }

    /**
     * クラスメタデータの確認
     */
    public function test_class_metadata(): void
    {
        $reflection = new ReflectionClass(ResourceNotFoundException::class);

        $this->assertSame('App\Exceptions', $reflection->getNamespaceName());
        $this->assertSame('ResourceNotFoundException', $reflection->getShortName());
        $this->assertFalse($reflection->isFinal());
    }

    /**
     * 例外が適切に定義されていることを確認
     */
    public function test_is_exception_class(): void
    {
        $this->assertTrue(is_subclass_of(ResourceNotFoundException::class, Exception::class));
    }
}
