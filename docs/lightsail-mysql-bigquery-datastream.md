**Datastream for BigQuery**
**AWS Lightsail MySQL → BigQuery CDC連携 手順書**
作成日: 2026-04-03

---

# **1. DatastreamのLightsail MySQLサポート状況**

Datastream は以下のMySQLソースを公式サポートしている。Lightsail マネージドDB は「Self-managed MySQL」カテゴリに分類される想定。

| ソース | サポート | 備考 |
| :---- | :---- | :---- |
| Self-hosted MySQL | ○ |  |
| Cloud SQL for MySQL | ○ |  |
| Amazon RDS for MySQL | ○ |  |
| Amazon Aurora MySQL | ○ |  |
| Amazon Lightsail マネージドDB | △ | Self-managed MySQL として接続想定。binlog設定可否の確認が必要 |
| MariaDB | ○ | MySQLコネクタ経由 |
| Percona Server | ○ | MySQLコネクタ経由 |

| ⚠ 重要な注意 Lightsail マネージドDB では `binlog_format=ROW` が設定できない可能性がある。Datastream CDC を利用するにはこの設定が必須であるため、事前にDB管理者への確認が必要。設定不可の場合はバッチ連携（Embulk、Dataflow等）を検討すること。 |
| :---- |

---

# **2. Lightsail MySQLの設定（管理者への依頼事項）**

## **2.1 事前確認事項**

DB管理者に以下を確認・依頼すること。

- [ ] `binlog_format` の現在値と、`ROW` への変更可否
- [ ] パブリックアクセス（Public mode）の有効化可否
- [ ] Datastream接続用MySQLユーザーの作成可否
- [ ] MySQLのバージョン（5.7 / 8.0 等）
- [ ] 以下のコマンドでパラメータ一覧を取得し、変更可能なパラメータを確認してもらう

```bash
aws lightsail get-relational-database-parameters \
  --relational-database-name <DB名>
```

## **2.2 binlogパラメータ設定**

Datastream CDC に必要なパラメータは以下のとおり。

| パラメータ | 値 | 説明 |
| :---- | :---- | :---- |
| binlog_format | ROW | 必須。MIXED/STATEMENTは非対応 |
| binlog_row_image | FULL | 全カラムの変更前後の値を記録 |
| binlog_checksum | NONE | Datastream推奨設定 |
| net_read_timeout | 3600 | 推奨値 |
| net_write_timeout | 3600 | 推奨値 |
| wait_timeout | 86400 | 推奨値 |

Lightsail CLIでのパラメータ変更コマンド例:

```bash
aws lightsail update-relational-database-parameters \
  --relational-database-name <DB名> \
  --parameters "parameterName=binlog_format,parameterValue=ROW,applyMethod=pending-reboot"
```

変更後はDBの再起動が必要（`pending-reboot` を指定した場合）。

**binlog保持期間の設定:**

```sql
CALL mysql.rds_set_configuration('binlog retention hours', 168);
```

※ Lightsail マネージドDB でこのプロシージャが使用可能か要確認。使用できない場合はDB管理者に保持期間の設定を依頼すること。

## **2.3 Datastream用ユーザー作成**

管理者に以下のSQLを実行してもらう。

```sql
CREATE USER 'datastream'@'%' IDENTIFIED BY '<パスワード>';

GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'datastream'@'%';
GRANT SELECT ON *.* TO 'datastream'@'%';

-- RDS互換DBのため、以下も付与
GRANT EXECUTE ON PROCEDURE mysql.rds_show_configuration TO 'datastream'@'%';

FLUSH PRIVILEGES;
```

---

# **3. ネットワーク接続**

## **3.1 方式A: IPアローリスト（Public IP）**

Lightsail のパブリックモードを有効化し、DatastreamのIPをファイアウォールで許可する方式。

**設定手順:**

