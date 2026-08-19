/**
 * collector/sources.json に並んだサイトの更新情報フィードが実在するかを確認する。
 *
 *   node collector/check-feeds.mjs
 * 各サイトへのアクセスは「フィード候補1回＋トップページ1回」までに抑え、
 * 逐次実行して間隔を空ける（自治体サイトへの負荷を避けるため）。
 */

import { readFileSync, writeFileSync } from "node:fs"

const SOURCES = new URL("./sources.json", import.meta.url)
const doc = JSON.parse(readFileSync(SOURCES, "utf8"))
const SITES = doc.sources.map((s) => [s.code, s.name, s.site])

const UA = "localpress-feed-check/0.1 (feasibility check; one request per site)"
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/html;q=0.8" },
      redirect: "follow",
      signal: ctrl.signal,
    })
    const buf = Buffer.from(await res.arrayBuffer())
    return { ok: res.ok, status: res.status, url: res.url, type: res.headers.get("content-type") || "", buf }
  } catch (e) {
    return { error: e.cause?.code || e.name || e.message }
  } finally {
    clearTimeout(timer)
  }
}

/** 文字コードを見て文字列化（自治体サイトは Shift_JIS / EUC-JP も残っている） */
function decode(buf, type) {
  const head = buf.subarray(0, 2000).toString("latin1")
  const m = /charset=["']?([\w-]+)/i.exec(type) || /charset=["']?([\w-]+)/i.exec(head) || /encoding=["']([\w-]+)/i.exec(head)
  let enc = (m?.[1] || "utf-8").toLowerCase()
  if (enc === "shift_jis" || enc === "sjis" || enc === "x-sjis") enc = "shift_jis"
  try {
    return new TextDecoder(enc).decode(buf)
  } catch {
    return buf.toString("utf8")
  }
}

function analyzeFeed(text) {
  const isRss = /<rss[\s>]/i.test(text) || /<rdf:RDF/i.test(text)
  const isAtom = /<feed[\s>][^>]*xmlns=["']http:\/\/www\.w3\.org\/2005\/Atom/i.test(text)
  if (!isRss && !isAtom) return null
  const items = (text.match(/<item[\s>]/gi) || []).length + (text.match(/<entry[\s>]/gi) || []).length
  const dates = [...text.matchAll(/<(?:pubDate|dc:date|updated|published)>([^<]+)</gi)].map((m) => m[1].trim())
  const parsed = dates.map((d) => Date.parse(d)).filter((n) => !Number.isNaN(n))
  const latest = parsed.length ? new Date(Math.max(...parsed)).toISOString().slice(0, 10) : "-"
  return { kind: isAtom ? "Atom" : "RSS", items, latest }
}

/** HTML の <link rel="alternate" type="application/rss+xml" href="..."> を拾う */
function autodiscover(html, base) {
  const links = [...html.matchAll(/<link[^>]+>/gi)].map((m) => m[0])
  const found = []
  for (const tag of links) {
    if (!/rel=["']?alternate/i.test(tag)) continue
    if (!/type=["']?application\/(rss|atom)\+xml/i.test(tag)) continue
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1]
    if (href) found.push(new URL(href, base).href)
  }
  return [...new Set(found)]
}

const results = []

for (const [code, name, base] of SITES) {
  const row = { code, name, base, feed: null, kind: null, items: null, latest: null, note: "" }

  // 1) /news.rss を試す
  const candidate = new URL("news.rss", base).href
  let r = await get(candidate)
  let info = r.buf ? analyzeFeed(decode(r.buf, r.type)) : null

  if (r.ok && info) {
    Object.assign(row, { feed: r.url, ...info })
  } else {
    // 2) トップページから autodiscovery
    await sleep(400)
    const top = await get(base)
    if (top.error) {
      row.note = `接続不可 (${top.error})`
    } else if (!top.ok) {
      row.note = `トップ HTTP ${top.status}`
    } else {
      const html = decode(top.buf, top.type)
      const feeds = autodiscover(html, top.url)
      if (feeds.length === 0) {
        row.note = r.error ? `RSSなし / news.rss:${r.error}` : `RSSなし (news.rss: HTTP ${r.status})`
      } else {
        await sleep(400)
        const f = await get(feeds[0])
        const fi = f.buf ? analyzeFeed(decode(f.buf, f.type)) : null
        if (f.ok && fi) {
          Object.assign(row, { feed: f.url, ...fi, note: "autodiscovery" })
        } else {
          row.note = `autodiscovery先が取得不可: ${feeds[0]}`
        }
      }
    }
  }

  results.push(row)
  const mark = row.feed ? "OK " : "-- "
  console.log(
    `${mark}${name.padEnd(6, "　")} ${row.feed ? `${row.kind} ${String(row.items).padStart(3)}件 最新${row.latest}  ${row.feed}` : row.note}`
  )
  await sleep(500)
}

const ok = results.filter((r) => r.feed)
console.log(`\n=== ${ok.length}/${results.length} 件でフィードを確認 ===`)
writeFileSync(
  new URL("./last-check.json", import.meta.url),
  JSON.stringify({ checkedAt: new Date().toISOString().slice(0, 10), results }, null, 2) + "\n"
)
console.log("  → collector/last-check.json に保存しました")
