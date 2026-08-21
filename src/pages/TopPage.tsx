import { useState } from "react"
import { articles, municipalities, daysUntilDeadline, Category } from "../data/content"
import { NavProps, Page } from "../types/nav"
import { CategoryBadge } from "../components/BadgeTag"
import JapanMap from "../components/JapanMap"
import Container from "../components/ui/Container"
import Button from "../components/ui/Button"
import SectionHeading from "../components/ui/SectionHeading"
import PlanTag from "../components/ui/PlanTag"

/* ── 分野カード（参考サイトの「コラム一覧」写真グリッドを踏襲） ── */
const fieldCards: { category: Category; img: string }[] = [
  { category: "補助金", img: "1554224155-6726b3ff858f" },
  { category: "入札・公募", img: "1507679799987-c73779587ccf" },
  { category: "イベント", img: "1503676260728-1c00da094a0b" },
  { category: "募集", img: "1486406146926-c627a92ad1ab" },
  { category: "子育て", img: "1476703993599-0035a21b17a9" },
  { category: "文化", img: "1480714378408-67cf0d13bc1b" },
  { category: "政策", img: "1460925895917-afdab827c52f" },
]

/* ── 3つの柱（参考サイトのリンクパネルを踏襲し、事業計画の対象区分に置き換え） ── */
const pillars: {
  head: string
  body: string
  eyebrow: string
  title: string
  plan: "無料" | "有料" | "自治体"
  links: { label: string; page: Page; params?: Record<string, string> }[]
}[] = [
  {
    head: "bg-primary",
    body: "bg-primary-soft",
    eyebrow: "探す",
    title: "一般のみなさま",
    plan: "無料",
    links: [
      { label: "自治体情報の横断検索（全件を見る）", page: "search" },
      { label: "イベント・生活の分野トップ", page: "events" },
      { label: "地域別に見る（岩手県 33 市町村）", page: "events" },
      { label: "補助金・助成の制度検索", page: "grants" },
      { label: "締切間近の情報", page: "search" },
      { label: "自治体ページ（プロフィールと新着）", page: "city", params: { code: "03201" } },
    ],
  },
  {
    head: "bg-ink-bg",
    body: "bg-sage-soft",
    eyebrow: "活用する",
    title: "事業者のみなさま",
    plan: "有料",
    links: [
      { label: "入札・公募の案件検索", page: "bid" },
      { label: "条件変更の履歴を追う", page: "bid" },
      { label: "案件の保存と通知設定", page: "mypage" },
      { label: "営業支援（案件化前のシグナル）", page: "for-business" },
      { label: "事業者向けのご案内", page: "for-business" },
      { label: "料金・プラン", page: "pricing" },
    ],
  },
  {
    head: "bg-sage",
    body: "bg-muted",
    eyebrow: "つながる",
    title: "自治体・調査のみなさま",
    plan: "自治体",
    links: [
      { label: "他自治体の施策を検索する", page: "search", params: { category: "政策" } },
      { label: "類似自治体との比較", page: "for-gov" },
      { label: "政策トレンドの把握", page: "for-gov" },
      { label: "データ提供について", page: "for-gov" },
      { label: "自治体向けのご案内", page: "for-gov" },
      { label: "お見積りのご相談", page: "pricing" },
    ],
  },
]

const regions = ["北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州"]

