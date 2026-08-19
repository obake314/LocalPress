# 収集元の一覧

岩手県33市町村＋県庁の「更新情報をどこから取るか」を、実地に確認して記録したもの。

- `sources.json` — 取得先の一覧。`method` が取得方法
  - `rss` … RSS/Atom が実在し、現在も更新されている
  - `html` … フィードが無く、HTMLの新着一覧を解析する必要がある
  - `unreachable` … 現状そのままでは取得できない
- `sources.csv` — 上記を表計算ソフトで見るための管理用CSV（UTF-8 BOM付き・Excelでそのまま開ける）
- `check-feeds.mjs` — 実在確認スクリプト。`node collector/check-feeds.mjs` で再検査し、
  結果を `last-check.json` に書き出す
- `fetch-august.mjs` — 指定月のお知らせをRSSから取得する。`node collector/fetch-august.mjs 2026-08`
- `export-csv.mjs` — `sources.json` と直近の取得結果から `sources.csv` を作り直す
- `output/` — 月次の取得結果

編集の起点は `sources.json` です。CSVは書き出し専用なので、CSVを直しても
`export-csv.mjs` を流すと上書きされます。

## 2026-08-19 時点の結果

| 取得方法 | 件数 |
|---|---|
| RSS あり | 7（うち遠野市は2022年で更新停止、実質6） |
| HTML解析が必要 | 26 |
| 取得不可 | 1（久慈市・TLS証明書の期限切れ） |

RSS があるのは 盛岡市・花巻市・釜石市・平泉町・洋野町・岩手県 と、停止中の遠野市のみ。
**残り26自治体は各サイトの新着一覧をHTMLから読む必要がある**ため、収集の実装量の大半はここに掛かる。

## 確認の作法

- 1サイトあたりの試行を数回までに抑え、逐次実行して間隔を空けている（自治体サイトへ負荷をかけないため）
- User-Agent に用途を書いている
- 本番の定期収集を作るときは、`robots.txt` の確認、`If-Modified-Since` / `ETag` による差分取得、
  取得間隔の制御を必ず入れること（事業計画の「収集時の負荷」リスクに対応する）
