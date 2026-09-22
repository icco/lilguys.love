import Link from "next/link"

export default function NotFound() {
  return (
    <main id="main" className="site-main filtered-empty">
      <p className="eyebrow">A little lost?</p>
      <h1>No lilguy here just yet.</h1>
      <p>This page may have moved, or its little friend hasn’t arrived.</p>
      <Link className="text-link" href="/archive">
        Back to the collection →
      </Link>
    </main>
  )
}