/* ── タブ付きお知らせボックス（参考サイトのニュースタブを踏襲） ── */
function NewsBox({ onNavigate }: NavProps) {
  const [tab, setTab] = useState(0)

  // 1本目は分野を問わず最新を出す。分類が未整備でも新着が空にならないようにする
  const tabs: { label: string; cats: string[] | null }[] = [
    { label: "新着のお知らせ", cats: null },
    { label: "イベント・生活", cats: ["イベント", "募集", "子育て", "文化"] },
    { label: "補助金・政策", cats: ["補助金", "政策"] },
    { label: "入札・公募", cats: ["入札・公募"] },
  ]

  const activeCats = tabs[tab].cats

  const current = articles
    .filter((a) => activeCats === null || activeCats.includes(a.category))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 5)

  return (
    <div className="border border-border bg-card">
      {/* タブ列 */}
      <div className="flex flex-wrap items-stretch border-b border-border">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={`border-r border-border px-8 py-5 text-sm font-semibold transition-colors ${
              tab === i
                ? "-mb-px border-b-2 border-b-primary bg-card text-primary"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="hidden flex-1 bg-muted md:block" />
        <button
          onClick={() => onNavigate("search")}
          className="border-l border-border bg-ink-bg px-8 py-5 text-sm font-semibold text-white transition-colors hover:bg-ink-bg-2"
        >
          一覧を見る
        </button>
      </div>

      {/* 行 */}
      <ul>
        {current.map((article, i) => {
          const days = daysUntilDeadline(article.deadline)
          return (
            <li key={article.id}>
              <button
                onClick={() => onNavigate("article", { id: article.id })}
                className={`group flex w-full flex-col gap-3 px-8 py-6 text-left transition-colors hover:bg-primary-soft md:flex-row md:items-center md:gap-8 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <span className="font-mono text-sm text-faint-foreground md:w-28 md:shrink-0">
                  {article.publishedAt}
                </span>
                <span className="md:w-32 md:shrink-0">
                  <CategoryBadge category={article.category} size="xs" />
                </span>
                <span className="flex-1 text-lead font-medium text-foreground transition-colors group-hover:text-primary">
                  {article.title}
                </span>
                {days !== null && days >= 0 && days <= 7 ? (
                  <span className="shrink-0 bg-alert-soft px-3 py-1 font-mono text-sm font-semibold text-alert">
                    残{days}日
                  </span>
                ) : (
                  <span className="shrink-0 font-mono text-sm text-faint-foreground">
                    {article.cityName}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function TopPage({ onNavigate }: NavProps) {
  const [query, setQuery] = useState("")

  const countOf = (category: Category) => articles.filter((a) => a.category === category).length

  const urgent = articles
    .filter((a) => {
      const d = daysUntilDeadline(a.deadline)
      return d !== null && d >= 0 && d <= 30
    })
    .sort((a, b) => (daysUntilDeadline(a.deadline) ?? 99) - (daysUntilDeadline(b.deadline) ?? 99))
    .slice(0, 4)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onNavigate("search", query ? { q: query } : {})
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* ══ ヒーロー（参考サイト：左に見出し＋ボタン＋実績、右に日本地図） ══ */}
      <section className="border-b border-border bg-card py-20 md:py-24">
        <Container>
          <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-20">
            {/* 左 */}
            <div className="min-w-0 flex-1">
              <p className="eyebrow mb-8 text-primary">全国自治体情報プラットフォーム</p>
              <h1 className="page-title">
                全国の自治体情報を、ひとつの窓口に。
              </h1>
              <p className="mt-8 max-w-xl text-lead text-muted-foreground">
                イベント・補助金・入札・公募・政策を自動で収集して整理し、地域と分野と締切から横断的に探せるようにします。
              </p>

              <div className="mt-12 flex flex-wrap justify-between">
                <Button variant="accent" size="lg" onClick={() => onNavigate("search")}>
                  LocalPress を検索する
                </Button>
                <Button variant="primary" size="lg" onClick={() => onNavigate("pricing")}>
                  企業・自治体のご担当者はこちら
                </Button>
              </div>

              {/* 実績パネル */}
              <div className="mt-14 border border-border">
                <p className="border-b border-border bg-muted px-8 py-3 font-mono text-eyebrow text-muted-foreground">
                  2026年8月現在
                </p>
                <div className="grid grid-cols-2 divide-x divide-border">
                  {[
                    { label: "現在の掲載件数", value: String(articles.length), unit: "件" },
                    {
                      label: "現在の対象自治体数",
                      value: String(municipalities.length),
                      unit: "自治体",
                    },
                  ].map(({ label, value, unit }) => (
                    <div key={label} className="px-8 py-7">
                      <p className="mb-3 text-sm text-muted-foreground">{label}</p>
                      <p className="metric-value">
                        {value}
                        <span className="metric-value__unit">
                          {unit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右：日本地図＋地域リンク */}
            <div className="w-full shrink-0 lg:w-[440px]">
              <div className="flex items-start gap-4 bg-card">
                <div className="aspect-square min-w-0 flex-1">
                  <JapanMap onNavigate={onNavigate} />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 pt-1">
                  {regions.map((r) => (
                    <button
                      key={r}
                      onClick={() => onNavigate("search")}
                      className="whitespace-nowrap text-sm text-primary transition-colors hover:text-primary-hover"
                    >
                      {r} ▶
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 border-l border-t border-border">
                {municipalities.slice(0, 8).map((city) => (
                  <button
                    key={city.code}
                    onClick={() => onNavigate("city", { code: city.code })}
                    className="border-b border-r border-border py-3 text-sm text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ══ 検索バー（仕様：サイトの中心は「検索」） ══ */}
      <section className="bg-muted py-12 md:py-14">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
            <div className="shrink-0">
              <p className="eyebrow mb-2 text-primary">Search</p>
              <p className="text-h3 text-foreground">横断検索</p>
            </div>
            <form onSubmit={submit} className="flex flex-1 flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="キーワード・自治体名で検索"
                className="h-16 flex-1 border border-transparent bg-card px-6 text-lead text-foreground placeholder:text-faint-foreground focus:border-accent focus:outline-none"
              />
              <Button
                variant="accent"
                size="lg"
                onClick={() => onNavigate("search", query ? { q: query } : {})}
              >
                検索する
              </Button>
            </form>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="eyebrow mr-2 text-faint-foreground">よく見られる分野</span>
            {fieldCards.slice(0, 5).map(({ category }) => (
              <button
                key={category}
                onClick={() => onNavigate("search", { category })}
                className="border border-border-strong px-5 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {category}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* ══ 新着（タブ付きボックス） ══ */}
      <section className="py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Latest"
            title="新着情報"
            lead="収集した情報を分野ごとに整理して掲載しています。閲覧はすべて無料です。"
          />
          <NewsBox onNavigate={onNavigate} />
        </Container>
      </section>

      {/* ══ 分野から探す（写真カードグリッド） ══ */}
      <section className="border-y border-border bg-card py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Search by field"
            title="分野から探す"
            lead="自治体が公開する情報を 7 つの分野に分類しています。"
            actionLabel="すべての情報を検索"
            onAction={() => onNavigate("search")}
          />

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {fieldCards.map(({ category, img }) => (
              <button
                key={category}
                onClick={() => onNavigate("search", { category })}
                className="group border border-border text-left transition-colors hover:border-primary"
              >
                <div className="h-40 overflow-hidden bg-sage-soft">
                  <img
                    src={`https://images.unsplash.com/photo-${img}?w=480&h=320&fit=crop&auto=format`}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-6 py-5">
                  <p className="text-h3 text-foreground transition-colors group-hover:text-primary">
                    {category}
                  </p>
                  <p className="font-mono text-sm text-faint-foreground">{countOf(category)}件</p>
                </div>
              </button>
            ))}

            {/* 入札は主力導線なので濃色のカードを添える */}
            <button
              onClick={() => onNavigate("bid")}
              className="group flex flex-col justify-between bg-ink-bg p-8 text-left transition-colors hover:bg-ink-bg-2"
            >
              <div>
                <p className="eyebrow mb-6 text-accent">For business</p>
                <p className="text-h3 text-white">入札・公募をもっと深く</p>
                <p className="mt-3 text-sm text-white/60">
                  公募前の下調べ段階の情報と、公開後の条件変更の通知まで。
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                法人向け機能を見る
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
            </button>
          </div>
        </Container>
      </section>

      {/* ══ LocalPress とは（ベン図＋説明） ══ */}
      <section className="py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="About"
            title="LocalPress とは"
            lead="収集して整理する仕組みをひとつ作れば、目的の異なる複数のサービスに展開できます。"
            align="center"
          />

          <div className="flex flex-col items-center gap-16 md:flex-row md:gap-20">
            <div className="h-64 w-64 shrink-0">
              <svg viewBox="0 0 200 200" className="h-full w-full">
                <circle cx="100" cy="88" r="46" fill="var(--color-primary)" fillOpacity="0.14" stroke="var(--color-primary)" strokeWidth="1" />
                <circle cx="72" cy="118" r="46" fill="var(--color-accent)" fillOpacity="0.18" stroke="var(--color-accent)" strokeWidth="1" />
                <circle cx="128" cy="118" r="46" fill="var(--color-sage)" fillOpacity="0.16" stroke="var(--color-sage)" strokeWidth="1" />
                <text x="100" y="72" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-primary)">収集・整理</text>
                <text x="58" y="140" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-accent-ink)">横断検索</text>
                <text x="142" y="140" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-sage)">通知・管理</text>
              </svg>
            </div>

            <div className="flex-1">
              <p className="text-lead text-muted-foreground">
                全国には 1,700 を超える市区町村と都道府県があり、それぞれが公式サイトで日々情報を公開しています。分野も様式もばらばらで、横断的に探す手段がありません。
              </p>
              <p className="mt-6 text-lead text-muted-foreground">
                LocalPress は、こうした公開情報を自動で収集し、分野・地域・対象・期限を揃えた形に整理します。一般の方には無料で開放し、網羅性と通知に価値を見いだす事業者には有料の機能を提供します。
              </p>
              <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-3">
                {[
                  { k: "収集", v: "毎日" },
                  { k: "対象", v: `${municipalities.length} 自治体` },
                  { k: "分野", v: "7 分野" },
                ].map(({ k, v }) => (
                  <div key={k} className="bg-card px-8 py-7">
                    <p className="eyebrow mb-3 text-faint-foreground">{k}</p>
                    <p className="font-mono text-h3 font-semibold text-foreground">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ══ 3つの柱（リンクパネル） ══ */}
      <section className="border-y border-border bg-card py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="For everyone"
            title="目的に合わせた3つの入口"
            lead="同じ情報基盤の上に、一般・事業者・自治体それぞれの使い方を用意しています。"
          />

          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map(({ head, body, eyebrow, title, plan, links }) => (
              <div key={title} className="flex flex-col border border-border">
                <div className={`${head} flex min-h-[112px] items-center justify-between gap-4 px-8 py-5`}>
                  <div>
                    <p className="eyebrow mb-2 text-white/60">{eyebrow}</p>
                    <h3 className="text-h3 text-white">{title}</h3>
                  </div>
                  <PlanTag plan={plan} />
                </div>
                <ul className={`${body} flex-1 px-8 py-7`}>
                  {links.map(({ label, page, params }) => (
                    <li key={label} className="border-b border-border/60 last:border-0">
                      <button
                        onClick={() => onNavigate(page, params)}
                        className="w-full py-4 text-left text-sm text-foreground transition-colors hover:text-primary"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ══ ピックアップ（締切間近の4カード） ══ */}
      <section className="py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Pickup"
            title="締切間近の情報"
            actionLabel="締切順で一覧を見る"
            onAction={() => onNavigate("search")}
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {urgent.map((article) => {
              const days = daysUntilDeadline(article.deadline)
              return (
                <button
                  key={article.id}
                  onClick={() => onNavigate("article", { id: article.id })}
                  className="group flex flex-col border border-border bg-card p-8 text-left transition-colors hover:border-primary"
                >
                  <span className="flex">
                    <CategoryBadge category={article.category} size="xs" />
                  </span>
                  <p className="mt-6 flex-1 text-lead font-semibold text-foreground transition-colors group-hover:text-primary">
                    {article.title}
                  </p>
                  <div className="mt-8 border-t border-border pt-5">
                    <p className="font-mono text-sm text-faint-foreground">{article.cityName}</p>
                    {days !== null && (
                      <p className="mt-2 font-mono text-h3 font-semibold text-alert">残{days}日</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </Container>
      </section>

      {/* ══ CTA帯（参考サイトの波形バンドを踏襲） ══ */}
      <section className="relative flex flex-1 items-center overflow-hidden bg-sage py-24 md:py-32">
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[120px] w-full"
        >
          <path d="M0,96 C260,150 520,40 760,72 C980,102 1220,150 1440,104 L1440,160 L0,160 Z" fill="var(--color-accent-soft)" fillOpacity="0.55" />
          <path d="M0,124 C280,168 540,72 800,104 C1020,132 1240,170 1440,132 L1440,160 L0,160 Z" fill="var(--color-accent)" fillOpacity="0.35" />
        </svg>

        <Container>
          <div className="relative text-center">
            <h2 className="text-h2 text-white">LocalPress の輪に参加しませんか</h2>
            <p className="mx-auto mt-6 max-w-xl text-lead text-white/80">
              検索と閲覧は無料です。通知や案件管理が必要になったら、法人プランへ。
            </p>

            <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
              {[
                { label: "対象自治体", value: String(municipalities.length), unit: "自治体" },
                { label: "掲載情報", value: String(articles.length), unit: "件" },
                { label: "更新", value: "毎日", unit: "" },
              ].map(({ label, value, unit }) => (
                <div key={label} className="bg-card px-6 py-8">
                  <p className="eyebrow mb-3 text-faint-foreground">{label}</p>
                  <p className="font-mono text-h2 font-semibold text-foreground">
                    {value}
                    {unit && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">{unit}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-14 flex flex-wrap justify-center gap-4">
              <Button variant="accent" size="lg" onClick={() => onNavigate("search")}>
                無料で情報を探す
              </Button>
              <Button variant="inverse" size="lg" onClick={() => onNavigate("pricing")}>
                法人プランを見る
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
