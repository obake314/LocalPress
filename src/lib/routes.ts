import { Page, NavParams } from "../types/nav"

/**
 * 事業計画書「URL設計」に対応するパス変換。
 * ルータ依存を増やさず history API だけで同期する。
 */

export function pathFor(page: Page, params: NavParams = {}): string {
  switch (page) {
    case "top":
      return "/"
    case "search": {
      const qs = new URLSearchParams()
      if (params.q) qs.set("q", params.q)
      if (params.prefecture) qs.set("pref", params.prefecture)
      if (params.category) qs.set("cat", params.category)
      const s = qs.toString()
      return s ? `/search?${s}` : "/search"
    }
    case "events":
      return params.code ? `/events/${params.code}` : "/events"
    case "grants":
      return params.id ? `/grants/${params.id}` : "/grants"
    case "bid":
      return params.id ? `/bid/${params.id}` : "/bid"
    case "city":
      return `/city/${params.code ?? ""}`
    case "article":
      return `/articles/${params.id ?? ""}`
    case "pricing":
      return "/pricing"
    case "for-business":
      return "/for-business"
    case "for-gov":
      return "/for-gov"
    case "mypage":
      return "/mypage"
    default:
      return "/"
  }
}

export function parsePath(
  pathname: string,
  search: string,
): { page: Page; params: NavParams } {
  const segments = pathname.split("/").filter(Boolean)
  const qs = new URLSearchParams(search)

  const [head, tail] = segments

  switch (head) {
    case undefined:
      return { page: "top", params: {} }
    case "search": {
      const params: NavParams = {}
      const q = qs.get("q")
      const pref = qs.get("pref")
      const cat = qs.get("cat")
      if (q) params.q = q
      if (pref) params.prefecture = pref
      if (cat) params.category = cat
      return { page: "search", params }
    }
    case "events":
      return { page: "events", params: tail ? { code: tail } : {} }
    case "grants":
      return { page: "grants", params: tail ? { id: tail } : {} }
    case "bid":
      return { page: "bid", params: tail ? { id: tail } : {} }
    case "city":
      return { page: "city", params: tail ? { code: tail } : {} }
    case "articles":
      return { page: "article", params: tail ? { id: tail } : {} }
    case "pricing":
      return { page: "pricing", params: {} }
    case "for-business":
      return { page: "for-business", params: {} }
    case "for-gov":
      return { page: "for-gov", params: {} }
    case "mypage":
      return { page: "mypage", params: {} }
    default:
      // 未知のパスはトップにフォールバックする（プレビュー環境で直リンクが解決できない場合に備える）
      return { page: "top", params: {} }
  }
}
