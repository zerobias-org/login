# login-starter

A working custom login page, ready to copy. It builds and runs **as-is** — do that first, then
change things one at a time.

This package is `"private": true` and is never published or deployed. It exists to be copied.

## 1. Copy it

```bash
cp -r package/login-starter package/yourcompany
cd package/yourcompany
```

Package folders are named after the company: `package/miraxr`, `package/workworlds`. Use a
lowercase, hyphen-free name — the deploy workflow validates the folder name against
`^[a-zA-Z0-9_-]+$` and uses it as the deployed app name.

## 2. Authenticate to the package registry

You need a `ZB_TOKEN` before `npm install` will work. Generate an API key at
[zerobias.com](https://zerobias.com) — user menu (upper right) -> **Create New API Key** — then:

```bash
export ZB_TOKEN="paste-your-api-key-here"
```

Add that line to your `~/.zshrc` or `~/.bashrc` so it persists.

The `.npmrc` in this folder points the `@zerobias-com` and `@zerobias-org` scopes at
`pkg.zerobias.org` and authenticates with `ZB_TOKEN`. **Keep that file** — without it `npm install`
looks for the SDK on the public npm registry and fails with a 404.

## 3. Install and run

Requires **Node 22.21.1 or newer** (the SDK's `engines` floor).

```bash
npm install
npm run dev
```

Then open **http://localhost:8080/en_us/login.html**.

You should see a working login page with a placeholder logo. If you do, everything is wired up.

## 4. Change these

Work down this list. Nothing here is optional except where noted.

- [ ] **`package.json`** — `name` -> `@zerobias-org/login-yourcompany`, and `description`
- [ ] **`src/assets/metadata.json`** — `org.name`. This drives the browser tab title.
- [ ] **`src/assets/visuals/logo.svg`** — replace with your logo. The views reference
      `/assets/visuals/logo.svg`; if you use a different filename, update all six views.
- [ ] **`src/assets/translations/en_US.json`** — every string users read:
  - [ ] `err.unknown` and `access_denied.content` — your support email
  - [ ] `login.welcome_message`, `shared_session.welcome_message`
  - [ ] `footer.company`, `footer.company_url`, `footer.copyright`
  - [ ] **`footer.privacy_policy_url`, `footer.terms_of_use_url`, `footer.help_url`** — these ship
        pointing at `yourcompany.com`. Left unchanged, your login page has three dead footer links.
- [ ] **`src/assets/custom.css`** — brand tokens are in `:root` at the top
- [ ] *(optional)* **`src/partials/scripts.hbs`** — post-login destination, see the comment inside
- [ ] *(optional)* **favicon** — you inherit the ZeroBias one by default. For your own, add
      `"favicon": "/assets/visuals/your-favicon.png"` under `"org"` in `metadata.json`. No template
      edit needed.

### Add another language

Copy `src/assets/translations/en_US.json` to e.g. `es_US.json` and translate the values. The build
detects it automatically and emits `dist/es_us/`.

## 5. What works locally, and what doesn't

| | Local | Deployed |
|---|---|---|
| Layout, styling, logo | yes | yes |
| Translated copy | yes | yes |
| Completing a login | **no** | yes |
| Language switcher | **no** | yes |

`npm run dev` serves your built page and proxies `/dana/api/*` to a real ZeroBias environment, but
sign-in needs session context the platform only provides on a deployed origin. Expect `401`s when
you try to actually log in locally — that is normal. Use local for look and feel; deploy to test
the real flow.

```bash
npm run dev        # proxies to api.uat.zerobias.com (default)
npm run dev:qa     # proxies to api.qa.zerobias.com
npm run dev:prod   # proxies to api.app.zerobias.com

PROXY_TARGET=https://api.example.zerobias.com npm run dev   # anything else
PORT=3000 npm run dev                                       # different port
```

`npm start` serves the built output with no proxy at all — every API call 404s. Use `npm run dev`
unless you only want to eyeball static layout.

## 6. Build

```bash
npm run build
```

Output lands in `dist/` — static HTML, CSS, JS, one directory per locale (`dist/en_us/`, ...).
That is exactly what gets uploaded to S3 and served through CloudFront. Nothing here runs
server-side in production; `server.js` is a local development tool only.

## 7. Deploy

Merging your package to a branch deploys it to that branch's environment:

- **`uat`** — first stop, test here
- **`qa`**
- **`main`** — production

Open a PR from your branch to `uat`. When it merges, `Dispatch Deploys` detects the changed package
and triggers `Deploy App` for it.

These branches are **independent** — there is no automatic promotion. To move the same work up, open
a PR from the same branch to `qa`, then another to `main`. If you skip one, that environment keeps
serving the older build.

## How the templates work

Your files don't replace the SDK's — they slot into them.

- **`src/views/*.hbs`** — one per page. The SDK ships **no** views, so all six must exist here.
  They are the page body; the SDK wraps them in its layout.
- **`src/partials/head.hbs`** — injected at the end of the SDK's `<head>`, so your tags come after
  the SDK's and win.
- **`src/partials/scripts.hbs`** — injected at the end of the body. Must exist; may be empty.
- **`{{{__ "some.key"}}}`** pulls from your translation file. **The build reads your translation
  file verbatim and does not fall back to SDK defaults** — a missing key renders the literal text
  `Missing translation: some.key` on the page. Change values; don't delete keys.
- **`{{{org.name}}}`** and any other key in `metadata.json` are available in every template.

## Troubleshooting

**`npm install` fails with a 404 for `@zerobias-com/dana-login-sdk`** — `ZB_TOKEN` isn't set, or
you deleted `.npmrc`.

**Build fails with `No translations found!`** — `src/assets/translations/` must contain at least one
`.json` file.

**A page shows `Missing translation: ...`** — that key is absent from your translation file. Add it
back with your own value.

**Handlebars error about a missing partial** — `src/partials/head.hbs` and `src/partials/scripts.hbs`
must both exist, even if empty.

**Logo doesn't appear** — the views point at `/assets/visuals/logo.svg`. Either keep that filename
or update all six views.
