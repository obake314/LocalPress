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
  [
    "開催レポート",
    /開催しました|実施しました|開催レポート|開催報告|を行いました|終了しました|審査結果|選考結果|結果を公表|受賞作品|表彰式/,
  ],
]

/**
 * 原則として除外するが、募集や講座の告知であれば残す。
 * 「ツキノワグマ出没防止対策研修会」のような、警告語を含む催しの告知を救うため。
 */
const EXCLUDE_UNLESS_ANNOUNCEMENT = [
  ["統計・調査", /統計|人口動態|推計人口|月報|年報|速報値|排出量|検査結果|調査結果|実態調査|集計結果|世帯数/],
  [
    "警告・注意",
    /クマ|ツキノワグマ|出没|注意喚起|気象警報|気象注意報|警報を発表|避難情報|熱中症|不審者|食中毒|感染症|停電|断水/,
  ],
  ["レシピ", /レシピ|作り方|献立|クッキング|料理教室以外/],
]

/** 募集・告知と判断する語 */
const ANNOUNCEMENT = /募集|受講生|参加者|申込|申請受付|講座|セミナー|研修会|教室|説明会/

/**
 * @param {string} title
 * @returns {{ excluded: boolean, reason?: string, matched?: string }}
 */
export function classifyTitle(title) {
  const t = String(title ?? "")

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
