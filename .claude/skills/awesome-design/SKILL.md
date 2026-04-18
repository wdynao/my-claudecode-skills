---
name: awesome-design
description: "デザインの方向性・雰囲気・スタイルを相談する文脈で発動する。「クールでダークな感じ」「温かみのあるデザイン」「Stripeっぽいデザイン」などデザイン設計の相談時に使う。企業名なしの一般的なUI作成依頼では発動しない。"
version: 1.0.0
allowed-tools: [WebFetch, Read, Write, Edit, Glob, Grep, AskUserQuestion]
---

# awesome-design スキル

awesome-design-md リポジトリ（VoltAgent/awesome-design-md）が収録する72社のデザインシステムを活用して、プロジェクト固有の `DESIGN.md` を生成するスキル。コーディングを始める前のデザイン設計フェーズで使う意思決定支援ツール。

GitHub: https://github.com/VoltAgent/awesome-design-md

---

## 発動条件

**発動する:**

- デザインの方向性・雰囲気・スタイルを相談するとき
- 「クールでダークな感じ」「温かみのある親しみやすいデザイン」等の雰囲気指定
- 「Stripeのデザインで」「Notion風に」等の企業名指定
- `/awesome-design` コマンド

**発動しない:**

- 「UIを作って」「ボタンを追加して」等、デザイン方向性の相談がない純粋なコーディング依頼

---

## ワークフロー

### Step 1: README取得（企業カタログ）

WebFetch で以下のURLからREADMEを取得し、企業一覧とデザイン特性をカタログとして使う。

```
https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/README.md
```

READMEには各企業のデザイン特性が記載されている（例: "Warm terracotta accent, clean editorial layout"）。これを候補選定の判断材料にする。

### Step 2: リポジトリの調査と提案

ユーザーの要望（雰囲気、用途、ターゲット）に基づいて2-3社を候補として提案する。各候補には推薦理由を添える（デザイン哲学、カラー系統、雰囲気）。

企業名を直接指定された場合はこのステップをスキップする。

### Step 3: AskUserQuestion でユーザーと意見交換

AskUserQuestion を使って候補から選択してもらう。追加の要望（「もう少し明るい感じ」「ダークモード必須」等）も確認する。要望に合わない場合は別の候補を提案し直す。

### Step 4: 候補企業の DESIGN.md を複数取得して比較

候補として挙がった企業（2-3社）の DESIGN.md を **並列で全て取得** する。1社だけでなく複数取得して比較提示することで、ユーザーがより良い判断を下せるようにする。

```
https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/{company}/DESIGN.md
```

取得した複数の DESIGN.md を以下の観点で比較表にまとめる:

- **カラーパレット**: Primary / Accent / Background の比較
- **タイポグラフィ**: フォントファミリー、ウェイト、特徴的な使い方
- **雰囲気**: 各社のデザイン哲学の違い
- **コンポーネント**: ボタン形状、カード、シャドウの特徴

比較を提示したうえで、ユーザーに「どちらが好みか」「ミックスしたいか」を AskUserQuestion で確認する。

その後、選ばれた企業のデザインに対してカスタマイズポイントを提示する:
- アクセントカラーの変更
- フォントの代替
- ダークモード / ライトモードの選択
- ブランドカラーの反映

### Step 5: プロジェクト用 DESIGN.md 生成

参考企業の DESIGN.md と同じ9セクションフォーマットで生成し、`./DESIGN.md`（プロジェクトルート）に保存する。冒頭に「Based on {企業名} design system」のクレジットを記載する。

**9セクションフォーマット:**

1. Visual Theme & Atmosphere
2. Color Palette & Roles
3. Typography Rules
4. Component Stylings
5. Layout Principles
6. Depth & Elevation
7. Do's and Don'ts
8. Responsive Behavior
9. Agent Prompt Guide

---

## 重要なルール

- DESIGN.md のカラーコード・フォント・スペーシングは「参考にする」ではなく「準拠する」（カスタマイズで変更した部分を除く）
- 複数企業を参考にする場合は2社まで推奨。3社以上はコンテキストが大きすぎるため非推奨
- 生成された DESIGN.md は、以降のUI実装時にAIエージェントが参照するデザイン指針書として機能する

---

## エイリアス解決ルール

ユーザーの入力を正しいディレクトリ名に変換する。

**ドット付き企業（ドットなしでも認識する）:**

| 入力 | → ディレクトリ名 |
|------|----------------|
| linear | linear.app |
| mistral | mistral.ai |
| together | together.ai |
| opencode | opencode.ai |
| xai, grok | x.ai |
| cal.com | cal |

**カタカナ入力（主要企業のみ）:**

| 入力 | → ディレクトリ名 |
|------|----------------|
| ストライプ | stripe |
| ノーション | notion |
| クロード | claude |
| アップル | apple |
| スポティファイ | spotify |
| ウーバー | uber |
| エアビー | airbnb |
| フィグマ | figma |
| エヌビディア | nvidia |
| ピンタレスト | pinterest |
| ビーエムダブリュー | bmw |
| バーセル | vercel |
| リニア | linear.app |
