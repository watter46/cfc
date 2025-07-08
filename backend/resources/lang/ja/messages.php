<?php

return [
    'validation_error'     => '入力データが無効です。',
    'authentication_error' => '認証に失敗しました。',
    'authorization_error'  => 'この操作を実行する権限がありません。',
    'resource_not_found'   => ':resourceが見つかりません。',
    'business_logic_error' => ':message',
    'system_error'         => 'システムエラーが発生しました。管理者にお問い合わせください。',
    'social_login'         => [
        'user_info_retrieval_failed' => 'プロバイダー「:provider」からのユーザー情報取得に失敗しました。',
        'unsupported_provider'       => 'サポートされていないプロバイダー「:provider」が指定されました。',
        'provider_id_conflict'       => 'プロバイダー「:provider」のID「:providerId」は既に別のユーザーによって使用されています。',
        'missing_required_info'      => 'ソーシャルログインに必要な情報「:field」が不足しています。',
    ],
];
