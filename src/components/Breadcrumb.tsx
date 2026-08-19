interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** 濃色面の上に置く場合 */
  inverse?: boolean
}

export default function Breadcrumb({ items, inverse }: BreadcrumbProps) {
  return (
    <nav
      className={`flex flex-wrap items-center gap-2 py-4 text-sm ${
        inverse ? "text-white/60" : "text-muted-foreground"
      }`}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && (
            <span className={inverse ? "text-white/30" : "text-border-strong"}>
              ›
            </span>
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={`transition-colors ${
                inverse ? "hover:text-accent" : "hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ) : (
            <span className={inverse ? "text-white" : "text-foreground"}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
