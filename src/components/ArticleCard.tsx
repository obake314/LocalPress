import { Article, daysUntilDeadline } from "../data/content"
import { CategoryBadge, StatusBadge, DeadlineBadge } from "./BadgeTag"
interface ArticleCardProps {
  article: Article
  onCityClick: (code: string) => void
  onArticleClick: (id: string) => void
  /** サイドバー等の狭い場所向け */
  compact?: boolean
  /** 横長の 1 行レイアウト（締切間近・一覧の密度を上げたい場面） */
  row?: boolean
}

export default function ArticleCard({
  article,
  onCityClick,
  onArticleClick,
  compact,
  row,
}: ArticleCardProps) {
  const days = daysUntilDeadline(article.deadline)

  if (compact) {
    return (
      <div
        onClick={() => onArticleClick(article.id)}
        className="group cursor-pointer border border-border bg-card p-5 transition-colors duration-200 hover:border-primary"
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <CategoryBadge category={article.category} size="xs" />
          <StatusBadge status={article.status} size="xs" />
        </div>
        <p className="text-body font-semibold leading-relaxed text-foreground transition-colors group-hover:text-primary line-clamp-2">
          {article.title}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCityClick(article.cityCode)
            }}
            className="font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {article.cityName}
          </button>
          {article.deadline && days !== null && <DeadlineBadge days={days} />}
        </div>
      </div>
    )
  }

  if (row) {
    return (
      <div
        onClick={() => onArticleClick(article.id)}
        className="group flex cursor-pointer flex-col gap-5 border border-border bg-card p-7 transition-colors duration-200 hover:border-primary md:flex-row md:items-center md:gap-10 md:p-8"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <CategoryBadge category={article.category} size="xs" />
            <StatusBadge status={article.status} size="xs" />
            <span className="font-mono text-eyebrow text-faint-foreground">
              {article.publishedAt}
            </span>
          </div>
          <h3 className="text-h3 text-foreground transition-colors group-hover:text-primary line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {article.summary}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCityClick(article.cityCode)
            }}
            className="mt-4 font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {article.prefecture} {article.cityName}
          </button>
        </div>

        {days !== null && (
          <div className="shrink-0 border-border md:w-36 md:border-l md:pl-10 md:text-center">
            <p className="eyebrow mb-2 text-faint-foreground">締切まで</p>
            <DeadlineBadge days={days} emphasis />
            <p className="mt-2 font-mono text-sm text-faint-foreground">
              {article.deadline}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={() => onArticleClick(article.id)}
      className="group flex h-full cursor-pointer flex-col border border-border bg-card p-7 transition-colors duration-200 hover:border-primary"
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <CategoryBadge category={article.category} size="xs" />
        <StatusBadge status={article.status} size="xs" />
        {article.amount && (
          <span className="bg-accent-soft px-2.5 py-1 font-mono text-eyebrow font-semibold text-accent-ink">
            {article.amount}
          </span>
        )}
      </div>

      <h3 className="text-h3 text-foreground transition-colors group-hover:text-primary line-clamp-3">
        {article.title}
      </h3>
      <p className="mt-4 flex-1 text-sm text-muted-foreground line-clamp-3">
        {article.summary}
      </p>

      <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCityClick(article.cityCode)
          }}
          className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
        >
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          {article.cityName}
        </button>
        {article.deadline && days !== null ? (
          <DeadlineBadge days={days} />
        ) : (
          <span className="font-mono text-sm text-faint-foreground">
            {article.publishedAt}
          </span>
        )}
      </div>
    </div>
  )
}
