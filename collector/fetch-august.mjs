/**
 * 指定した月のお知らせをRSSから全件取得する。
 *
 *   node collector/fetch-august.mjs [YYYY-MM]
 *
 * collector/sources.json のうち method が "rss" のものだけを対象にする。
 * HTML解析が必要な26自治体はここでは扱わない（別途スクレイパが要る）。
 */

import { readFileSync, writeFileSync } from "node:fs"

const MONTH = process.argv[2] || "2026-08"
const SOURCES = JSON.parse(readFileSync(new URL("./sources.json", import.meta.url), "utf8"))
const UA = "LocalPress-collector/0.1 (+monthly collection test)"
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function decode(buf, contentType) {
  const head = buf.subarray(0, 2000).toString("latin1")
  const m =
    /charset=["']?([\w-]+)/i.exec(contentType) ||
    /encoding=["']([\w-]+)/i.exec(head) ||
    /charset=["']?([\w-]+)/i.exec(head)
  let enc = (m?.[1] || "utf-8").toLowerCase()
  if (["sjis", "x-sjis"].includes(enc)) enc = "shift_jis"
  try {
    return new TextDecoder(enc).decode(buf)
  } catch {
    return buf.toString("utf8")
  }
}

const unescapeXml = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()

const pick = (block, tag) => {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block)
  return m ? unescapeXml(m[1]) : ""
}

/** Atom の link は href 属性に入る */
const pickLink = (block) => {
  const plain = pick(block, "link")
  if (plain) return plain
  const m = /<link[^>]*href=["']([^"']+)["']/i.exec(block)
  return m ? m[1] : ""
}

/** 日付を JST の YYYY-MM-DD に落とす */
const toJstDate = (raw) => {
  if (!raw) return null
  const t = Date.parse(raw)
  if (Number.isNaN(t)) return null
  return new Date(t + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

async function fetchFeed(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: ctrl.signal })
    if (!res.ok) return { error: `HTTP ${res.status}` }
    const buf = Buffer.from(await res.arrayBuffer())
    return { text: decode(buf, res.headers.get("content-type") || "") }
  } catch (e) {
    return { error: e.cause?.code || e.name }
  } finally {
    clearTimeout(timer)
  }
}

function parseItems(xml) {
  const blocks = xml.match(/<(?:item|entry)[\s>][\s\S]*?<\/(?:item|entry)>/gi) || []
  return blocks.map((b) => ({
    title: pick(b, "title"),
    url: pickLink(b),
    date:
      toJstDate(pick(b, "pubDate")) ??
      toJstDate(pick(b, "dc:date")) ??
      toJstDate(pick(b, "updated")) ??
      toJstDate(pick(b, "published")),
    summary: pick(b, "description") || pick(b, "summary"),
  }))
}

const rssSources = SOURCES.sources.filter((s) => s.method === "rss")
const all = []
const report = []

for (const src of rssSources) {
  const r = await fetchFeed(src.feed)
  if (r.error) {
    report.push({ ...src, fetched: 0, inMonth: 0, note: r.error })
    console.log(`-- ${src.name.padEnd(6, "　")} 取得失敗 (${r.error})`)
    await sleep(800)
    continue
  }

  const items = parseItems(r.text)
  const inMonth = items.filter((i) => i.date?.startsWith(MONTH))
  const dated = items.filter((i) => i.date)
  const oldest = dated.length ? dated.map((i) => i.date).sort()[0] : "-"

  for (const i of inMonth) {
    all.push({ code: src.code, cityName: src.name, ...i })
  }

  // フィードが月初まで遡れているか（＝全件取れたと言えるか）を判定する
  const covers = oldest !== "-" && oldest < `${MONTH}-01`
  report.push({
    code: src.code,
    name: src.name,
    fetched: items.length,
    inMonth: inMonth.length,
    oldest,
    covers,
  })
  console.log(
    `${covers ? "OK" : "△ "} ${src.name.padEnd(6, "　")} ` +
      `フィード${String(items.length).padStart(3)}件 → ${MONTH} は ${String(inMonth.length).padStart(3)}件 ` +
      `(最古 ${oldest})${covers ? "" : "  ※フィードが月初まで届かず、取りこぼしの可能性"}`
  )
  await sleep(800)
}

all.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.cityName.localeCompare(b.cityName))

writeFileSync(
  new URL(`./output/${MONTH}.json`, import.meta.url),
  JSON.stringify({ month: MONTH, collectedAt: new Date().toISOString(), report, items: all }, null, 2) + "\n"
)

console.log(`\n=== ${MONTH} の取得結果 ===`)
console.log(`  対象: RSSがある ${rssSources.length} 件（HTML解析が必要な ${SOURCES.summary.html} 自治体は未対応）`)
console.log(`  取得: ${all.length} 件`)
console.log(`  → collector/output/${MONTH}.json`)
const partial = report.filter((r) => r.covers === false)
if (partial.length) {
  console.log(`\n  フィードが月初まで遡れていないため「全件」と言い切れない: ${partial.map((r) => r.name).join(", ")}`)
}
