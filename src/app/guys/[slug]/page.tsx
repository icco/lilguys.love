import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Credit, GuyPhoto } from "@/components/Gallery"
import { getGuys } from "@/lib/gallery"
import { formatDate, kinds, publishedGuys } from "@/lib/guys"

export const dynamic = "force-dynamic"
type Props = { params: Promise<{ slug: string }> }

async function getGuy(slug: string) {
  const guy = publishedGuys(await getGuys(), new Date()).find(
    (entry) => entry.slug === slug
  )
  if (!guy) notFound()
  return guy
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guy = await getGuy((await params).slug)
  const description = guy.caption || guy.alt
  const images = [
    { url: guy.image, width: guy.width, height: guy.height, alt: guy.alt },
  ]
  return {
    title: guy.name,
    description,
    alternates: { canonical: `/guys/${guy.slug}` },
    openGraph: {
      title: guy.name,
      description,
      url: `/guys/${guy.slug}`,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: guy.name,
      description,
      images: [guy.image],
    },
  }
}

export default async function GuyPage({ params }: Props) {
  const guy = await getGuy((await params).slug)
  return (
    <main id="main" className="site-main detail-page">
      <Link href="/archive" className="text-link back-link">
        ← Back to the archive
      </Link>
      <header className="page-heading">
        <p className="eyebrow">{kinds[guy.kind]}</p>
        <h1>
          {guy.name}
          <span className="rose">.</span>
        </h1>
      </header>
      <figure className="featured-guy">
        <GuyPhoto guy={guy} priority />
        <figcaption className="detail-caption">
          {guy.caption && <p className="caption">{guy.caption}</p>}
          <Credit guy={guy} />
          <p className="added-date">
            Joined the collection{" "}
            <time dateTime={guy.publishedOn}>
              {formatDate(guy.publishedOn)}
            </time>
          </p>
        </figcaption>
      </figure>
      <div className="detail-end">
        <span className="rose" aria-hidden="true">
          ♡
        </span>
        <p>A little friend. A little brighter day.</p>
        <Link href="/archive" className="text-link">
          Meet more lilguys →
        </Link>
      </div>
    </main>
  )
}
