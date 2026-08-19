/** 環境変数の読み取りと検証をひとまとめにする */

const required = (name) => {
  const v = process.env[name]
  if (!v) throw new Error(`環境変数 ${name} が未設定です`)
  return v.trim()
}

/** "localpress" / "localpress.microcms.io" / "https://..." のいずれでも受け付ける */
export const serviceId = () =>
  required("MICROCMS_SERVICE_DOMAIN")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.microcms\.io$/, "")

export const apiKey = () => required("MICROCMS_API_KEY")

/** microCMS の Webhook 設定で入れた「シークレット」。署名検証に使う */
export const webhookSecret = () => process.env.MICROCMS_WEBHOOK_SECRET?.trim() || ""

/**
 * これより古い記事は取り込まない（日数）。
 * 配信が止まったフィードに残る何年も前の記事でコンテンツ枠を消費しないため。
 * 0 を指定すると無制限。
 */
export const maxAgeDays = () => {
  const raw = Number(process.env.SKIP_OLDER_THAN_DAYS ?? 60)
  return Number.isFinite(raw) && raw >= 0 ? raw : 60
}

/** 手動実行 (POST /collect) を許可するトークン。未設定なら手動実行を無効にする */
export const manualToken = () => process.env.COLLECT_TOKEN?.trim() || ""

export const endpoint = (name) => `https://${serviceId()}.microcms.io/api/v1/${name}`

export const headers = (extra = {}) => ({ "X-MICROCMS-API-KEY": apiKey(), ...extra })
