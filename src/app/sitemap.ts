import type { MetadataRoute } from "next"

import { getGuys } from "@/lib/gallery"
import { publishedGuys } from "@/lib/guys"
import { site } from "@/lib/site"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guys = publishedGuys(await getGuys(), new Date())
  return [
    "",
    "/archive",
    "/submit",
    ...guys.map((guy) => `/guys/${guy.slug}`),
  ].map((path) => ({ url: `${site.url}${path}` }))
}
