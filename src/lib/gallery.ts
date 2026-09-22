import { cache } from "react"

import { loadGuys } from "./content"

// Deduplicate reads within a render, without caching publication dates across days.
export const getGuys = cache(() => loadGuys())
