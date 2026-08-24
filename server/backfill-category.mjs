/**
 * 既存の記事に調達区分を書き込み、案件でない書類を消す。
 *
 *   node -e "import('./backfill-category.mjs').then(m => m.backfillCategory({ dryRun: true }))"
 *
 * 区分は kkj API では 45% が空で返るため題名から補っている。既に登録済みの
 * 記事にはその判定が入っていないので、概要文の先頭に「区分: 〜」を足す。
 * 判定できないものは「その他」とし、落とさずに残す。
 *
 * あわせて、様式・契約書案・結果一覧といった案件に付随する書類は消す。
 * 応募できるものではなく、一覧に混ざると邪魔になる。
 */

import { getAll } from "./microcms.mjs"
import { endpoint, headers } from "./config.mjs"
import { classifyCategory, isProcurement } from "../collector/kkj/classify.mjs"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function backfillCategory({ dryRun = false } = {}) {
  const articles = (await getAll("articles")) ?? []

  let deleted = 0
  let updated = 0
  let failed = 0
  const tally = {}

  for (const a of articles) {
    if (!isProcurement(a.title)) {
      if (!dryRun) {
        const res = await fetch(`${endpoint("articles")}/${a.id}`, { method: "DELETE", headers: headers() })
        res.ok ? deleted++ : failed++
        await sleep(160)
      } else deleted++
      continue
    }

    const category = classifyCategory({ title: a.title, description: a.summary, category: "" })

    // 既に同じ区分が入っていれば触らない。違っていれば書き換える
    // （発注元が工事監理業務を「工事」としている等、元の区分が誤っている場合がある）
    const current = /区分\s*[:：]\s*([^\/]+)/.exec(a.summary ?? "")?.[1]?.trim()
    if (current === category) continue
    tally[category] = (tally[category] ?? 0) + 1
    if (dryRun) { updated++; continue }

    const body = (a.summary ?? "").replace(/^\s*区分\s*[:：][^\/]*\/\s*/, "")
    const summary = `区分: ${category} / ${body}`.slice(0, 200)
    const res = await fetch(`${endpoint("articles")}/${a.id}`, {
      method: "PATCH",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ summary }),
    })
    if (res.ok) updated++
    else { failed++; if (failed <= 3) console.warn(`[backfill] ${a.id} (HTTP ${res.status})`) }
    await sleep(160)
  }

  return { checked: articles.length, deleted, updated, failed, tally, dryRun }
}
