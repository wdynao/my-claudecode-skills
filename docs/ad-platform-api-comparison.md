# 広告媒体7社 クリエイティブ別メトリクスAPI 比較表

> 調査日: 2026-04-03

## 比較表

| | **Meta** | **TikTok** | **Google Ads** | **Yahoo!広告** | **LINE広告** | **X (Twitter)** | **メルカリ** |
|---|---|---|---|---|---|---|---|
| **公開API** | ✅ あり | ✅ あり | ✅ あり | ✅ あり | ✅ あり（申請制） | ✅ あり（審査制） | ❌ なし |
| **クリエイティブ別取得** | ✅ Ad単位 | ✅ Ad単位 | ✅ Ad単位 + アセット単位 | ✅ Ad単位 | ✅ Ad単位 | ✅ プロモートツイート単位 | ❌ |
| **インプレッション** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | CSV手動DLのみ |
| **クリック数** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | CSV手動DLのみ |
| **コンバージョン** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | CSV手動DLのみ |
| **CPC** | ✅ 直接取得 | ✅ 直接取得 | ✅ 直接取得 | ✅ 直接取得 | ✅ (推測) | ⚠️ 計算必要 | CSV手動DLのみ |
| **画像素材のDL** | ✅ フルサイズURL | ✅ フルサイズURL | ✅ フルサイズURL | ✅ 一時URL（15分有効） | ❓ 不明 | ✅ フルサイズURL | ❓ 不明 |
| **動画素材のDL** | ✅ ファイルURL | ✅ 署名付きURL | ⚠️ YouTube IDのみ | ✅ 一時URL（15分有効） | ❓ 不明 | ✅ ファイルURL | ❓ 不明 |
| **認証方式** | OAuth / System User Token | OAuth（実質無期限） | OAuth 2.0 + 開発者トークン | OAuth 2.0（要法人契約） | 独自JWS署名 | OAuth 1.0A | N/A |
| **利用開始の敷居** | 🟢 低い | 🟡 中 | 🟡 中 | 🔴 高い | 🔴 高い | 🔴 高い | N/A |

## 各媒体の詳細

### Meta (Facebook / Instagram)

- **Insights API**: `GET /act_{ad_account_id}/insights?level=ad&fields=ad_id,ad_name,impressions,clicks,ctr,cpc,spend,actions,cost_per_action_type`
- **画像取得**: `GET /act_{ad_account_id}/adimages` → `url` フィールド（CDN上フルサイズ）
- **動画取得**: `GET /act_{ad_account_id}/advideos` → `source` フィールド
- **認証**: System User Token（無期限）を推奨。権限は `ads_read` のみでOK
- **SDK**: `pip install facebook-business`

### TikTok

- **Reporting API**: `GET /open_api/v1.3/report/integrated/get/?data_level=AUCTION_AD&dimensions=["ad_id","stat_time_day"]&metrics=["impressions","clicks","ctr","cpc","conversions","conversion_rate","spend"]`
- **画像取得**: `GET /open_api/v1.3/file/image/ad/info/`
- **動画取得**: `GET /open_api/v1.3/file/video/ad/info/`（署名付き有効期限ありURL）
- **認証**: OAuth（トークン実質無期限）
- **SDK**: `github.com/tiktok/tiktok-business-api-sdk`

### Google Ads

- **Insights**: GAQL（Google Ads Query Language）で `SELECT ad_group_ad.ad.id, metrics.impressions, metrics.clicks, metrics.average_cpc, metrics.conversions, metrics.cost_micros FROM ad_group_ad`
- **画像取得**: `asset.image_asset.full_size.url`（フル解像度）
- **動画取得**: `asset.youtube_video_asset.youtube_video_id`（YouTube IDのみ、動画ファイル直接DL不可）
- **認証**: OAuth 2.0 + 開発者トークン（Developer Token）
- **SDK**: `pip install google-ads`
- **注意**: 費用は `cost_micros`（100万分の1単位）で返るため割り算が必要

### Yahoo!広告（検索広告 / YDA）

- **レポート**: `ReportDefinitionService` で ReportCategory = `AD` を指定 → 非同期生成 → CSV/ZIPでダウンロード
- **画像/動画取得**: YDAのみ `MediaService.get` → `downloadUrl`（**発行から15分間のみ有効**な一時URL）
- **認証**: OAuth 2.0（LY Corporationとの法人契約が前提）
- **SDK**: 公式サンプルコードのみ（フルSDKなし）

### LINE広告

- **レポート**: `POST /adaccounts/{adaccountId}/pfreports` → `GET .../download`（CSV形式）
- **画像/動画取得**: 詳細不明（ドキュメントが認証壁で閲覧不可）
- **認証**: 独自JWS署名（アクセスキー / シークレットキー方式、HS256）
- **SDK**: 公式Python SDKなし
- **注意**: 2027年3月サービス終了予定

### X (Twitter)

- **Analytics API**: 同期 `GET /stats/accounts/:account_id`、非同期 `POST /stats/jobs/accounts/:account_id`
- **画像/動画取得**: `GET /accounts/:account_id/media_library` → `media_url`（フルサイズ）
- **認証**: OAuth 1.0A（Ads API専用の審査が別途必要）
- **SDK**: `pip install twitter-ads`
- **注意**: CPCは `spend ÷ clicks` で自分で計算。2025年から従量課金モデルへ移行中

### メルカリ広告

- **公開APIなし**（2026年4月時点）
- **代替手段**: 管理画面からCSV手動ダウンロード
  - 取得可能: インプレッション、クリック、CVR、CPC、CPA、ROAS、CPM
  - データ更新: 表示回数は約1時間ごと、CV関連は約4時間ごと
  - 上限: 1回あたり1,000件
  - CV対象: 購入イベントのみ（VIEW_ITEM、ADD_TO_CARTはCSV非対応）
- **画像/動画素材DL**: 不明（サポートに要確認）
