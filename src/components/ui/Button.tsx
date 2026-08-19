import { ReactNode } from "react"
type Variant = "primary" | "accent" | "outline" | "ghost" | "inverse"
type Size = "lg" | "md" | "sm"
interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  size?: Size
  href?: string
  className?: string
  full?: boolean
}

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
  outline:
    "border border-border-strong text-foreground hover:border-primary hover:text-primary bg-card",
  ghost: "text-muted-foreground hover:text-primary hover:bg-primary-soft",
  inverse: "bg-card text-primary hover:bg-accent-soft",
}

const sizes: Record<Size, string> = {
  lg: "text-lead px-8 py-4 gap-2.5",
  md: "text-sm px-6 py-3 gap-2",
  sm: "text-sm px-4 py-2 gap-1.5",
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  href,
  className = "",
  full,
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center font-semibold tracking-tight transition-colors duration-200 whitespace-nowrap ${variants[variant]} ${sizes[size]} ${
    full ? "w-full" : ""
  } ${className}`

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  )
}
