/**
 * 取得した発注情報を microCMS の収集箱へ登録する。
 *
 *   node push.mjs
 *
 * 入札情報公開サービスは分野が確定しているので、状態は「採用」で入れる。
 * 収集サービス側の昇格処理が articles へ流す。
 */

import { readFileSync, readdirSync } from "node:fs"

const DOMAIN = (process.env.MICROCMS_SERVICE_DOMAIN ?? "")
  .trim()
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "")
  .replace(/\.microcms\.io$/, "")
const KEY = (process.env.MICROCMS_API_KEY ?? "").trim()
const ITEMS = process.env.MICROCMS_ITEMS_ENDPOINT?.trim() || "feeditems"

if (!DOMAIN || !KEY) {
  console.error("MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY が要ります")
  process.exit(1)
}

const api = `https://${DOMAIN}.microcms.io/api/v1/${ITEMS}`
const headers = { "X-MICROCMS-API-KEY": KEY, "Content-Type": "application/json" }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 直近の取得結果を読む
const dir = new URL("./output/", import.meta.url)
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort()
if (files.length === 0) {
  console.log("取得結果がありません")
  process.exit(0)
}
const { items } = JSON.parse(readFileSync(new URL(files.at(-1), dir), "utf8"))

// 既存のURLを集めて重複を防ぐ
const known = new Set()
for (let offset = 0; ; offset += 100) {
  const r = await fetch(`${api}?limit=100&offset=${offset}&fields=url`, { headers })
  if (!r.ok) break
  const j = await r.json()
  for (const c of j.contents) known.add(c.url)
  if (known.size >= j.totalCount || j.contents.length === 0) break
}
console.log(`収集箱の既存 ${known.size} 件`)

/**
 * 明細ページのURL。doEdit の引数が案件IDで、詳細は POST 遷移のため
 * 直リンクできない。一覧の入口URLを控えて、そこから辿れるようにする。
 */
const ORGS = JSON.parse(readFileSync(new URL("./orgs.json", import.meta.url), "utf8"))
const entryOf = (cityCode) =>
  `${ORGS.base}?name1=${ORGS.orgs.find((o) => o.cityCode === cityCode)?.name1 ?? ""}`

let created = 0, skipped = 0, failed = 0
for (const i of items) {
  // 契約管理番号を含めて一意にする
  const url = `${entryOf(i.cityCode)}#${i.contractNo}`
  if (known.has(url)) { skipped++; continue }

  const summary = [
    `入札方式: ${i.method}`,
    `工種: ${i.workType}`,
    i.openingDate ? `開札日: ${i.openingDate}` : null,
    i.section ? `課所: ${i.section}` : null,
    i.note && i.note !== "公告文を参照の事" ? i.note : null,
  ].filter(Boolean).join(" / ")

  const body = {
    cityCode: i.cityCode,
    cityName: i.cityName,
    title: i.title,
    url,
    publishedDate: i.publishedDate ? `${i.publishedDate}T00:00:00.000Z` : null,
    rawSummary: summary.slice(0, 1000),
    state: ["採用"],
  }

  const r = await fetch(api, { method: "POST", headers, body: JSON.stringify(body) })
  if (r.ok) { created++; known.add(url) }
  else { failed++; if (failed <= 3) console.warn(`  失敗 ${r.status} ${(await r.text()).slice(0, 120)}`) }
  await sleep(180)
}

console.log(`登録 ${created} 件 / 既存 ${skipped} 件 / 失敗 ${failed} 件`)
