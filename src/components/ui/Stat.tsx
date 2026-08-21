interface StatProps {
  label: string
  value: string
  unit?: string
  inverse?: boolean
}

export default function Stat({ label, value, unit, inverse }: StatProps) {
  return (
    <div>
      <p
        className={`eyebrow mb-3 ${
          inverse ? "text-white/50" : "text-faint-foreground"
        }`}
      >
        {label}
      </p>
      <p className={`metric-value${inverse ? " metric-value--inverse" : ""}`}>
        {value}
        {unit && (
          <span className="metric-value__unit">
            {unit}
          </span>
        )}
      </p>
    </div>
  )
}
