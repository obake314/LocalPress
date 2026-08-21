import { useState } from "react"
import {
  articles,
  getArticleById,
  getRevisions,
  daysUntilDeadline,
} from "../data/content"
import { Navigate } from "../types/nav"
import Breadcrumb from "../components/Breadcrumb"
import Container from "../components/ui/Container"
import Button from "../components/ui/Button"
import SectionHeading from "../components/ui/SectionHeading"
import PlanTag from "../components/ui/PlanTag"
import { PAID_FEATURES } from "../lib/features"
import { StatusBadge, DeadlineBadge } from "../components/BadgeTag"
import BidSpecTable from "../components/BidSpecTable"
import { parseBidSpec, bidSpecValue, bidRemark } from "../lib/bidSpec"
interface BidPageProps {
  /** /bid/{案件ID} */
  bidId?: string
  onNavigate: Navigate
}

const bids = () => articles.filter((a) => a.category === "入札・公募")

/** 有料機能のロック表示（仕様書「無料・有料の出し分け」） */
function PaidLock({
  title,
  description,
  onNavigate,
  children,
}: {
  title: string
  description: string
  onNavigate: Navigate
  children: React.ReactNode
}) {
  // 開発期間中は制限を掛けず、そのまま見せる
  if (!PAID_FEATURES) {
    return <div className="border border-border bg-card">{children}</div>
  }

  return (
    <div className="relative overflow-hidden border border-border bg-card">
      <div
        aria-hidden
        className="pointer-events-none select-none blur-[6px] saturate-50"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-card/70 px-8 text-center backdrop-blur-[2px]">
        {PAID_FEATURES && <PlanTag plan="法人" />}
        <div>
          <p className="text-h3 text-foreground">{title}</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <Button onClick={() => onNavigate("pricing")}>
          法人プランで解錠する
        </Button>
      </div>
    </div>
  )
}

