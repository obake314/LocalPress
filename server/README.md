# 収集サービス（Render）

microCMS の Webhook を受けて、自治体のRSSを取得し `feedItems` へ登録するサービス。
Render の Web Service として動かす。

```
microCMS 管理画面（「収集を実行」コンテンツを追加）
        │  Webhook（署名付き）
        ▼
Render: localpress-collector
        │  1. feeds API から収集元を読む
        │  2. RSS を取得
        │  3. 既存URLと突き合わせ、新着だけ登録
        ▼
microCMS: feedItems（収集箱）
        │  人が確認して分類・訂正
        ▼
microCMS: articles → pnpm content:pull → サイト
```

## エンドポイント

| メソッド | パス | 用途 |
|---|---|---|
| POST | `/webhook/microcms` | microCMS の Webhook 受け口。`X-MICROCMS-Signature` を検証 |
| POST | `/collect` | 手動実行。`Authorization: Bearer <COLLECT_TOKEN>` |
| GET | `/` | 稼働状況と直近の実行結果 |
| GET | `/healthz` | 死活確認（Render のヘルスチェック用） |

Webhook は待たせずに `202` を返し、収集は裏で走る。実行中に再度叩かれた場合は `409` を返して二重起動を防ぐ。

## 環境変数

Render の管理画面（Environment）で設定する。

| 変数 | 必須 | 内容 |
|---|---|---|
| `MICROCMS_SERVICE_DOMAIN` | ✓ | サービスID。`https://` や `.microcms.io` は付いていても外す |
| `MICROCMS_API_KEY` | ✓ | GET と POST の権限が要る |
| `MICROCMS_WEBHOOK_SECRET` | ✓ | microCMS の Webhook 設定に入れた「シークレット」と同じ値 |
| `COLLECT_TOKEN` | | 手動実行を使うなら設定。未設定なら `/collect` は常に 401 |
| `SKIP_OLDER_THAN_DAYS` | | 既定 60。これより古い記事は取り込まない。0 で無制限 |

## デプロイ手順

1. このリポジトリを GitHub に置く
2. Render で **New > Blueprint** を選び、リポジトリを指定する（[render.yaml](../render.yaml) を読み込む）
3. 上の環境変数を設定する
4. デプロイ後、`https://<サービス名>.onrender.com/healthz` が `{"ok":true}` を返すことを確認
5. microCMS 側から起動できるようにする。方法は2つある（どちらか一方でよい）

   **A. GitHub Actions 連携（推奨）**
   microCMS の **API設定 > Webhook > 追加 > GitHub Actions** を選び、次を入力する。

   | 項目 | 値 |
   |---|---|
   | Webhookの名前 | 任意（例: 収集を実行） |
   | GitHub token | GitHub の Personal Access Token（下記） |
   | ユーザー名 | `obake314` |
   | リポジトリ名 | `LocalPress` |
   | トリガーイベント名 | `collect` |

   microCMS が `repository_dispatch` を送り、GitHub Actions 経由で `/collect` が叩かれる。
   Render を直接公開しなくてよく、実行ログも Actions に残る。

   トークンは **Fine-grained personal access token** を推奨。
   対象リポジトリを `LocalPress` だけに絞り、権限は **Contents: Read and write** を付ける。

   **B. カスタム通知（Render を直接叩く）**
   - 通知先URL: `https://<サービス名>.onrender.com/webhook/microcms`
   - シークレット: `MICROCMS_WEBHOOK_SECRET` と同じ値

   この場合は署名検証付きで Render が直接受ける。GitHub を経由しない分だけ速い。

## microCMS 側に必要なAPI

`feeds`（収集元）と `feedItems`（収集箱）が要る。フィールドは [../microcms/SETUP.md](../microcms/SETUP.md) を参照。
`feeds` が未作成の間は同梱の `sources.fallback.json`（33市町村＋県の確認済み一覧）で動く。

## 定期実行（GitHub Actions）

Render の Cron Jobs は無料枠に無いため、定期実行の号令は GitHub Actions から出す。
[../.github/workflows/collect.yml](../.github/workflows/collect.yml) が3時間おきに `/collect` を叩く。

リポジトリの **Settings > Secrets and variables > Actions** に次の2つを登録する。

| Secret | 値 |
|---|---|
| `COLLECT_URL` | `https://<サービス名>.onrender.com` |
| `COLLECT_TOKEN` | Render に設定した `COLLECT_TOKEN` と同じ値 |

ワークフローは次の順で動く。

1. `/healthz` を叩いてサービスを起こす（無料プランは停止しているため）
2. `/collect` に POST。`202` なら開始、`409` なら実行中としてスキップ
3. `/` を15秒おきに見て完了を待ち、登録件数を出力。失敗ならジョブを失敗させる

Actions の画面から手動実行（Run workflow）もできる。

**実行間隔を変えるとき**は `cron: "0 */3 * * *"` を書き換える。
**3時間おきでも足りない自治体がある**点には注意すること（下記）。

## 無料プランで気をつけること

- **Render は15分間アクセスがないと停止し、復帰に約1分かかる。**
  Webhook を叩いた直後は待たされるが、リクエスト自体は届くので収集は走る。
  GitHub Actions 側は先に `/healthz` で起こしてから本命を投げている。
- **RSS は最新数件しか保持しない。** 盛岡市はフィードに5件しか載らないため、
  更新の多い日は3時間でも溢れうる。取りこぼしが出る場合は間隔を詰める。
- **GitHub Actions の無料枠**はプライベートリポジトリで月2,000分。
  3時間おき（1日8回）で1回あたり1〜2分なので、月500分程度を見込む。
  足りなければ間隔を空けるか、リポジトリを公開にする（公開リポジトリは無料）。
- **microCMS のコンテンツ数の上限は10,000件。** 初回実行だけで約400件入る。
  収集箱は「採用／除外を決めたら消す」運用を前提にする。
- GitHub Actions の `schedule` は混雑時に数分〜数十分遅れることがある。
  厳密な時刻が要る用途には向かない。
