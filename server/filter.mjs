/**
 * 収集した項目のうち、案件として価値の無いものを落とす。
 *
 * 自治体のRSSはページ更新をそのまま流すため、統計の定期公表や記者会見録、
 * クマの目撃情報、終わったイベントの報告などが大量に混ざる。
 * これらは「探して応募する」対象ではないので、収集の段階で除く。
 *
 * 判定はタイトルの語だけで行う簡易なもので、本文までは見ない。
 * 分野や締切の抽出（本文解析）は別工程で行う。
 */

/**
 * 常に除外する。すでに終わった事柄の報告なので、募集の告知と紛れることはない。
 * 「◯◯募集に係る審査結果について」のような、募集語を含むが結果報告のものを確実に落とす。
 */
const ALWAYS_EXCLUDE = [
  ["記者会見", /記者会見|定例会見|会見録/],
  // 合格発表。「◯◯採用試験 合格者の発表」を救済語で残さないため常に除外する
  ["合格発表", /合格者|合格発表|合格状況|内定者/],
  [
    "開催レポート",
    /開催しました|実施しました|開催レポート|開催報告|を行いました|終了しました|審査結果|選考結果|入札結果|落札結果|結果を公表|受賞作品|表彰式/,
  ],
]

/**
 * 原則として除外するが、募集や講座の告知であれば残す。
 * 「ツキノワグマ出没防止対策研修会」のような、警告語を含む催しの告知を救うため。
 */
const EXCLUDE_UNLESS_ANNOUNCEMENT = [
  ["統計・調査", /統計|人口動態|推計人口|月報|年報|速報値|排出量|検査結果|調査結果|実態調査|集計結果|世帯数|算定結果|交付税|配分結果/],
  [
    "警告・注意",
    /クマ|ツキノワグマ|出没|注意喚起|ご注意ください|注意してください|お気をつけください|気象警報|気象注意報|警報を発表|避難情報|熱中症|不審者|サギ|詐欺|食中毒|感染|海外へ旅行|海外渡航|渡航される/,
  ],
  ["レシピ", /レシピ|作り方|献立|クッキング/],
  // 「入札参加資格者名簿」「審議会委員を公募」まで巻き込まないよう語を絞る
  ["名簿・議事", /議員名簿|議会だより|議事録|会議録|会議結果/],
  // 各種会議体の常設ページや開催案内。委員の公募は救済語で残る
  ["審議会・委員会", /審議会|協議会|委員会|懇談会|検討会|連絡会|部会/],
  ["資料開示", /情報公開|公文書|開示請求|会議資料|配布資料|議事概要/],
  // 診療体制や年末年始・お盆の運用案内。案件ではなく生活の案内
  ["診療・窓口体制", /診療体制|休日診療|当番医|夜間診療|外来診療|休診|お盆期間中の|年末年始の/],
  // 防災・災害の速報。「消防職員採用試験」「消防学校の見積案件」まで
  // 巻き込まないよう、災害|消防 のような広い語は使わない
  [
    "防災情報",
    /災害警戒本部|避難指示|避難勧告|避難準備|警戒レベル|火災速報|義援金|被災された方|防災情報|土砂災害|洪水調節|事後対策|Jアラート|一斉情報伝達/,
  ],
]

/**
 * URL で判別する除外。特定の階層にまとまって置かれている読み物は
 * タイトルに手がかりが無いことがある（料理名だけのレシピなど）。
 */
const EXCLUDE_URL = [
  // 岩手県 県北広域振興局 水産部のレシピ集
  ["レシピ", /^https:\/\/www\.pref\.iwate\.jp\/kenpoku\/suisan\/1085518\/1085799\//],
]

/** 募集・告知と判断する語 */
const ANNOUNCEMENT = /募集|公募|受講生|参加者|申込|申請受付|講座|講習|セミナー|研修会|教室|説明会|採用試験|入札|見積|プロポーザル/

/**
 * @param {{ title?: string, url?: string } | string} item タイトル文字列でも可
 * @returns {{ excluded: boolean, reason?: string, matched?: string }}
 */
export function classifyItem(item) {
  const { title, url } = typeof item === "string" ? { title: item, url: "" } : (item ?? {})
  const t = String(title ?? "")
  const u = String(url ?? "")

  for (const [reason, pattern] of EXCLUDE_URL) {
    if (pattern.test(u)) return { excluded: true, reason, matched: "URL" }
  }

  for (const [reason, pattern] of ALWAYS_EXCLUDE) {
    const m = pattern.exec(t)
    if (m) return { excluded: true, reason, matched: m[0] }
  }

  for (const [reason, pattern] of EXCLUDE_UNLESS_ANNOUNCEMENT) {
    const m = pattern.exec(t)
    if (!m) continue
    if (ANNOUNCEMENT.test(t)) return { excluded: false }
    return { excluded: true, reason, matched: m[0] }
  }

  return { excluded: false }
}

/** 後方互換：タイトルだけで判定する */
export const classifyTitle = (title) => classifyItem(title)
