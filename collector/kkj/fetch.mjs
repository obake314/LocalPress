/**
 * 官公需情報ポータルサイトから発注情報を取る。
 *
 *   node fetch.mjs                 既定の県ぶん
 *   node fetch.mjs 03 04 15        県コードを指定
 *   node fetch.mjs --all           47都道府県
 *   DAYS=90 node fetch.mjs         公告日の遡り日数（既定 60）
 *
 * ブラウザが要らないので Render でも GitHub Actions でも動く。
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { collect, KEYWORDS } from "./kkj.mjs"

const PREFS = JSON.parse(readFileSync(new URL("./prefectures.json", import.meta.url), "utf8"))
  .prefectures

/** 既定は掲載中の県だけ。全国に広げるときは --all か県コードを渡す */
const DEFAULT_CODES = ["03", "04", "15"]

const args = process.argv.slice(2)
const codes = args.includes("--all")
  ? PREFS.map((p) => p.code)
  : args.filter((a) => /^\d{2}$/.test(a)).length
    ? args.filter((a) => /^\d{2}$/.test(a))
    : DEFAULT_CODES

const days = Number(process.env.DAYS ?? 60)
const from = new Date(Date.now() + 9 * 3600 * 1000 - days * 86400000).toISOString().slice(0, 10)
const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)

console.log(`公告日 ${from} 以降 / ${codes.length} 県 / 検索語 ${KEYWORDS.join("・")}`)

const all = []
const summary = []

for (const code of codes) {
  const pref = PREFS.find((p) => p.code === code)
  try {
    const items = await collect({ lgCode: code, from })

    // 公告本文は1件あたり数千字あり、全国ぶんを抱えたままだとメモリが尽きる。
    // 締切はこの時点で読み終えているので、本文は落として長さだけ残す
    for (const it of items) {
      const { description, ...rest } = it
      all.push({ ...rest, descriptionLength: (description ?? "").length })
    }

    const open = items.filter((i) => i.deadline && i.deadline >= today).length
    const noDeadline = items.filter((i) => !i.deadline).length
    summary.push({ code, name: pref?.name, items: items.length, open, noDeadline })
    console.log(
      `  ${(pref?.name ?? code).padEnd(5, "　")} ${String(items.length).padStart(4)} 件` +
        `（締切前 ${String(open).padStart(3)} / 締切不明 ${String(noDeadline).padStart(3)}）`
    )
  } catch (e) {
    summary.push({ code, name: pref?.name, error: e.message })
    console.log(`  ${(pref?.name ?? code).padEnd(5, "　")} 失敗: ${e.message}`)
  }
}

mkdirSync(new URL("./output/", import.meta.url), { recursive: true })
writeFileSync(
  new URL(`./output/kkj-${today}.json`, import.meta.url),
  JSON.stringify({ collectedAt: new Date().toISOString(), from, summary, items: all }, null, 2) + "\n"
)

const open = all.filter((i) => i.deadline && i.deadline >= today).length
console.log(`\n合計 ${all.length} 件 / うち締切前 ${open} 件 → output/kkj-${today}.json`)
