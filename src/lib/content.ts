import { readdir, readFile, realpath } from "node:fs/promises"
import path from "node:path"

import sharp from "sharp"

import { parseGuy, type PhotoGuy } from "./guys.ts"

// Used by the server and the build-time validator. Never imported by client UI.
export async function loadGuys(root = process.cwd()): Promise<PhotoGuy[]> {
  // Canonicalize the checkout root, not the allowed directory: resolving the
  // latter as the baseline would bless an outside symlink target.
  root = await realpath(root)
  const directory = path.join(root, "content/guys")
  const publicDirectory = path.join(root, "public/guys")
  if ((await realpath(directory)) !== directory) {
    throw new Error("content/guys must not resolve through a symlink")
  }
  if ((await realpath(publicDirectory)) !== publicDirectory) {
    throw new Error("public/guys must not resolve through a symlink")
  }
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".json"))
    .sort()
  const guys: PhotoGuy[] = []
  for (const file of files) {
    try {
      const entryPath = await realpath(path.join(directory, file))
      if (path.dirname(entryPath) !== directory)
        throw new Error("Entry resolves outside content/guys")
      const guy = parseGuy(
        file.slice(0, -5),
        JSON.parse(await readFile(entryPath, "utf8"))
      )
      const imagePath = await realpath(path.join(root, "public", guy.image))
      if (path.dirname(imagePath) !== publicDirectory)
        throw new Error("Image resolves outside public/guys")
      const metadata = await sharp(imagePath).metadata()
      if (
        !metadata.width ||
        !metadata.height ||
        !["jpeg", "png", "webp", "avif", "heif"].includes(metadata.format || "")
      ) {
        throw new Error("Image must be a readable JPG, PNG, WebP, or AVIF")
      }
      if ((metadata.pages || 1) > 1)
        throw new Error("Use a still photograph, not an animated image")
      const rotated = (metadata.orientation || 1) >= 5
      guys.push({
        ...guy,
        width: rotated ? metadata.height : metadata.width,
        height: rotated ? metadata.width : metadata.height,
      })
    } catch (error) {
      throw new Error(
        `${file}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error }
      )
    }
  }
  return guys
}
