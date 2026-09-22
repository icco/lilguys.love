import { loadGuys } from "../src/lib/content.ts"

const guys = await loadGuys()
console.log(
  `Validated ${guys.length} lilguy${guys.length === 1 ? "" : "s"} and their photos.`
)
