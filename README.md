# my-claudecode-skills

Claude Code で使えるお気に入りスキルセット集。テンプレートとして使えます。

## セットアップ

```bash
# 1. playwright-cli スキルをインストール
npm install -g @playwright/cli@latest
playwright-cli install-browser
playwright-cli install --skills
```

## 導入済みスキル

| スキル | 導入方法 | 説明 |
|--------|----------|------|
| [playwright-cli](.claude/skills/playwright-cli/) | `playwright-cli install --skills` | AI エージェント向けブラウザ操作 CLI |

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
