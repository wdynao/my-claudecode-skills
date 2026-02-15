---
name: x-research
description: X (Twitter) のツイートを検索・分析する。トレンド調査、特定ユーザーの発言確認、話題のリサーチに使う。
---

# X Research Skill

X API v2 を使ってツイートを検索・取得する。依存は Node.js 18+ のみ。

## セットアップ

`~/.claude/settings.json` に X API Bearer Token を設定:

```json
{
  "env": {
    "X_BEARER_TOKEN": "your-token-here"
  }
}
```

## 使い方

```bash
node .claude/skills/x-research/x-search.mjs search "Claude AI" --sort likes --limit 10
node .claude/skills/x-research/x-search.mjs profile anthropic
node .claude/skills/x-research/x-search.mjs tweet 1234567890123456789
node .claude/skills/x-research/x-search.mjs thread 1234567890123456789
```

### 検索オプション

| フラグ | 説明 | デフォルト |
|--------|------|------------|
| `--sort` | `likes` / `impressions` / `retweets` / `recent` | `likes` |
| `--since` | `1h` / `3h` / `12h` / `1d` / `3d` / `7d` | `7d` |
| `--limit` | 表示件数 | `15` |
| `--pages` | API ページ数 (1-5) | `1` |
| `--min-likes` | 最小いいね数フィルター | なし |
| `--no-replies` | リプライ除外 | off |
| `--quality` | いいね10以上のみ | off |

## コスト目安

X API は従量課金制。1ツイート読み取り約 $0.005。検索1ページ (最大100件) で約 $0.50。

## 注意

- 検索対象は直近7日間のみ (Recent Search API)
- リツイートはデフォルトで除外
- レート制限: 450リクエスト/15分
