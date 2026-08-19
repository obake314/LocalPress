/** 事業計画書「無料・有料の出し分け」を UI 上で明示するバッジ */
export type Plan = "無料" | "有料" | "法人" | "自治体"
const styles: Record<Plan, string> = {
  無料: "bg-primary-soft text-primary",
  有料: "bg-accent-soft text-accent-foreground",
  法人: "bg-ink-bg text-white",
  自治体: "bg-sage-soft text-sage",
}

interface PlanTagProps {
  plan: Plan
  className?: string
}

export default function PlanTag({ plan, className = "" }: PlanTagProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap px-2.5 py-1 font-mono text-eyebrow font-semibold tracking-wider ${styles[plan]} ${className}`}
    >
      {plan}
    </span>
  )
}
