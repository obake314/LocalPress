/**
 * 収集箱で「採用」にした項目を articles へ移す。
 *
 *   1. state が 採用 の項目を取る
 *   2. 分野を決める（feeditems の category、無ければ分野別フィードとの突き合わせ）
 *   3. 元ページから締切と概要を補う
 *   4. articles に登録する（同じ URL が既にあれば飛ばす）
 *   5. 収集箱からは削除する
 *
 * microCMS のスキーマは API から変更できないため、フィールドの有無を
 * 実行時に調べて、あるものだけ書き込む。
 */

import { serviceId, apiKey, endpoint, headers } from "./config.mjs"
import { getAll, createContent } from "./microcms.mjs"
import { inspectPage } from "./page.mjs"
import { decodeBody, parseFeed } from "./feed.mjs"
import { readFileSync } from "node:fs"

const ITEMS = process.env.MICROCMS_ITEMS_ENDPOINT?.trim() || "feeditems"
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** API のフィールド構成を調べる。書き込めない項目を送ると 400 になるため */
async function fieldsOf(name) {
  const res = await fetch(`https://${serviceId()}.microcms-management.io/api/v1/apis/${name}`, {
    headers: { "X-MICROCMS-API-KEY": apiKey(), Accept: "application/json" },
  })
  if (!res.ok) return null
  const json = await res.json()
  return new Set((json.apiFields ?? []).map((f) => f.fieldId))
}

/** 分野別フィードから URL と分野の対応を作る（feeditems に分野が無い場合の保険） */
async function categoryByUrl() {
  const map = new Map()
  const fallback = JSON.parse(readFileSync(new URL("./sources.fallback.json", import.meta.url), "utf8"))

  for (const s of fallback.sources) {
    for (const cf of s.categoryFeeds ?? []) {
      try {
        const r = await fetch(cf.feed, { headers: { "User-Agent": "LocalPress-collector/0.1" } })
        if (!r.ok) continue
        const buf = Buffer.from(await r.arrayBuffer())
        for (const i of parseFeed(decodeBody(buf, r.headers.get("content-type") || ""))) {
          map.set(i.url, cf.category)
        }
      } catch {
        /* 取得できなければこのフィードは諦める */
      }
      await sleep(500)
    }
  }
  return map
}

const clean = (s) => (s ?? "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()

/** 分野ごとの想定対象者 */
const TARGETS = {
  "入札・公募": ["企業"],
  補助金: ["企業"],
  募集: ["企業", "団体"],
  イベント: ["個人"],
  文化: ["個人"],
  子育て: ["子育て世帯"],
  政策: ["個人", "企業"],
}

export async function promoteAdopted({ dryRun = false } = {}) {
  const adopted = (await getAll(ITEMS)) ?? []
  const targets = adopted.filter((c) => (c.state ?? []).includes("採用"))
  if (targets.length === 0) return { promoted: 0, skipped: 0, failed: 0, note: "採用済みの項目なし" }

  const [articleFields, itemFields] = await Promise.all([fieldsOf("articles"), fieldsOf(ITEMS)])
  const hasPublishedDate = articleFields?.has("publishedDate") ?? false
  const itemHasCategory = itemFields?.has("category") ?? false

  const existing = new Set(
    ((await getAll("articles", { fields: "sourceUrl" })) ?? []).map((a) => a.sourceUrl)
  )
  const urlCategory = itemHasCategory ? new Map() : await categoryByUrl()

  let promoted = 0, skipped = 0, failed = 0
  const unknown = []

  for (const item of targets) {
    // 既に articles にあるものは、収集箱から消して重複を残さない
    if (existing.has(item.url)) {
      skipped++
      if (!dryRun) {
        await fetch(`${endpoint(ITEMS)}/${item.id}`, { method: "DELETE", headers: headers() })
        await sleep(150)
      }
      continue
    }

    // 入札情報公開サービス由来のものは分野が確定している
    const fromBidPortal = /epi-cloud\.fwd\.ne\.jp/.test(item.url ?? "")

    const category = fromBidPortal
      ? "入札・公募"
      : itemHasCategory
        ? Array.isArray(item.category)
          ? item.category[0]
          : item.category
        : urlCategory.get(item.url)

    if (!category) {
      unknown.push(item.title)
      continue
    }

    // 元ページから締切と概要を補う。入札情報公開サービスはセッションが要り
    // 直リンクできないので取りに行かない
    const page = fromBidPortal ? {} : await inspectPage(item.url)
    if (!fromBidPortal) await sleep(400)

    const body = {
      title: item.title,
      cityCode: item.cityCode,
      cityName: item.cityName,
      prefecture: item.prefecture || "岩手県",
      category: [category],
      status: ["募集中"],
      targets: TARGETS[category] ?? ["個人"],
      summary: (clean(item.rawSummary) || page.summary || item.title).slice(0, 200),
      body: (page.text ? clean(page.text) : clean(item.rawSummary)).slice(0, 2000),
      sourceUrl: item.url,
      ...(page.deadline ? { deadline: `${page.deadline}T00:00:00.000Z` } : {}),
      ...(hasPublishedDate && item.publishedDate ? { publishedDate: item.publishedDate } : {}),
    }

    if (dryRun) {
      promoted++
      continue
    }

    try {
      await createContent("articles", body)
      promoted++
      existing.add(item.url)

      // 昇格したら収集箱からは消す
      const del = await fetch(`${endpoint(ITEMS)}/${item.id}`, { method: "DELETE", headers: headers() })
      if (!del.ok) console.warn(`[promote] 収集箱から削除できず ${item.id} (HTTP ${del.status})`)
    } catch (e) {
      failed++
      console.warn(`[promote] 登録失敗: ${e.message}`)
    }
    await sleep(200)
  }

  return {
    promoted,
    skipped,
    failed,
    unknownCategory: unknown.length,
    unknownTitles: unknown.slice(0, 5),
    publishedDateSupported: hasPublishedDate,
    categoryOnItems: itemHasCategory,
  }
}
