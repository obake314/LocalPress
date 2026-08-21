import { BidSpec } from "../lib/bidSpec"

interface BidSpecTableProps {
  specs: BidSpec[]
  /** 濃色面の上に置く場合 */
  inverse?: boolean
  columns?: 2 | 3
}

/**
 * 入札案件の仕様を並べる定義リスト。
 * 一覧・詳細のどちらからも使う共通の見た目。
 */
export default function BidSpecTable({ specs, inverse, columns = 3 }: BidSpecTableProps) {
  if (specs.length === 0) return null

  return (
    <dl
      className={`grid gap-x-10 gap-y-8 ${
        columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {specs.map(({ label, value, emphasis }) => (
        <div key={label + value}>
          <dt className={`eyebrow mb-3 ${inverse ? "text-white/40" : "text-faint-foreground"}`}>
            {label}
          </dt>
          <dd
            className={
              emphasis
                ? `font-mono text-h3 font-semibold ${inverse ? "text-accent" : "text-alert"}`
                : `text-body ${inverse ? "text-white" : "text-foreground"}`
            }
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
