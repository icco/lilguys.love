import { readdir, readFile, realpath } from "node:fs/promises"
import path from "node:path"

import sharp from "sharp"

import { parseGuy, type PhotoGuy } from "./guys.ts"

// Used by the server and the build-time validator. Never imported by client UI.
export async function loadGuys(root = process.cwd()): Promise<PhotoGuy[]> {
  const directory = path.join(root, "content/guys")
  const publicDirectory = await realpath(path.join(root, "public/guys"))
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".json"))
    .sort()
  const guys: PhotoGuy[] = []
  for (const file of files) {
    try {
      const guy = parseGuy(
        file.slice(0, -5),
        JSON.parse(await readFile(path.join(directory, file), "utf8"))
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
