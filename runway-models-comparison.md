# Runway API 動画生成モデル比較表

## 注記

- 料金の前提: 1クレジット = $0.01
- 調査日: 2026-04-03
- 情報ソース: 公式ドキュメント・ヘルプ・技術ブログの横断調査
- 公式APIドキュメント（docs.dev.runwayml.com）がHTTP 403で直接取得できないため、一部情報はキャッシュ・第三者情報源からの推定を含む

---

## テキスト/画像 → 動画生成モデル

| モデル | API名 | 料金 (credits/秒) | 料金 ($/秒) | Camera Motion | Motion Brush | Reference Image |
|---|---|---|---|---|---|---|
| Gen-3 Alpha | `gen3a` | 10 | $0.10 | ✅ 対応（6軸カメラコントロール） | ❌ 非対応 | ✅ 対応（`promptImage`） |
| Gen-3 Alpha Turbo | `gen3a_turbo` | 5 | $0.05 | ✅ 対応（6軸、値域 -10〜+10） | ❌ 非対応 | ✅ 対応（画像入力必須） |
| Gen-4 | `gen4` | 12 | $0.12 | ⚠️ プロンプト経由 | ❓ 不明 | ✅ 対応（最大3枚） |
| Gen-4 Turbo | `gen4_turbo` | 5 | $0.05 | ⚠️ プロンプト経由 | ❓ 不明 | ✅ 対応 |
| Gen-4 Aleph | `gen4_aleph` | 15 | $0.15 | ✅ 対応（Motion Transfer含む） | ❓ 不明 | ✅ 対応 |
| Gen-4.5 | `gen-4.5` | 25 | $0.25 | ⚠️ プロンプト経由 | ❓ 不明 | ✅ 対応（URL/base64） |

## キャラクターパフォーマンス（モーションキャプチャ）モデル

| モデル | API名 | 料金 (credits/秒) | 料金 ($/秒) | 入力 | 転写範囲 |
|---|---|---|---|---|---|
| Act One (Alpha) | `gen3/actone` | 10 | $0.10 | 駆動動画 + キャラクター画像/動画 | 顔・表情・口の動き |
| Act One (Turbo) | `gen3turbo/actone` | 5 | $0.05 | 駆動動画 + キャラクター画像/動画 | 顔・表情・口の動き |
| Act Two | `gen4/act-two` | 5 | $0.05 | パフォーマンス動画 + キャラクター参照 | 顔・上半身・手・背景（ジェスチャーON時） |

## 音声同期モデル

| モデル | API名 | 料金 | 入力 |
|---|---|---|---|
| Lip Sync | `lipsync/create` | 未確認 | 画像/動画 + 音声ファイル or テキスト+ボイスID |

---

## 各モデルの補足

### テキスト/画像 → 動画

- **Gen-3 Alpha**: 標準モデル。カメラコントロール専用パラメータあり
- **Gen-3 Alpha Turbo**: Alpha比で高速・低コスト。画像入力が必須（テキストのみ不可）
- **Gen-4**: Gen-4世代の標準。複数参照画像対応（at-mention記法）
- **Gen-4 Turbo**: Gen-4比で5倍高速。生成時間2〜10秒指定可能
- **Gen-4 Aleph**: Video-to-Video編集・変換特化。ノベルビュー生成、ショット継続、スタイル変更。2025年8月よりAPI提供
- **Gen-4.5**: 2025年12月リリースの最新フラッグシップ。機能追加予定あり

### キャラクターパフォーマンス

- **Act One**: Gen-3ベースのモーションキャプチャ。駆動動画の顔の表情・口の動きをキャラクターに転写。3Dリギング不要。`motion_multiplier` パラメータで動きの強度を調整可能
- **Act Two**: Gen-4ベースの次世代版。頭部・顔・上半身・手・背景の動きを一括転写。ジェスチャーコントロールON/OFF切替可能（ONで全身、OFFで顔+環境のみ）。2025年7月21日にAPI追加

### 音声同期

- **Lip Sync**: 音声トラックに合わせて口の動きを同期。テキストから音声を生成してそれに合わせることも可能。`/lipsync/voices` で利用可能なボイス一覧取得

---

## 信頼度の注記

- **高信頼度**: 各モデルのcredits/秒料金、Gen-3 Alpha TurboのCamera Motion対応、Gen-3世代のMotion Brush非対応、Gen-4以降のReference Image対応、Act One / Act Twoの存在と基本機能
- **中信頼度**: Gen-4以降のCamera Motionはプロンプト経由のみ（専用APIパラメータ未確認）、Act Twoの正式APIエンドポイント名（第三者ラッパーで確認）
- **低信頼度**: Lip Syncの料金、Gen-4世代のMotion Brush対応状況

---

## ソース

- https://docs.dev.runwayml.com/guides/pricing/
- https://docs.dev.runwayml.com/guides/models/
- https://docs.dev.runwayml.com/api-details/api_changelog/
- https://help.runwayml.com/hc/en-us/articles/34926468947347 (Camera Control on Gen-3 Alpha Turbo)
- https://help.runwayml.com/hc/en-us/articles/40042718905875 (Gen-4 Image References)
- https://help.runwayml.com/hc/en-us/articles/30266515017875 (Gen-3 Alpha and Turbo)
- https://help.runwayml.com/hc/en-us/articles/44609246167059 (Aleph Reference Image)
- https://help.runwayml.com/hc/en-us/articles/33927968552339 (Act One)
- https://help.runwayml.com/hc/en-us/articles/42311337895827 (Act Two)
- https://useapi.net/docs/api-runwayml-v1/post-runwayml-gen4-act-two
- https://useapi.net/docs/api-runwayml-v1/post-runwayml-gen3turbo-actone
- https://useapi.net/docs/api-runwayml-v1/post-runwayml-lipsync-create
- https://aimlapi.com/models/runway-act-two

> **補足**: Runway APIでは第三者モデル（Kling, Google Veo, Wan等）も利用可能ですが、Runway独自モデルではないため本表からは除外しています。
