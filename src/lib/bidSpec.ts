/**
 * 入札案件の仕様項目。
 *
 * 収集した発注情報は「入札方式: X / 工種: Y / 開札日: Z / 課所: W」という
 * 一行のテキストで入っている。microCMS に専用フィールドを増やさずに
 * 構造化して扱えるよう、ここで解釈する。
 *
 * 将来 articles に個別フィールドを足したら、parseBidSpec を差し替えるだけで
 * 画面側は変えずに済む。
 */

export interface BidSpec {
  label: string
  value: string
  /** 開札日など、日付として強調したい項目 */
  emphasis?: boolean
}

/** 画面に出す順番と、日付として扱う項目 */
const ORDER = [
  "入札方式",
  "工種",
  "開札日",
  "申請締切日",
  "課所",
  "場所",
  "案件番号",
  "契約管理番号",
]
const DATE_FIELDS = new Set(["開札日"])

/** 「ラベル: 値」を / 区切りで並べた文字列を項目に分解する */
export function parseBidSpec(summary: string | undefined): BidSpec[] {
  if (!summary) return []

  const specs: BidSpec[] = []
  for (const part of summary.split("/")) {
    const m = /^\s*([^:：]{1,10})\s*[:：]\s*(.+)$/.exec(part)
    if (!m) continue
    const label = m[1].trim()
    const value = m[2].trim()
    if (!value) continue
    specs.push({ label, value, emphasis: DATE_FIELDS.has(label) })
  }

  return specs.sort((a, b) => {
    const ia = ORDER.indexOf(a.label)
    const ib = ORDER.indexOf(b.label)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })
}

/** 指定したラベルの値だけ取り出す（一覧で開札日を出すときなどに使う） */
export function bidSpecValue(
  summary: string | undefined,
  label: string,
): string | null {
  return parseBidSpec(summary).find((s) => s.label === label)?.value ?? null
}

/**
 * 概要文のうち、ラベル付きの項目を取り除いた残り。
 * 「質問の回答があります」のような備考だけを取り出す。
 */
export function bidRemark(summary: string | undefined): string {
  if (!summary) return ""
  return summary
    .split("/")
    .filter((part) => !/^\s*[^:：]{1,10}\s*[:：]/.test(part))
    .join(" / ")
    .trim()
}
