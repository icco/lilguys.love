import type { Metadata } from "next"
import Link from "next/link"

import { Credit, EmptyGallery, Gallery, GuyPhoto } from "@/components/Gallery"
import { getGuys } from "@/lib/gallery"
import {
  formatDate,
  guyOfTheDay,
  kinds,
  publishedGuys,
  utcDay,
} from "@/lib/guys"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { alternates: { canonical: "/" } }

export default async function Home() {
  const now = new Date()
  const guys = await getGuys()
  const today = guyOfTheDay(guys, now)
  const recent = publishedGuys(guys, now)
    .filter((guy) => guy.slug !== today?.slug)
    .slice(0, 4)
  return (
    <main id="main" className="site-main">
      <header className="page-heading home-heading">
        <div>
          <p className="eyebrow">A daily dose of small & lovely</p>
          <h1>
            Today’s lilguy<span className="rose">.</span>
          </h1>
        </div>
        <div className="date-label">
          <time dateTime={utcDay(now)}>{formatDate(utcDay(now))}</time>
          <span>A new day at midnight UTC</span>
        </div>
      </header>
      {today ? (
        <section aria-label="Lilguy of the day">
          <figure className="featured-guy">
            <Link
              href={`/guys/${today.slug}`}
              aria-label={`Meet ${today.name}`}
            >
              <GuyPhoto guy={today} priority />
            </Link>
            <figcaption className="feature-caption">
              <div>
                <p className="eyebrow">{kinds[today.kind]}</p>
                <h2>
                  <Link href={`/guys/${today.slug}`}>{today.name}</Link>
                </h2>
                {today.caption && <p className="caption">{today.caption}</p>}
                <Credit guy={today} />
              </div>
              <Link className="text-link" href={`/guys/${today.slug}`}>
                Meet this lilguy <span aria-hidden="true">↗</span>
              </Link>
            </figcaption>
          </figure>
        </section>
      ) : (
        <EmptyGallery />
      )}
      {recent.length > 0 && (
        <section className="recent-section" aria-labelledby="recent-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">More little reasons to smile</p>
              <h2 id="recent-heading">New to the collection</h2>
            </div>
            <Link href="/archive" className="text-link">
              View the archive <span aria-hidden="true">→</span>
            </Link>
          </div>
          <Gallery guys={recent} />
        </section>
      )}
      <aside className="invitation">
        <div>
          <h2>Good things come in small sizes.</h2>
          <p>Know a lilguy who belongs here? We’d love to meet them.</p>
        </div>
        <Link href="/submit" className="button-link">
          Submit a lilguy <span aria-hidden="true">↗</span>
        </Link>
      </aside>
    </main>
  )
}
