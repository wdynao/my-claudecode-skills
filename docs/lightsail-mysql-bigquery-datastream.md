**Datastream for BigQuery**
**AWS Lightsail MySQL → BigQuery CDC連携 手順書**
作成日: 2026-04-03

---

# **1. Lightsail MySQL の種別と Datastream 対応状況**

| 種別 | Datastream対応 |
| :---- | :---- |
| Amazon Lightsail マネージドDB | △ 下記の事前確認が必要 |
| Amazon Lightsail セルフホスト MySQL | ○ |

### マネージドDB の制約

- `SET GLOBAL binlog_format = 'ROW'` は**実行不可**（SUPER権限がマスターユーザーに付与されていない）
- パラメータ変更API (`update-relational-database-parameters`) 経由での変更は可能性があるが、`binlog_format` が変更可能かどうかの公式ドキュメントは存在しない
- MySQL 8.0.34以降はデフォルトで `binlog_format=ROW` のため、**バージョン次第では変更不要の可能性がある**

以下のコマンドで確定できる:

```bash
# binlog_format が変更可能か確認（isModifiable フラグを見る）
aws lightsail get-relational-database-parameters \
  --relational-database-name <DB名> \
  --query "relationalDatabaseParameters[?parameterName=='binlog_format']"
```

**→ マネージドDB の場合**: セクション2A へ
**→ セルフホスト の場合**: セクション2B へ

---

# **2A. マネージドDBの設定（管理者への依頼事項）**

## **binlogパラメータ**

| パラメータ | 値 |
| :---- | :---- |
| binlog_format | ROW |
| binlog_row_image | FULL |
| binlog_checksum | NONE |
| net_read_timeout | 3600 |
| net_write_timeout | 3600 |
| wait_timeout | 86400 |

```bash
aws lightsail update-relational-database-parameters \
  --relational-database-name <DB名> \
  --parameters "parameterName=binlog_format,parameterValue=ROW,applyMethod=pending-reboot"
```

**binlog保持期間:**

```sql
CALL mysql.rds_set_configuration('binlog retention hours', 168);
```

※ RDS専用プロシージャのため Lightsail では実行不可の可能性あり

## **Datastream用ユーザー作成**

```sql
CREATE USER 'datastream'@'%' IDENTIFIED BY '<パスワード>';
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'datastream'@'%';
GRANT SELECT ON *.* TO 'datastream'@'%';
GRANT EXECUTE ON PROCEDURE mysql.rds_show_configuration TO 'datastream'@'%';
FLUSH PRIVILEGES;
```

---

# **2B. セルフホストMySQLの設定**

## **binlogパラメータ**

`/etc/mysql/mysql.conf.d/mysqld.cnf` または `/etc/my.cnf` に追加:

```ini
[mysqld]
server_id = 1
log_bin = mysql-bin
binlog_format = ROW
binlog_row_image = FULL
binlog_expire_logs_seconds = 604800
max_allowed_packet = 1G
```

```bash
sudo systemctl restart mysql
```

## **Datastream用ユーザー作成**

```sql
CREATE USER 'datastream'@'%' IDENTIFIED BY '<パスワード>';
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'datastream'@'%';
GRANT SELECT ON *.* TO 'datastream'@'%';
FLUSH PRIVILEGES;
```

---

# **3. ネットワーク接続**

| | IPアローリスト | SSHトンネル（推奨） |
| :---- | :---- | :---- |
| 概要 | Lightsailパブリックモード有効化 + DatastreamのIP許可 | 踏み台サーバー経由で接続 |
| 追加コスト | $0 | $3.50/月〜（踏み台） |
| セキュリティ | △ DB公開が必要 | ○ DB非公開のまま |
| 設定難易度 | 低 | 中 |

## **方式A: IPアローリスト**

1. Lightsailで「パブリックモード」を有効化
2. ファイアウォールでDatastreamのIP → ポート3306を許可
3. SSL接続を設定

## **方式B: SSHトンネル**

```
Datastream ---(SSH:22)---> 踏み台 ---(MySQL:3306)---> Lightsail MySQL
  (GCP)                   (AWS)                        (AWS)
```

1. 踏み台インスタンスを起動（Lightsail MySQL と同一リージョン）
2. 踏み台のSSH公開鍵をDatastreamに登録
3. Datastreamで踏み台のパブリックIPとSSH秘密鍵を指定

---

# **4. コスト**

課金対象の processed byte は**実データの2〜5倍**になる。

| 月間処理量 | CDC単価 |
| :---- | :---- |
| 〜2,500 GiB | $2.00/GiB |
| 2,500〜5,000 GiB | $1.50/GiB |

**バックフィル:** 月間500GiBまで無料、超過分 $0.40/GiB

---

# **5. 制限事項**

| 制限 | 影響 |
| :---- | :---- |
| マネージドDBで `binlog_format=ROW` 設定不可の場合 | CDC連携不可。バッチ連携（Embulk等）を検討 |
| GTIDは使用しない | binlogファイル＋ポジションベースで接続 |
| 500万行超テーブルのバックフィル | ユニークかつNOT NULLのインデックスが必要 |
| ストリーム一時停止中のbinlog期限切れ | 再開不可になる。保持期間168時間を推奨 |

---

# **参考リンク**

- Datastream MySQLソース設定: cloud.google.com/datastream/docs/configure-your-source-mysql-database
- Self-managed MySQL CDC設定: cloud.google.com/datastream/docs/configure-self-managed-mysql
- Lightsail DBパラメータ更新: docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-updating-database-parameters.html
- SSHトンネル設定: cloud.google.com/datastream/docs/ssh-tunnel
- Datastream IPアローリスト: cloud.google.com/datastream/docs/ip-allowlists-and-regions
- Datastream料金: cloud.google.com/datastream/pricing
