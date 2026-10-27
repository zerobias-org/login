# login-auditcrowd

The ZeroBias custom login page for **AuditCrowd** (Running Bull's verifiable-audit marketplace).

This is a re-cut of `package/login-starter`, replacing the July 2026 `package/auditcrowd` that was built on the older `w3geekery` pattern. The six views and both partials are the starter's templates, unchanged except for the added font in `head.hbs`. All AuditCrowd branding lives in four places:

| File | What |
|---|---|
| `src/assets/custom.css` | The liquid-glass / neon brand: glass card, cyan→violet gradient button, deep-space background. Tokens are in `:root`. |
| `src/assets/visuals/logo.svg` | The shield mark. The "AuditCrowd" wordmark is drawn next to it by `.logo-container::after`, so it uses the page's Space Grotesk font. |
| `src/assets/translations/en_US.json`, `es_US.json` | Every string users read, in English and Spanish. Both files carry the same 36 keys as the starter. |
| `src/assets/metadata.json` | `org.name` = AuditCrowd |

## Run it locally

You need Node 22.21.1+ and your own ZeroBias API key as `ZB_TOKEN`, because `npm install` reads the SDK from `pkg.zerobias.org`.

```bash
export ZB_TOKEN="<your own ZeroBias API key>"
npm install          # on Windows: npm install --force (the SDK declares linux/darwin only)
npm run dev          # http://localhost:8080/en_us/login.html  ·  /es_us/login.html
```

Completing a sign-in does not work locally. That needs a deployed origin, so expect a `401`. Use local runs to check the look and the copy.

## Not decided yet

- **Post-login destination (`nextPath`).** `src/partials/scripts.hbs` is left as the starter ships it, so the platform default applies. The old package forced `/auditcrowd`, the ZB-portal app path. AuditCrowd now runs on its own domain, so the hand-off back to `auditcrowd.runningbulltech.com` depends on the shared-session mechanics we are confirming with ZeroBias.
- **Footer links.**
  - `privacy_policy_url` points at the live Crowds privacy page.
  - `terms_of_use_url` (`/frontend/terms`) and `help_url` need real pages before production.
  - The support address `support@runningbulltech.com` must be confirmed.

## Deploy

Open a PR from this branch to `uat`. When it merges, *Dispatch Deploys* builds and deploys it. Promote to `qa` and `main` with separate PRs.
