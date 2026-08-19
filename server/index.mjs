/**
 * LocalPress 収集サービス（Render の Web Service として動かす）
 *
 *   POST /webhook/microcms  microCMS の Webhook 受け口。署名を検証して収集を開始する
 *   POST /collect           手動実行。Authorization: Bearer <COLLECT_TOKEN>
 *   GET  /healthz           死活確認
 *   GET  /                  稼働状況
 *
 * Render の無料プランは15分無通信で停止し、復帰に約1分かかる。
 * Webhook は待たせずに即 202 を返し、収集は裏で走らせる。
 */

import { createServer } from "node:http"
import { createHmac, timingSafeEqual } from "node:crypto"
import { runCollection } from "./collect.mjs"
import { webhookSecret, manualToken } from "./config.mjs"

const PORT = process.env.PORT || 10000

/** 直近の実行結果をメモリに保持する（再起動で消えるが状況確認には足りる） */
const state = { running: false, startedAt: null, last: null, history: [] }

const json = (res, status, body) => {
  const payload = JSON.stringify(body, null, 2)
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
  res.end(payload)
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on("data", (c) => {
      size += c.length
      if (size > 1_000_000) {
        reject(new Error("body too large"))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on("end", () => resolve(Buffer.concat(chunks)))
    req.on("error", reject)
  })

/** microCMS の X-MICROCMS-Signature は本文の HMAC-SHA256（16進） */
function verifySignature(raw, signature) {
  const secret = webhookSecret()
  if (!secret) return { ok: false, reason: "MICROCMS_WEBHOOK_SECRET が未設定です" }
  if (!signature) return { ok: false, reason: "署名ヘッダーがありません" }

  const expected = createHmac("sha256", secret).update(raw).digest("hex")
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "署名が一致しません" }
  }
  return { ok: true }
}

async function startCollection(trigger) {
  if (state.running) return { accepted: false, reason: "すでに実行中です" }

  state.running = true
  state.startedAt = new Date().toISOString()

  // 応答を待たせないため、意図的に待たずに走らせる
  runCollection()
    .then((result) => {
      state.last = { trigger, ...result }
    })
    .catch((e) => {
      state.last = { trigger, ok: false, error: e.message, finishedAt: new Date().toISOString() }
    })
    .finally(() => {
      state.running = false
      state.history.unshift(state.last)
      state.history = state.history.slice(0, 10)
      console.log("[collect]", JSON.stringify(state.last))
    })

  return { accepted: true }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === "GET" && url.pathname === "/healthz") {
    return json(res, 200, { ok: true })
  }

  if (req.method === "GET" && url.pathname === "/") {
    return json(res, 200, {
      service: "LocalPress collector",
      running: state.running,
      startedAt: state.startedAt,
      last: state.last,
    })
  }

  if (req.method === "POST" && url.pathname === "/webhook/microcms") {
    let raw
    try {
      raw = await readBody(req)
    } catch {
      return json(res, 400, { error: "リクエストの読み取りに失敗しました" })
    }

    const check = verifySignature(raw, req.headers["x-microcms-signature"])
    if (!check.ok) {
      console.warn("[webhook] 署名検証に失敗:", check.reason)
      return json(res, 401, { error: check.reason })
    }

    const started = await startCollection("microcms-webhook")
    return json(res, started.accepted ? 202 : 409, started)
  }

  if (req.method === "POST" && url.pathname === "/collect") {
    const token = manualToken()
    const auth = (req.headers.authorization || "").replace(/^Bearer\s+/i, "")
    if (!token || auth !== token) {
      return json(res, 401, { error: "COLLECT_TOKEN が一致しません" })
    }

    const started = await startCollection("manual")
    return json(res, started.accepted ? 202 : 409, started)
  }

  json(res, 404, { error: "not found" })
})

server.listen(PORT, () => {
  console.log(`LocalPress collector listening on ${PORT}`)
})
