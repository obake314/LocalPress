/** microCMS の読み書き。無料プランは limit 上限100・APIキー1本という前提 */

import { endpoint, headers } from "./config.mjs"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function getAll(name, { fields } = {}) {
  const out = []
  const limit = 100
  let offset = 0

  for (;;) {
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (fields) qs.set("fields", fields)

    const res = await fetch(`${endpoint(name)}?${qs}`, { headers: headers() })
    if (res.status === 404) return null // API 未作成
    if (!res.ok) throw new Error(`${name} の取得に失敗 (HTTP ${res.status})`)

    const json = await res.json()
    out.push(...json.contents)
    offset += limit
    if (out.length >= json.totalCount || json.contents.length === 0) break
  }

  return out
}

export async function createContent(name, body) {
  const res = await fetch(endpoint(name), {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`${name} への登録に失敗 (HTTP ${res.status}) ${(await res.text()).slice(0, 160)}`)
  }
  return res.json()
}

/** 書き込みは間隔を空ける。無料プランの転送量とレート制限に配慮する */
export async function createMany(name, items, { delayMs = 200, onProgress } = {}) {
  const created = []
  const failed = []

  for (const item of items) {
    try {
      created.push(await createContent(name, item))
    } catch (e) {
      failed.push({ item, error: e.message })
    }
    onProgress?.(created.length + failed.length, items.length)
    await sleep(delayMs)
  }

  return { created, failed }
}
