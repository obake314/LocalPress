import {
  getArticleById,
  getCityByCode,
  articles,
  daysUntilDeadline,
} from "../data/content"
import { Navigate } from "../types/nav"
import {
  CategoryBadge,
  StatusBadge,
  DeadlineBadge,
} from "../components/BadgeTag"
import ArticleCard from "../components/ArticleCard"
import Breadcrumb from "../components/Breadcrumb"
import Container from "../components/ui/Container"
import Button from "../components/ui/Button"
import PlanTag from "../components/ui/PlanTag"
import { PAID_FEATURES } from "../lib/features"
interface ArticlePageProps {
  articleId: string
  onNavigate: Navigate
}

export default function ArticlePage({
  articleId,
  onNavigate,
}: ArticlePageProps) {
  const article = getArticleById(articleId)
  const city = article ? getCityByCode(article.cityCode) : null

  if (!article) {
    return (
      <Container>
        <div className="py-32 text-center">
          <p className="text-h2 text-foreground">情報が見つかりませんでした</p>
          <div className="mt-10">
            <Button onClick={() => onNavigate("top")}>トップへ戻る</Button>
          </div>
        </div>
      </Container>
    )
  }

  const days = daysUntilDeadline(article.deadline)
  // 入札・公募は法人プランの領域。ここでは概要までを見せ、詳細は案件ページへ送る
  const isBid = PAID_FEATURES && article.category === "入札・公募"
  const related = articles
    .filter(
      (a) =>
        a.id !== article.id &&
        (a.category === article.category || a.cityCode === article.cityCode),
    )
    .slice(0, 3)

  const meta = [
    {
      label: "自治体",
      node: (
        <button
          onClick={() => onNavigate("city", { code: article.cityCode })}
          className="text-body font-medium text-primary transition-colors hover:text-primary-hover"
        >
          {article.prefecture} {article.cityName}
        </button>
      ),
    },
    {
      label: "公開日",
      node: (
        <p className="font-mono text-body text-foreground">
          {article.publishedAt}
        </p>
      ),
    },
    ...(article.deadline
      ? [
          {
            label: "締切日",
            node: (
              <p className="font-mono text-body text-alert">
                {article.deadline}
              </p>
            ),
          },
        ]
      : []),
    ...(article.targets.length > 0
      ? [
          {
            label: "対象者",
            node: (
              <p className="text-body text-foreground">
                {article.targets.join("・")}
              </p>
            ),
          },
        ]
      : []),
    ...(article.amount
      ? [
          {
            label: "金額・規模",
            node: (
              <p className="font-mono text-body text-foreground">
                {article.amount}
              </p>
            ),
          },
        ]
      : []),
  ]

  return (
    <div>
      {/* 記事ヘッダー */}
      <section className="border-b border-border bg-card pb-16 pt-6 md:pb-20">
        <Container>
          <Breadcrumb
            items={[
              { label: "ホーム", onClick: () => onNavigate("top") },
              {
                label: article.prefecture,
                onClick: () =>
                  onNavigate("search", { prefecture: article.prefecture }),
              },
              {
                label: article.cityName,
                onClick: () => onNavigate("city", { code: article.cityCode }),
              },
              {
                label: article.category,
                onClick: () =>
                  onNavigate("search", { category: article.category }),
              },
            ]}
          />

          <div className="mt-8 max-w-4xl">
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <CategoryBadge category={article.category} />
              <StatusBadge status={article.status} />
              {PAID_FEATURES && <PlanTag plan={isBid ? "法人" : "無料"} />}
              {days !== null && <DeadlineBadge days={days} />}
            </div>

            <h1 className="text-h1 text-foreground">{article.title}</h1>
            <p className="mt-8 text-lead text-muted-foreground">
              {article.summary}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_320px] lg:gap-20">
            <article className="min-w-0">
              {/* メタ情報 */}
              <dl className="grid gap-x-10 gap-y-8 border-y border-border py-10 sm:grid-cols-3">
                {meta.map(({ label, node }) => (
                  <div key={label}>
                    <dt className="eyebrow mb-3 text-faint-foreground">
                      {label}
                    </dt>
                    <dd>{node}</dd>
                  </div>
                ))}
              </dl>

              {/* 本文 — 入札・公募は詳細を案件ページ（有料）に集約する */}
              <div className="mt-14">
                <div className="flex flex-wrap items-center gap-4">
                  <h2 className="text-h3 text-foreground">詳細</h2>
                  {PAID_FEATURES && isBid && <PlanTag plan="有料" />}
                </div>

                {isBid ? (
                  <div className="mt-6 border border-border bg-card p-10">
                    <p className="text-body text-muted-foreground">
                      仕様・参加資格・提出書類、および公開後の条件変更の履歴は、入札・公募の案件ページでご確認いただけます。
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                      <Button
                        onClick={() => onNavigate("bid", { id: article.id })}
                      >
                        案件ページを開く
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onNavigate("pricing")}
                      >
                        法人プランを見る
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 whitespace-pre-line text-body text-muted-foreground">
                    {article.body}
                  </div>
                )}
              </div>

              {/* タグ */}
              {article.tags.length > 0 && (
                <div className="mt-14 flex flex-wrap gap-3">
                  {article.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onNavigate("search", { q: tag })}
                      className="border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-16 flex flex-col gap-6 bg-primary-soft p-10 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-sm text-muted-foreground">
                  掲載内容は公開情報を整理したものです。申請・応募の際は必ず自治体の元ページをご確認ください。
                </p>
                <Button href={article.sourceUrl} size="lg" className="shrink-0">
                  元ページを開く
                </Button>
              </div>
            </article>

            {/* サイドバー */}
            <aside className="space-y-5">
              {city && (
                <div className="border border-border bg-card p-8">
                  <p className="eyebrow mb-5 text-faint-foreground">
                    発信元の自治体
                  </p>
                  <button
                    onClick={() => onNavigate("city", { code: city.code })}
                    className="text-h3 text-foreground transition-colors hover:text-primary"
                  >
                    {city.name}
                  </button>
                  {city.summary && (
                    <p className="mt-4 text-sm text-muted-foreground">{city.summary}</p>
                  )}
                  {(city.population > 0 || city.area > 0) && (
                    <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6">
                      {city.population > 0 && (
                        <div>
                          <p className="eyebrow mb-2 text-faint-foreground">人口</p>
                          <p className="font-mono text-body text-foreground">
                            {city.population.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {city.area > 0 && (
                        <div>
                          <p className="eyebrow mb-2 text-faint-foreground">面積</p>
                          <p className="font-mono text-body text-foreground">
                            {city.area.toLocaleString()} km²
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => onNavigate("city", { code: city.code })}
                    className="mt-8 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                  >
                    {city.name}の情報をすべて見る →
                  </button>
                </div>
              )}

              <div className="bg-ink-bg p-8">
                <p className="eyebrow mb-4 text-accent">通知</p>
                <p className="text-sm text-white/70">
                  同じ条件の新着と、締切・条件変更を受け取れます。
                </p>
                <div className="mt-6">
                  <Button
                    variant="accent"
                    size="sm"
                    full
                    onClick={() => onNavigate("pricing")}
                  >
                    この条件を保存する
                  </Button>
                </div>
              </div>

              {related.length > 0 && (
                <div>
                  <p className="eyebrow mb-5 px-1 text-faint-foreground">
                    関連する情報
                  </p>
                  <div className="space-y-3">
                    {related.map((a) => (
                      <ArticleCard
                        key={a.id}
                        article={a}
                        compact
                        onCityClick={(code) => onNavigate("city", { code })}
                        onArticleClick={(id) => onNavigate("article", { id })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </Container>
      </section>
    </div>
  )
}