1. Lightsail コンソール でDB の「パブリックモード」を有効化（10〜15分かかる）
2. Lightsail ファイアウォールで以下を設定:
   - プロトコル: TCP
   - ポート: 3306
   - 送信元: Datastreamの使用リージョンのIPレンジ（[IPアローリスト参照](#参考リンク)）
3. DatastreamでSSL接続を設定（推奨）

| 項目 | 内容 |
| :---- | :---- |
| 追加コスト | $0 |
| セキュリティ | △（公開インターネット経由、SSL推奨） |
| 設定難易度 | 低 |

| ⚠ セキュリティ上の注意 DBがパブリックインターネットに露出するため、ファイアウォールルールのIP制限とSSL接続を必ず設定すること。パブリックモード有効化はDB管理者の承認が必要な場合がある。 |
| :---- |

## **3.2 方式B: SSHトンネル（推奨）**

同一リージョンに踏み台サーバー（Lightsail インスタンス または EC2）を配置し、SSHトンネル経由で接続する方式。

**構成図:**

```
Datastream ---(SSH:22)---> 踏み台 ---(MySQL:3306)---> Lightsail MySQL
  (GCP)                   (AWS)                        (AWS, Private推奨)
```

**設定手順:**

1. Lightsail または EC2 で踏み台インスタンスを起動（同一リージョン推奨）
2. 踏み台の SSH 公開鍵を Datastream に登録
3. 踏み台から Lightsail MySQL（ポート3306）への疎通を確認
4. Datastream でSSHトンネル設定を行う際に踏み台のパブリックIPとSSH秘密鍵を指定

| 項目 | 内容 |
| :---- | :---- |
| 追加コスト | 踏み台インスタンス代（Lightsail 最小構成 $3.50/月〜） |
| セキュリティ | ○（DBをパブリックに公開しない） |
| 設定難易度 | 中 |

---

# **4. コスト**

## **4.1 Datastream課金体系**

処理データ量（GiB単位）の従量課金。**課金対象の「processed byte」は実データの2〜5倍**になる点に注意。アイドル状態のストリームには課金なし。

| 月間処理量 | CDC単価 (USD/GiB) |
| :---- | :---- |
| 0〜2,500 GiB | $2.00 |
| 2,500〜5,000 GiB | $1.50 |
| 5,000〜10,000 GiB | $1.20 |
| 10,000+ GiB | $0.80 |

**バックフィル（初期ロード）:** 月間500GiBまで無料、超過分$0.40/GiB

## **4.2 概算コスト例（1GB/日の変更量）**

| 項目 | 概算 |
| :---- | :---- |
| CDC費用 | $120〜300/月（60〜150 GiB × $2.00） |
| 初回バックフィル（10GB DB） | $0（500GiB無料枠内） |
| ネットワーク（SSHの場合） | $3.50〜15/月（踏み台インスタンス） |
| 合計目安 | $125〜320/月（BQストレージ費用除く） |

---

# **5. 制限事項・注意点**

## **Lightsail マネージドDB 固有の問題**

| 制限・注意点 | 詳細 |
| :---- | :---- |
| binlog_format=ROW 設定不可の場合 | Datastream CDC は利用不可。代替案としてバッチ連携（Embulk、Dataflow等）を検討 |
| パラメータ変更APIの制約 | 一部パラメータが読み取り専用で変更できない可能性がある |
| パブリックモード有効化の時間 | 有効化・無効化に10〜15分かかる |
| GTID非互換 | MySQLのGTIDは使用しない。binlogファイル＋ポジションベースで接続すること |

## **Datastreamの一般的な制限**

| 制限・注意点 | 詳細 |
| :---- | :---- |
| 大規模テーブルのバックフィル | 500万行超のテーブルはユニークかつNOT NULLのインデックスが必要 |
| DDL変更のサポート | ALTER TABLE 等の一部DDLはサポート外。スキーマ変更時は要確認 |
| 課金データサイズ | 実データの2〜5倍が課金対象となる |
| binlog期限切れリスク | ストリームを一時停止中にbinlogが保持期間を超えると再開不可になる。保持期間（推奨168時間）の設定を確認すること |

---

# **参考リンク**

| ドキュメント | URL |
| :---- | :---- |
| Datastream MySQLソース設定 | cloud.google.com/datastream/docs/configure-your-source-mysql-database |
| Self-managed MySQL CDC設定 | cloud.google.com/datastream/docs/configure-self-managed-mysql |
| Lightsail DBパラメータ更新 | docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-updating-database-parameters.html |
| Lightsail パブリックアクセス設定 | docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-configuring-database-public-mode.html |
| SSHトンネル設定 | cloud.google.com/datastream/docs/ssh-tunnel |
| Datastream料金 | cloud.google.com/datastream/pricing |
| Datastream IPアローリスト | cloud.google.com/datastream/docs/ip-allowlists-and-regions |
