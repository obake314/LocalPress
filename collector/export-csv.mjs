/**
 * collector/sources.json を管理用CSVに書き出す。
 *
 *   node collector/export-csv.mjs
 *
 * 直近の月次取得結果（collector/output/*.json）があれば、取得件数も突き合わせる。
 * Excel で開けるよう UTF-8 BOM 付きで出力する。
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs"

const dir = new URL("./", import.meta.url)
const sources = JSON.parse(readFileSync(new URL("./sources.json", dir), "utf8"))

// 直近の取得結果を読む（あれば）
let latest = null
const outDir = new URL("./output/", dir)
if (existsSync(outDir)) {
  const files = readdirSync(outDir).filter((f) => f.endsWith(".json")).sort()
  if (files.length) {
    latest = JSON.parse(readFileSync(new URL(files.at(-1), outDir), "utf8"))
  }
}
const byCode = new Map((latest?.report ?? []).map((r) => [r.code, r]))

const kubun = (name) =>
  name.endsWith("県") ? "県" : name.endsWith("市") ? "市" : name.endsWith("町") ? "町" : "村"

const method = { rss: "RSS", html: "HTML解析が必要", unreachable: "取得不可" }

const headers = [
  "団体コード",
  "自治体名",
  "区分",
  "公式サイトURL",
  "取得方法",
  "フィードURL",
  "フィード形式",
  "フィード掲載件数",
  "フィード最新日",
  `${latest?.month ?? "-"}取得件数`,
  "月初まで遡れるか",
  "備考",
  "確認日",
]

const esc = (v) => {
  const s = v === null || v === undefined ? "" : String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const rows = sources.sources.map((s) => {
  const r = byCode.get(s.code)
  return [
    s.code,
    s.name,
    kubun(s.name),
    s.site,
    method[s.method] ?? s.method,
    s.feed ?? "",
    s.feedFormat ?? "",
    s.itemsAtCheck ?? "",
    s.latestAtCheck ?? "",
    r ? r.inMonth : "",
    r ? (r.covers === true ? "はい" : r.covers === false ? "いいえ（取りこぼしの可能性）" : "") : "",
    s.note ?? "",
    sources.checkedAt,
  ].map(esc).join(",")
})

const csv = "﻿" + [headers.join(","), ...rows].join("\r\n") + "\r\n"
writeFileSync(new URL("./sources.csv", dir), csv)

console.log(`  ${rows.length} 行を書き出しました → collector/sources.csv`)
console.log(`  取得方法の内訳: RSS ${sources.summary.rss} / HTML ${sources.summary.html} / 取得不可 ${sources.summary.unreachable}`)
