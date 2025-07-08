<?php

declare(strict_types=1);

namespace Tests\Unit\Exceptions;

use App\Exceptions\UserFriendlyException;
use Exception;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

/**
 * UserFriendlyException基底クラスのユニットテスト
 *
 * カスタム例外クラスの基本的な動作確認を行います。
 */
class UserFriendlyExceptionTest extends TestCase
{
    /**
     * 例外クラスの基本的な継承構造テスト
     */
    public function test_extends_exception(): void
    {
        $this->assertTrue(is_subclass_of(UserFriendlyException::class, Exception::class));
    }

    /**
     * コンストラクタの引数が適切に設定されていることを確認
     */
    public function test_constructor_parameters(): void
    {
        $reflection = new ReflectionClass(UserFriendlyException::class);
        $constructor = $reflection->getConstructor();

        $this->assertNotNull($constructor);
        $this->assertSame(4, $constructor->getNumberOfParameters());

        $parameters = $constructor->getParameters();
        $this->assertSame('messageKey', $parameters[0]->getName());
        $this->assertSame('placeholders', $parameters[1]->getName());
        $this->assertSame('code', $parameters[2]->getName());
        $this->assertSame('previous', $parameters[3]->getName());
    }

    /**
     * getUserMessageメソッドが存在することを確認
     */
    public function test_has_get_user_message_method(): void
    {
        $reflection = new ReflectionClass(UserFriendlyException::class);

        $this->assertTrue($reflection->hasMethod('getUserMessage'));

        $method = $reflection->getMethod('getUserMessage');
        $this->assertTrue($method->isPublic());
        $this->assertSame('string', $method->getReturnType()->getName());
    }

    /**
     * プロパティが適切に定義されていることを確認
     */
    public function test_has_user_message_property(): void
    {
        $reflection = new ReflectionClass(UserFriendlyException::class);

        $this->assertTrue($reflection->hasProperty('userMessage'));

        $property = $reflection->getProperty('userMessage');
        $this->assertTrue($property->isProtected());
    }

    /**
     * クラスがfinalでないことを確認（継承可能であること）
     */
    public function test_is_not_final(): void
    {
        $reflection = new ReflectionClass(UserFriendlyException::class);

        $this->assertFalse($reflection->isFinal());
    }

    /**
     * 例外クラスのメタデータ確認
     */
    public function test_class_metadata(): void
    {
        $reflection = new ReflectionClass(UserFriendlyException::class);

        // 名前空間が正しいことを確認
        $this->assertSame('App\Exceptions', $reflection->getNamespaceName());

        // クラス名が正しいことを確認
        $this->assertSame('UserFriendlyException', $reflection->getShortName());
    }
}
