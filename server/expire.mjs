/**
 * 締切を過ぎた記事を「終了」に落とす。
 *
 * 収集のたびに呼ぶ。サイト側も表示のたびに締切と突き合わせて直しているが、
 * microCMS の一覧を見たときに実態と食い違っていると編集の判断を誤るため、
 * 保管しているデータのほうも合わせておく。
 *
 * 下げる方向にだけ効かせる。「終了」「準備中」は編集側の判断なので触らない。
 */

import { getAll } from "./microcms.mjs"
import { endpoint, headers } from "./config.mjs"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** 今日（日本時間）を YYYY-MM-DD で返す */
export const todayJst = () =>
  new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)

/** 締切までの残り日数。今日が締切なら 0、過ぎていれば負の数 */
export function daysUntilDeadline(deadline, today = todayJst()) {
  if (!deadline) return null
  const to = Date.parse(`${String(deadline).slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(to)) return null
  return Math.round((to - Date.parse(`${today}T00:00:00Z`)) / 86400000)
}

/** 締切から見た状態。変える必要がなければ null を返す */
export function statusByDeadline(status, deadline, today = todayJst()) {
  const now = Array.isArray(status) ? status[0] : status
  if (now === "終了" || now === "準備中") return null
  const days = daysUntilDeadline(deadline, today)
  if (days === null) return null
  const next = days < 0 ? "終了" : days <= 7 ? "締切間近" : null
  return next && next !== now ? next : null
}

export async function expireOverdue({ dryRun = false } = {}) {
  const articles = (await getAll("articles")) ?? []
  const today = todayJst()

  let closed = 0
  let nearing = 0
  let failed = 0

  for (const a of articles) {
    const next = statusByDeadline(a.status, a.deadline, today)
    if (!next) continue

    if (!dryRun) {
      const res = await fetch(`${endpoint("articles")}/${a.id}`, {
        method: "PATCH",
        headers: headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status: [next] }),
      })
      if (!res.ok) {
        failed++
        if (failed <= 3) {
          console.warn(`[expire] 更新できず ${a.id} (HTTP ${res.status}) ${(await res.text()).slice(0, 120)}`)
        }
        continue
      }
      await sleep(160)
    }

    if (next === "終了") closed++
    else nearing++
  }

  return { today, checked: articles.length, closed, nearing, failed }
}
