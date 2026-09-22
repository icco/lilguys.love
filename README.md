# lilguys.love

A little home for lil guys and the people who love them.

Created from [icco/nextjs-template](https://github.com/icco/nextjs-template).
Next.js App Router, React, TypeScript, Tailwind CSS, and daisyUI.

## Development

Use Node 26 and pnpm 11.2.2:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:8080>. The starter landing page is in
`src/app/page.tsx`; site metadata lives in `src/lib/site.ts`.

```sh
pnpm check
pnpm build
pnpm test:smoke
pnpm start
```

`pnpm lint:fix` fixes lint/import order; `pnpm format` formats source and Tailwind
classes. Production serves on `PORT` (default 8080), with `/healthz` for checks.

## Deployment

CI validates the app and publishes `ghcr.io/icco/lilguys.love:main` with build
provenance. The Docker image runs standalone Next.js as a non-root user on 8080.

```sh
docker build -t lilguys.love .
docker run --rm -p 8080:8080 lilguys.love
```

DNS is tracked in [icco.me PR #244](https://github.com/icco/icco.me/pull/244):
Google Cloud DNS apex and `www` A records, with Porkbun nameserver delegation.
That PR must merge and apply before the new DNS is active.

To put the site live, add this service under `services` in
`icco.me/mist/docker-compose.yml`, then follow its deployment runbook:

```yaml
lilguys:
  image: ghcr.io/icco/lilguys.love:main
  restart: unless-stopped
  networks: [caddy]
  labels:
    caddy: lilguys.love, www.lilguys.love
    caddy.reverse_proxy: "{{upstreams 8080}}"
```

The GHCR package must be public or mist must have authenticated pull access.
Porkbun API access must be enabled for the domain. Caddy handles HTTPS.
