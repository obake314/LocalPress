/**
 * 入札案件の締切を補う一度きりの手直し。
 *
 *   node -e "import('./backfill-bid.mjs')"
 *
 * 入札情報公開サービス由来の記事は、昇格時に締切を入れていなかった。
 * 概要文に「申請締切日: 2026-08-31」の形で残っているので、そこから読んで
 * deadline を埋める。あわせて、記事だけあって municipalities に無い
 * 都道府県を足す（自治体ページへの導線が切れるため）。
 */

import { getAll, createContent } from "./microcms.mjs"
import { endpoint, headers } from "./config.mjs"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const PREF = {
  "01": ["北海道", "https://www.pref.hokkaido.lg.jp/"],
  "02": ["青森県", "https://www.pref.aomori.lg.jp/"],
  "03": ["岩手県", "https://www.pref.iwate.jp/"],
  "04": ["宮城県", "https://www.pref.miyagi.jp/"],
  "05": ["秋田県", "https://www.pref.akita.lg.jp/"],
  "06": ["山形県", "https://www.pref.yamagata.jp/"],
  "07": ["福島県", "https://www.pref.fukushima.lg.jp/"],
  "15": ["新潟県", "https://www.pref.niigata.lg.jp/"],
}

function bidDeadline(summary) {
  const s = summary ?? ""
  for (const label of ["申請締切日", "締切日", "開札日"]) {
    const m = new RegExp(`${label}\\s*[:：]\\s*(\\d{4}-\\d{2}-\\d{2})`).exec(s)
    if (m) return m[1]
  }
  return null
}

const articles = (await getAll("articles")) ?? []
const munis = (await getAll("municipalities")) ?? []

// 1. 締切の補完
let filled = 0
let failed = 0
for (const a of articles) {
  if (a.deadline) continue
  const d = bidDeadline(a.summary)
  if (!d) continue

  const res = await fetch(`${endpoint("articles")}/${a.id}`, {
    method: "PATCH",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ deadline: `${d}T00:00:00.000Z` }),
  })
  if (res.ok) filled++
  else {
    failed++
    if (failed <= 3) console.warn(`  失敗 ${a.id} HTTP ${res.status} ${(await res.text()).slice(0, 120)}`)
  }
  await sleep(180)
}
console.log(`締切を補完 ${filled} 件 / 失敗 ${failed} 件`)

// 2. 記事はあるのに municipalities に無い都道府県を足す
const known = new Set(munis.map((m) => String(m.code ?? "").padStart(5, "0")))
const needed = new Set(
  articles
    .map((a) => String(a.cityCode ?? ""))
    .filter((c) => /^\d{2}000$/.test(c) && !known.has(c))
)

for (const code of needed) {
  const p = PREF[code.slice(0, 2)]
  if (!p) {
    console.warn(`  ${code} の県名がわかりません`)
    continue
  }
  // prefecture / area はセレクトで、選択肢は管理画面からしか増やせない。
  // 未選択のまま作り、県名は pull 側が団体コードから補う
  await createContent("municipalities", { code, name: p[0], website: p[1] })
  console.log(`自治体を追加 ${code} ${p[0]}`)
  await sleep(200)
}

// 所属県（prefecture）はセレクトの選択肢が岩手・青森しか無く API から増やせない。
// 未選択のままにして、pull 側で団体コードから補っている。
