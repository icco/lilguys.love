import type { PhotoGuy } from "./guys.ts"

// A production process serves an immutable checkout. Cache the raw validated
// collection, never the clock-dependent publication filter or daily selection.
export function createCollectionLoader(
  load: () => Promise<PhotoGuy[]>,
  production: boolean
) {
  let collection: Promise<PhotoGuy[]> | undefined
  return () => {
    if (!production) return load()
    collection ??= load().catch((error: unknown) => {
      collection = undefined
      throw error
    })
    return collection
  }
}
