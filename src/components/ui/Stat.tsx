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
      <p
        className={`font-mono text-h1 font-bold tracking-tight ${
          inverse ? "text-white" : "text-foreground"
        }`}
      >
        {value}
        {unit && (
          <span
            className={`ml-2 text-lead font-normal ${
              inverse ? "text-white/60" : "text-muted-foreground"
            }`}
          >
            {unit}
          </span>
        )}
      </p>
    </div>
  )
}
