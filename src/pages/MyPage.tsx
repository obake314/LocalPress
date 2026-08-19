import { articles, daysUntilDeadline } from "../data/content"
import { NavProps } from "../types/nav"
import Breadcrumb from "../components/Breadcrumb"
import Container from "../components/ui/Container"
import Button from "../components/ui/Button"
import SectionHeading from "../components/ui/SectionHeading"
import PlanTag from "../components/ui/PlanTag"
import { CategoryBadge, DeadlineBadge } from "../components/BadgeTag"

/** 未ログイン時の見本として提示する保存条件 */
const savedConditions = [
  { name: "岩手県／入札・公募／建設", hits: 4, plan: "有料" as const },
  { name: "盛岡市／補助金／企業", hits: 3, plan: "無料" as const },
  { name: "締切7日以内のすべて", hits: 5, plan: "有料" as const },
]

export default function MyPage({ onNavigate }: NavProps) {
  const watching = articles
    .filter((a) => {
      const d = daysUntilDeadline(a.deadline)
      return d !== null && d >= 0
    })
    .sort(
      (a, b) =>
        (daysUntilDeadline(a.deadline) ?? 99) -
        (daysUntilDeadline(b.deadline) ?? 99),
    )
    .slice(0, 4)

  return (
    <div>
      <section className="bg-ink-bg py-16 md:py-20">
        <Container>
          <Breadcrumb
            inverse
            items={[
              { label: "ホーム", onClick: () => onNavigate("top") },
              { label: "マイページ" },
            ]}
          />
          <h1 className="mt-8 text-h1 text-white">マイページ</h1>
          <p className="mt-6 max-w-2xl text-lead text-white/70">
            保存した条件と案件、通知の設定をまとめて管理します。ログインするとご利用いただけます。
          </p>
        </Container>
      </section>

      {/* ログイン導線 */}
      <section className="py-20 md:py-24">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:gap-8">
            <div className="border border-border bg-card p-10 md:p-14">
              <p className="eyebrow mb-6 text-primary">Sign in</p>
              <h2 className="text-h2 text-foreground">ログインして続ける</h2>
              <p className="mt-6 max-w-lg text-body text-muted-foreground">
                無料アカウントでも、条件の保存と新着通知を一部お使いいただけます。変更履歴の追跡や案件管理は法人プランの機能です。
              </p>

              <div className="mt-12 max-w-md space-y-5">
                <div>
                  <label className="eyebrow mb-3 block text-faint-foreground">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="h-14 w-full border border-border bg-background px-5 text-body text-foreground placeholder:text-faint-foreground focus:border-primary focus:bg-card focus:outline-none"
                  />
                </div>
                <div>
                  <label className="eyebrow mb-3 block text-faint-foreground">
                    パスワード
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="h-14 w-full border border-border bg-background px-5 text-body text-foreground placeholder:text-faint-foreground focus:border-primary focus:bg-card focus:outline-none"
                  />
                </div>
                <Button size="lg" full onClick={() => onNavigate("search")}>
                  ログイン
                </Button>
                <p className="text-sm text-muted-foreground">
                  アカウントをお持ちでない方は{""}
                  <button
                    onClick={() => onNavigate("pricing")}
                    className="font-semibold text-primary hover:text-primary-hover"
                  >
                    プランを選んで登録
                  </button>
                </p>
              </div>
            </div>

            <div className="bg-ink-bg p-10">
              <p className="eyebrow mb-6 text-accent">Notification</p>
              <h3 className="text-h3 text-white">通知でできること</h3>
              <ul className="mt-8 space-y-5">
                {[
                  "保存した条件に合う新着を毎朝まとめて受け取る",
                  "締切の 7 日前・前日にリマインドする",
                  "保存した案件の条件が変わったら即時に知らせる",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-4 text-body text-white/70"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-accent" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* 保存条件の見本 */}
      <section className="border-y border-border bg-card py-20 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Saved"
            title="保存条件（見本）"
            lead="よく使う検索条件を保存しておくと、新着と変更をまとめて追えます。"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {savedConditions.map((c) => (
              <div key={c.name} className="border border-border p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <PlanTag plan={c.plan} />
                  <span className="font-mono text-sm text-faint-foreground">
                    今週 {c.hits} 件
                  </span>
                </div>
                <p className="text-lead font-semibold text-foreground">
                  {c.name}
                </p>
                <button
                  onClick={() => onNavigate("search")}
                  className="mt-6 text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  この条件で検索する →
                </button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ウォッチ中の締切 */}
      <section className="py-20 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Watching"
            title="締切が近い案件（見本）"
            actionLabel="すべての情報を検索"
            onAction={() => onNavigate("search")}
          />
          <div className="overflow-hidden border border-border bg-card">
            {watching.map((a, i) => {
              const days = daysUntilDeadline(a.deadline)
              return (
                <button
                  key={a.id}
                  onClick={() => onNavigate("article", { id: a.id })}
                  className={`group flex w-full flex-col gap-4 p-7 text-left transition-colors hover:bg-primary-soft md:flex-row md:items-center md:gap-8 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="md:w-32 md:shrink-0">
                    <CategoryBadge category={a.category} size="xs" />
                  </span>
                  <span className="flex-1 text-lead font-medium text-foreground transition-colors group-hover:text-primary">
                    {a.title}
                  </span>
                  <span className="font-mono text-sm text-faint-foreground md:w-28">
                    {a.cityName}
                  </span>
                  {days !== null && <DeadlineBadge days={days} />}
                </button>
              )
            })}
          </div>
        </Container>
      </section>
    </div>
  )
}
