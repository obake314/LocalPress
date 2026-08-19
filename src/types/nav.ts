/** 全ページ共通のナビゲーション型。以前は各ファイルに同じ union が複製されていた。 */
export type Page = "top" | "search" | "city" | "article" | "pricing" | "events" | "grants" | "bid" | "for-business" | "for-gov" | "mypage"

export type NavParams = Record<string, string>

export type Navigate = (page: Page, params?: NavParams) => void

export interface NavProps {
  onNavigate: Navigate
}
