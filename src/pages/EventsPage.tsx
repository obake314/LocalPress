import { useState } from "react"
import { articles, municipalities, Category } from "../data/content"
import { Navigate } from "../types/nav"
import ArticleCard from "../components/ArticleCard"
import Breadcrumb from "../components/Breadcrumb"
import Container from "../components/ui/Container"
import SectionHeading from "../components/ui/SectionHeading"
import PlanTag from "../components/ui/PlanTag"
import { CategoryBadge } from "../components/BadgeTag"
interface EventsPageProps {
  /** 地域別一覧（/events/{都道府県}/{市区町村}）で絞り込む自治体コード */
  cityCode?: string
  onNavigate: Navigate
}

/** 仕様書「イベント・生活（分野トップ）」のカテゴリ別 */
const lifeCategories: Category[] = ["イベント", "文化", "子育て", "募集"]

export default function EventsPage({
  cityCode = "",
  onNavigate,
}: EventsPageProps) {
  const [category, setCategory] = useState<Category | "">("")
  const [city, setCity] = useState(cityCode)

  const activeCity = municipalities.find((m) => m.code === city)

  const list = articles
    .filter((a) => lifeCategories.includes(a.category))
    .filter((a) => (category ? a.category === category : true))
    .filter((a) => (city ? a.cityCode === city : true))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  const countOf = (c: Category) =>
    articles.filter(
      (a) => a.category === c && (city ? a.cityCode === city : true),
    ).length

  return (
    <div>
      {/* ヘッダー */}
      <section className="bg-ink-bg py-16 md:py-20">
        <Container>
          <Breadcrumb
            inverse
            items={[
              { label: "ホーム", onClick: () => onNavigate("top") },
              {
                label: "イベント・生活",
                onClick: activeCity ? () => setCity("") : undefined,
              },
              ...(activeCity
                ? [{ label: "岩手県" }, { label: activeCity.name }]
                : []),
            ]}
          />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-4">
                <p className="eyebrow text-accent">Events & Life</p>
                <PlanTag plan="無料" />
              </div>
              <h1 className="text-h1 text-white">
                {activeCity
                  ? `${activeCity.name}のイベント・生活情報`
                  : "イベント・生活"}
              </h1>
              <p className="mt-6 text-lead text-white/70">
                {activeCity
                  ? activeCity.summary ||
                    `${activeCity.name}が公開しているイベント・文化・子育て・募集の情報です。`
                  : "地域の催し、文化、子育て支援、各種募集。暮らしに関わる情報をまとめて探せます。すべて無料で閲覧できます。"}
              </p>
            </div>
            <p className="font-mono text-h1 text-white">
              {list.length}
              <span className="ml-2 text-lead font-normal text-white/60">
                件
              </span>
            </p>
          </div>
        </Container>
      </section>

      {/* カテゴリ別 */}
      <section className="py-20 md:py-24">
        <Container>
          <SectionHeading eyebrow="Category" title="カテゴリ別に見る" />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {lifeCategories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? "" : c)}
                className={` border p-8 text-left transition-colors duration-200 ${
                  category === c
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                <CategoryBadge category={c} size="xs" />
                <p className="mt-6 font-mono text-h2 font-bold text-foreground">
                  {countOf(c)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{c}の情報</p>
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* 地域別 */}
      <section className="border-y border-border bg-card py-20 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Area"
            title="地域別に見る"
            lead="岩手県内の全 33 市町村から選べます。"
          />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCity("")}
              className={` border px-5 py-2.5 text-sm transition-colors ${
                city === ""
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              すべて
            </button>
            {municipalities.map((m) => (
              <button
                key={m.code}
                onClick={() => setCity(city === m.code ? "" : m.code)}
                className={` border px-5 py-2.5 text-sm transition-colors ${
                  city === m.code
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* 一覧 */}
      <section className="py-20 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Latest"
            title="新着の情報"
            actionLabel="条件を追加して検索する"
            onAction={() => onNavigate("search")}
          />

          {list.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {list.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onCityClick={(code) => onNavigate("city", { code })}
                  onArticleClick={(id) => onNavigate("article", { id })}
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border-strong py-24 text-center">
              <p className="text-lead text-muted-foreground">
                この条件に合う情報はまだありません。
              </p>
            </div>
          )}
        </Container>
      </section>
    </div>
  )
}
