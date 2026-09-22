import Image from "next/image"
import Link from "next/link"

import { kinds, type PhotoGuy } from "@/lib/guys"

export function Credit({ guy }: { guy: PhotoGuy }) {
  if (!guy.credit) return null
  return (
    <p className="photo-credit">
      Photo shared by{" "}
      {guy.credit.url ? (
        <a href={guy.credit.url} rel="noopener noreferrer">
          {guy.credit.name} <span aria-hidden="true">↗</span>
        </a>
      ) : (
        guy.credit.name
      )}
    </p>
  )
}

export function GuyPhoto({
  guy,
  priority = false,
}: {
  guy: PhotoGuy
  priority?: boolean
}) {
  return (
    <Image
      src={guy.image}
      alt={guy.alt}
      width={guy.width}
      height={guy.height}
      sizes="(max-width: 700px) 100vw, 1000px"
      priority={priority}
      className="guy-photo"
    />
  )
}

export function Gallery({ guys }: { guys: PhotoGuy[] }) {
  return (
    <ul className="gallery-grid">
      {guys.map((guy) => (
        <li key={guy.slug}>
          <Link href={`/guys/${guy.slug}`} className="guy-card">
            <div className="card-photo">
              <Image
                src={guy.image}
                alt={guy.alt}
                width={guy.width}
                height={guy.height}
                sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
              />
            </div>
            <div className="card-caption">
              <h3>{guy.name}</h3>
              <span>{kinds[guy.kind]}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function EmptyGallery({ archive = false }: { archive?: boolean }) {
  return (
    <div className="empty-gallery">
      <svg
        className="empty-drawing"
        viewBox="0 0 160 130"
        fill="none"
        aria-hidden="true"
      >
        <path d="M45 47C17 44 22 13 40 18c11 2 13 13 12 19M108 37c-1-24 26-27 29-10 3 13-5 21-19 20" />
        <path d="M29 77c0-30 18-45 49-45s53 18 53 46c0 30-21 39-52 39S29 105 29 77Z" />
        <path d="M58 72v3m44-3v3M72 88c5 5 10 5 15 0m-7-1v7" />
      </svg>
      <p className="eyebrow">A little space for a little friend</p>
      <h2>
        {archive
          ? "A collection starts with one lilguy."
          : "Our first lilguy is on the way."}
      </h2>
      <p>
        Small stuffed friends. Real animals. A little moment of joy.
        <br className="desktop-break" /> We’re making room for all of them.
      </p>
      <Link href="/submit" className="text-link">
        Meet the idea <span aria-hidden="true">↗</span>
      </Link>
    </div>
  )
}
