# AGENTS.md

Instructions for AI coding assistants working in this repository.

This repo holds white-label login pages for the ZeroBias platform. Each company gets one package
under `package/`. A package is a set of Handlebars templates, translations, and assets that the
**Dana Login SDK** (`@zerobias-com/dana-login-sdk`) compiles into a static site via Metalsmith.

## If the user wants a new login page

Copy the starter — do not hand-build a package, and do not copy `miraxr` or `workworlds` (both are
years out of date and depend on a deprecated package scope).

```bash
cp -r package/login-starter package/<company>
cd package/<company>
npm install
npm run dev     # http://localhost:8080/en_us/login.html
```

`package/login-starter/README.md` has the authoritative checklist. Work through it rather than
guessing what needs changing.

## Hard requirements — the build fails without these

- **At least one `src/assets/translations/*.json`.** The build reads the *package's* translations
  directory only. With none it fails: `No translations found!`
- **Both `src/partials/head.hbs` and `src/partials/scripts.hbs` must exist.** The SDK does
  `{{> head}}` and `{{> scripts}}`; Handlebars throws on a missing partial. They may be empty.
- **All six views must exist** in `src/views/`: `login.hbs`, `access_denied.hbs`, `eula.hbs`,
  `request_access.hbs`, `session_expired.hbs`, `shared_session.hbs`. **The SDK ships no views
  directory** — every page comes from the package.
- **Keep `.npmrc`.** It maps `@zerobias-com` / `@zerobias-org` to `pkg.zerobias.org` and
  authenticates with `$ZB_TOKEN`. Without it `npm install` 404s against the public npm registry.
- **Node 22.21.1+.** Older Node cannot run the SDK.

## Rules that are easy to get wrong

**Never delete a translation key to "inherit the default."** There is no fallback — the build reads
each package's translation file verbatim. A missing key renders the literal string
`Missing translation: footer.powered_by_logo` as page text or an image `src`. Always change the
value.

**Don't add a `<link rel="icon">` to `head.hbs`.** The SDK supplies the ZeroBias favicon from the
CDN. To override it, set `favicon` under `org` in `src/assets/metadata.json`. Adding a link tag
emits a second icon and works only by declaration-order accident.

**Don't commit ZeroBias brand images.** The favicon and the "Powered by ZeroBias" lockup come from
`cdn.zerobias.com` via the SDK. Only the company's *own* logo belongs in `src/assets/visuals/`.

**`server.js` is local-only.** Production is static files on S3 + CloudFront. Nothing in a package
runs server-side in production.

**Sign-in cannot be tested locally.** API calls proxy to a real environment but return `401` without
platform session context. That is expected, not a bug to fix. Layout, styling, and copy are what
local development is for; the real flow is tested on a deployed environment.

**Package folder names** become the deployed app name and must match `^[a-zA-Z0-9_-]+$`.

## Template model

The SDK owns the page shell; the package fills it in.

- `src/views/*.hbs` — the body of each page
- `src/partials/head.hbs` — appended to the SDK's `<head>`, so package tags come after the SDK's
- `src/partials/scripts.hbs` — appended to the end of the body
- `{{{__ "some.key"}}}` — resolves from the package's translation file
- `{{{org.name}}}` — and any other key in `src/assets/metadata.json`, available in every template

Build output goes to `dist/<locale>/`, one directory per translation file.

## Deployment

Branches map to environments: `uat` (test here first), `qa`, `main` (production). Merging a package
change to a branch deploys it there.

**The branches are independent — there is no automatic promotion.** The same branch must be PR'd to
each one separately. Do not assume merging to `uat` will reach production.

## Do not touch

- `package/login-starter` is the shared template. Copy it; don't edit it while customizing a
  company's page.
- Other companies' packages.
- `.github/workflows/` — deploy plumbing wired to Vault, S3, and IAM roles.
