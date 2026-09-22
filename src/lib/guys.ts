export const kinds = {
  stuffed: "Stuffed animal",
  real: "Real animal",
} as const

export type Kind = keyof typeof kinds

export interface Guy {
  slug: string
  name: string
  kind: Kind
  image: string
  alt: string
  caption?: string
  publishedOn: string
  credit?: { name: string; url?: string }
}

export interface PhotoGuy extends Guy {
  width: number
  height: number
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function text(value: unknown, field: string, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    throw new Error(`${field} must be nonempty text, at most ${max} characters`)
  }
  return value.trim()
}

export function parseGuy(slug: string, value: unknown): Guy {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Filename must be a lowercase, hyphen-separated slug")
  }
  if (!record(value)) throw new Error("Entry must be a JSON object")
  const allowed = [
    "name",
    "kind",
    "image",
    "alt",
    "caption",
    "publishedOn",
    "credit",
  ]
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`Unknown field: ${key}`)
  }
  if (value.kind !== "stuffed" && value.kind !== "real") {
    throw new Error('kind must be "stuffed" or "real"')
  }
  const publishedOn = text(value.publishedOn, "publishedOn", 10)
  const date = new Date(`${publishedOn}T00:00:00Z`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(publishedOn) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== publishedOn
  ) {
    throw new Error(
      "publishedOn must be a real calendar date in YYYY-MM-DD format"
    )
  }
  const image = text(value.image, "image", 200)
  if (
    !/^\/guys\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|jpeg|png|webp|avif)$/.test(
      image
    )
  ) {
    throw new Error(
      "image must point to a JPG, PNG, WebP, or AVIF directly under /guys/"
    )
  }
  let credit: Guy["credit"]
  if (value.credit !== undefined) {
    if (!record(value.credit)) throw new Error("credit must be an object")
    for (const key of Object.keys(value.credit)) {
      if (key !== "name" && key !== "url")
        throw new Error(`Unknown credit field: ${key}`)
    }
    credit = { name: text(value.credit.name, "credit.name", 120) }
    if (value.credit.url !== undefined) {
      const url = text(value.credit.url, "credit.url", 2000)
      const parsed = new URL(url)
      if (
        !["https:", "http:"].includes(parsed.protocol) ||
        parsed.username ||
        parsed.password
      ) {
        throw new Error(
          "credit.url must be a public HTTP(S) URL without credentials"
        )
      }
      credit.url = url
    }
  }
  return {
    slug,
    name: text(value.name, "name", 120),
    kind: value.kind,
    image,
    alt: text(value.alt, "alt", 500),
    publishedOn,
    ...(value.caption !== undefined
      ? { caption: text(value.caption, "caption", 1000) }
      : {}),
    ...(credit ? { credit } : {}),
  }
}

export function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10)
}

export function publishedGuys<T extends Guy>(
  guys: readonly T[],
  now: Date
): T[] {
  const today = utcDay(now)
  return guys
    .filter((guy) => guy.publishedOn <= today)
    .sort(
      (a, b) =>
        b.publishedOn.localeCompare(a.publishedOn) ||
        a.slug.localeCompare(b.slug)
    )
}

export function guyOfTheDay<T extends Guy>(
  guys: readonly T[],
  now: Date
): T | undefined {
  const eligible = publishedGuys(guys, now).sort((a, b) =>
    a.slug.localeCompare(b.slug)
  )
  if (!eligible.length) return undefined
  const day = Math.floor(now.getTime() / 86_400_000)
  return eligible[((day % eligible.length) + eligible.length) % eligible.length]
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}
