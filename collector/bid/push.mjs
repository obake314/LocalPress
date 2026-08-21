/**
 * 取得した発注情報を microCMS の収集箱へ登録する。
 *
 *   node push.mjs
 *
 * 入札は分野が確定しているので、状態は「採用」で入れる。
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

/** R08-08-26 や 令和8年8月26日 を YYYY-MM-DD にする */
function toIso(raw) {
  const s = (raw ?? "").trim()
  let m = /^R(\d{1,2})[-./](\d{1,2})[-./](\d{1,2})/.exec(s)
  if (m) return `${2018 + Number(m[1])}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`
  m = /令和(\d{1,2})年(\d{1,2})月(\d{1,2})日/.exec(s)
  if (m) return `${2018 + Number(m[1])}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`
  m = /(20\d{2})[-./年](\d{1,2})[-./月](\d{1,2})/.exec(s)
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`
  return null
}

/**
 * 新潟型の列並び
 * [0]連番 [1]調達区分 [2]案件名称 [3]工種 [4]入札方式 [5]場所 [6]締切日 [7][8]予備 [9]発注機関
 */
function mapNiigata(item) {
  const c = item.cells
  const agency = c[9] || item.prefName
  const deadline = toIso(c[6])
  const summary = [
    c[1] ? `調達区分: ${c[1]}` : null,
    c[4] ? `入札方式: ${c[4]}` : null,
    c[3] ? `工種: ${c[3]}` : null,
    deadline ? `締切日: ${deadline}` : null,
    c[5] ? `場所: ${c[5]}` : null,
    `発注機関: ${agency}`,
  ].filter(Boolean).join(" / ")

  return {
    cityName: agency,
    title: c[2],
    summary,
    deadline,
    // 同じ案件を二度入れないための鍵。案件名称と発注機関で一意とみなす
    key: `${item.prefName}/${agency}/${c[2]}`,
  }
}

/**
 * efftis 型（宮城など）。取得時に項目名で拾ってあるので、そのまま組み立てる
 */
function mapEfftis(item) {
  const notice = toIso(item.noticeDate)
  const apply = toIso(item.applyDeadline)
  const open = toIso(item.openDate)
  const agency = item.dept || item.prefName
  const summary = [
    item.bidType ? `入札方式: ${item.bidType}` : null,
    item.workType ? `工種: ${item.workType}` : null,
    open ? `開札日: ${open}` : null,
    `課所: ${agency}`,
    apply ? `申請締切日: ${apply}` : null,
    item.caseNo ? `案件番号: ${item.caseNo}` : null,
  ].filter(Boolean).join(" / ")

  return {
    cityName: agency,
    title: item.title,
    summary,
    // 事業者が動く期限は申請の締切。無ければ開札日で代える
    deadline: apply ?? open,
    published: notice,
    // 案件IDが一意なので、そのまま鍵に使う
    key: item.projectId || `${item.prefName}/${agency}/${item.title}`,
  }
}

const dir = new URL("./output/", import.meta.url)

/** 系統ごとに、いちばん新しい取得結果を使う */
function latest(prefix) {
  const f = readdirSync(dir).filter((x) => x.startsWith(prefix) && x.endsWith(".json")).sort().at(-1)
  return f ? JSON.parse(readFileSync(new URL(f, dir), "utf8")).items ?? [] : []
}

const items = [
  ...latest("ebid-").map((x) => ({ ...x, variant: "ebid" })),
  ...latest("efftis-").map((x) => ({ ...x, variant: "efftis" })),
]
if (items.length === 0) {
  console.log("取得結果がありません")
  process.exit(0)
}

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

const PREFS = JSON.parse(readFileSync(new URL("./prefectures.json", import.meta.url), "utf8")).prefectures

let created = 0, skipped = 0, failed = 0
for (const item of items) {
  const m = item.variant === "efftis" ? mapEfftis(item) : mapNiigata(item)
  if (!m.title) continue

  const entry = PREFS.find((p) => p.code === item.prefCode)?.url ?? ""
  const url = `${entry}#${encodeURIComponent(m.key)}`
  if (known.has(url)) { skipped++; continue }

  const body = {
    // 都道府県コード2桁＋000。市町村コードは一覧から取れないため県単位で持つ
    cityCode: `${item.prefCode}000`,
    cityName: m.cityName,
    title: m.title.slice(0, 200),
    url,
    // 日付が無い案件があるため、値があるときだけ送る（null は 400 になる）
    // 公告日が取れていればそれを、無ければ締切日を掲載日に使う
    ...(m.published || m.deadline
      ? { publishedDate: `${m.published ?? m.deadline}T00:00:00.000Z` }
      : {}),
    rawSummary: m.summary.slice(0, 1000),
    state: ["採用"],
  }

  const r = await fetch(api, { method: "POST", headers, body: JSON.stringify(body) })
  if (r.ok) { created++; known.add(url) }
  else { failed++; if (failed <= 3) console.warn(`  失敗 ${r.status} ${(await r.text()).slice(0, 120)}`) }
  await sleep(180)
}

console.log(`登録 ${created} 件 / 既存 ${skipped} 件 / 失敗 ${failed} 件`)
