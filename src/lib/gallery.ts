import { cache } from "react"

import { createCollectionLoader } from "./collection-cache"
import { loadGuys } from "./content"

// Process-level production cache + per-render deduplication. Development reads
// fresh files each render; deployments/restarts invalidate the production cache.
export const getGuys = cache(
  createCollectionLoader(
    () => loadGuys(),
    process.env.NODE_ENV === "production"
  )
)