export default function BidPage({ bidId = "", onNavigate }: BidPageProps) {
  const [openOnly, setOpenOnly] = useState(false)
  const [pref, setPref] = useState("")

  const detail = bidId ? getArticleById(bidId) : undefined

  /* ─── 案件詳細（有料） ─── */
  if (detail) {
    const days = daysUntilDeadline(detail.deadline)
    const history = getRevisions(detail.id)

    return (
      <div>
        <section className="bg-muted py-16 md:py-20">
          <Container>
            <Breadcrumb
              items={[
                { label: "ホーム", onClick: () => onNavigate("top") },
                { label: "入札・公募", onClick: () => onNavigate("bid") },
                { label: detail.cityName },
              ]}
            />
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {PAID_FEATURES && <PlanTag plan="法人" />}
              <StatusBadge status={detail.status} size="xs" />
              {history.length > 0 && (
                <span className="bg-accent px-2.5 py-1 font-mono text-eyebrow font-semibold text-accent-foreground">
                  条件変更 {history.length} 件
                </span>
              )}
            </div>
            <h1 className="page-title page-title--spaced page-title--wide">
              {detail.title}
            </h1>

            {/* 発注情報の仕様。入札情報公開サービスから取得したもの */}
            <div className="mt-12 border-t border-border pt-10">
              <BidSpecTable
                specs={[
                  {
                    label: "発注者",
                    value: `${detail.prefecture} ${detail.cityName}`,
                  },
                  ...parseBidSpec(detail.summary),
                  ...(detail.deadline
                    ? [
                        {
                          label: "提出期限",
                          value: detail.deadline,
                          emphasis: true,
                        },
                      ]
                    : []),
                  ...(days !== null
                    ? [
                        {
                          label: "残り",
                          value: days >= 0 ? `${days} 日` : "受付終了",
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          </Container>
        </section>

        <section className="py-20 md:py-24">
          <Container>
            <div className="grid gap-16 lg:grid-cols-[1fr_320px] lg:gap-20">
              <div className="space-y-16">
                {/* 概要は無料で読める */}
                <div>
                  <div className="mb-6 flex items-center gap-4">
                    <h2 className="text-h3 text-foreground">案件の概要</h2>
                    <PlanTag plan="無料" />
                  </div>
                  <p className="text-body text-muted-foreground">
                    {bidRemark(detail.summary) ||
                      "この案件の詳細は、発注機関の入札情報公開サービスでご確認いただけます。"}
                  </p>
                </div>

                {/* 詳細は有料 */}
                <div>
                  <div className="mb-6 flex items-center gap-4">
                    <h2 className="text-h3 text-foreground">仕様・参加資格</h2>
                    {PAID_FEATURES && <PlanTag plan="有料" />}
                  </div>
                  <PaidLock
                    title="案件の詳細は法人プランで閲覧できます"
                    description="仕様書の要点、参加資格、提出書類、予定価格帯までを整理して表示します。"
                    onNavigate={onNavigate}
                  >
                    <div className="p-10">
                      <p className="whitespace-pre-line text-body text-muted-foreground">
                        {detail.body}
                      </p>
                    </div>
                  </PaidLock>
                </div>

                {/* 変更履歴も有料 */}
                <div>
                  <div className="mb-6 flex items-center gap-4">
                    <h2 className="text-h3 text-foreground">条件変更の履歴</h2>
                    {PAID_FEATURES && <PlanTag plan="有料" />}
                  </div>
                  <PaidLock
                    title="公開後に変わった条件を追跡します"
                    description="期限・参加資格・予定価格などの変更を検知し、保存した案件については通知します。"
                    onNavigate={onNavigate}
                  >
                    <div className="divide-y divide-border">
                      {(history.length > 0
                        ? history
                        : [
                            {
                              date: "2026-08-10",
                              field: "提出期限",
                              before: "2026-08-25",
                              after: "2026-09-01",
                            },
                          ]
                      ).map((r, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-3 p-8 md:flex-row md:items-center"
                        >
                          <span className="font-mono text-sm text-faint-foreground md:w-32">
                            {r.date}
                          </span>
                          <span className="text-body font-semibold text-foreground md:w-40">
                            {r.field}
                          </span>
                          <span className="flex-1 text-sm text-muted-foreground">
                            <span className="line-through">{r.before}</span>
                            <span className="mx-3 text-accent">→</span>
                            <span className="text-foreground">{r.after}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </PaidLock>
                </div>
              </div>

              <aside className="space-y-8">
                <div className="border border-border bg-card p-8">
                  <p className="eyebrow mb-4 text-faint-foreground">出典</p>
                  <p className="text-sm text-muted-foreground">
                    本ページは自治体の公開情報を整理したものです。応札にあたっては必ず元ページの公告をご確認ください。
                  </p>
                  <div className="mt-6">
                    <Button
                      href={detail.sourceUrl}
                      variant="outline"
                      size="sm"
                      full
                    >
                      元の公告を見る
                    </Button>
                  </div>
                </div>

                <div className="bg-ink-bg p-8">
                  <p className="eyebrow mb-4 text-accent">保存・通知</p>
                  <p className="text-sm text-white/70">
                    案件を保存すると、期限が近づいたときと条件が変更されたときに通知します。
                  </p>
                  <div className="mt-6">
                    <Button
                      variant="accent"
                      size="sm"
                      full
                      onClick={() => onNavigate("pricing")}
                    >
                      通知を設定する
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          </Container>
        </section>
      </div>
    )
  }

  /* ─── 案件検索（見出しまでは無料） ─── */
  const open = bids().filter((b) =>
    openOnly ? b.status === "募集中" || b.status === "締切間近" : true,
  )
  const list = open.filter((b) => (pref ? b.prefecture === pref : true))

  // 都道府県の並びは団体コード順（北から南へ）。件数は募集中の切替を反映する
  const prefs = [...new Set(bids().map((b) => b.prefecture))]
    .map((name) => ({
      name,
      code:
        bids()
          .find((b) => b.prefecture === name)
          ?.cityCode.slice(0, 2) ?? "99",
      count: open.filter((b) => b.prefecture === name).length,
    }))
    .sort((a, b) => a.code.localeCompare(b.code))

  return (
    <div>
      <section className="bg-muted py-16 md:py-20">
        <Container>
          <Breadcrumb
            items={[
              { label: "ホーム", onClick: () => onNavigate("top") },
              { label: "入札・公募" },
            ]}
          />
          <div className="mt-6 flex items-center gap-4">
            <p className="eyebrow text-primary">Bids & RFPs</p>
            {PAID_FEATURES && <PlanTag plan="法人" />}
          </div>
          <h1 className="page-title page-title--spaced">入札・公募</h1>
          <p className="mt-6 max-w-2xl text-lead text-muted-foreground">
            案件の一覧は無料で確認できます。仕様・参加資格・条件変更の履歴、および通知と案件管理は法人プランの機能です。
          </p>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Result"
            title={`${list.length} 件の案件`}
            lead="公募前の下調べ段階の情報も含めて収集しています。"
            actionLabel={openOnly ? "すべての案件を表示" : "募集中のみ表示"}
            onAction={() => setOpenOnly(!openOnly)}
          />

          {/* 都道府県で絞る。収録県が増えるとそのまま選択肢に並ぶ */}
          <div className="mb-10 flex flex-wrap gap-3">
            <button
              onClick={() => setPref("")}
              className={`border px-5 py-2.5 text-sm transition-colors ${
                pref === ""
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              すべて
              <span className="ml-2 font-mono text-eyebrow opacity-60">
                {open.length}
              </span>
            </button>
            {prefs.map((p) => (
              <button
                key={p.name}
                onClick={() => setPref(pref === p.name ? "" : p.name)}
                className={`border px-5 py-2.5 text-sm transition-colors ${
                  pref === p.name
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {p.name}
                <span className="ml-2 font-mono text-eyebrow opacity-60">
                  {p.count}
                </span>
              </button>
            ))}
          </div>

          <div className="overflow-hidden border border-border bg-card">
            {list.map((b, i) => {
              const days = daysUntilDeadline(b.deadline)
              const changes = getRevisions(b.id).length
              const method = bidSpecValue(b.summary, "入札方式")
              const workType = bidSpecValue(b.summary, "工種")
              const opening = bidSpecValue(b.summary, "開札日")
              const section = bidSpecValue(b.summary, "課所")
              const remark = bidRemark(b.summary)
              return (
                <button
                  key={b.id}
                  onClick={() => onNavigate("bid", { id: b.id })}
                  className={`group flex w-full flex-col gap-6 p-8 text-left transition-colors hover:bg-primary-soft md:flex-row md:items-center md:gap-10 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <StatusBadge status={b.status} size="xs" />
                      <span className="font-mono text-eyebrow text-faint-foreground">
                        {b.publishedAt} ／ {b.prefecture} {b.cityName}
                      </span>
                      {method && (
                        <span className="bg-muted px-2.5 py-1 text-eyebrow text-muted-foreground">
                          {method}
                        </span>
                      )}
                      {workType && (
                        <span className="bg-muted px-2.5 py-1 text-eyebrow text-muted-foreground">
                          {workType}
                        </span>
                      )}
                      {changes > 0 && (
                        <span className="bg-accent-soft px-2.5 py-1 font-mono text-eyebrow font-semibold text-accent-ink">
                          条件変更 {changes} 件
                        </span>
                      )}
                    </div>
                    <h3 className="text-h3 text-foreground transition-colors group-hover:text-primary">
                      {b.title}
                    </h3>
                    {remark && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-1">
                        {remark}
                      </p>
                    )}
                    {section && (
                      <p className="mt-3 font-mono text-eyebrow text-faint-foreground">
                        {section}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 md:w-40 md:text-right">
                    <p className="eyebrow mb-2 text-faint-foreground">
                      {opening ? "開札日" : "提出期限"}
                    </p>
                    <p className="font-mono text-body text-foreground">
                      {opening ?? b.deadline ?? "—"}
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
              <div className="px-8 py-20 text-center">
                <p className="text-lead text-muted-foreground">
                  条件に合う案件がありません。
                </p>
                <button
                  onClick={() => {
                    setPref("")
                    setOpenOnly(false)
                  }}
                  className="mt-6 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  絞り込みを解除する
                </button>
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  )
}
