import { NavProps, Page } from "../types/nav"
import Breadcrumb from "../components/Breadcrumb"
import Container from "../components/ui/Container"
import Button from "../components/ui/Button"
import SectionHeading from "../components/ui/SectionHeading"
import PlanTag from "../components/ui/PlanTag"
import type { Plan as PlanLabel } from "../components/ui/PlanTag"
interface PlanDef {
  name: string
  nameEn: string
  price: string
  period: string
  target: string
  tag: PlanLabel
  description: string
  features: { label: string; available: boolean }[]
  cta: string
  ctaPage: Page
  highlighted?: boolean
  badge?: string
}

/** 事業計画書「収益の仕組み」の 4 区分に対応 */
const plans: PlanDef[] = [
  {
    name: "フリー",
    nameEn: "Free",
    price: "¥0",
    period: "",
    target: "一般利用者",
    tag: "無料",
    description:
      "イベント・生活情報などの横断検索。登録なしでそのまま使えます。",
    features: [
      { label: "横断検索・基本の絞り込み", available: true },
      { label: "お知らせ・自治体ページの閲覧", available: true },
      { label: "締切間近の一覧", available: true },
      { label: "条件保存・新着通知", available: false },
      { label: "入札・公募の詳細と変更履歴", available: false },
      { label: "案件タイムライン・営業支援", available: false },
      { label: "データ出力", available: false },
    ],
    cta: "無料ではじめる",
    ctaPage: "search",
  },
  {
    name: "スタンダード",
    nameEn: "Standard",
    price: "¥3,800",
    period: "/ 月",
    target: "個人・企業",
    tag: "有料",
    description: "補助金・助成、事業者募集の検索と通知。取りこぼしを防ぎます。",
    features: [
      { label: "横断検索・高度な絞り込み", available: true },
      { label: "お知らせ・自治体ページの閲覧", available: true },
      { label: "締切間近の一覧", available: true },
      { label: "条件保存・新着通知（5件まで）", available: true },
      { label: "入札・公募の詳細と変更履歴", available: false },
      { label: "案件タイムライン・営業支援", available: false },
      { label: "データ出力", available: false },
    ],
    cta: "14日間無料で試す",
    ctaPage: "grants",
  },
  {
    name: "ビジネス",
    nameEn: "Business",
    price: "¥19,800",
    period: "/ 月",
    target: "法人営業部門",
    tag: "法人",
    description:
      "入札・公募の発見、期限管理、条件変更の通知まで。営業部門向け。",
    features: [
      { label: "横断検索・高度な絞り込み", available: true },
      { label: "お知らせ・自治体ページの閲覧", available: true },
      { label: "締切間近の一覧", available: true },
      { label: "条件保存・通知（無制限）", available: true },
      { label: "入札・公募の詳細と変更履歴", available: true },
      { label: "案件タイムライン・営業支援", available: true },
      { label: "データ出力（CSV）", available: true },
    ],
    cta: "14日間無料で試す",
    ctaPage: "bid",
    highlighted: true,
    badge: "主力プラン",
  },
  {
    name: "エンタープライズ",
    nameEn: "Enterprise",
    price: "個別見積",
    period: "",
    target: "自治体・調査機関",
    tag: "自治体",
    description: "他自治体の事例検索・比較、政策トレンド、データ提供を個別に。",
    features: [
      { label: "ビジネスプランの全機能", available: true },
      { label: "事例検索・自治体比較", available: true },
      { label: "政策トレンドの分析", available: true },
      { label: "データ提供（API・CSV）", available: true },
      { label: "専任サポート", available: true },
      { label: "カスタム要件への対応", available: true },
      { label: "対象範囲の個別設定", available: true },
    ],
    cta: "相談する",
    ctaPage: "for-gov",
  },
]

/** 仕様書「無料・有料の出し分け」の表 */
const featureComparison = [
  {
    feature: "横断検索・絞り込み",
    free: "○（基本）",
    standard: "○（高度）",
    business: "○（高度）",
    enterprise: "○",
  },
  {
    feature: "お知らせ・自治体ページ閲覧",
    free: "○",
    standard: "○",
    business: "○",
    enterprise: "○",
  },
  {
    feature: "条件保存・新着/変更通知",
    free: "△（一部）",
    standard: "5件まで",
    business: "無制限",
    enterprise: "無制限",
  },
  {
    feature: "入札・公募の詳細／変更履歴",
    free: "×",
    standard: "×",
    business: "○",
    enterprise: "○",
  },
  {
    feature: "案件タイムライン・営業支援",
    free: "×",
    standard: "×",
    business: "○",
    enterprise: "○",
  },
  {
    feature: "事例比較・データ出力",
    free: "×",
    standard: "×",
    business: "CSV",
    enterprise: "CSV / API",
  },
]

const faqs = [
  {
    q: "無料プランに機能制限はありますか？",
    a: "基本的な横断検索・絞り込み・閲覧は制限なく使えます。通知の登録、高度な条件、変更履歴の閲覧、データ出力が有料の範囲です。",
  },
  {
    q: "解約はいつでもできますか？",
    a: "月払いプランはいつでも解約できます。解約された月の末日まで引き続きご利用いただけます。",
  },
  {
    q: "対応している地域はどこまでですか？",
    a: "現在は岩手県内の 33 市町村を対象に収集しています。取りこぼしと処理費用の検証を経て、順次全国へ拡大します。",
  },
  {
    q: "請求書払い・年払いには対応していますか？",
    a: "ビジネスとエンタープライズでは請求書払いと年払い（割引あり）に対応しています。",
  },
]

