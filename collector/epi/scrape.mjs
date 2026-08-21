/**
 * 入札情報公開サービス（電子入札コアシステム）から発注情報を取得する。
 *
 *   node collector/epi/scrape.mjs            全機関
 *   node collector/epi/scrape.mjs 03201      指定した自治体だけ
 *
 * このシステムはフレーム構成・POST遷移・セッションIDのURL埋め込みで、
 * HTTPリクエストだけでは辿れない。実ブラウザで操作する必要がある。
 * Render の無料プランには Chromium が載らないため、GitHub Actions で動かす。
 *
 * 取得できるのは RSS には出ない項目：入札方式・工種・開札日・課所名。
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { chromium } from "playwright"

const ORGS = JSON.parse(readFileSync(new URL("./orgs.json", import.meta.url), "utf8"))
const only = process.argv[2]

/**
 * 業務区分。メニュー構造は同じだが、検索フォームと結果のフレーム名が
 * 区分ごとに違う（工事=KK301/KFK301、コンサル=KK301/KFC301、物品=KB301/KFB301）。
 */
const SUPPLY_TYPES = [
  { label: "工事", category: "工事", form: "KK301", result: "KFK301" },
  { label: "コンサル", category: "コンサル", form: "KK301", result: "KFC301" },
  { label: "物品・役務", category: "物品・役務", form: "KB301", result: "KFB301" },
]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** 和暦を含まない YYYY/MM/DD を YYYY-MM-DD にする */
const toIso = (s) => {
  const m = /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/.exec(s ?? "")
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : null
}

const frame = (page, part) => page.frames().find((f) => f.url().includes(part))

/** 1機関の1業務区分ぶんの発注情報を取る */
async function scrapeOrg(page, org, supply) {
  await page.goto(`${ORGS.base}?name1=${org.name1}`, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(1200)

  // 業務区分 → 発注情報の検索
  await page.click(`span.ATYPE:has-text("${supply.label}")`)
  await page.waitForTimeout(2200)

  const menu = frame(page, "koukai_main")
  if (!menu) throw new Error("メニューのフレームが見つかりません")
  await menu.click("text=発注情報の検索")
  await page.waitForTimeout(2500)

  const form = frame(page, supply.form)
  if (!form) throw new Error("検索フォームのフレームが見つかりません")

  // 今年度・100件表示にして検索
  const year = `${new Date().getFullYear()}年度`
  await form.selectOption("select[name=nendo]", { label: year }).catch(() => {})
  // A300 は表示件数（010=10件 … 040=100件）
  await form.selectOption("select[name=A300]", "040").catch(() => {})
  await form.click('input[value="検索"]')
  await page.waitForTimeout(4000)

  const result = frame(page, supply.result)
  if (!result) return []

  return result.evaluate(() =>
    [...document.querySelectorAll("table tr")]
      .map((tr) => {
        const cells = [...tr.cells].map((c) => c.innerText.replace(/\s+/g, " ").trim())
        const link = tr.querySelector("a")
        const id = /doEdit\('([^']+)'\)/.exec(link?.getAttribute("href") ?? "")?.[1] ?? null
        return { cells, id }
      })
      .filter((r) => r.cells.length >= 6 && /^\d{4}\//.test(r.cells[0]))
  )
}

// ローカルでは端末の Chrome を使う。GitHub Actions では playwright の Chromium
const browser = await chromium.launch(
  process.env.USE_SYSTEM_CHROME === "1" ? { channel: "chrome" } : {},
)
const page = await browser.newPage({ userAgent: "LocalPress-collector/0.1" })
const all = []

for (const org of ORGS.orgs) {
  if (only && org.cityCode !== only) continue

  for (const supply of SUPPLY_TYPES) {
    try {
      const rows = await scrapeOrg(page, org, supply)
      for (const { cells, id } of rows) {
        all.push({
          cityCode: org.cityCode,
          cityName: org.name,
          supplyType: supply.category,
          publishedDate: toIso(cells[0]),
          title: cells[1],
          contractNo: cells[2],
          method: cells[3],
          // 工事は「工種」、コンサル・物品役務は業務種別。列の意味は同じ
          workType: cells[4],
          note: cells[5],
          openingDate: toIso(cells[6]),
          section: cells[7] ?? "",
          detailId: id,
        })
      }
      console.log(`  ${org.name.padEnd(8, "　")} ${supply.category.padEnd(7, "　")} ${rows.length} 件`)
    } catch (e) {
      console.log(`  ${org.name.padEnd(8, "　")} ${supply.category.padEnd(7, "　")} 取得失敗: ${e.message}`)
    }
    await sleep(2000) // 相手のサーバーに負荷をかけない
  }
}

await browser.close()

mkdirSync(new URL("./output/", import.meta.url), { recursive: true })
const out = new URL(`./output/${new Date().toISOString().slice(0, 10)}.json`, import.meta.url)
writeFileSync(out, JSON.stringify({ collectedAt: new Date().toISOString(), items: all }, null, 2) + "\n")
console.log(`\n合計 ${all.length} 件 → collector/epi/output/`)
