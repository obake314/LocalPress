/**
 * 収集本体。
 *
 *   1. microCMS の feeds API から収集元を読む（未作成なら同梱の sources.fallback.json）
 *   2. RSS を取得して記事を抽出
 *   3. 既に収集箱にあるURLを除いて、新着だけを登録する
 *
 * Render の無料プランはファイルシステムが揮発するため、重複判定は
 * ローカルに持たず必ず microCMS 側の既存データと突き合わせる。
 */

import { readFileSync } from "node:fs"
import { decodeBody, parseFeed } from "./feed.mjs"
import { getAll, createMany } from "./microcms.mjs"
import { maxAgeDays } from "./config.mjs"
import { classifyItem } from "./filter.mjs"

/** 収集箱のエンドポイント名。microCMS 側の実体は小文字の feeditems */
const ITEMS_ENDPOINT = process.env.MICROCMS_ITEMS_ENDPOINT?.trim() || "feeditems"

const UA = "LocalPress-collector/0.1 (+https://github.com/localpress)"
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** 収集元の一覧。microCMS を正とし、無ければ同梱のJSONで動く */
export async function loadSources() {
  const feeds = await getAll("feeds")

  if (feeds) {
    return {
      origin: "microCMS",
      sources: feeds
        .filter((f) => f.enabled !== false)
        .map((f) => ({
          code: String(f.cityCode ?? "").padStart(5, "0"),
          name: f.cityName ?? "",
          method: (Array.isArray(f.method) ? f.method[0] : f.method || "").toLowerCase(),
          feed: f.feedUrl || null,
        }))
        .filter((f) => f.method === "rss" && f.feed),
    }
  }

  const fallback = JSON.parse(
    readFileSync(new URL("./sources.fallback.json", import.meta.url), "utf8")
  )
  return {
    origin: "sources.fallback.json",
    sources: fallback.sources.filter((s) => s.method === "rss" && s.feed),
  }
}

async function fetchFeed(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: ctrl.signal,
    })
    if (!res.ok) return { error: `HTTP ${res.status}` }
    const buf = Buffer.from(await res.arrayBuffer())
    return { items: parseFeed(decodeBody(buf, res.headers.get("content-type") || "")) }
  } catch (e) {
    return { error: e.cause?.code || e.name }
  } finally {
    clearTimeout(timer)
  }
}

export async function runCollection({ dryRun = false } = {}) {
  const startedAt = new Date().toISOString()
  const { origin, sources } = await loadSources()

  // 既存URLを集めて重複登録を防ぐ
  const existing = await getAll(ITEMS_ENDPOINT, { fields: "url" })
  if (existing === null && !dryRun) {
    return {
      ok: false,
      error: `${ITEMS_ENDPOINT} API が見つかりません。microCMS で作成し、APIキーに GET/POST を許可してください。`,
      startedAt,
    }
  }
  const known = new Set((existing ?? []).map((c) => c.url).filter(Boolean))

  const perSource = []
  const fresh = []

  const days = maxAgeDays()
  const oldestAllowed = days > 0 ? new Date(Date.now() - days * 86400000).toISOString().slice(0, 10) : null
  let skippedOld = 0

  /** 案件として価値の無いものを落とした内訳 */
  const skippedByReason = {}

  for (const src of sources) {
    const r = await fetchFeed(src.feed)

    if (r.error) {
      perSource.push({ code: src.code, name: src.name, error: r.error })
      await sleep(600)
      continue
    }

    const inRange = r.items.filter((i) => {
      if (!oldestAllowed) return true
      if (!i.date) return true // 日付が取れないものは残して人が判断する
      if (i.date >= oldestAllowed) return true
      skippedOld++
      return false
    })

    // 統計の定期公表・記者会見・警告・開催報告・レシピは案件ではないので登録しない
    const worthKeeping = inRange.filter((i) => {
      const c = classifyItem(i)
      if (!c.excluded) return true
      skippedByReason[c.reason] = (skippedByReason[c.reason] ?? 0) + 1
      return false
    })

    const news = worthKeeping.filter((i) => !known.has(i.url))
    for (const i of news) {
      known.add(i.url) // 同一実行内の重複も防ぐ
      fresh.push({
        cityCode: src.code,
        cityName: src.name,
        title: i.title.slice(0, 200),
        url: i.url,
        publishedDate: i.date ? `${i.date}T00:00:00.000Z` : null,
        rawSummary: i.summary?.slice(0, 1000) ?? "",
        state: ["未処理"],
      })
    }

    perSource.push({
      code: src.code,
      name: src.name,
      fetched: r.items.length,
      skippedOld: r.items.length - inRange.length,
      skippedNoise: inRange.length - worthKeeping.length,
      new: news.length,
    })
    await sleep(600)
  }

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      origin,
      startedAt,
      maxAgeDays: days,
      skippedOld,
      skippedByReason,
      sources: perSource,
      newCount: fresh.length,
    }
  }

  const { created, failed } = await createMany(ITEMS_ENDPOINT, fresh)

  return {
    ok: true,
    origin,
    startedAt,
    finishedAt: new Date().toISOString(),
    maxAgeDays: days,
    skippedOld,
    skippedByReason,
    sources: perSource,
    registered: created.length,
    failed: failed.length,
    failures: failed.slice(0, 5).map((f) => f.error),
  }
}
