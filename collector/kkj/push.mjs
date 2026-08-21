/**
 * 官公需情報ポータルから取った発注情報を microCMS の収集箱へ登録する。
 *
 *   node push.mjs
 *   DRY_RUN=1 node push.mjs     登録せず件数だけ見る
 *
 * 分野が確定しているので状態は「採用」で入れる。昇格は収集サービス側が行う。
 */

import { readFileSync, readdirSync } from "node:fs"

const DOMAIN = (process.env.MICROCMS_SERVICE_DOMAIN ?? "")
  .trim()
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "")
  .replace(/\.microcms\.io$/, "")
const KEY = (process.env.MICROCMS_API_KEY ?? "").trim()
const ITEMS = process.env.MICROCMS_ITEMS_ENDPOINT?.trim() || "feeditems"
const DRY = process.env.DRY_RUN === "1"

if (!DOMAIN || !KEY) {
  console.error("MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY が要ります")
  process.exit(1)
}

const api = `https://${DOMAIN}.microcms.io/api/v1/${ITEMS}`
const headers = { "X-MICROCMS-API-KEY": KEY, "Content-Type": "application/json" }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const todayJst = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)

const dir = new URL("./output/", import.meta.url)
const file = readdirSync(dir).filter((f) => f.startsWith("kkj-")).sort().at(-1)
if (!file) {
  console.log("取得結果がありません。先に fetch.mjs を回してください")
  process.exit(0)
}
const { items } = JSON.parse(readFileSync(new URL(file, dir), "utf8"))
const today = todayJst()

/**
 * 掲載する案件を選ぶ。
 *
 * 締切が過ぎたものは応募できないので入れない。
 * 締切が読めなかったものは、公告から日が浅いあいだだけ入れる
 * （本文が無く判断できない案件を切り捨てると取りこぼしが大きい）。
 */
const KEEP_WITHOUT_DEADLINE_DAYS = 30
const staleLimit = new Date(Date.now() + 9 * 3600 * 1000 - KEEP_WITHOUT_DEADLINE_DAYS * 86400000)
  .toISOString()
  .slice(0, 10)

const chosen = []
let expired = 0
let stale = 0
for (const i of items) {
  if (!i.title || !i.url) continue
  if (i.deadline) {
    if (i.deadline < today) { expired++; continue }
  } else if (!i.issueDate || i.issueDate < staleLimit) {
    stale++
    continue
  }
  chosen.push(i)
}

console.log(`取得 ${items.length} 件 → 掲載対象 ${chosen.length} 件（締切済み ${expired} / 締切不明で古い ${stale}）`)
if (DRY) process.exit(0)

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

let created = 0, skipped = 0, failed = 0
for (const i of chosen) {
  // 公告PDFに直リンクできる。Key を付けて同じPDFの別案件と衝突しないようにし、
  // あわせて kkj 由来と分かる印にする（昇格処理が分野を決めるのに使う）
  const url = `${i.url}#kkj:${encodeURIComponent(i.key)}`
  if (known.has(url)) { skipped++; continue }

  const summary = [
    i.category ? `区分: ${i.category}` : null,
    i.deadline ? `締切日: ${i.deadline}` : null,
    i.issueDate ? `公告日: ${i.issueDate}` : null,
    `発注機関: ${i.cityName || i.orgName || i.prefName}`,
  ].filter(Boolean).join(" / ")

  const body = {
    // 市区町村コードが取れない国の機関などは県単位で持つ
    cityCode: i.cityCode || `${i.lgCode ?? "00"}000`,
    cityName: i.cityName || i.orgName || i.prefName || "",
    title: i.title.slice(0, 200),
    url,
    ...(i.issueDate ? { publishedDate: `${i.issueDate}T00:00:00.000Z` } : {}),
    rawSummary: summary.slice(0, 1000),
    state: ["採用"],
  }

  const r = await fetch(api, { method: "POST", headers, body: JSON.stringify(body) })
  if (r.ok) { created++; known.add(url) }
  else { failed++; if (failed <= 3) console.warn(`  失敗 ${r.status} ${(await r.text()).slice(0, 140)}`) }
  await sleep(180)
}

console.log(`登録 ${created} 件 / 既存 ${skipped} 件 / 失敗 ${failed} 件`)
