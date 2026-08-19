import { ReactNode } from "react"

interface ContainerProps {
  children: ReactNode
  /** 記事本文など、読み物として幅を絞りたい場合 */
  narrow?: boolean
  className?: string
}

export default function Container({
  children,
  narrow,
  className = "",
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-6 md:px-10 ${
        narrow ? "max-w-3xl" : "max-w-page"
      } ${className}`}
    >
      {children}
    </div>
  )
}
