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

## Sub Agent フロントマター リファレンス（2026-04時点）

Claude Code Sub Agent (`.claude/agents/*.md`) のフロントマターで利用可能なフィールド一覧。基本フィールド4項目に加え、2026年4月時点で追加された応用フィールドを含む。

| フィールド | 必須 | 取れる値 / 型 | デフォルト | 説明 | サンプル | 使いどころ・注意点 |
|-----------|------|--------------|-----------|------|---------|-----------------|
| `name` | ✅ | string | — | エージェントの一意識別子。 | `name: engineer` | `Agent(name)` 構文での呼び出し時に一致するキーになる。スペース不可推奨。 |
| `description` | ✅ | string | — | 委譲タイミングの説明。`\|` 複数行記法が公式サンプル。 | `description: \|`<br>`  コードレビュー担当。` | 親が「いつこの Agent を呼ぶか」を判断する文章。詳しく書くほど委譲精度が上がる。 |
| `tools` | ❌ | string（カンマ区切り） | 全ツール | 利用可能ツールのカンマ区切りリスト。 | `tools: Read, Glob, Grep` | 最小権限の原則に従い、不要なツールは外す。Sub Agent が他の Sub Agent を呼ぶには `Agent` を含める必要がある。 |
| `tools: Agent(...)` 拡張 | ❌ | `Agent(name1, name2, ...)` | — | Agent ツールに型制限をかけ、指定した name の Sub Agent だけを召喚可能にする。 | `tools: Agent(engineer, reviewer), TodoWrite` | 許可外の Agent を呼ぶとリクエスト失敗。Sub Agent から Sub Agent を呼ぶ場合は `Agent` をツールに含めること。 |
| `model` | ❌ | `opus` / `sonnet` / `haiku` / `inherit` / フルモデルID | (親に準拠) | 使用モデルの指定。 | `model: haiku` | `inherit` で親セッションのモデルに追従。コスト最適化には `haiku`、高精度タスクには `opus`。 |
| `color` | ❌ | `red` / `blue` / `green` / `yellow` / `purple` / `orange` / `pink` / `cyan` | — | UI 表示色。動作には影響しない純 UI 装飾。 | `color: pink` | 複数 Agent を並べたときに視覚的に区別しやすくなる。 |
| `effort` | ❌ | `low` / `medium` / `high` / `xhigh` / `max` | — | 推論努力レベル。 | `effort: high` | 深い検証なら `high` 以上、高速探索なら `low`。`max` は Haiku では不可の可能性あり。 |
| `permissionMode` | ❌ | `default` / `acceptEdits` / `auto` / `dontAsk` / `bypassPermissions` / `plan` | `default` | 許可プロンプトの制御。 | `permissionMode: acceptEdits` | 親が `bypassPermissions` / `acceptEdits` の場合は子の設定は上書き不可。親が `auto` の場合は子も `auto` を継承し子の設定は無視される。 |
| `maxTurns` | ❌ | integer（正の整数） | — | 最大ターン数（1ターン = 1ツール使用 + 推論）。 | `maxTurns: 10` | 無限ループ防止。到達すると Sub Agent が強制終了するため、長尺タスクには不向き。 |
| `skills` | ❌ | string[] | — | Skill 本体マークダウンを起動時にプリロード。`~/.claude/skills/<name>/SKILL.md` または `.claude/skills/<name>/SKILL.md` を参照。 | `skills:`<br>`  - playwright-cli` | Agent 専用の手順書・ツール定義を自動注入したいとき。 |
| `mcpServers` | ❌ | string[] / object[] | — | MCP 接続を限定公開。文字列で親セッション定義サーバー名を参照、または `type: stdio` / `type: http` でインライン定義。 | `mcpServers:`<br>`  - type: stdio`<br>`    command: npx`<br>`    args: ["-y", "@mcp/sqlite", "data.db"]` | インライン定義は Sub Agent 終了時に自動クリーンアップ。 |
| `hooks` | ❌ | object | — | ライフサイクル介入。イベントは `PreToolUse`（exit code 2 でブロック可）/ `PostToolUse` / `PostToolUseFailure` / `Stop`（`SubagentStop` に自動変換）。 | `hooks:`<br>`  PreToolUse:`<br>`    - matcher: "Write\|Edit"`<br>`      hooks:`<br>`        - type: command`<br>`          command: echo "detected"` | ツール実行前後に任意コマンドを挟める。`Stop` イベントはフロントマター内では `SubagentStop` として扱われる。 |
| `memory` | ❌ | `user` / `project` / `local` | — | セッション横断の記憶。`user`=全プロジェクト共通、`project`=プロジェクト内、`local`=git 管理外。 | `memory: project` | 有効化すると Read/Write/Edit が自動付与。`MEMORY.md` の先頭 200 行（または 25KB）が毎回ロードされる。 |
| `initialPrompt` | ❌ | string | — | `claude --agent <name>` で単独起動した時のみ有効な初期プロンプト。スラッシュコマンドや Skill 呼び出しも記述可。 | `initialPrompt: /report-skill generate daily` | Agent を単体ツールとして CLI から起動する場面向け。委譲経由では無視される。 |
| `isolation` | ❌ | `worktree` | — | `worktree` を指定すると git worktree で隔離実行。 | `isolation: worktree` | 並列リファクタの衝突防止。Git 管理下が必須。変更がなければ自動クリーンアップ。 |
| `background` | ❌ | boolean | `false` | `true` で常時バックグラウンド実行。 | `background: true` | tester・レポート生成など対話不要なタスク向け。`AskUserQuestion` が失敗するため対話が必要な Agent には不向き。 |

