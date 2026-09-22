# Development

Use Node 26 and pnpm 11.2.2.

`@icco/react-common` comes from GitHub Packages. Authenticate locally with a GitHub
token that can read the package (never commit a token):

```sh
export NODE_AUTH_TOKEN="$(gh auth token)"
```

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:8080>. `pnpm check` runs lint, type checking, formatting,
content/rotation tests, and content validation. `pnpm build` validates the
collection before building; `pnpm test:smoke` checks the standalone production
server. `pnpm start` serves production on `PORT` (default 8080).

Routes live under `src/app`. The content loader in `src/lib/content.ts` is
server-only in usage, shared with the CLI validator; pure validation and selection
logic live in `src/lib/guys.ts`. Keep filesystem code out of client components.
The UI uses Server Components and URL-based archive filters, with no client-side
JavaScript needed for filtering. Main content pages and sitemap are dynamic to
honor publication dates and daily rotation without scheduled builds.

Production caches the validated collection and image dimensions once per server
process. Publication filtering and the UTC selection still run on each request.
A deploy/restart loads the new checkout; don't edit a running production container.
Development reloads content each render. Failed loads are retried, not cached.

`pnpm format` and `pnpm lint:fix` fix formatting and import order. See
[publishing.md](publishing.md) for the GitHub upload workflow and form setup.

The Docker image serves standalone Next.js as a non-root user on port 8080 and
includes `content/` and `public/` for runtime reads. `/healthz` is the health check.
CI builds PR images; main publishes `ghcr.io/icco/lilguys.love:main` with provenance.

Shared UI uses `@icco/react-common`'s `SiteHeader`, `Footer`, `Loading`, and
`WebVitals` subpath exports. Tailwind scans the package's dist directory and
daisyUI supplies its component styles. The gallery has a fixed light palette;
the shared header's theme toggle is disabled. Web Vitals sends to
`https://reportd.natwelch.com/analytics/lilguys`, allowed by the CSP.

The CI token needs read access to `@icco/react-common`. Under that package's
GitHub settings, grant `icco/lilguys.love` Actions access if needed. Docker reads
the token through a BuildKit secret, never a build argument:

```sh
docker build --secret id=npm_token,env=NODE_AUTH_TOKEN -t lilguys.love .
```
