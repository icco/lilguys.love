# Publishing lilguys

All published entries and photos live in Git. There is no database or automatic
Google Forms integration. Nat reviews submissions and adds selected photos by hand.

## Add a lilguy through GitHub

1. Review the submission and confirm permission to publish the image and public
   credit. Download the actual photo from submitted links rather than hotlinking.
2. Prepare a still JPG, PNG, WebP, or AVIF. Aim for a longest edge around 2000 pixels
   and under 1 MB where practical. Correct its orientation and strip location/EXIF
   metadata before uploading. Preserve the original proportions.
3. Upload the photo to `public/guys/`, for example `pocket-bear.webp`.
4. Create `content/guys/pocket-bear.json` with the metadata below. The filename
   becomes the permanent URL: `/guys/pocket-bear`. Use lowercase letters, numbers,
   and hyphens. Image filenames follow the same rule.
5. Open a PR. CI checks every entry, image, and build. Merge when it passes; the
   existing GHCR/mist deployment publishes the updated collection.

```json
{
  "name": "Pocket Bear",
  "kind": "stuffed",
  "image": "/guys/pocket-bear.webp",
  "alt": "A tiny brown teddy bear peeking out of a coat pocket.",
  "caption": "Ready for a very small adventure.",
  "publishedOn": "2026-09-25",
  "credit": {
    "name": "Nat",
    "url": "https://example.com/original"
  }
}
```

`kind` is `stuffed` or `real`. `caption` and `credit` are optional; `credit.url`
is optional too. A credit with just a name is fine. Alt text should describe the
photo itself. Captions are plain text, not HTML or Markdown. Image dimensions are
read automatically. Unknown fields, invalid dates, missing images, and empty alt
text fail validation with the entry filename.

## Dates and rotation

`publishedOn` starts at midnight **UTC**. Future entries are excluded from the
homepage, archive, detail pages, and sitemap until that date. Their image files
and metadata are still public in Git (and images are directly accessible), so
this is scheduling, not private storage.

The published collection is sorted by slug, and the UTC day number selects a
position modulo the collection size. With an unchanged collection, each friend
gets one turn per cycle; the next day advances by one. Adding or removing entries
may change that day's selection. Everyone requesting the page on the same UTC
day sees the same pick. An already-open tab updates on refresh.

Routes resolve publication dates on each request, so no midnight rebuild is
needed. The archive is newest first, with slug order breaking date ties. Empty
collections and categories have deliberate empty states.

## Set up the Google Form

Suggested fields:

- Lilguy name (required)
- Stuffed animal / real animal (required)
- Photo upload **or** link to a photo (at least one)
- Caption or story (optional)
- Public credit name and original source URL (optional)
- Permission to publish the photograph, caption, and credit on lilguys.love and
  in its public GitHub repository (required)

Google Forms file uploads require Google sign-in. For submissions without sign-in,
use a link-only form or a separate link-only form; adding a link question to a
file-upload form does not remove Google's sign-in requirement. Make the chosen
submission method clear in the form description.

Paste the public form URL into `submissionFormUrl` in `src/lib/site.ts` and deploy.
Until then, `/submit` shows “Submissions opening soon” without a broken button.
Private form responses and contact details should never be copied into Git.

## Local checks

```sh
pnpm content:check
pnpm check
pnpm build
pnpm test:smoke
```

To remove an entry, delete its JSON and image. Git history and external copies
may retain the photo; a site removal is not a guarantee of complete erasure.
