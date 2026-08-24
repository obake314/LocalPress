/**
 * 工事の案件を消す。
 *
 *   node -e "import('./purge-koji.mjs').then(m => m.purgeKoji({ dryRun: true }))"
 *
 * 扱う対象を役務・物品に絞ったため、既に載せた工事を落とす。
 * 工事は工種の細分化が激しく運用が重いうえ、公共工事には前払金保証という
 * 別の資金の受け皿があり、事業として狙う層とずれる。
 *
 * あわせて、題名が PDF のファイル名や表の断片のまま入っている案件も消す。
 * 発注元の公表の仕方によって混入するもので、読み手に伝わらない。
 */

import { getAll } from "./microcms.mjs"
import { endpoint, headers } from "./config.mjs"
import { classifyCategory, isUsableTitle } from "../collector/kkj/classify.mjs"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function purgeKoji({ dryRun = false } = {}) {
  const articles = (await getAll("articles")) ?? []

  const targets = articles.filter((a) => {
    if (!isUsableTitle(a.title)) return true
    return classifyCategory({ title: a.title, description: a.summary, category: "" }) === "工事"
  })

  let deleted = 0
  let failed = 0
  for (const a of targets) {
    if (dryRun) { deleted++; continue }
    const res = await fetch(`${endpoint("articles")}/${a.id}`, { method: "DELETE", headers: headers() })
    if (res.ok) deleted++
    else { failed++; if (failed <= 3) console.warn(`[purge-koji] 削除できず ${a.id} (HTTP ${res.status})`) }
    await sleep(160)
  }

  return { checked: articles.length, deleted, failed, remaining: articles.length - deleted, dryRun }
}
