import { useState } from "react"
import { getCityByCode, getArticlesByCity, Category } from "../data/content"
import { Navigate } from "../types/nav"
import ArticleCard from "../components/ArticleCard"
import Breadcrumb from "../components/Breadcrumb"
import Container from "../components/ui/Container"
import Button from "../components/ui/Button"
import Stat from "../components/ui/Stat"
interface CityPageProps {
  cityCode: string
  onNavigate: Navigate
}

const tabs: { label: string; value: string }[] = [
  { label: "すべて", value: "" },
  { label: "補助金", value: "補助金" },
  { label: "入札・公募", value: "入札・公募" },
  { label: "イベント", value: "イベント" },
  { label: "募集", value: "募集" },
]

export default function CityPage({ cityCode, onNavigate }: CityPageProps) {
  const city = getCityByCode(cityCode)
  const cityArticles = getArticlesByCity(cityCode)
  const [activeTab, setActiveTab] = useState<string>("")

  if (!city) {
    return (
      <Container>
        <div className="py-32 text-center">
          <p className="text-h2 text-foreground">
            自治体が見つかりませんでした
          </p>
          <div className="mt-10">
            <Button onClick={() => onNavigate("top")}>トップへ戻る</Button>
          </div>
        </div>
      </Container>
    )
  }

  const filtered = activeTab
    ? cityArticles.filter((a) => a.category === activeTab as Category)
    : cityArticles

  return (
    <div>
      {/* 自治体ヘッダー */}
      <section className="bg-ink-bg py-16 md:py-20">
        <Container>
          <Breadcrumb
            inverse
            items={[
              { label: "ホーム", onClick: () => onNavigate("top") },
              {
                label: city.prefecture,
                onClick: () =>
                  onNavigate("search", { prefecture: city.prefecture }),
              },
              { label: city.name },
            ]}
          />

          <div className="mt-8 flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow mb-6 text-accent">
                {city.region ? `${city.region}・${city.prefecture}` : city.prefecture}
              </p>
              <h1 className="text-h1 text-white">{city.name}</h1>
              {city.summary && (
                <p className="mt-6 text-lead text-white/70">{city.summary}</p>
              )}
              <div className="mt-10">
                <a
                  href={city.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-b border-white/30 pb-1 text-sm text-white/80 transition-colors hover:border-accent hover:text-accent"
                >
                  公式サイトを開く
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* 人口・面積は未登録のことがあるため、値があるときだけ出す */}
            <div className="flex shrink-0 gap-10">
              {city.population > 0 && (
                <Stat inverse label="人口" value={city.population.toLocaleString()} unit="人" />
              )}
              {city.area > 0 && (
                <Stat inverse label="面積" value={city.area.toLocaleString()} unit="km²" />
              )}
              <Stat inverse label="掲載" value={String(cityArticles.length)} unit="件" />
            </div>
          </div>
        </Container>
      </section>

      {/* 分野タブ */}
      <section className="top-20 z-30 border-b border-border bg-card/95 backdrop-blur">
        <Container>
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map(({ label, value }) => {
              const count = (
                value
                  ? cityArticles.filter((a) => a.category === value)
                  : cityArticles
              ).length
              return (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className={`shrink-0 border-b-2 py-6 text-sm font-semibold transition-colors ${
                    activeTab === value
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  <span className="ml-2 font-mono text-eyebrow text-faint-foreground">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </Container>
      </section>

      {/* 一覧 */}
      <section className="py-20 md:py-24">
        <Container>
          {filtered.length === 0 ? (
            <div className="border border-dashed border-border-strong py-24 text-center">
              <p className="text-lead text-muted-foreground">
                該当する情報がありません。
              </p>
              <div className="mt-8">
                <Button variant="outline" onClick={() => setActiveTab("")}>
                  すべての分野を表示
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onCityClick={(code) => onNavigate("city", { code })}
                  onArticleClick={(id) => onNavigate("article", { id })}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  )
}
