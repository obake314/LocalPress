import { useState, useEffect } from "react"
import { Page, NavParams } from "./types/nav"
import { pathFor, parsePath } from "./lib/routes"
import Header from "./components/Header"
import Footer from "./components/Footer"
import TopPage from "./pages/TopPage"
import SearchPage from "./pages/SearchPage"
import CityPage from "./pages/CityPage"
import ArticlePage from "./pages/ArticlePage"
import PricingPage from "./pages/PricingPage"
import EventsPage from "./pages/EventsPage"
import GrantsPage from "./pages/GrantsPage"
import BidPage from "./pages/BidPage"
import IntroPage from "./pages/IntroPage"
import MyPage from "./pages/MyPage"

interface NavState {
  page: Page
  params: NavParams
}

const initialState = (): NavState => {
  if (typeof window === "undefined") return { page: "top", params: {} }
  return parsePath(window.location.pathname, window.location.search)
}

export default function App() {
  const [nav, setNav] = useState<NavState>(initialState)

  // ブラウザの戻る／進むに追従する
  useEffect(() => {
    const onPop = () =>
      setNav(parsePath(window.location.pathname, window.location.search))
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const navigate = (page: Page, params: NavParams = {}) => {
    setNav({ page, params })
    try {
      window.history.pushState({}, "", pathFor(page, params))
    } catch {
      // プレビュー環境などで pushState が使えない場合は状態遷移のみ行う
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearch = (query: string) =>
    navigate("search", query ? { q: query } : {})

  const renderPage = () => {
    switch (nav.page) {
      case "search":
        return (
          <SearchPage
            key={`${nav.params.q ?? ""}|${nav.params.category ?? ""}|${nav.params.prefecture ?? ""}`}
            initialQuery={nav.params.q || ""}
            initialCategory={nav.params.category || ""}
            initialPrefecture={nav.params.prefecture || ""}
            onNavigate={navigate}
          />
        )
      case "city":
        return (
          <CityPage cityCode={nav.params.code || ""} onNavigate={navigate} />
        )
      case "article":
        return (
          <ArticlePage articleId={nav.params.id || ""} onNavigate={navigate} />
        )
      case "pricing":
        return <PricingPage onNavigate={navigate} />
      case "events":
        return (
          <EventsPage
            key={nav.params.code ?? ""}
            cityCode={nav.params.code}
            onNavigate={navigate}
          />
        )
      case "grants":
        return <GrantsPage grantId={nav.params.id} onNavigate={navigate} />
      case "bid":
        return <BidPage bidId={nav.params.id} onNavigate={navigate} />
      case "for-business":
        return <IntroPage audience="business" onNavigate={navigate} />
      case "for-gov":
        return <IntroPage audience="gov" onNavigate={navigate} />
      case "mypage":
        return <MyPage onNavigate={navigate} />
      case "top":
      default:
        return <TopPage onNavigate={navigate} />
    }
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Header onNavigate={navigate} onSearch={handleSearch} />
      <main className="flex flex-1 flex-col">{renderPage()}</main>
      <Footer onNavigate={navigate} />
    </div>
  )
}
