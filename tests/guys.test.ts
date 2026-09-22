import assert from "node:assert/strict"
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { test } from "node:test"

import sharp from "sharp"

import { createCollectionLoader } from "../src/lib/collection-cache.ts"
import { loadGuys } from "../src/lib/content.ts"
import {
  guyOfTheDay,
  parseGuy,
  publishedGuys,
  utcDay,
} from "../src/lib/guys.ts"

const entry = {
  name: "Pocket Bear",
  kind: "stuffed",
  image: "/guys/pocket-bear.png",
  alt: "A little brown bear in a coat pocket.",
  publishedOn: "2026-09-22",
}

test("directory symlinks cannot redefine the allowed checkout boundary", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "lilguys-links-"))
  try {
    await mkdir(path.join(root, "content/guys"), { recursive: true })
    await mkdir(path.join(root, "public"))
    await mkdir(path.join(root, "outside/guys"), { recursive: true })
    await symlink(
      path.join(root, "outside/guys"),
      path.join(root, "public/guys")
    )
    await assert.rejects(
      loadGuys(root),
      /public\/guys must not resolve through a symlink/
    )
    await rm(path.join(root, "public"), { recursive: true })
    await symlink(path.join(root, "outside"), path.join(root, "public"))
    await assert.rejects(
      loadGuys(root),
      /public\/guys must not resolve through a symlink/
    )
    await rm(path.join(root, "public"))
    await mkdir(path.join(root, "public/guys"), { recursive: true })
    await rm(path.join(root, "content/guys"), { recursive: true })
    await symlink(
      path.join(root, "outside/guys"),
      path.join(root, "content/guys")
    )
    await assert.rejects(
      loadGuys(root),
      /content\/guys must not resolve through a symlink/
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("production shares in-flight and completed content without freezing UTC publication", async () => {
  let calls = 0
  const future = { ...parseGuy("bear", entry), width: 24, height: 32 }
  const get = createCollectionLoader(async () => {
    calls++
    return [future]
  }, true)
  const [a, b] = await Promise.all([get(), get()])
  assert.equal(a, b)
  assert.equal(await get(), a)
  assert.equal(calls, 1)
  assert.equal(guyOfTheDay(a, new Date("2026-09-21T23:59:59Z")), undefined)
  assert.equal(
    guyOfTheDay(await get(), new Date("2026-09-22T00:00:00Z"))?.slug,
    "bear"
  )
  assert.equal(calls, 1)
})

test("development reads fresh content and rejected production loads can retry", async () => {
  let calls = 0
  const development = createCollectionLoader(async () => {
    calls++
    return []
  }, false)
  await development()
  await development()
  assert.equal(calls, 2)
  let attempts = 0
  const production = createCollectionLoader(async () => {
    if (++attempts === 1) throw new Error("temporary read failure")
    return []
  }, true)
  await assert.rejects(production(), /temporary read failure/)
  assert.deepEqual(await production(), [])
  await production()
  assert.equal(attempts, 2)
})

test("validates real dates, image paths, required alt text, and safe attribution", () => {
  assert.equal(parseGuy("pocket-bear", entry).name, "Pocket Bear")
  for (const bad of [
    { publishedOn: "2026-02-30" },
    { publishedOn: "tomorrow" },
    { kind: "plush" },
    { image: "/guys/../secret.png" },
    { image: "https://example.com/bear.jpg" },
    { alt: " " },
    { credit: { name: "Nat", url: "javascript:alert(1)" } },
    { credit: { name: "Nat", url: "https://user:secret@example.com" } },
    { publshedOn: "2026-09-22" },
  ])
    assert.throws(() => parseGuy("pocket-bear", { ...entry, ...bad }))
  assert.throws(() => parseGuy("../bear", entry))
  assert.equal(
    parseGuy("bear", {
      ...entry,
      publishedOn: "2028-02-29",
      credit: { name: "Nat", url: "https://example.com/photo" },
    }).credit?.name,
    "Nat"
  )
})

test("publication begins at midnight UTC and archive is newest first with stable ties", () => {
  const guys = [
    parseGuy("bear", entry),
    parseGuy("cat", { ...entry, kind: "real", publishedOn: "2026-09-23" }),
    parseGuy("ant", entry),
  ]
  const before = new Date("2026-09-22T23:59:59.999Z")
  const after = new Date("2026-09-23T00:00:00Z")
  assert.deepEqual(
    publishedGuys(guys, before).map((g) => g.slug),
    ["ant", "bear"]
  )
  assert.deepEqual(
    publishedGuys(guys, after).map((g) => g.slug),
    ["cat", "ant", "bear"]
  )
  assert.equal(utcDay(new Date("2026-09-22T20:00:00-04:00")), "2026-09-23")
})

test("daily rotation is deterministic, visits each entry once per cycle, and wraps", () => {
  const guys = ["bear", "cat", "frog"].map((slug) => parseGuy(slug, entry))
  const dates = [22, 23, 24, 25].map(
    (day) => new Date(`2026-09-${day}T00:00:00Z`)
  )
  const picks = dates.map((date) => guyOfTheDay(guys, date)?.slug)
  assert.equal(new Set(picks.slice(0, 3)).size, 3)
  assert.equal(picks[0], picks[3])
  assert.equal(guyOfTheDay([...guys].reverse(), dates[0])?.slug, picks[0])
  assert.equal(
    guyOfTheDay(guys, new Date("2026-09-22T23:59:59Z"))?.slug,
    picks[0]
  )
  assert.equal(guyOfTheDay([], dates[0]), undefined)
  assert.equal(guyOfTheDay(guys, new Date("2026-09-21T23:59:59Z")), undefined)
  assert.equal(guyOfTheDay([guys[0]], dates[3])?.slug, "bear")
})

test("loader handles empty collections, dimensions, bad images, and symlink escapes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "lilguys-test-"))
  try {
    await mkdir(path.join(root, "content/guys"), { recursive: true })
    await mkdir(path.join(root, "public/guys"), { recursive: true })
    assert.deepEqual(await loadGuys(root), [])
    const file = path.join(root, "content/guys/pocket-bear.json")
    await writeFile(file, JSON.stringify(entry))
    await assert.rejects(loadGuys(root), /pocket-bear.json/)
    const image = path.join(root, "public/guys/pocket-bear.png")
    await writeFile(image, "not a photograph")
    await assert.rejects(loadGuys(root), /pocket-bear.json/)
    await sharp({
      create: { width: 24, height: 32, channels: 3, background: "#ddd" },
    })
      .png()
      .toFile(image)
    const [guy] = await loadGuys(root)
    assert.equal(guy.width, 24)
    assert.equal(guy.height, 32)
    await rm(image)
    await writeFile(path.join(root, "outside.png"), "outside")
    await symlink(path.join(root, "outside.png"), image)
    await assert.rejects(loadGuys(root), /outside public\/guys/)
    await writeFile(file, "invalid json")
    await assert.rejects(loadGuys(root), /pocket-bear.json/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
