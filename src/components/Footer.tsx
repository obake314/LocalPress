import { Page, Navigate } from "../types/nav"
import Container from "./ui/Container"
interface FooterProps {
  onNavigate: Navigate
}

const regionMap: Record<string, string[]> = {
  北海道・東北: [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
  ],
  関東・甲信越: [
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "山梨県",
    "長野県",
  ],
  東海・北陸: [
    "静岡県",
    "愛知県",
    "岐阜県",
    "三重県",
    "富山県",
    "石川県",
    "福井県",
  ],
  近畿: ["滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  中国・四国: [
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
  ],
  九州・沖縄: [
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ],
}

const columns: { heading: string; items: { label: string; page?: Page }[] }[] = [
  {
    heading: "分野から探す",
    items: [
      { label: "イベント・生活", page: "events" },
      { label: "補助金・助成", page: "grants" },
      { label: "入札・公募", page: "bid" },
      { label: "統合検索", page: "search" },
    ],
  },
  {
    heading: "ご利用のご案内",
    items: [
      { label: "事業者向け紹介", page: "for-business" },
      { label: "自治体・調査機関向け", page: "for-gov" },
      { label: "料金・プラン", page: "pricing" },
    ],
  },
  {
    heading: "アカウント",
    items: [
      { label: "ログイン", page: "mypage" },
      { label: "マイページ", page: "mypage" },
      { label: "保存条件・通知設定", page: "mypage" },
      { label: "ご請求について", page: "pricing" },
    ],
  },
  {
    heading: "会社情報",
    items: [
      { label: "会社概要" },
      { label: "利用規約" },
      { label: "プライバシーポリシー" },
      { label: "お問い合わせ" },
    ],
  },
]

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <>
      {/* 参考サイトの「ご参画・お問い合わせ」バンドを踏襲 */}
      <section className="bg-ink-bg-2 py-8 md:py-10">
        <Container>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-white/80 md:text-body">
              LocalPress
              への掲載・データ提供のご相談、法人プランのお申し込みは、こちらからお問い合わせください。
            </p>
            <div className="flex shrink-0 flex-wrap gap-3">
              <button
                onClick={() => onNavigate("for-business")}
                className="border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-accent hover:text-accent"
              >
                企業・自治体のご担当者はこちら
              </button>
              <button
                onClick={() => onNavigate("pricing")}
                className="bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                お問い合わせ
              </button>
            </div>
          </div>
        </Container>
      </section>

      <footer className="bg-ink-bg text-white/60">
        <Container>
          <div className="py-10 md:py-12">
            {/* Link columns */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-x-8">
              {columns.map(({ heading, items }) => (
                <div key={heading}>
                  <p className="eyebrow mb-3 text-accent">{heading}</p>
                  <ul className="space-y-1.5">
                    {items.map(({ label, page }) => (
                      <li key={label}>
                        {page ? (
                          <button
                            onClick={() => onNavigate(page)}
                            className="text-sm text-white/70 transition-colors hover:text-white"
                          >
                            {label}
                          </button>
                        ) : (
                          <span className="cursor-default text-sm text-white/40">
                            {label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Prefectures are kept inline to avoid making the footer unnecessarily tall. */}
            <div className="hairline mt-9 border-t pt-7 md:mt-10 md:pt-8">
              <p className="eyebrow mb-5 text-white/40">
                LocalPress は全国へ順次拡大していきます
              </p>
              <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(regionMap).map(([region, prefs]) => (
                  <div
                    key={region}
                    className="grid grid-cols-[7.5rem_1fr] gap-2 sm:block"
                  >
                    <p className="text-sm font-semibold text-white sm:mb-1.5">
                      {region}
                    </p>
                    <ul className="flex flex-wrap gap-x-3 gap-y-0.5 leading-snug">
                      {prefs.map((pref) => (
                        <li key={pref}>
                          <button
                            onClick={() =>
                              onNavigate("search", { prefecture: pref })
                            }
                            className={`text-xs transition-colors hover:text-white ${
                              pref === "岩手県"
                                ? "text-accent"
                                : "text-white/50"
                            }`}
                          >
                            {pref}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="hairline mt-8 flex flex-col items-start justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center">
              <button
                onClick={() => onNavigate("top")}
                className="flex items-center gap-3 transition-opacity hover:opacity-70"
              >
                <span className="flex h-8 w-8 items-center justify-center bg-white/10">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 2c1.1 0 2.1.25 3 .68V10h-3V4zm-1 0v6H6.07A6.01 6.01 0 019 4zm-3.93 7H9v5.93A6.01 6.01 0 015.07 11zm5.93 5.93V11h3.93A6.01 6.01 0 0111 16.93z" />
                  </svg>
                </span>
                <span className="text-body font-semibold tracking-tight text-white">
                  LocalPress
                </span>
              </button>
              <p className="font-mono text-eyebrow text-white/35">
                © 2026 LocalPress — 全国自治体情報プラットフォーム
              </p>
            </div>
          </div>
        </Container>
      </footer>
    </>
  )
}
