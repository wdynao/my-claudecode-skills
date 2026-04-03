# Runway API 動画生成モデル比較表

## 注記

- 料金の前提: 1クレジット = $0.01
- 調査日: 2026-04-03
- 情報ソース: 公式ドキュメント・ヘルプ・技術ブログの横断調査

---

## モデル比較表

| モデル | API名 | 料金 (credits/秒) | 料金 ($/秒) | Camera Motion | Motion Brush | Reference Image |
|---|---|---|---|---|---|---|
| Gen-3 Alpha | `gen3a` | 10 | $0.10 | ✅ 対応（6軸カメラコントロール） | ❌ 非対応 | ✅ 対応（`promptImage`） |
| Gen-3 Alpha Turbo | `gen3a_turbo` | 5 | $0.05 | ✅ 対応（6軸、値域 -10〜+10） | ❌ 非対応 | ✅ 対応（画像入力必須） |
| Gen-4 | `gen4` | 12 | $0.12 | ⚠️ プロンプト経由 | ❓ 不明 | ✅ 対応（最大3枚） |
| Gen-4 Turbo | `gen4_turbo` | 5 | $0.05 | ⚠️ プロンプト経由 | ❓ 不明 | ✅ 対応 |
| Gen-4 Aleph | `gen4_aleph` | 15 | $0.15 | ✅ 対応（Motion Transfer含む） | ❓ 不明 | ✅ 対応 |
| Gen-4.5 | `gen-4.5` | 25 | $0.25 | ⚠️ プロンプト経由 | ❓ 不明 | ✅ 対応（URL/base64） |

---

## 各モデルの補足

- **Gen-3 Alpha**: 標準モデル。カメラコントロール専用パラメータあり
- **Gen-3 Alpha Turbo**: Alpha比で高速・低コスト。画像入力が必須（テキストのみ不可）
- **Gen-4**: Gen-4世代の標準。複数参照画像対応（at-mention記法）
- **Gen-4 Turbo**: Gen-4比で5倍高速。生成時間2〜10秒指定可能
- **Gen-4 Aleph**: Video-to-Video編集・変換特化。ノベルビュー生成、ショット継続、スタイル変更。2025年8月1日よりAPI提供
- **Gen-4.5**: 2025年12月リリースの最新フラッグシップ。「Additional inputs coming soon」と記載あり、機能追加予定

---

## 信頼度の注記

- **高信頼度**: 各モデルのcredits/秒料金、Gen-3 Alpha TurboのCamera Motion対応（専用パラメータあり）、Gen-3世代のMotion Brush非対応、Gen-4以降のReference Image対応
- **中信頼度**: Gen-4以降のCamera Motionはテキストプロンプト経由のみ（専用APIパラメータの存在は未確認）、Gen-4（標準）の独立APIモデルとしての現状
- **低信頼度**: Gen-3 Alpha（標準）のAPI経由カメラパラメータ詳細、Gen-4世代のMotion Brush非対応（言及がないだけ）

---

## ソース

- https://docs.dev.runwayml.com/guides/pricing/
- https://docs.dev.runwayml.com/guides/models/
- https://help.runwayml.com/hc/en-us/articles/34926468947347
- https://help.runwayml.com/hc/en-us/articles/40042718905875
- https://help.runwayml.com/hc/en-us/articles/30266515017875
- https://help.runwayml.com/hc/en-us/articles/44609246167059
