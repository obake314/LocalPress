import { useState, useMemo } from "react"
import {
  articles,
  getArticleById,
  daysUntilDeadline,
  Target,
} from "../data/content"
import { Navigate } from "../types/nav"
import Breadcrumb from "../components/Breadcrumb"
import Container from "../components/ui/Container"
import Button from "../components/ui/Button"
import SectionHeading from "../components/ui/SectionHeading"
import PlanTag from "../components/ui/PlanTag"
import { StatusBadge, DeadlineBadge } from "../components/BadgeTag"
interface GrantsPageProps {
  /** /grants/{制度ID} */
  grantId?: string
  onNavigate: Navigate
}

const targets: Target[] = [
  "個人",
  "企業",
  "団体",
  "子育て世帯",
  "高齢者",
  "農業者",
]

const grants = () => articles.filter((a) => a.category === "補助金")

export default function GrantsPage({
  grantId = "",
  onNavigate,
}: GrantsPageProps) {
  const [query, setQuery] = useState("")
  const [target, setTarget] = useState<Target | "">("")
  const [openOnly, setOpenOnly] = useState(false)

  const detail = grantId ? getArticleById(grantId) : undefined

  const list = useMemo(() => {
    let result = grants()
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.cityName.includes(q),
      )
    }
    if (target) result = result.filter((a) => a.targets.includes(target))
    if (openOnly)
      result = result.filter(
        (a) => a.status === "募集中" || a.status === "締切間近",
      )
    return result.sort((a, b) =>
      (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"),
    )
  }, [query, target, openOnly])

  /* ─── 制度詳細 ─── */
  if (detail) {
    const days = daysUntilDeadline(detail.deadline)

    return (
      <div>
        <section className="bg-ink-bg py-16 md:py-20">
          <Container>
            <Breadcrumb
              inverse
              items={[
                { label: "ホーム", onClick: () => onNavigate("top") },
                { label: "補助金・助成", onClick: () => onNavigate("grants") },
                { label: detail.cityName },
              ]}
            />
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <PlanTag plan="無料" />
              <StatusBadge status={detail.status} size="xs" />
            </div>
            <h1 className="mt-6 max-w-4xl text-h1 text-white">
              {detail.title}
            </h1>
          </Container>
        </section>

        <section className="py-20 md:py-24">
          <Container>
            <div className="grid gap-16 lg:grid-cols-[1fr_320px] lg:gap-20">
              <div>
                <p className="text-lead text-muted-foreground">
                  {detail.summary}
                </p>
                <div className="mt-14 border-t border-border pt-14">
                  <h2 className="text-h3 text-foreground">制度の内容</h2>
                  <p className="mt-6 whitespace-pre-line text-body text-muted-foreground">
                    {detail.body}
                  </p>
                </div>
                <div className="mt-14">
                  <Button href={detail.sourceUrl} size="lg">
                    自治体の元ページで申請する
                  </Button>
                </div>
              </div>

              <aside className="space-y-8 border border-border bg-card p-8">
                <div>
                  <p className="eyebrow mb-3 text-faint-foreground">上限額</p>
                  <p className="font-mono text-h3 font-bold text-foreground">
                    {detail.amount ?? "記載なし"}
                  </p>
                </div>
                <div className="border-t border-border pt-8">
                  <p className="eyebrow mb-3 text-faint-foreground">申請締切</p>
                  <p className="font-mono text-h3 font-bold text-foreground">
                    {detail.deadline ?? "随時"}
                  </p>
                  {days !== null && (
                    <div className="mt-3">
                      <DeadlineBadge days={days} />
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-8">
                  <p className="eyebrow mb-3 text-faint-foreground">対象</p>
                  <p className="text-body text-foreground">
                    {detail.targets.join("・")}
                  </p>
                </div>
                <div className="border-t border-border pt-8">
                  <p className="eyebrow mb-3 text-faint-foreground">申請先</p>
                  <button
                    onClick={() =>
                      onNavigate("city", { code: detail.cityCode })
                    }
                    className="text-body text-primary transition-colors hover:text-primary-hover"
                  >
                    {detail.prefecture} {detail.cityName}
                  </button>
                </div>
              </aside>
            </div>
          </Container>
        </section>
      </div>
    )
  }

  /* ─── 制度検索 ─── */
  return (
    <div>
      <section className="bg-ink-bg py-16 md:py-20">
        <Container>
          <Breadcrumb
            inverse
            items={[
              { label: "ホーム", onClick: () => onNavigate("top") },
              { label: "補助金・助成" },
            ]}
          />
          <div className="mt-6 flex items-center gap-4">
            <p className="eyebrow text-accent">Grants</p>
            <PlanTag plan="無料" />
          </div>
          <h1 className="mt-6 text-h1 text-white">補助金・助成を探す</h1>
          <p className="mt-6 max-w-2xl text-lead text-white/70">
            対象・上限額・締切・申請先を揃えて掲載しています。締切が近い順に並びます。
          </p>

          <div className="mt-12 max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="制度名・自治体名・キーワード"
              className="h-14 w-full bg-card px-6 text-lead text-foreground placeholder:text-faint-foreground focus:outline-none"
            />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container>
          {/* 絞り込み */}
          <div className="mb-14 flex flex-wrap items-center gap-3">
            <span className="eyebrow mr-2 text-faint-foreground">対象者</span>
            {targets.map((t) => (
              <button
                key={t}
                onClick={() => setTarget(target === t ? "" : t)}
                className={` border px-5 py-2.5 text-sm transition-colors ${
                  target === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {t}
              </button>
            ))}
            <button
              onClick={() => setOpenOnly(!openOnly)}
              className={`ml-2 border px-5 py-2.5 text-sm transition-colors ${
                openOnly
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              募集中のみ
            </button>
          </div>

          <SectionHeading
            eyebrow="Result"
            title={`${list.length} 件の制度`}
            actionLabel="他の分野も横断して検索"
            onAction={() => onNavigate("search")}
          />

          <div className="overflow-hidden border border-border bg-card">
            {list.map((g, i) => {
              const days = daysUntilDeadline(g.deadline)
              return (
                <button
                  key={g.id}
                  onClick={() => onNavigate("grants", { id: g.id })}
                  className={`group flex w-full flex-col gap-6 p-8 text-left transition-colors hover:bg-primary-soft md:flex-row md:items-center md:gap-10 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <StatusBadge status={g.status} size="xs" />
                      <span className="font-mono text-eyebrow text-faint-foreground">
                        {g.prefecture} {g.cityName}
                      </span>
                    </div>
                    <h3 className="text-h3 text-foreground transition-colors group-hover:text-primary">
                      {g.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {g.summary}
                    </p>
                    <p className="mt-4 text-sm text-faint-foreground">
                      対象：{g.targets.join("・")}
                    </p>
                  </div>

                  <div className="shrink-0 md:w-44 md:text-right">
                    <p className="eyebrow mb-2 text-faint-foreground">上限額</p>
                    <p className="font-mono text-h3 font-bold text-foreground">
                      {g.amount ?? "—"}
                    </p>
                    <p className="mt-4 font-mono text-sm text-muted-foreground">
                      {g.deadline}
                    </p>
                    {days !== null && (
                      <div className="mt-2">
                        <DeadlineBadge days={days} />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}

            {list.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-lead text-muted-foreground">
                  この条件に合う制度は見つかりませんでした。
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  )
}
