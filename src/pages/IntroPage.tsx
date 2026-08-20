import { Navigate, Page } from "../types/nav"
import Breadcrumb from "../components/Breadcrumb"
import Container from "../components/ui/Container"
import Button from "../components/ui/Button"
import SectionHeading from "../components/ui/SectionHeading"
interface IntroPageProps {
  audience: "business" | "gov"
  onNavigate: Navigate
}

interface Copy {
  breadcrumb: string
  eyebrow: string
  title: string
  lead: string
  problems: { title: string; body: string }[]
  solutions: { eyebrow: string; title: string; body: string }[]
  ctaTitle: string
  ctaBody: string
  ctaLabel: string
  ctaPage: Page
}

const copies: Record<"business" | "gov", Copy> = {
  business: {
    breadcrumb: "事業者向け",
    eyebrow: "For business",
    title: "自治体案件を、探す前に知る。",
    lead: "入札公告が出てからでは間に合わない。LocalPress は公募前の下調べ段階の動きから収集し、案件になる前のシグナルを営業部門に届けます。",
    problems: [
      {
        title: "自治体ごとにサイトが違う",
        body: "担当エリアが広がるほど、巡回するサイトが増え続けます。更新の見落としは機会損失に直結します。",
      },
      {
        title: "条件は公開後にも変わる",
        body: "提出期限、参加資格、予定価格。公告後の訂正に気づかず失注するケースは珍しくありません。",
      },
      {
        title: "案件の前後がつながらない",
        body: "調査業務、公募、結果発表。同じ事業の情報がばらばらに公開され、全体像が見えません。",
      },
    ],
    solutions: [
      {
        eyebrow: "01",
        title: "横断収集と自動分類",
        body: "対象自治体の公開情報を毎日収集し、分野・対象・金額・期限を揃えて整理します。",
      },
      {
        eyebrow: "02",
        title: "変更の検知と通知",
        body: "保存した条件に合う新着と、公開後の条件変更を検知して通知します。",
      },
      {
        eyebrow: "03",
        title: "案件タイムライン",
        body: "同一事業の下調べ・公募・結果を時系列でつなぎ、次の動きを読めるようにします。",
      },
    ],
    ctaTitle: "まずは無料で情報の量を確かめてください",
    ctaBody:
      "検索と閲覧は無料です。通知・変更履歴・案件管理が必要になった時点で法人プランへ。",
    ctaLabel: "法人プランを見る",
    ctaPage: "pricing",
  },
  gov: {
    breadcrumb: "自治体・調査機関向け",
    eyebrow: "For government",
    title: "他自治体の動きを、横並びで見る。",
    lead: "施策の検討に必要なのは、近隣や類似規模の自治体が何をどう進めているかという事実です。LocalPress は公開情報を揃った形で整理し、検索と比較を可能にします。",
    problems: [
      {
        title: "事例調べに時間がかかる",
        body: "他自治体のサイトを個別に当たる作業に、企画のたびに数日を要しています。",
      },
      {
        title: "比較できる形になっていない",
        body: "同じ施策でも公開の粒度も様式も異なり、横並びの比較が困難です。",
      },
      {
        title: "傾向が把握しづらい",
        body: "どの分野の施策が増えているのか、全体の動きが見えません。",
      },
    ],
    solutions: [
      {
        eyebrow: "01",
        title: "事例検索",
        body: "分野・対象・規模から他自治体の施策を検索し、元の公開ページまで辿れます。",
      },
      {
        eyebrow: "02",
        title: "自治体比較",
        body: "人口・面積などが近い自治体を並べ、施策の有無と内容を比較できます。",
      },
      {
        eyebrow: "03",
        title: "データ提供",
        body: "調査・研究用途に、整理済みデータを個別の条件で提供します。",
      },
    ],
    ctaTitle: "ご要望に合わせて個別にお見積りします",
    ctaBody: "対象範囲、提供形式、更新頻度をうかがったうえでご提案します。",
    ctaLabel: "料金の考え方を見る",
    ctaPage: "pricing",
  },
}

export default function IntroPage({ audience, onNavigate }: IntroPageProps) {
  const copy = copies[audience]

  return (
    <div>
      <section className="bg-ink-bg py-16 md:py-24">
        <Container>
          <Breadcrumb
            inverse
            items={[
              { label: "ホーム", onClick: () => onNavigate("top") },
              { label: copy.breadcrumb },
            ]}
          />
          <div className="mt-8 max-w-3xl">
            <p className="eyebrow mb-8 text-accent">{copy.eyebrow}</p>
            <h1 className="mt-6 text-h1 text-white">{copy.title}</h1>
            <p className="mt-8 text-lead text-white/70">{copy.lead}</p>
            <div className="mt-12 flex flex-wrap justify-between">
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
                onClick={() => onNavigate(copy.ctaPage)}
              >
                {copy.ctaLabel}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* 課題 */}
      <section className="py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Problem"
            title="こんな状況になっていませんか"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {copy.problems.map((p) => (
              <div key={p.title} className="border border-border bg-card p-8">
                <h3 className="text-h3 text-foreground">{p.title}</h3>
                <p className="mt-4 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 解決 */}
      <section className="border-y border-border bg-card py-24 md:py-32">
        <Container>
          <SectionHeading
            eyebrow="Solution"
            title="LocalPress ができること"
            lead="収集して整理する仕組みを土台に、目的に応じた機能を重ねています。"
          />
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {copy.solutions.map((s) => (
              <div key={s.eyebrow} className="border-t-2 border-primary pt-8">
                <p className="eyebrow mb-6 font-mono text-primary">
                  {s.eyebrow}
                </p>
                <h3 className="text-h3 text-foreground">{s.title}</h3>
                <p className="mt-4 text-body text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-h2 text-foreground">{copy.ctaTitle}</h2>
            <p className="mt-6 text-lead text-muted-foreground">
              {copy.ctaBody}
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => onNavigate(copy.ctaPage)}>
                {copy.ctaLabel}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  onNavigate(audience === "business" ? "bid" : "search")
                }
              >
                {audience === "business"
                  ? "入札・公募を見る"
                  : "掲載情報を検索する"}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
