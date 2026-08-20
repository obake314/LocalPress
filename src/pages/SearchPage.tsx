import { useState, useMemo, useRef } from "react"
import {
  articles,
  municipalities,
  Category,
  Status,
  Target,
} from "../data/content"
import { Navigate } from "../types/nav"
import ArticleCard from "../components/ArticleCard"
import Container from "../components/ui/Container"
import Button from "../components/ui/Button"
import PlanTag from "../components/ui/PlanTag"
interface SearchPageProps {
  initialQuery?: string
  initialCategory?: string
  initialPrefecture?: string
  onNavigate: Navigate
}

const categories: Category[] = [
  "イベント",
  "補助金",
  "入札・公募",
  "募集",
  "文化",
  "子育て",
  "政策",
]
const statuses: Status[] = ["募集中", "締切間近", "終了", "準備中"]
const targets: Target[] = [
  "個人",
  "企業",
  "団体",
  "子育て世帯",
  "高齢者",
  "農業者",
]
const prefectures = ["岩手県"]

/** 仕様書「期間・締切」の絞り込み */
const deadlineRanges: { label: string; days: number }[] = [
  { label: "7日以内", days: 7 },
  { label: "30日以内", days: 30 },
  { label: "90日以内", days: 90 },
]

export default function SearchPage({
  initialQuery = "",
  initialCategory = "",
  initialPrefecture = "",
  onNavigate,
}: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [prefecture, setPrefecture] = useState(initialPrefecture)
  const [status, setStatus] = useState("")
  const [city, setCity] = useState("")
  const [target, setTarget] = useState("")
  const [withAmount, setWithAmount] = useState(false)
  const [deadlineWithin, setDeadlineWithin] = useState(0)
  const [sortBy, setSortBy] = useState<"新着順" | "締切順">("新着順")
  const [filterOpen, setFilterOpen] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    let result = [...articles]

    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.cityName.includes(q) ||
          a.tags.some((t) => t.includes(q)),
      )
    }
    if (category) result = result.filter((a) => a.category === category)
    if (prefecture) result = result.filter((a) => a.prefecture === prefecture)
    if (status) result = result.filter((a) => a.status === status)
    if (city) result = result.filter((a) => a.cityCode === city)
    if (target)
      result = result.filter((a) => a.targets.includes(target as Target))
    if (withAmount) result = result.filter((a) => Boolean(a.amount))
    if (deadlineWithin > 0) {
      const limit = new Date("2026-08-19")
      limit.setDate(limit.getDate() + deadlineWithin)
      result = result.filter((a) => a.deadline && new Date(a.deadline) <= limit)
    }

    return result.sort((a, b) =>
      sortBy === "締切順"
        ? (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999")
        : b.publishedAt.localeCompare(a.publishedAt),
    )
  }, [
    query,
    category,
    prefecture,
    status,
    city,
    target,
    withAmount,
    deadlineWithin,
    sortBy,
  ])

  const activeChips = [
    category && { label: category, clear: () => setCategory("") },
    prefecture && { label: prefecture, clear: () => setPrefecture("") },
    city && {
      label: municipalities.find((m) => m.code === city)?.name ?? "",
      clear: () => setCity(""),
    },
    status && { label: status, clear: () => setStatus("") },
    target && { label: `対象：${target}`, clear: () => setTarget("") },
    withAmount && {
      label: "金額の記載あり",
      clear: () => setWithAmount(false),
    },
    deadlineWithin > 0 && {
      label: `締切${deadlineWithin}日以内`,
      clear: () => setDeadlineWithin(0),
    },
    query && { label: `"${query}"`, clear: () => setQuery("") },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  const clearAll = () => {
    setQuery("")
    setCategory("")
    setPrefecture("")
    setStatus("")
    setCity("")
    setTarget("")
    setWithAmount(false)
    setDeadlineWithin(0)
  }

  const countOf = (predicate: (a: typeof articles[number]) => boolean) =>
    articles.filter(predicate).length

  const FacetGroup = ({
    title,
    plan,
    children,
  }: {
    title: string
    plan?: "無料" | "有料"
    children: React.ReactNode
  }) => (
    <div className="border-b border-border pb-8 last:border-0">
      <div className="mb-5 flex items-center gap-3">
        <p className="eyebrow text-faint-foreground">{title}</p>
        {plan === "有料" && <PlanTag plan="有料" />}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )

  const FacetButton = ({
    label,
    count,
    active,
    onClick,
  }: {
    label: string
    count?: number
    active: boolean
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${
        active
          ? "bg-primary-soft font-semibold text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="font-mono text-eyebrow text-faint-foreground">
          {count}
        </span>
      )}
    </button>
  )

  const filters = (
    <div className="space-y-8">
      <FacetGroup title="分野">
        <FacetButton
          label="すべて"
          count={articles.length}
          active={category === ""}
          onClick={() => setCategory("")}
        />
        {categories.map((c) => (
          <FacetButton
            key={c}
            label={c}
            count={countOf((a) => a.category === c)}
            active={category === c}
            onClick={() => setCategory(category === c ? "" : c)}
          />
        ))}
      </FacetGroup>

      <FacetGroup title="状態">
        {statuses.map((s) => (
          <FacetButton
            key={s}
            label={s}
            count={countOf((a) => a.status === s)}
            active={status === s}
            onClick={() => setStatus(status === s ? "" : s)}
          />
        ))}
      </FacetGroup>

      <FacetGroup title="地域">
        {prefectures.map((p) => (
          <FacetButton
            key={p}
            label={p}
            count={countOf((a) => a.prefecture === p)}
            active={prefecture === p}
            onClick={() => setPrefecture(prefecture === p ? "" : p)}
          />
        ))}
        <div className="mt-3 max-h-64 space-y-1 pr-1">
          {municipalities.map((m) => {
            const count = countOf((a) => a.cityCode === m.code)
            return (
              <FacetButton
                key={m.code}
                label={m.name}
                count={count}
                active={city === m.code}
                onClick={() => setCity(city === m.code ? "" : m.code)}
              />
            )
          })}
        </div>
      </FacetGroup>

      <FacetGroup title="対象者">
        {targets.map((t) => (
          <FacetButton
            key={t}
            label={t}
            count={countOf((a) => a.targets.includes(t))}
            active={target === t}
            onClick={() => setTarget(target === t ? "" : t)}
          />
        ))}
      </FacetGroup>

      <FacetGroup title="期間・締切" plan="有料">
        {deadlineRanges.map(({ label, days }) => (
          <FacetButton
            key={label}
            label={label}
            active={deadlineWithin === days}
            onClick={() =>
              setDeadlineWithin(deadlineWithin === days ? 0 : days)
            }
          />
        ))}
      </FacetGroup>

      <FacetGroup title="金額・規模" plan="有料">
        <FacetButton
          label="金額の記載あり"
          count={countOf((a) => Boolean(a.amount))}
          active={withAmount}
          onClick={() => setWithAmount(!withAmount)}
        />
        <button
          onClick={() => onNavigate("pricing")}
          className="mt-3 w-full bg-accent-soft px-4 py-3 text-left text-sm text-accent-ink transition-colors hover:bg-accent"
        >
          さらに細かい条件は有料プランで →
        </button>
      </FacetGroup>
    </div>
  )

  return (
    <div>
      {/* 検索バー */}
      <section className="border-b border-border bg-ink-bg py-12 md:py-16">
        <Container>
          <div className="flex flex-col gap-3 bg-card p-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-faint-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="キーワード・自治体名で検索"
                className="h-14 w-full bg-transparent pl-14 pr-4 text-lead text-foreground placeholder:text-faint-foreground focus:outline-none"
              />
            </div>
            <Button
              size="lg"
              onClick={() =>
                resultsRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              検索する
            </Button>
          </div>
        </Container>
      </section>

      <Container>
        <div className="flex gap-16 py-12 md:py-16">
          {/* 絞り込み — デスクトップ */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="top-32">
              <div className="mb-8 flex items-center justify-between">
                <p className="text-h3 text-foreground">絞り込み</p>
                {activeChips.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    すべて解除
                  </button>
                )}
              </div>
              <div className="max-h-[calc(100vh-14rem)] pr-2">
                {filters}
              </div>
            </div>
          </aside>

          {/* 結果 */}
          <div ref={resultsRef} className="min-w-0 flex-1 scroll-mt-32">
            <div className="flex flex-col gap-8 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow mb-4 text-primary">Search result</p>
                <h1 className="text-h2 text-foreground">
                  {filtered.length}
                  <span className="ml-3 text-lead font-normal text-muted-foreground">
                    件
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary lg:hidden"
                >
                  絞り込み
                </button>
                {(["新着順", "締切順"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={` px-5 py-2.5 text-sm font-medium transition-colors ${
                      sortBy === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 選択中の条件 */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-8">
                {activeChips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={chip.clear}
                    className="inline-flex items-center gap-2 bg-primary-soft px-4 py-2 text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {chip.label}
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            )}

            {/* モバイル絞り込み */}
            {filterOpen && (
              <div className="mt-10 border border-border bg-card p-8 lg:hidden">
                {filters}
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {filtered.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onCityClick={(code) => onNavigate("city", { code })}
                    onArticleClick={(id) => onNavigate("article", { id })}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-10 border border-dashed border-border-strong py-24 text-center">
                <p className="text-h3 text-foreground">
                  条件に合う情報が見つかりませんでした
                </p>
                <p className="mt-4 text-body text-muted-foreground">
                  条件を減らすか、別のキーワードでお試しください。
                </p>
                <div className="mt-10">
                  <Button variant="outline" onClick={clearAll}>
                    条件をすべて解除する
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}
