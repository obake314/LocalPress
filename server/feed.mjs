/** RSS / Atom の解析。依存を増やさないため正規表現で読む */

export function decodeBody(buf, contentType) {
  const head = buf.subarray(0, 2000).toString("latin1")
  const m =
    /charset=["']?([\w-]+)/i.exec(contentType) ||
    /encoding=["']([\w-]+)/i.exec(head) ||
    /charset=["']?([\w-]+)/i.exec(head)
  let enc = (m?.[1] || "utf-8").toLowerCase()
  if (["sjis", "x-sjis"].includes(enc)) enc = "shift_jis"
  try {
    return new TextDecoder(enc).decode(buf)
  } catch {
    return buf.toString("utf8")
  }
}

const clean = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()

const tag = (block, name) => {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i").exec(block)
  return m ? clean(m[1]) : ""
}

const link = (block) => {
  const plain = tag(block, "link")
  if (plain) return plain
  const m = /<link[^>]*href=["']([^"']+)["']/i.exec(block)
  return m ? m[1] : ""
}

/** 日付を日本時間の YYYY-MM-DD に落とす */
export const toJstDate = (raw) => {
  if (!raw) return null
  const t = Date.parse(raw)
  if (Number.isNaN(t)) return null
  return new Date(t + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function parseFeed(xml) {
  const blocks = xml.match(/<(?:item|entry)[\s>][\s\S]*?<\/(?:item|entry)>/gi) || []
  return blocks
    .map((b) => ({
      title: tag(b, "title"),
      url: link(b),
      date:
        toJstDate(tag(b, "pubDate")) ??
        toJstDate(tag(b, "dc:date")) ??
        toJstDate(tag(b, "updated")) ??
        toJstDate(tag(b, "published")),
      summary: tag(b, "description") || tag(b, "summary"),
    }))
    .filter((i) => i.title && i.url)
}
