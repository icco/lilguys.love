import type { Metadata } from "next"
import Link from "next/link"

import { EmptyGallery, Gallery } from "@/components/Gallery"
import { getGuys } from "@/lib/gallery"
import { publishedGuys } from "@/lib/guys"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "The archive",
  description:
    "Every little friend, all in one place. Browse our collection of stuffed animals and real animals.",
  alternates: { canonical: "/archive" },
}

const filters = [
  { value: "all", label: "All lilguys" },
  { value: "stuffed", label: "Stuffed animals" },
  { value: "real", label: "Real animals" },
] as const

export default async function Archive({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string | string[] }>
}) {
  const { kind } = await searchParams
  const active = kind === "stuffed" || kind === "real" ? kind : "all"
  const guys = publishedGuys(await getGuys(), new Date())
  const visible = guys.filter((guy) => active === "all" || guy.kind === active)
  return (
    <main id="main" className="site-main">
      <header className="page-heading">
        <p className="eyebrow">Small friends, kept here with love</p>
        <h1>
          The archive<span className="rose">.</span>
        </h1>
        <p>Every lilguy has a place here. Take your time looking around.</p>
      </header>
      <div className="archive-toolbar">
        <nav className="filters" aria-label="Filter the archive">
          {filters.map((filter) => (
            <Link
              key={filter.value}
              href={
                filter.value === "all"
                  ? "/archive"
                  : `/archive?kind=${filter.value}`
              }
              aria-current={active === filter.value ? "page" : undefined}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
        <p className="result-count">
          {visible.length} {visible.length === 1 ? "lilguy" : "lilguys"}
        </p>
      </div>
      {visible.length ? (
        <Gallery guys={visible} />
      ) : guys.length ? (
        <div className="filtered-empty">
          <h2>
            No {active === "stuffed" ? "stuffed" : "real"} friends just yet.
          </h2>
          <p>There’s always room for one more.</p>
          <Link href="/archive" className="text-link">
            See all lilguys →
          </Link>
        </div>
      ) : (
        <EmptyGallery archive />
      )}
    </main>
  )
}
