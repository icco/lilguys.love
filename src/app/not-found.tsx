import Link from "next/link"

export default function NotFound() {
  return (
    <main
      id="main"
      className="grid min-h-screen place-content-center gap-6 px-6 text-center"
    >
      <h1 className="text-3xl font-bold">Page not found</h1>
      <Link className="link" href="/">
        Back home
      </Link>
    </main>
  )
}
