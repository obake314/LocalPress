/**
 * 元ページを1回だけ取得して、受付が終わっているかを判定する。
 *
 * RSSのタイトルには「申込みは終了しました」が現れないため、
 * 締切済みかどうかは本文を見ないと分からない。
 * あわせて概要文も拾う（岩手県のフィードは description を持たないため）。
 */

import { decodeBody } from "./feed.mjs"

const UA = "LocalPress-collector/0.1 (+monthly collection)"

/** 受付が終わっていることを示す言い回し */
const CLOSED = [
  /申[しこ]?込み?は?終了しました/,
  /受付は?終了しました/,
  /受付を終了しました/,
  /募集は?終了しました/,
  /応募は?終了しました/,
  /締め?切りました/,
  /受付終了/,
  /募集終了/,
  /申込受付は?終了/,
]

/** HTML から本文らしいテキストを取り出す */
function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

/** meta description があれば概要として使う */
function metaDescription(html) {
  const m =
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i.exec(html) ||
    /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i.exec(html)
  return m ? m[1].trim() : ""
}

/**
 * @param {string} url
 * @returns {Promise<{ ok: boolean, closed: boolean, matched?: string, summary?: string, error?: string }>}
 */
export async function inspectPage(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: ctrl.signal,
    })
    if (!res.ok) return { ok: false, closed: false, error: `HTTP ${res.status}` }

    const buf = Buffer.from(await res.arrayBuffer())
    const html = decodeBody(buf, res.headers.get("content-type") || "")
    const text = toText(html)

    for (const pattern of CLOSED) {
      const m = pattern.exec(text)
      if (m) return { ok: true, closed: true, matched: m[0] }
    }

    return { ok: true, closed: false, summary: (metaDescription(html) || text.slice(0, 200)).slice(0, 300) }
  } catch (e) {
    return { ok: false, closed: false, error: e.cause?.code || e.name }
  } finally {
    clearTimeout(timer)
  }
}
