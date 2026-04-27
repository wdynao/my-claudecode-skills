# my-claudecode-skills

Claude Code で使えるお気に入りスキルセット集。テンプレートとして使えます。

## 導入済みスキル

| スキル | 依存 | 説明 |
|--------|------|------|
| [playwright-cli](.claude/skills/playwright-cli/) | Node.js | AI エージェント向けブラウザ操作 CLI |
| [x-research](.claude/skills/x-research/) | Node.js 18+ | X (Twitter) ツイート検索・リサーチ |
| [obsidian-vault](.claude/skills/obsidian-vault/) | なし | 会話の洞察を Zettelkasten ノートとして Vault に保存 |
| [notebooklm](.claude/skills/notebooklm/) | なし | NotebookLM での調査依頼パッケージを生成（YouTube、音声、大量PDF、Fast Research 等） |

## セットアップ

### x-research

1. [X Developer Portal](https://developer.x.com/en/portal/dashboard) で Bearer Token を取得
2. `<USER>/.claude/settings.json` にトークンを追加:

```json
{
  "env": {
    "X_BEARER_TOKEN": "your-token-here"
  }
}
```

> `<USER>/.claude/settings.json` の `env` に設定した値は、全プロジェクトの Claude Code セッションで環境変数として使える。

## スキルの追加方法

### 公式インストーラーがある場合

```bash
<tool-name> install --skills
```

### 自作スキルを追加する場合

`.claude/skills/<skill-name>/SKILL.md` を作成する。

```yaml
---
name: my-skill
description: スキルの説明
---

Claude への指示を Markdown で書く。
```

## License

[MIT](LICENSE)

---

## Work Sample 問題1: 回文判定メソッドの実装

- 言語: Ruby 3.x
- テスト: Minitest

### 使い方

```ruby
require_relative "lib/palindrome"

Palindrome.palindrome?("たけやぶやけた")  # => true
Palindrome.palindrome?("hello")           # => false
Palindrome.palindrome?("")                # => true
```

### 仕様

- **厳密一致**方式を採用する
- 空白除去・大文字小文字変換は行わない（`"Racecar"` と `"racecar"` は別物）
- 空文字 `""` は `true` として扱う
- 引数が `nil` または `String` 以外の場合は `ArgumentError` を raise する

### 時間計算量（問題1.3の回答）

文字列の長さを **n** とすると、`palindrome?` の計算量は **O(n)** である。

#### 根拠

| ステップ | 処理 | 計算量 |
|----------|------|--------|
| `String#reverse` | 文字列全体をなぞって新しい逆順文字列を生成 | O(n) |
| `==` による比較 | 先頭から1文字ずつ比較（最悪ケースで全文字を確認） | O(n) |

2つの処理は直列に実行されるため、合計は O(n) + O(n) = **O(n)** となる。

#### 空間計算量

`String#reverse` は元の文字列とは別の新しい文字列オブジェクトを生成するため、追加メモリは **O(n)** が必要になる。

#### 補足: より定数倍を絞った実装について

`String#reverse` を使わずに、インデックスで前半と後半を直接突き合わせる実装にすれば、新しい文字列の生成コストを省きつつ比較回数も最大 n/2 回に抑えられる。ただしこの最適化はあくまで定数倍の改善であり、オーダーは引き続き **O(n)** のままである。

つまり「reverse + 全比較」と「インデックス突き合わせ」はどちらも O(n) で漸近的には等価であり、現実の入力サイズで意味のある差が出ることは稀である。可読性を優先して `str == str.reverse` を採用している。

### テスト実行方法

```bash
ruby test/test_palindrome.rb
```
