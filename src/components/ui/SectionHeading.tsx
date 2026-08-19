interface SectionHeadingProps {
  eyebrow?: string
  title: string
  lead?: string
  actionLabel?: string
  onAction?: () => void
  align?: "left" | "center"
  /** 濃色面の上に置く場合 */
  inverse?: boolean
}

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  actionLabel,
  onAction,
  align = "left",
  inverse,
}: SectionHeadingProps) {
  const centered = align === "center"

  return (
    <div
      className={`mb-12 flex flex-col gap-6 md:mb-16 ${
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p
            className={`eyebrow mb-4 ${
              inverse ? "text-accent" : "text-primary"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h2 className={`text-h2 ${inverse ? "text-white" : "text-foreground"}`}>
          {title}
        </h2>
        {lead && (
          <p
            className={`mt-5 text-lead ${
              inverse ? "text-white/70" : "text-muted-foreground"
            }`}
          >
            {lead}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`group inline-flex shrink-0 items-center gap-2 text-sm font-semibold transition-colors ${
            inverse
              ? "text-accent hover:text-white"
              : "text-primary hover:text-primary-hover"
          }`}
        >
          {actionLabel}
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </button>
      )}
    </div>
  )
}