const cell = (value: string) =>
  value === "×"
    ? "text-faint-foreground"
    : value === "○"
      ? "text-primary"
      : "text-foreground"
export default function PricingPage({ onNavigate }: NavProps) {
  return (
    <div>
      {/* ヘッダー */}
      <section className="bg-ink-bg py-20 md:py-28">
        <Container>
          <Breadcrumb
            inverse
            items={[
              { label: "ホーム", onClick: () => onNavigate("top") },
              { label: "料金・プラン" },
            ]}
          />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow mb-8 text-accent">Pricing</p>
            <h1 className="mt-6 text-h1 text-white">
              無料で探せる。
            </h1>
            <p className="mt-8 text-lead text-white/70">
              一般に開かれた情報の検索と閲覧は、すべて無料です。通知・変更履歴・案件管理といった、仕事の成果に直結する機能を有料プランで提供します。
            </p>
          </div>
        </Container>
      </section>

      {/* プラン */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-5 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col p-8 ${
                  plan.highlighted
                    ? "bg-ink-bg ring-2 ring-accent"
                    : "border border-border bg-card"
                }`}
              >
                <div className="mb-6 flex items-center justify-between gap-3">
                  <p
                    className={`eyebrow ${
                      plan.highlighted ? "text-accent" : "text-faint-foreground"
                    }`}
                  >
                    {plan.nameEn}
                  </p>
                  {plan.badge && (
                    <span className="bg-accent px-2.5 py-1 font-mono text-eyebrow font-semibold text-accent-foreground">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h2
                  className={`text-h3 ${
                    plan.highlighted ? "text-white" : "text-foreground"
                  }`}
                >
                  {plan.name}
                </h2>
                <p
                  className={`mt-2 text-sm ${
                    plan.highlighted ? "text-white/50" : "text-faint-foreground"
                  }`}
                >
                  {plan.target}
                </p>

                <p className="mt-8">
                  <span
                    className={`font-mono text-h2 font-bold tracking-tight ${
                      plan.highlighted ? "text-white" : "text-foreground"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`ml-2 text-sm ${
                        plan.highlighted
                          ? "text-white/50"
                          : "text-muted-foreground"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </p>

                <p
                  className={`mt-6 text-sm ${
                    plan.highlighted ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>

                <ul
                  className={`mt-10 flex-1 space-y-4 border-t pt-8 ${
                    plan.highlighted ? "border-white/15" : "border-border"
                  }`}
                >
                  {plan.features.map(({ label, available }) => (
                    <li key={label} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-0.5 shrink-0 font-mono ${
                          available
                            ? plan.highlighted
                              ? "text-accent"
                              : "text-primary"
                            : plan.highlighted
                              ? "text-white/25"
                              : "text-faint-foreground"
                        }`}
                      >
                        {available ? "✓" : "—"}
                      </span>
                      <span
                        className={
                          available
                            ? plan.highlighted
                              ? "text-white/80"
                              : "text-muted-foreground"
                            : plan.highlighted
                              ? "text-white/25"
                              : "text-faint-foreground"
                        }
                      >
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <Button
                    full
                    variant={
                      plan.highlighted
                        ? "accent"
                        : plan.price === "¥0"
                          ? "primary"
                          : "outline"
                    }
                    onClick={() => onNavigate(plan.ctaPage)}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 比較表 */}
      <section className="border-y border-border bg-card py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="Comparison"
            title="機能の比較"
            lead="無料で使える範囲と、有料プランで解錠される機能の一覧です。"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="py-6 pr-6 text-sm font-semibold text-foreground">
                    機能
                  </th>
                  {[
                    "フリー",
                    "スタンダード",
                    "ビジネス",
                    "エンタープライズ",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-6 text-center text-sm font-semibold text-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row) => (
                  <tr key={row.feature} className="border-b border-border">
                    <td className="py-6 pr-6 text-body text-foreground">
                      {row.feature}
                    </td>
                    <td
                      className={`px-6 py-6 text-center text-sm ${cell(row.free)}`}
                    >
                      {row.free}
                    </td>
                    <td
                      className={`px-6 py-6 text-center text-sm ${cell(row.standard)}`}
                    >
                      {row.standard}
                    </td>
                    <td className="bg-primary-soft px-6 py-6 text-center text-sm font-semibold text-primary">
                      {row.business}
                    </td>
                    <td
                      className={`px-6 py-6 text-center text-sm ${cell(row.enterprise)}`}
                    >
                      {row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <Container>
          <SectionHeading eyebrow="FAQ" title="よくある質問" />
          <div className="grid gap-x-16 gap-y-12 md:grid-cols-2">
            {faqs.map(({ q, a }) => (
              <div key={q}>
                <p className="text-h3 text-foreground">{q}</p>
                <p className="mt-4 text-body text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-ink-bg py-20 md:py-28">
        <Container>
          <div className="flex flex-col items-center gap-10 text-center">
            <div className="flex items-center gap-4">
              <PlanTag plan="無料" />
              <span className="text-sm text-white/60">
                登録なしで今すぐ使えます
              </span>
            </div>
            <h2 className="max-w-2xl text-h2 text-white">
              まずは無料で、情報の量を確かめてください。
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="accent"
                size="lg"
                onClick={() => onNavigate("search")}
              >
                無料で情報を探す
              </Button>
              <Button
                variant="inverse"
                size="lg"
                onClick={() => onNavigate("for-business")}
              >
                事業者向けの詳細を見る
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
