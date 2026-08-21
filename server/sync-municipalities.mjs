/**
 * 記事はあるのに municipalities に無い自治体を足す。
 *
 *   node -e "import('./sync-municipalities.mjs').then(m => m.syncMunicipalities({ dryRun: true }))"
 *
 * 収集元が増えるたびに新しい市区町村が現れる。レコードが無いと
 * 自治体ページへの導線が切れ、県ページの集計からも漏れるため、
 * 記事に付いている団体コードと名称からレコードを作る。
 *
 * prefecture と area はセレクトで、選択肢を API から増やせない。
 * 未選択のまま作り、県名は取り込み時に団体コードから補っている。
 */

import { getAll, createContent } from "./microcms.mjs"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** 同じコードに複数の名称が付いていたら、いちばん多いものを採る */
function nameByCode(articles) {
  const counts = new Map()
  for (const a of articles) {
    const code = String(a.cityCode ?? "")
    const name = String(a.cityName ?? "").trim()
    if (!/^\d{5}$/.test(code) || !name) continue
    const m = counts.get(code) ?? new Map()
    m.set(name, (m.get(name) ?? 0) + 1)
    counts.set(code, m)
  }
  const out = new Map()
  for (const [code, m] of counts) {
    out.set(code, [...m].sort((a, b) => b[1] - a[1])[0][0])
  }
  return out
}

export async function syncMunicipalities({ dryRun = false } = {}) {
  const [articles, munis] = await Promise.all([getAll("articles"), getAll("municipalities")])
  const known = new Set((munis ?? []).map((m) => String(m.code ?? "").padStart(5, "0")))
  const names = nameByCode(articles ?? [])

  const missing = [...names].filter(([code]) => !known.has(code)).sort()
  const added = []
  let failed = 0

  for (const [code, name] of missing) {
    // 県そのもの（末尾000）に市区町村名が付いている場合は、国の機関などを
    // 県単位でまとめたものなので自治体としては作らない
    if (/000$/.test(code)) continue
    if (dryRun) {
      added.push({ code, name })
      continue
    }
    try {
      await createContent("municipalities", { code, name })
      added.push({ code, name })
    } catch (e) {
      failed++
      if (failed <= 3) console.warn(`[municipalities] ${code} ${name} を作れず: ${e.message}`)
    }
    await sleep(200)
  }

  return { checked: names.size, added: added.length, failed, dryRun, names: added.map((a) => a.name) }
}
