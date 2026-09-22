import { Loading } from "@icco/react-common/Loading"

export default function ArchiveLoading() {
  return (
    <main id="main" className="site-main filtered-empty" aria-busy="true">
      <div role="status">
        <Loading size="sm" />
        <p>Finding a little friend…</p>
      </div>
    </main>
  )
}
