/**
 * アプリが参照するコンテンツの入り口。
 *
 * microCMS から取り込み済み（pnpm content:pull）ならそのデータを、
 * まだ取り込んでいなければ mockData.ts のサンプルを返す。
 * 画面側はこのファイルだけを見ればよく、供給元を意識しなくてよい。
 */

import {
  articles as mockArticles,
  municipalities as mockMunicipalities,
  statusByDeadline,
} from "./mockData"
import { generatedArticles, generatedMunicipalities } from "./content.generated"

export type {
  Category,
  Status,
  Target,
  Municipality,
  Article,
} from "./mockData"
export {
  categoryColors,
  statusColors,
  daysUntilDeadline,
  todayJst,
  statusByDeadline,
  getRevisions,
} from "./mockData"
export type { Revision } from "./mockData"

/** 表示中のデータがどこから来ているか（運用画面や開発時の確認用） */
export const contentSource: "microCMS" | "mock" =
  generatedArticles.length > 0 || generatedMunicipalities.length > 0
    ? "microCMS"
    : "mock"

export const municipalities =
  generatedMunicipalities.length > 0
    ? generatedMunicipalities
    : mockMunicipalities

/**
 * 状態は締切と突き合わせて直したうえで渡す。
 * 画面側はここを通ったものだけを見るので、締切切れが「募集中」のまま残らない。
 */
export const articles = (
  generatedArticles.length > 0 ? generatedArticles : mockArticles
).map((a) => {
  const status = statusByDeadline(a.status, a.deadline)
  return status === a.status ? a : { ...a, status }
})

export const getCityByCode = (code: string) =>
  municipalities.find((m) => m.code === code)

export const getArticlesByCity = (code: string) =>
  articles.filter((a) => a.cityCode === code)

export const getArticleById = (id: string) => articles.find((a) => a.id === id)
