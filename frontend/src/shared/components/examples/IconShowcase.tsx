/**
 * アシストとゴールアイコンの使用例コンポーネント
 *
 * 新しく作成したアイコンの表示例とスタイリングの参考として使用します。
 * サイバーパンク・未来感のあるテーマに適したスタイリングを適用しています。
 */

import { AssistIcon, GoalIcon } from "../icons";

export function IconShowcase() {
  return (
    <div className="bg-space-900 p-8 rounded-lg border border-neon-blue/20">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        アシスト & ゴール アイコン
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* アシストアイコンの例 */}
        <div
          className="bg-space-800/50 p-6 rounded-lg border border-neon-green/30 
                        backdrop-blur-sm hover:border-neon-green/50 transition-colors"
        >
          <h3 className="text-neon-green text-lg font-semibold mb-4 flex items-center gap-2">
            <AssistIcon className="w-6 h-6 text-neon-green" />
            アシスト
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">小サイズ:</span>
              <AssistIcon className="w-4 h-4 text-neon-green" size={16} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">中サイズ:</span>
              <AssistIcon className="w-6 h-6 text-neon-green" size={24} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">大サイズ:</span>
              <AssistIcon className="w-8 h-8 text-neon-green" size={32} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">アニメーション:</span>
              <AssistIcon
                className="w-6 h-6 text-neon-green animate-pulse"
                size={24}
              />
            </div>
          </div>
        </div>

        {/* ゴールアイコンの例 */}
        <div
          className="bg-space-800/50 p-6 rounded-lg border border-neon-purple/30 
                        backdrop-blur-sm hover:border-neon-purple/50 transition-colors"
        >
          <h3 className="text-neon-purple text-lg font-semibold mb-4 flex items-center gap-2">
            <GoalIcon className="w-6 h-6 text-neon-purple" />
            ゴール
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">小サイズ:</span>
              <GoalIcon className="w-4 h-4 text-neon-purple" size={16} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">中サイズ:</span>
              <GoalIcon className="w-6 h-6 text-neon-purple" size={24} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">大サイズ:</span>
              <GoalIcon className="w-8 h-8 text-neon-purple" size={32} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">アニメーション:</span>
              <GoalIcon
                className="w-6 h-6 text-neon-purple animate-spin"
                size={24}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 統計表示の例 */}
      <div
        className="mt-8 bg-gradient-to-r from-space-800/30 to-space-700/30 
                      p-6 rounded-lg border border-white/10"
      >
        <h3 className="text-white text-lg font-semibold mb-4 text-center">
          統計表示例
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AssistIcon className="w-5 h-5 text-neon-green" />
              <span className="text-gray-300">アシスト</span>
            </div>
            <span className="text-2xl font-bold text-neon-green">12</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GoalIcon className="w-5 h-5 text-neon-purple" />
              <span className="text-gray-300">ゴール</span>
            </div>
            <span className="text-2xl font-bold text-neon-purple">8</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-gray-400 text-sm">
        これらのアイコンは統計表示、試合結果、選手情報などで活用できます
      </div>
    </div>
  );
}
