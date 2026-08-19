import {
  Category,
  Status,
  categoryColors,
  statusColors,
} from "../data/content"
type Size = "sm" | "xs"
const sizeCls: Record<Size, string> = {
  xs: "text-eyebrow px-2 py-0.5",
  sm: "text-sm px-3 py-1",
}

interface CategoryBadgeProps {
  category: Category
  size?: Size
}

export function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  const { bg, text, bar } = categoryColors[category]
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${bg} ${text} ${sizeCls[size]}`}
    >
      <span className={`h-2.5 w-0.5 ${bar}`} />
      {category}
    </span>
  )
}

interface StatusBadgeProps {
  status: Status
  size?: Size
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const { bg, text } = statusColors[status]
  const dot = status === "募集中" || status === "締切間近"
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${bg} ${text} ${sizeCls[size]}`}
    >
      {dot && <span className="h-1.5 w-1.5 bg-current" />}
      {status}
    </span>
  )
}

interface DeadlineBadgeProps {
  days: number
  /** 締切間近を大きく見せたい箇所（トップの「締切間近」など）で使う */
  emphasis?: boolean
}

export function DeadlineBadge({ days, emphasis }: DeadlineBadgeProps) {
  if (days < 0) {
    return (
      <span className="font-mono text-sm text-faint-foreground">締切済</span>
    )
  }

  const base = emphasis
    ? "font-mono text-h3 font-bold tracking-tight"
    : "inline-flex items-center px-2.5 py-1 font-mono text-sm font-semibold"

  if (days === 0) {
    return (
      <span
        className={`${base} ${
          emphasis ? "text-alert" : "bg-alert-soft text-alert"
        }`}
      >
        本日締切
      </span>
    )
  }

  if (days <= 7) {
    return (
      <span
        className={`${base} ${
          emphasis ? "text-alert" : "bg-alert-soft text-alert"
        }`}
      >
        残{days}日
      </span>
    )
  }

  return (
    <span
      className={
        emphasis
          ? "font-mono text-h3 font-bold tracking-tight text-primary"
          : "font-mono text-sm text-muted-foreground"
      }
    >
      残{days}日
    </span>
  )
}
