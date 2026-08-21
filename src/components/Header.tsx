import { useState, useEffect } from "react"
import { Page, Navigate } from "../types/nav"
import Container from "./ui/Container"
import Button from "./ui/Button"
import PlanTag from "./ui/PlanTag"
import { PAID_FEATURES } from "../lib/features"
interface HeaderProps {
  onNavigate: Navigate
  onSearch: (query: string) => void
}

const navLinks: { label: string; page: Page; plan?: "無料" | "有料" }[] = [
  { label: "イベント・生活", page: "events", plan: "無料" },
  { label: "補助金・助成", page: "grants", plan: "無料" },
  { label: "入札・公募", page: "bid", plan: "有料" },
  { label: "料金・プラン", page: "pricing" },
]

const drawerExtra: { label: string; page: Page }[] = [
  { label: "事業者向け", page: "for-business" },
  { label: "自治体・調査機関向け", page: "for-gov" },
  { label: "マイページ", page: "mypage" },
]

export default function Header({ onNavigate, onSearch }: HeaderProps) {
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
    setMenuOpen(false)
  }

  const go = (page: Page) => {
    onNavigate(page)
    setMenuOpen(false)
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-card/95 backdrop-blur transition-shadow duration-200 ${
        scrolled
          ? "border-border shadow-[0_1px_24px_rgba(20,38,29,0.07)]"
          : "border-transparent"
      }`}
    >
      <Container>
        <div className="flex h-20 items-center gap-6 xl:gap-10">
          {/* Logo */}
          <button
            onClick={() => go("top")}
            className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-70"
          >
            <span className="flex h-9 w-9 items-center justify-center bg-primary">
              <svg
                className="h-5 w-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 2c1.1 0 2.1.25 3 .68V10h-3V4zm-1 0v6H6.07A6.01 6.01 0 019 4zm-3.93 7H9v5.93A6.01 6.01 0 015.07 11zm5.93 5.93V11h3.93A6.01 6.01 0 0111 16.93z" />
              </svg>
            </span>
            <span className="text-h3 font-semibold tracking-tight text-foreground">
              LocalPress
            </span>
          </button>

          {/* Nav — desktop */}
          <nav className="hidden flex-1 items-center justify-between gap-1 lg:flex">
            {navLinks.map(({ label, page, plan }) => (
              <button
                key={label}
                onClick={() => go(page)}
                className="group flex items-center whitespace-nowrap px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary xl:px-4"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="ml-auto flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="自治体情報を検索"
                  className="h-11 w-44 border border-border bg-background pl-11 pr-4 text-sm text-foreground transition-colors placeholder:text-faint-foreground focus:border-primary focus:bg-card focus:outline-none lg:w-40 xl:w-64"
                />
              </div>
            </form>

            <button
              onClick={() => go("mypage")}
              className="hidden whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-primary lg:block"
            >
              ログイン
            </button>

            <Button
              onClick={() => go("search")}
              size="sm"
              className="hidden sm:inline-flex"
            >
              無料ではじめる
            </Button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="メニュー"
              className="p-2 text-foreground transition-colors hover:bg-primary-soft lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d={
                    menuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 7h16M4 12h16M4 17h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {/* Drawer — mobile */}
      {menuOpen && (
        <div className="border-t border-border bg-card lg:hidden">
          <Container>
            <div className="flex flex-col py-6">
              <form onSubmit={handleSearch} className="mb-6 md:hidden">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="自治体情報を検索"
                  className="h-12 w-full border border-border bg-background px-4 text-body text-foreground placeholder:text-faint-foreground focus:border-primary focus:outline-none"
                />
              </form>

              {navLinks.map(({ label, page, plan }) => (
                <button
                  key={label}
                  onClick={() => go(page)}
                  className="flex items-center justify-between border-b border-border py-4 text-left text-lead font-medium text-foreground"
                >
                  {label}
                  {PAID_FEATURES && plan && <PlanTag plan={plan} />}
                </button>
              ))}

              {drawerExtra.map(({ label, page }) => (
                <button
                  key={label}
                  onClick={() => go(page)}
                  className="border-b border-border py-4 text-left text-sm text-muted-foreground last:border-0"
                >
                  {label}
                </button>
              ))}
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
