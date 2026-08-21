/**
 * 官公需情報ポータルサイト（kkj.go.jp）の検索APIを叩く。
 *
 * 認証も登録も要らず、ブラウザも要らない素のHTTPで済む。
 * 国の機関から市町村まで同じ形で返るので、これを収集の主軸にする。
 *
 * 仕様のうち実地で確かめたもの:
 *   Query           必須。キーワード検索で、これ抜きでは「全件」が取れない
 *   LG_Code         都道府県コード2桁。正しく絞り込める
 *   CFT_Issue_Date  "2026-08-01/" の形の期間指定（公告日）
 *   Category        工事 / 役務 / 物品
 *   Count           上限1000。ページングは無いので期間で分割する
 */

import { request } from "node:https"
import { rootCertificates } from "node:tls"
import { readFileSync } from "node:fs"

const ENDPOINT = "https://www.kkj.go.jp/api/"

/**
 * kkj.go.jp の証明書は SECOM TLS RSA Root CA 2024 から降りているが、
 * このルートは Node が内蔵するルート一覧にまだ入っておらず、素の fetch は
 * UNABLE_TO_GET_ISSUER_CERT_LOCALLY で失敗する（curl やブラウザは
 * OS の信頼ストアを見るので通る）。実行環境に左右されないよう、
 * ルート証明書を同梱して内蔵ルートに足したうえで接続する。
 *
 *   取得元   http://repo2.secomtrust.net/root/tlsrsa/tlsrsarootca2024.cer
 *   SHA-256  14:35:F2:25:C5:D2:52:D7:A2:19:48:CC:3C:E6:2A:EC:FA:88:00:1E:3D:D7:2D:1C:C3:55:51:00:EB:37:2F:93
 *   有効期限 2049-01-14
 */
const CA = [
  ...rootCertificates,
  readFileSync(new URL("./secom-tls-rsa-root-ca-2024.pem", import.meta.url), "utf8"),
]

/** 証明書を差し替えたいので fetch ではなく node:https を使う */
function get(url, timeout = 90000) {
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      { ca: CA, headers: { "User-Agent": "LocalPress-collector/0.1" }, timeout },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume()
          reject(new Error(`kkj API が ${res.statusCode}`))
          return
        }
        const chunks = []
        res.on("data", (c) => chunks.push(c))
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
      }
    )
    req.on("timeout", () => req.destroy(new Error("kkj API が応答しない")))
    req.on("error", reject)
    req.end()
  })
}

/**
 * 検索語。単独では取りこぼすが、和集合を取ると頭打ちになる。
 * 岩手県の2か月ぶんで測ったところ、この6語で飽和し、
 * さらに14語を足しても1件も増えなかった。
 */
export const KEYWORDS = ["入札", "公告", "見積", "業務", "調達", "募集"]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** 全角の数字と記号を半角にそろえる。公告本文は全角と半角が混ざる */
const toHalf = (s) =>
  (s ?? "").replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))

const tag = (xml, name) => {
  const m = new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`).exec(xml)
  return m ? m[1].trim() : ""
}

/**
 * 和暦・西暦の混在した日付を YYYY-MM-DD にする。
 * 「令和８年９月25日」「令和8年9月25日」「2026年9月25日」「2026/9/25」を受ける。
 */
export function toIso(raw) {
  const s = toHalf(raw)
  let m = /令和\s*(\d{1,2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/.exec(s)
  if (m) return `${2018 + Number(m[1])}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`
  m = /(20\d{2})\s*[年/-]\s*(\d{1,2})\s*[月/-]\s*(\d{1,2})/.exec(s)
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`
  return null
}

/**
 * 公告本文から締切を読む。
 *
 * 本文には履行期間・質問受付・入札日など日付が何個も出るため、
 * 「参加できなくなる日」に当たるものだけを、具体的な見出しの順に探す。
 * 上の段が見つかればそこで打ち切る。同じ段に複数あるときは遅いほうを取る
 * （申込より提出のほうが後で、実際の期限はそちら）。
 */
const DEADLINE_LABELS = [
  /入札書[^。]{0,12}提出[^。]{0,8}期限/,
  /(?:企画提案書|提案書|見積書)[^。]{0,12}提出[^。]{0,8}期限/,
  /(?:参加申込書|参加申請書|参加表明書)[^。]{0,12}(?:提出)?[^。]{0,8}期限/,
  /(?:申込|申請)[^。]{0,6}(?:期限|締切|締め切り)/,
  /提出[^。]{0,8}期限/,
  /受付[^。]{0,8}期限/,
  /開札[^。]{0,10}(?:日時|日)/,
  /入札[^。]{0,10}(?:日時|日)/,
]

/** 締切と紛らわしいが別物の記述。ここに当たった箇所は読み飛ばす */
const NOT_DEADLINE = /質問|履行期間|委託期間|契約期間|業務期間|工期|閲覧|交付期間/

export function parseDeadline(description, { after = null } = {}) {
  const text = (description ?? "").replace(/\s+/g, " ")
  if (!text) return null

  for (const label of DEADLINE_LABELS) {
    const found = []
    // 見出しの直前は「別項目の日付」なので読まない。日付は見出しより後ろだけを見る
    const re = new RegExp(`(.{0,24})(${label.source})(.{0,80})`, "g")
    for (const m of text.matchAll(re)) {
      if (NOT_DEADLINE.test(m[1] + m[2])) continue
      const iso = toIso(m[3])
      if (!iso) continue
      if (after && iso < after) continue // 公告日より前は別件の記述
      found.push(iso)
    }
    if (found.length) return found.sort().at(-1)
  }
  return null
}

/** APIを1回叩いて明細を返す */
export async function search({ query, lgCode, from, category, count = 1000 } = {}) {
  const qs = new URLSearchParams({ Query: query, Count: String(count) })
  if (lgCode) qs.set("LG_Code", lgCode)
  if (from) qs.set("CFT_Issue_Date", `${from}/`)
  if (category) qs.set("Category", category)

  const xml = await get(`${ENDPOINT}?${qs}`)

  const hits = Number(tag(xml, "SearchHits") || 0)
  const items = xml
    .split("<SearchResult>")
    .slice(1)
    .map((blk) => {
      const b = blk.split("</SearchResult>")[0]
      const issue = tag(b, "CftIssueDate").slice(0, 10) || null
      const description = tag(b, "ProjectDescription")
      return {
        key: tag(b, "Key"),
        title: tag(b, "ProjectName"),
        description,
        // 6桁の団体コードは末尾がチェックデジット。5桁に落として既存データと突き合わせる
        cityCode: tag(b, "CityCode").slice(0, 5) || null,
        cityName: tag(b, "CityName") || null,
        prefName: tag(b, "PrefectureName") || null,
        orgName: tag(b, "OrganizationName") || null,
        lgCode: tag(b, "LgCode") || null,
        category: tag(b, "Category") || null,
        issueDate: issue,
        deadline: parseDeadline(description, { after: issue }),
        url: tag(b, "ExternalDocumentURI"),
      }
    })

  return { hits, items }
}

/** 検索語を変えて何度か叩き、Key で重複を除いてまとめる */
export async function collect({ lgCode, from, keywords = KEYWORDS, onStep } = {}) {
  const byKey = new Map()
  for (const query of keywords) {
    const { hits, items } = await search({ query, lgCode, from })
    for (const it of items) if (it.key) byKey.set(it.key, it)
    onStep?.({ query, hits, got: items.length, total: byKey.size })
    await sleep(400)
  }
  return [...byKey.values()]
}
