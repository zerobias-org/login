# ZeroBias Custom Login

White-label login pages for the ZeroBias platform. Each company gets a package in this repo, built on
the Dana Login SDK and deployed as a static site to S3 + CloudFront.

## Getting started

**Copy [`package/login-starter`](package/login-starter/) and follow its README.** It is a complete,
working login page that builds and runs as-is, with a checklist of exactly what to change.

```bash
git clone git@github.com:zerobias-org/login.git
cd login
cp -r package/login-starter package/yourcompany
cd package/yourcompany
```

Then see **[`package/login-starter/README.md`](package/login-starter/README.md)** for the full
walkthrough — registry auth, local development, the customization checklist, and deployment.

### Prerequisites

- **Node 22.21.1 or newer** — the SDK's `engines` floor
- A **`ZB_TOKEN`** — generate an API key at [zerobias.com](https://zerobias.com): user menu (upper
  right) -> *Create New API Key*. Then `export ZB_TOKEN="..."` in your `~/.zshrc` or `~/.bashrc`.

Each package has its own `.npmrc` pointing the `@zerobias-com` and `@zerobias-org` scopes at
`pkg.zerobias.org`, authenticated with `ZB_TOKEN`. **Keep that file** — without it `npm install`
looks for the SDK on the public npm registry and fails with a 404.

### Alternative: generate a package from scratch

The SDK also ships a scaffold that emits the same structure:

```bash
npx dana-login-init yourcompany --name "Your Company" --email "help@yourcompany.com"
```

It produces a bare skeleton rather than a styled page. If you use it, **copy `.npmrc` from
`package/login-starter` into the generated folder** — the scaffold does not create one, and
`npm install` will 404 without it. Copying the starter avoids this entirely.

## Repository layout

```
login/
├── package/
│   ├── login-starter/     # copy-me template (private — never published or deployed)
│   ├── miraxr/            # company package
│   └── workworlds/        # company package
├── .github/workflows/     # dispatch + deploy
├── lerna.json
└── README.md
```

One directory per company. The folder name becomes the deployed app name, so it must match
`^[a-zA-Z0-9_-]+$`.

## Environments

Merging a package to a branch deploys it to that branch's environment:

- **`uat`** — first stop, test here
- **`qa`** — QA
- **`main`** — production

Open a PR from your branch to `uat`. On merge, `Dispatch Deploys` detects which package changed and
triggers `Deploy App` for it.

**The branches are independent — there is no automatic promotion.** To move the same work up, open a
PR from the same branch to `qa`, then another to `main`. Skip one and that environment keeps serving
the older build.

## Local development

From inside your package:

```bash
npm install
npm run dev     # then open http://localhost:8080/en_us/login.html
```

`npm run dev` serves your built page and proxies `/dana/api/*` to a real ZeroBias environment
(`api.uat.zerobias.com` by default; `npm run dev:qa` and `npm run dev:prod` switch targets).

Completing a sign-in does **not** work locally — that needs session context the platform only
provides on a deployed origin, so expect `401`s. Local development is for layout, styling, and copy.
Deploy to `uat` to exercise the real authentication flow.

## How customization works

Your package supplies templates that slot into the SDK's layout — they don't replace it.

- **`src/views/*.hbs`** — one per page: `login`, `access_denied`, `eula`, `request_access`,
  `session_expired`, `shared_session`. The SDK ships **no** views, so all six must exist in your
  package.
- **`src/partials/head.hbs`** — rendered at the end of the SDK's `<head>`, so your tags come after
  the SDK's and win.
- **`src/partials/scripts.hbs`** — rendered at the end of the body. Must exist; may be empty.
- **`src/assets/translations/*.json`** — every user-visible string. One file per locale; the build
  emits `dist/<locale>/` for each. **Read verbatim, with no fallback to SDK defaults** — a missing
  key renders the literal text `Missing translation: some.key` on the page. Change values; don't
  delete keys.
- **`src/assets/metadata.json`** — `org.name` drives the page title and is available to every
  template.
- **`src/assets/custom.css`** and **`src/assets/visuals/`** — your styling and images.

### ZeroBias brand chrome

The ZeroBias favicon and the "Powered by ZeroBias" footer lockup are served from `cdn.zerobias.com`
and supplied by the SDK, so you inherit them without committing any images. To use your own favicon,
set it by value in `src/assets/metadata.json` — no template edit needed:

```json
{ "org": { "name": "Your Company", "favicon": "/assets/visuals/your-favicon.png" } }
```

## Building

```bash
npm run build     # from inside your package
```

Output is static HTML/CSS/JS in `dist/`, one directory per locale. That is what gets uploaded to S3
and served through CloudFront — nothing runs server-side in production. The `server.js` in a package
is a local development tool only.

Handlebars reference: <https://handlebarsjs.com/>
