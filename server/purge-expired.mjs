/**
 * 締切が過ぎた記事を消す。
 *
 *   node --env-file=../.env -e "import('./purge-expired.mjs').then(m => m.purgeExpired({ dryRun: true }))"
 *
 * 収集の時点でも締切済みは弾いているが、掲載中に締切を迎えたものは残る。
 * 応募できない案件は用がないので、ためこまずに消す
 * （無料プランのコンテンツ枠は 10,000 件しかない）。
 *
 * 消すのは「締切が今日より前」のものだけ。締切を持たない記事や、
 * 編集側が手で終了にした記事は対象にしない。日付で機械的に判断できるものに限る。
 */

import { getAll } from "./microcms.mjs"
import { endpoint, headers } from "./config.mjs"
import { todayJst } from "./expire.mjs"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function purgeExpired({ dryRun = false, keepDays = 0 } = {}) {
  const articles = (await getAll("articles")) ?? []

  // keepDays を指定すると、締切から その日数ぶんは残す（すぐ消したくない場合）
  const limit = new Date(Date.parse(`${todayJst()}T00:00:00Z`) - keepDays * 86400000)
    .toISOString()
    .slice(0, 10)

  const targets = articles.filter((a) => a.deadline && String(a.deadline).slice(0, 10) < limit)

  let deleted = 0
  let failed = 0
  for (const a of targets) {
    if (dryRun) {
      deleted++
      continue
    }
    const res = await fetch(`${endpoint("articles")}/${a.id}`, { method: "DELETE", headers: headers() })
    if (res.ok) deleted++
    else {
      failed++
      if (failed <= 3) console.warn(`[purge] 削除できず ${a.id} (HTTP ${res.status})`)
    }
    await sleep(160)
  }

  return { today: todayJst(), limit, checked: articles.length, deleted, failed, dryRun }
}
