/**
 * ebidPPIPublish 系の入札情報システムから発注情報を取得する。
 *
 *   node ebid.mjs           全県
 *   node ebid.mjs 15        県コード指定
 *
 * 新潟・福井・兵庫・愛媛・宮崎・鹿児島の6県が同じ画面構成。
 * いずれも共同利用で、発注機関の選択肢に県内市町村が並ぶ。
 * フレーム構成で、検索は cond フレームの document.frm.submit() で走る。
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { chromium } from "playwright"

const SITES = [
  { code: "15", name: "新潟県", url: "https://www.ep-bis.pref.niigata.jp/ebidPPIPublish/EjPPIj" },
  { code: "18", name: "福井県", url: "https://www2.ebid.pref.fukui.jp/ebidPPIPublish/EjPPIj" },
  { code: "28", name: "兵庫県", url: "https://www2.ppi.pref.hyogo.jp/ebidPPIPublish/EjPPIj" },
  { code: "38", name: "愛媛県", url: "https://www.ebid-ppi.pref.ehime.jp/ebidPPIPublish/index.html" },
  { code: "45", name: "宮崎県", url: "https://www.e-nyusatsu-joho.pref.miyazaki.lg.jp/ebidPPIPublish/EjPPIj" },
  { code: "46", name: "鹿児島県", url: "https://www.kagoshima-nyusatsu.jp/ebidPPIPublish/EjPPIj" },
]

const only = process.argv[2]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** フレームは遅れて現れるので、名前が出るまで待つ */
async function waitFrame(page, name, timeout = 20000) {
  const until = Date.now() + timeout
  while (Date.now() < until) {
    const f = page.frames().find((x) => x.name() === name)
    if (f) {
      // 中身が描かれるまで少し待つ
      const ready = await f.evaluate(() => document.readyState === "complete" && document.body.innerHTML.length > 200).catch(() => false)
      if (ready) return f
    }
    await sleep(500)
  }
  return null
}

/** 明細行を持つフレームを探す */
async function findResultFrame(page, timeout = 20000) {
  const until = Date.now() + timeout
  while (Date.now() < until) {
    for (const f of page.frames()) {
      const n = await f.evaluate(() =>
        [...document.querySelectorAll("table tr")].filter((tr) => tr.cells.length >= 5).length
      ).catch(() => 0)
      if (n > 2) return f
    }
    await sleep(700)
  }
  return null
}

/** 検索を1回実行して明細を取る。多すぎる場合は null を返す */
async function searchOnce(page, cond, agencyIndex) {
  await cond.selectOption("select[name=ejMaxDisplayRowCount]", { index: 10 }).catch(() => {})
  if (agencyIndex !== null) {
    await cond.selectOption("select[name=KikanNO]", { index: agencyIndex }).catch(() => {})
  }
  await sleep(400)
  await cond.evaluate(() => document.frm.submit())
  await sleep(3000)

  const list = await waitFrame(page, "list", 25000)
  if (!list) return []

  const tooMany = await list.evaluate(() => /多すぎます/.test(document.body.innerText)).catch(() => false)
  if (tooMany) return null

  return list.evaluate(() =>
    [...document.querySelectorAll("table tr")]
      .map((tr) => [...tr.cells].map((c) => c.innerText.replace(/\s+/g, " ").trim()))
      .filter((r) => r.length >= 5 && r.some((c) => /\d{4}[/.年]\d{1,2}|令和\d/.test(c)))
  )
}

async function scrapePref(page, site) {
  await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 40000 })
  await page.waitForTimeout(2500)

  const menu = await waitFrame(page, "menu_Frm")
  if (!menu) throw new Error("メニューのフレームが出ない")
  await menu.click("text=入札情報")

  const cond = await waitFrame(page, "cond")
  if (!cond) throw new Error("検索条件のフレームが出ない")

  // 発注機関の選択肢＝この県で共同利用している団体
  const agencies = await cond.evaluate(() =>
    [...(document.querySelector("select[name=KikanNO]")?.options ?? [])].map((o, i) => ({ i, name: o.text.trim() }))
  ).catch(() => [])

  // まず全機関まとめて。700件を超えると弾かれるので、その場合は機関ごとに分ける
  const whole = await searchOnce(page, cond, null)
  if (whole !== null) return { rows: whole, agencies, split: false }

  const rows = []
  for (const a of agencies) {
    if (!a.name) continue
    // 検索のたびに条件フレームを取り直す
    const c = await waitFrame(page, "cond", 15000)
    if (!c) break
    const r = await searchOnce(page, c, a.i)
    if (r) rows.push(...r.map((cells) => [...cells, a.name]))
    await sleep(1200)
  }
  return { rows, agencies, split: true }
}

const browser = await chromium.launch(process.env.USE_SYSTEM_CHROME === "1" ? { channel: "chrome" } : {})
const all = []
const summary = []

for (const site of SITES) {
  if (only && site.code !== only) continue
  const page = await browser.newPage({ userAgent: "LocalPress-collector/0.1" })
  try {
    const { rows, agencies, split } = await scrapePref(page, site)
    for (const cells of rows) all.push({ prefCode: site.code, prefName: site.name, cells })
    summary.push({ ...site, rows: rows.length, agencies: agencies.length, split })
    console.log(
      `  ${site.name.padEnd(5, "　")} ${String(rows.length).padStart(4)} 件  ` +
        `共同利用 ${String(agencies.filter((a) => a.name).length).padStart(2)} 団体${split ? "（機関ごとに分割取得）" : ""}`
    )
  } catch (e) {
    summary.push({ ...site, error: e.message })
    console.log(`  ${site.name.padEnd(5, "　")} 失敗: ${e.message}`)
  }
  await page.close()
  await sleep(2500)
}

await browser.close()
mkdirSync(new URL("./output/", import.meta.url), { recursive: true })
writeFileSync(
  new URL(`./output/ebid-${new Date().toISOString().slice(0, 10)}.json`, import.meta.url),
  JSON.stringify({ collectedAt: new Date().toISOString(), summary, items: all }, null, 2) + "\n"
)
console.log(`\n合計 ${all.length} 件 / ${summary.filter((s) => !s.error).length} 県`)
