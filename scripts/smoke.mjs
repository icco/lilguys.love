import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { setTimeout } from "node:timers/promises"

// Set SMOKE_BASE_URL to test a running Docker container instead.
const external = process.env.SMOKE_BASE_URL
const port = process.env.SMOKE_PORT || "18080"
const base = external || `http://127.0.0.1:${port}`
const server = external
  ? null
  : spawn(process.execPath, ["scripts/start.mjs"], {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "production", PORT: port },
    })
const exited = server ? once(server, "exit") : null

try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server && server.exitCode !== null)
      throw new Error("Production server exited before readiness")
    try {
      const response = await fetch(`${base}/healthz`, {
        signal: AbortSignal.timeout(1000),
      })
      if (response.ok) {
        ready = true
        break
      }
    } catch {
      /* Wait for startup. */
    }
    await setTimeout(500)
  }
  assert.ok(ready, "Production server becomes ready")
  const home = await fetch(base)
  assert.equal(home.status, 200)
  assert.equal(home.headers.get("x-powered-by"), null)
  assert.equal(home.headers.get("x-content-type-options"), "nosniff")
  assert.match(
    home.headers.get("content-security-policy") || "",
    /frame-ancestors 'none'/
  )
  assert.doesNotMatch(
    home.headers.get("content-security-policy") || "",
    /unsafe-eval/
  )
  assert.match(await home.text(), /<h1[\s>]/)
  const health = await fetch(`${base}/healthz`)
  assert.deepEqual(await health.json(), { status: "ok" })
  assert.equal(health.headers.get("cache-control"), "no-store")
  const robots = await fetch(`${base}/robots.txt`)
  assert.equal(robots.status, 200)
  assert.match(await robots.text(), /Sitemap: https:\/\//)
  const sitemap = await fetch(`${base}/sitemap.xml`)
  assert.equal(sitemap.status, 200)
  assert.match(await sitemap.text(), /<urlset/)
  assert.equal((await fetch(`${base}/icon.svg`)).status, 200)
  assert.equal((await fetch(`${base}/this-page-does-not-exist`)).status, 404)
  console.log("Production smoke checks passed.")
} finally {
  if (server && server.exitCode === null) {
    server.kill("SIGTERM")
    const forceKill = globalThis.setTimeout(() => server.kill("SIGKILL"), 5000)
    await exited
    globalThis.clearTimeout(forceKill)
  }
}
