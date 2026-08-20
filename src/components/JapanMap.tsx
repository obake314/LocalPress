import { useState } from "react"
import { Navigate } from "../types/nav"
import {
  JAPAN_VIEWBOX,
  JAPAN_MAIN_PATH,
  JAPAN_OKINAWA_PATH,
  OKINAWA_INSET,
  PREFECTURE_POINTS,
} from "../data/japanGeo"

/** 収集対象の都道府県（順次拡大） */
const ACTIVE_PREFS = ["岩手県"]

interface JapanMapProps {
  onNavigate: Navigate
  /** すべての都道府県名を常に表示する */
  showAllLabels?: boolean
}

export default function JapanMap({ onNavigate, showAllLabels }: JapanMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  const land = {
    fill: "var(--color-sage-soft)",
    stroke: "var(--color-sage)",
    strokeWidth: 0.9,
    strokeLinejoin: "round" as const,
  }

  return (
    <svg
      viewBox={JAPAN_VIEWBOX}
      className="h-full w-full"
      role="img"
      aria-label="日本地図。都道府県を選ぶとその地域の情報を検索します。"
    >
      {/* 本土 */}
      <path d={JAPAN_MAIN_PATH} {...land} />

      {/* 沖縄（南西諸島）は慣例に従い左下の別枠に配置 */}
      <rect
        x={OKINAWA_INSET.x}
        y={OKINAWA_INSET.y}
        width={OKINAWA_INSET.w}
        height={OKINAWA_INSET.h}
        fill="none"
        stroke="var(--color-border-strong)"
        strokeWidth="1"
      />
      <path d={JAPAN_OKINAWA_PATH} {...land} />

      {PREFECTURE_POINTS.map(({ pref, label, x, y }) => {
        const active = ACTIVE_PREFS.includes(pref)
        const isHovered = hovered === pref
        const showLabel = active || isHovered || showAllLabels

        return (
          <g
            key={pref}
            onClick={() => onNavigate("search", { prefecture: pref })}
            onMouseEnter={() => setHovered(pref)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
          >
            {/* 当たり判定を広げる透明な円 */}
            <circle cx={x} cy={y} r="11" fill="transparent" />

            {active && (
              <circle
                cx={x}
                cy={y}
                r="12"
                fill="var(--color-accent)"
                opacity={isHovered ? 0.45 : 0.28}
              />
            )}

            <circle
              cx={x}
              cy={y}
              r={active ? 5.5 : 3.5}
              fill={active ? "var(--color-primary)" : "var(--color-sage)"}
              fillOpacity={active || isHovered ? 1 : 0.5}
            />

            {showLabel && (
              <text
                x={x + 10}
                y={y + 4}
                fontSize={active ? 16 : 13}
                fontWeight={active ? 700 : 500}
                fill={active ? "var(--color-primary)" : "var(--color-foreground)"}
                style={{ pointerEvents: "none" }}
              >
                {label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
