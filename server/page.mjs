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
  /申[しこ]?込み?は終了しました/,
  /受付は終了しました/,
  /受付を終了しました/,
  /募集は終了しました/,
  /応募は終了しました/,
  /申込受付は終了しました/,
  /締め切りました/,
  /締切ました/,
]

/**
 * HTML から本文らしいテキストを取り出す。
 *
 * リンクの中身は落とす。自治体サイトはサイドバーや関連リンクに
 * 「【終了しました】◯◯について」という他ページの見出しを並べるため、
 * それを本文の状態と取り違えると受付中の案件まで終了と誤判定する。
 */
function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<a\b[\s\S]*?<\/a>/gi, " ")
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

/** 和暦・西暦の日付を YYYY-MM-DD に直す */
function toIsoDate(era, y, m, d) {
  const year = era === "令和" ? 2018 + Number(y) : Number(y)
  const mm = String(Number(m)).padStart(2, "0")
  const dd = String(Number(d)).padStart(2, "0")
  return `${year}-${mm}-${dd}`
}

/**
 * 締切らしき日付を本文から拾う。
 * 「提出期限」「申込締切」などの語の直後に現れる日付だけを見る。
 * 開催日や公開日を締切と取り違えないよう、語からの距離を制限する。
 */
export function extractDeadline(text) {
  const label = /(提出期限|申[しこ]?込み?期限|申[しこ]?込み?締[め]?切|応募期限|応募締[め]?切|募集期限|受付期限|締[め]?切日|期限)/g
  let m
  while ((m = label.exec(text)) !== null) {
    const window = text.slice(m.index, m.index + 60)
    const wareki = /令和(\d{1,2})年\s*(\d{1,2})月\s*(\d{1,2})日/.exec(window)
    if (wareki) return toIsoDate("令和", wareki[1], wareki[2], wareki[3])
    const seireki = /(20\d{2})[年./-]\s*(\d{1,2})[月./-]\s*(\d{1,2})/.exec(window)
    if (seireki) return toIsoDate("西暦", seireki[1], seireki[2], seireki[3])
  }
  return null
}

/**
 * @param {string} url
 * @returns {Promise<{ ok: boolean, closed: boolean, matched?: string, summary?: string, deadline?: string|null, error?: string }>}
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

    return {
      ok: true,
      closed: false,
      summary: (metaDescription(html) || text.slice(0, 200)).slice(0, 300),
      deadline: extractDeadline(text),
      text: text.slice(0, 4000),
    }
  } catch (e) {
    return { ok: false, closed: false, error: e.cause?.code || e.name }
  } finally {
    clearTimeout(timer)
  }
}
