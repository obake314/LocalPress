/**
 * microCMS から本番コンテンツを取得し、src/data/content.generated.ts を書き出す。
 *
 *   pnpm content:pull
 *
 * なぜビルド時に取り込むのか:
 *   このアプリはサーバーを持たない SPA なので、ブラウザから直接 microCMS を叩くと
 *   API キーが配信物に埋め込まれて公開されてしまう。無料プランは
 *   「データ転送 20GB/月・超過するとAPI停止」「APIキーは1本」なので、
 *   キーが漏れると第三者にサービスを止められる。
 *   そのため取得はローカル／CIのビルド時に一度だけ行い、結果を静的なTSとして固める。
 *
 * 取得できなかった場合は既存の generated ファイルを壊さずに終了する。
 */

import { writeFileSync, readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = resolve(ROOT, "src/data/content.generated.ts")

/**
 * サービスIDの表記ゆれを吸収する。
 * "localpress" / "localpress.microcms.io" / "https://localpress.microcms.io/" の
 * いずれで書かれていても "localpress" にそろえる。
 */
function normalizeServiceId(raw) {
  return String(raw ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.microcms\.io$/, "")
    .replace(/\.microcms-management\.io$/, "")
}

const DOMAIN = normalizeServiceId(process.env.MICROCMS_SERVICE_DOMAIN)
const KEY = (process.env.MICROCMS_API_KEY ?? "").trim().replace(/^["']|["']$/g, "")

if (!DOMAIN || !KEY) {
  console.error(
    "\n  MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY が未設定です。\n" +
      "  .env.example をコピーして .env を作り、値を入れてください。\n"
  )
  process.exit(1)
}

/** limit の上限は 100 なので分割して全件取得する */
async function fetchAll(endpoint) {
  const all = []
  const limit = 100
  let offset = 0

  for (;;) {
    const url = `https://${DOMAIN}.microcms.io/api/v1/${endpoint}?limit=${limit}&offset=${offset}`
    let res
    try {
      res = await fetch(url, { headers: { "X-MICROCMS-API-KEY": KEY } })
    } catch (cause) {
      throw new Error(
        `${url} に接続できませんでした（${cause.cause?.code ?? cause.message}）。\n` +
          `  サービスIDが正しいか、ネットワークが繋がっているか確認してください。\n` +
          `  MICROCMS_SERVICE_DOMAIN には https:// や .microcms.io を含めず、IDだけを書きます。`
      )
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      const hint =
        res.status === 401 || res.status === 403
          ? "APIキーが違うか、GET権限がありません。"
          : res.status === 404
            ? `エンドポイント "${endpoint}" が存在しません。microCMS 側のAPI名を確認してください。`
            : "サービスID・APIキー・エンドポイント名を確認してください。"
      throw new Error(`${endpoint} の取得に失敗しました (HTTP ${res.status})。${hint}\n  ${detail.slice(0, 200)}`)
    }

    const json = await res.json()
    all.push(...json.contents)
    offset += limit
    if (all.length >= json.totalCount || json.contents.length === 0) break
  }

  return all
}

const CATEGORIES = ["イベント", "補助金", "入札・公募", "募集", "文化", "子育て", "政策"]
const STATUSES = ["募集中", "締切間近", "終了", "準備中"]
const TARGETS = ["個人", "企業", "団体", "子育て世帯", "高齢者", "農業者"]

/** 取り込み時に見つかった入力漏れ。最後にまとめて表示する */
const warnings = []

/**
 * select フィールドは配列で返る。先頭を取り、想定外・未選択なら fallback を使う。
 * 黙って既定値に寄せると誤った分類のまま公開されるので、必ず記録する。
 */
const one = (value, allowed, fallback, { field, title }) => {
  const v = Array.isArray(value) ? value[0] : value
  if (allowed.includes(v)) return v
  warnings.push(
    v === undefined || v === null || v === ""
      ? `${title}: ${field} が未選択のため「${fallback}」で取り込みました`
      : `${title}: ${field} の値「${v}」は想定外のため「${fallback}」で取り込みました`
  )
  return fallback
}

const many = (value, allowed) => (Array.isArray(value) ? value.filter((v) => allowed.includes(v)) : [])

/** セレクトは配列で返るので先頭を取る。テキストならそのまま */
const text = (v) => {
  const raw = Array.isArray(v) ? v[0] : v
  return typeof raw === "string" ? raw.trim() : ""
}

/** 数値はテキストフィールドで入力されることがあるため、桁区切りを外して解釈する */
const num = (v) => {
  if (typeof v === "number") return v
  const raw = text(v).replace(/[,\s]/g, "")
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}
/**
 * microCMS の日時は UTC の ISO 文字列で返る。
 * 画面では日付だけを使うので、日本時間に直してから YYYY-MM-DD にする。
 * （例: 2026-08-25T15:00:00Z は JST では 8/26）
 */
const dateOnly = (v) => {
  if (typeof v !== "string" || v.length < 10) return null
  if (!v.includes("T")) return v.slice(0, 10)
  const t = Date.parse(v)
  if (Number.isNaN(t)) return null
  return new Date(t + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

/** tags は「テキスト（カンマ区切り）」でも「複数選択（配列）」でも受け取る */
const tagList = (v) => {
  if (Array.isArray(v)) return v.map(text).filter(Boolean)
  if (typeof v === "string") {
    return v
      .split(/[,、\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
  }
  return []
}

/**
 * 全国地方公共団体コードは5桁で先頭が0になる県が多い（岩手県は 03xxx）。
 * 数字フィールドや手入力で先頭ゼロが落ちることがあるため補う。
 */
const municipalityCode = (v) => {
  const raw = String(v ?? "").trim()
  return /^\d{1,5}$/.test(raw) ? raw.padStart(5, "0") : raw
}

function mapMunicipality(c) {
  // area は「地方区分（東北など）」に変更されたため、面積とは別項目として扱う
  const areaValue = text(c.area)
  const isRegion = areaValue !== "" && !/^[\d.,]+$/.test(areaValue)

  return {
    code: municipalityCode(c.code),
    name: text(c.name),
    prefecture: text(c.prefecture) || "岩手県",
    ...(isRegion ? { region: areaValue } : {}),
    population: num(c.population),
    area: isRegion ? num(c.areaKm2) : num(c.area),
    website: text(c.website),
    summary: text(c.summary),
  }
}

function mapArticle(c) {
  return {
    id: text(c.id),
    title: text(c.title),
    cityCode: municipalityCode(c.cityCode ?? c.municipality?.code),
    cityName: text(c.cityName ?? c.municipality?.name),
    prefecture: text(c.prefecture ?? c.municipality?.prefecture) || "岩手県",
    category: one(c.category, CATEGORIES, "政策", { field: "category", title: text(c.title) }),
    status: one(c.status, STATUSES, "募集中", { field: "status", title: text(c.title) }),
    targets: many(c.targets, TARGETS),
    publishedAt: dateOnly(c.publishedAtDate ?? c.publishedAt) ?? "",
    deadline: dateOnly(c.deadline),
    summary: text(c.summary),
    body: text(c.body),
    sourceUrl: text(c.sourceUrl),
    ...(text(c.amount) ? { amount: text(c.amount) } : {}),
    tags: tagList(c.tags),
  }
}

const header = `/**
 * microCMS から取得したコンテンツ（生成物・手で編集しないこと）。
 * 更新するには pnpm content:pull を実行する。
 * 取得元: https://${DOMAIN}.microcms.io/api/v1/
 * 生成日時: ${new Date().toISOString()}
 */

import type { Article, Municipality } from "./mockData"

`

try {
  const [municipalities, articles] = await Promise.all([
    fetchAll("municipalities"),
    fetchAll("articles"),
  ])

  const body =
    header +
    `export const generatedMunicipalities: Municipality[] = ${JSON.stringify(
      municipalities.map(mapMunicipality),
      null,
      2
    )}\n\n` +
    `export const generatedArticles: Article[] = ${JSON.stringify(
      articles.map(mapArticle),
      null,
      2
    )}\n`

  writeFileSync(OUT, body)

  console.log(
    `\n  取り込み完了: 自治体 ${municipalities.length} 件 / 情報 ${articles.length} 件` +
      `\n  → src/data/content.generated.ts`
  )

  if (warnings.length > 0) {
    console.log(`\n  入力漏れ ${warnings.length} 件（microCMS 側で直すと正しい分類で表示されます）:`)
    for (const w of warnings) console.log(`    - ${w}`)
  }

  const orphans = new Set(
    articles
      .map(mapArticle)
      .map((a) => a.cityCode)
      .filter((code) => !municipalities.map(mapMunicipality).some((m) => m.code === code))
  )
  if (orphans.size > 0) {
    console.log(
      `\n  自治体が見つからない cityCode: ${[...orphans].join(", ")}` +
        `\n  municipalities の code と表記をそろえてください。`
    )
  }

  console.log("")
} catch (err) {
  const kept = (() => {
    try {
      return readFileSync(OUT, "utf8").includes("generatedArticles")
    } catch {
      return false
    }
  })()

  console.error(`\n  ${err.message}`)
  console.error(
    kept
      ? "  既存の content.generated.ts はそのまま残しました。\n"
      : "  content.generated.ts は未生成のため、モックデータで表示されます。\n"
  )
  process.exit(1)
}
