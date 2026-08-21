/**
 * efftis 系（電子入札コアシステム）の入札公告情報を取得する。
 *
 *   node efftis.mjs           全県
 *   node efftis.mjs 04        県コード指定
 *
 * 画面はフレーム構成で、操作はすべて main フレームの JavaScript 関数を呼ぶ。
 *   onBidNoticeSearch('00')        建設工事の入札公告情報へ
 *   onInvitationNoticeSearch('01') 建設関連の入札・参加募集公告情報へ
 *   onSearchCount('ReceiptingEntry') 申請受付中だけに絞る
 *   onNext()                       次ページ
 *
 * 全期間だと数千件になるが、事業者が使えるのは申請受付中の案件だけなので
 * ReceiptingEntry で絞って取る。件数が数十件に収まりページ送りも数回で済む。
 */

import { writeFileSync, mkdirSync } from "node:fs"
import { chromium } from "playwright"

const SITES = [
  {
    code: "04",
    name: "宮城県",
    url: "https://miyagi.efftis.jp/04000/PPI/Public/Server/",
    kinds: [
      { label: "建設工事", open: "onBidNoticeSearch('00')" },
      { label: "建設関連", open: "onInvitationNoticeSearch('01')" },
    ],
  },
]

const only = process.argv[2]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** main フレームは検索のたびに差し替わるので、毎回取り直す */
const mainFrame = (page) => page.frames().find((f) => f.name() === "main")

async function waitMain(page, timeout = 25000) {
  const until = Date.now() + timeout
  while (Date.now() < until) {
    const f = mainFrame(page)
    if (f) {
      const ok = await f
        .evaluate(() => document.readyState === "complete" && document.body.innerHTML.length > 500)
        .catch(() => false)
      if (ok) return f
    }
    await sleep(400)
  }
  throw new Error("main フレームが出ない")
}

/** 見出し行を頼りに明細を拾う。列の並びが県ごとに違っても崩れないようにする */
function readPage() {
  const norm = (s) => s.replace(/\s+/g, " ").trim()
  const tables = [...document.querySelectorAll("table")]
  let head = null
  let rows = []

  for (const t of tables) {
    const trs = [...t.rows]
    const hi = trs.findIndex((r) => {
      const cells = [...r.cells].map((c) => norm(c.innerText))
      return cells.length >= 5 && cells.some((c) => /調達案件名称|案件名称/.test(c))
    })
    if (hi < 0) continue
    head = [...trs[hi].cells].map((c) => norm(c.innerText))
    rows = trs
      .slice(hi + 1)
      .map((r) => [...r.cells].map((c) => norm(c.innerText)))
      .filter((r) => r.length === head.length && /^\d+$/.test(r[0]))
    break
  }

  const m = document.body.innerText.match(/表示案件\s*(\d+)\s*-\s*(\d+)\s*該当案件数\s*(\d+)/)
  return {
    head,
    rows,
    from: m ? Number(m[1]) : 0,
    to: m ? Number(m[2]) : 0,
    total: m ? Number(m[3]) : 0,
    ids: [...document.querySelectorAll("a")]
      .map((a) => (a.getAttribute("onclick") || "").match(/onDetail\(\s*'([^']+)'/)?.[1])
      .filter(Boolean),
  }
}

/** 見出し名から値を引く */
function pick(head, row, ...names) {
  for (const n of names) {
    const i = head.findIndex((h) => h.replace(/\s/g, "").includes(n))
    if (i >= 0 && row[i]) return row[i]
  }
  return ""
}

async function scrapeKind(page, site, kind) {
  await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 40000 })
  await sleep(2500)

  let main = await waitMain(page)
  await main.evaluate((code) => eval(code), kind.open)
  await sleep(3500)

  main = await waitMain(page)
  const hasFilter = await main
    .evaluate(() => typeof onSearchCount === "function" && /申請受付中/.test(document.body.innerText))
    .catch(() => false)

  // 申請受付中だけに絞る。無ければ条件なしで全件検索する
  await main.evaluate((f) => (f ? onSearchCount("ReceiptingEntry") : onSearch()), hasFilter)
  await sleep(4000)

  const out = []
  const seen = new Set()
  for (let guard = 0; guard < 60; guard++) {
    main = await waitMain(page)
    const p = await main.evaluate(readPage)
    if (!p.head || p.rows.length === 0) break

    p.rows.forEach((row, i) => {
      const no = row[0]
      if (seen.has(`${p.from}/${no}`)) return
      seen.add(`${p.from}/${no}`)
      out.push({
        kind: kind.label,
        caseNo: pick(p.head, row, "調達案件番号", "案件番号"),
        title: pick(p.head, row, "調達案件名称", "案件名称"),
        dept: pick(p.head, row, "工事担当", "担当", "発注機関"),
        bidType: pick(p.head, row, "入札方式"),
        workType: pick(p.head, row, "工種", "業務種別"),
        noticeDate: pick(p.head, row, "公告日"),
        applyDeadline: pick(p.head, row, "申請締切日", "申請締切"),
        openDate: pick(p.head, row, "開札予定日", "開札"),
        projectId: p.ids[i] ?? "",
      })
    })

    if (p.to >= p.total || p.to === 0) break
    await main.evaluate(() => onNext())
    await sleep(3000)
  }
  return out
}

const browser = await chromium.launch(
  process.env.USE_SYSTEM_CHROME === "1" ? { channel: "chrome" } : {}
)
const all = []
const summary = []

for (const site of SITES) {
  if (only && site.code !== only) continue
  for (const kind of site.kinds) {
    const page = await browser.newPage({ userAgent: "LocalPress-collector/0.1" })
    try {
      const rows = await scrapeKind(page, site, kind)
      for (const r of rows) all.push({ prefCode: site.code, prefName: site.name, ...r })
      summary.push({ code: site.code, name: site.name, kind: kind.label, rows: rows.length })
      console.log(`  ${site.name} ${kind.label.padEnd(4, "　")} ${String(rows.length).padStart(4)} 件`)
    } catch (e) {
      summary.push({ code: site.code, name: site.name, kind: kind.label, error: e.message })
      console.log(`  ${site.name} ${kind.label} 失敗: ${e.message}`)
    }
    await page.close()
    await sleep(2000)
  }
}

await browser.close()
mkdirSync(new URL("./output/", import.meta.url), { recursive: true })
writeFileSync(
  new URL(`./output/efftis-${new Date().toISOString().slice(0, 10)}.json`, import.meta.url),
  JSON.stringify({ collectedAt: new Date().toISOString(), summary, items: all }, null, 2) + "\n"
)
console.log(`\n合計 ${all.length} 件`)
