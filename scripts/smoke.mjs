import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { setTimeout } from "node:timers/promises"

import sharp from "sharp"

// Set SMOKE_BASE_URL to test a running Docker container instead.
const external = process.env.SMOKE_BASE_URL
const port = process.env.SMOKE_PORT || "18080"
const base = external || `http://127.0.0.1:${port}`
// Exercise content-backed routes in an isolated standalone server. Synthetic
// test images and entries never touch the real collection or deployed image.
const root = external
  ? null
  : await mkdtemp(path.join(os.tmpdir(), "lilguys-smoke-"))
if (root) {
  await cp(".next/standalone", root, { recursive: true })
  await cp(".next/static", path.join(root, ".next/static"), { recursive: true })
  await cp("public", path.join(root, "public"), { recursive: true })
  await cp("content", path.join(root, "content"), { recursive: true })
  // Next.js discovers public files at startup, so prepare the image first.
  await sharp({
    create: { width: 32, height: 48, channels: 3, background: "#ac7580" },
  })
    .png()
    .toFile(path.join(root, "public/guys/smoke-bear.png"))
}
const server = external
  ? null
  : spawn(process.execPath, ["server.js"], {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: port,
        HOSTNAME: "127.0.0.1",
      },
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
  const archive = await fetch(`${base}/archive`)
  assert.equal(archive.status, 200)
  assert.match(await archive.text(), /The archive/)
  const submit = await fetch(`${base}/submit`)
  assert.equal(submit.status, 200)
  assert.match(await submit.text(), /Found a lilguy/)
  const missing = await fetch(`${base}/guys/not-a-real-lilguy`)
  // Next.js may stream a 200 response before notFound; the noindex directive
  // and not-found UI must still be present for a streamed response.
  const missingHtml = await missing.text()
  assert.match(missingHtml, /No lilguy here just yet/)
  assert.match(missingHtml, /noindex/)
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
  if (root) {
    // Replace only this temporary server's collection for predictable coverage.
    const entries = path.join(root, "content/guys")
    await rm(entries, { recursive: true })
    await mkdir(entries)
    assert.match(
      await (await fetch(base)).text(),
      /Our first lilguy is on the way/
    )
    const image = "/guys/smoke-bear.png"
    for (const [slug, kind, publishedOn] of [
      ["smoke-bear", "stuffed", "2020-01-01"],
      ["smoke-cat", "real", "2020-01-02"],
      ["smoke-future", "real", "2999-01-01"],
    ]) {
      await writeFile(
        path.join(entries, `${slug}.json`),
        JSON.stringify({
          name: slug,
          kind,
          publishedOn,
          image,
          alt: "Synthetic test image",
          caption: "A smoke test friend",
          credit: { name: "Test credit", url: "https://example.com/photo" },
        })
      )
    }
    const detail = await (await fetch(`${base}/guys/smoke-bear`)).text()
    assert.match(detail, /A smoke test friend/)
    assert.match(detail, /Test credit/)
    assert.match(detail, /summary_large_image/)
    assert.match(detail, /og:image/)
    assert.match(
      detail,
      /rel="canonical" href="https:\/\/lilguys.love\/guys\/smoke-bear"/
    )
    const filtered = await (await fetch(`${base}/archive?kind=stuffed`)).text()
    assert.match(filtered, /href="\/guys\/smoke-bear"/)
    assert.doesNotMatch(filtered, /href="\/guys\/smoke-cat"/)
    const all = await (await fetch(`${base}/archive`)).text()
    assert.match(all, /href="\/guys\/smoke-cat"/)
    assert.doesNotMatch(all, /smoke-future/)
    assert.match(
      await (await fetch(`${base}/guys/smoke-future`)).text(),
      /No lilguy here just yet/
    )
    const updatedSitemap = await (await fetch(`${base}/sitemap.xml`)).text()
    assert.match(updatedSitemap, /\/guys\/smoke-bear/)
    assert.doesNotMatch(updatedSitemap, /smoke-future/)
    const daily = await (await fetch(base)).text()
    assert.match(daily, /smoke-(?:bear|cat)/)
    assert.doesNotMatch(daily, /smoke-future/)
    const optimized = await fetch(
      `${base}/_next/image?url=%2Fguys%2Fsmoke-bear.png&w=640&q=75`
    )
    assert.equal(optimized.status, 200)
    assert.match(optimized.headers.get("content-type") || "", /^image\//)
  }
  console.log("Production smoke checks passed.")
} finally {
  if (server && server.exitCode === null) {
    server.kill("SIGTERM")
    const forceKill = globalThis.setTimeout(() => server.kill("SIGKILL"), 5000)
    await exited
    globalThis.clearTimeout(forceKill)
  }
  if (root) await rm(root, { recursive: true, force: true })
}
