# my-claudecode-skills

Claude Code で使えるお気に入りスキルセット集。テンプレートとして使えます。

## セットアップ

```bash
# playwright-cli
npm install -g @playwright/cli@latest
playwright-cli install-browser
playwright-cli install --skills

# x-research (依存: Node.js 18+)
# ~/.claude/settings.json に X_BEARER_TOKEN を設定すること
```

### 環境変数の設定

`~/.claude/settings.json` にトークンを追加する:

```json
{
  "env": {
    "X_BEARER_TOKEN": "your-token-here"
  }
}
```

## 導入済みスキル

| スキル | 導入方法 | 依存 | 説明 |
|--------|----------|------|------|
| [playwright-cli](.claude/skills/playwright-cli/) | `playwright-cli install --skills` | Node.js | AI エージェント向けブラウザ操作 CLI |
| [x-research](.claude/skills/x-research/) | 同梱 | Node.js 18+ | X (Twitter) ツイート検索・リサーチ |

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
