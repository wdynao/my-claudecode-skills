# my-claudecode-skills

Claude Code で使えるお気に入りスキルセット集。テンプレートとして使えます。

## 導入済みスキル

| スキル | 依存 | 説明 |
|--------|------|------|
| [playwright-cli](.claude/skills/playwright-cli/) | Node.js | AI エージェント向けブラウザ操作 CLI |
| [x-research](.claude/skills/x-research/) | Node.js 18+ | X (Twitter) ツイート検索・リサーチ |
| [obsidian-vault](.claude/skills/obsidian-vault/) | なし | 会話の洞察を Zettelkasten ノートとして Vault に保存 |

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