---

### leader への適用例

オーケストレーター系 Agent に適したフロントマター構成例。

```yaml
---
# === 基本フィールド ===
name: leader
description: |
  チーム開発のリーダー。自分では成果物を作らず、Sub Agent への委譲と進捗管理に専念する。
tools: Agent, TodoWrite, AskUserQuestion, SendMessage
model: inherit              # 親セッションのモデルに追従

# === 応用フィールド ===
color: red                  # 指揮棒・赤旗（道具メタファー）
effort: high                # 委譲判断は深く考えたい
permissionMode: default     # 明示しておく（誤爆防止）
memory: project             # プロジェクトの委譲パターン・成功例を学習
skills:                     # 委譲ルールや team conventions をプリロードしたい場合
  - delegation-patterns
  - team-conventions

# === ライフサイクル介入（任意） ===
hooks:
  PreToolUse:
    - matcher: "Agent"
      hooks:
        - type: command
          command: "./scripts/log-delegation.sh"  # 委譲ログを取る用途
  Stop:
    - hooks:
        - type: command
          command: "./scripts/save-progress.sh"   # 終了時に進捗を保存
---
```

```yaml
# --- 以下は leader には付けない方がよい ---
# isolation: worktree   # leader はファイルを触らないので worktree 不要
# background: true      # AskUserQuestion が失敗するため対話必須の leader には不向き
# maxTurns: 10          # 委譲管理が途中で止まるリスク
# initialPrompt: ...    # leader は委譲先で呼ばれるため、単独起動の initialPrompt は無意味
```

> ※ `SendMessage` ツールは実験機能。利用には環境変数 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` が必要 (subagents.md L725-726 参照)。

#### leader に合わないフィールド

| フィールド | 理由 |
|-----------|------|
| `isolation` | ファイルを直接触らないため worktree 不要 |
| `background` | ユーザーとの対話が必要なため不向き |
| `maxTurns` | 委譲管理の途中で止まると困る |
| `initialPrompt` | 委譲先として呼ばれる側なので無意味 |

---

### 出典

- Sub Agent 完全ドキュメント: https://code.claude.com/docs/en/subagents.md
- Agent Teams: https://code.claude.com/docs/en/agent-teams.md
- Hooks リファレンス: https://code.claude.com/docs/en/hooks.md
- Skills: https://code.claude.com/docs/en/skills.md
- MCP: https://code.claude.com/docs/en/mcp.md

---

## License

[MIT](LICENSE)
