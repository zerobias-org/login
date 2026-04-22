# Local Development Guide

This document explains how to run the custom login package locally for development and testing.

## Prerequisites

1. **Node.js** >= 22.21.1 (required by `@zerobias-com/dana-login-sdk@1.0.55+`)
2. **ZB_TOKEN** environment variable set (for npm install)

### Setting ZB_TOKEN

Generate an API key from zerobias.com (upper right user menu → Create New API Key), then:

```bash
export ZB_TOKEN="your-api-key-here"
```

Add this to your `.bash_profile`, `.bashrc`, or `.zshrc` to persist across sessions.

## Setup

```bash
cd package/w3geekery  # or your package directory
npm install
```

### Note: glob Version Override

The `@zerobias-com/dana-login-sdk` requires glob v8.x due to import syntax. This is handled via `overrides` in package.json:

```json
{
  "overrides": {
    "glob": "^8.1.0"
  }
}
```

## Running Locally

### What Works Locally

| Feature | Local Dev | Deployed |
|---------|-----------|----------|
| UI/Styling preview | ✅ | ✅ |
| Template customization | ✅ | ✅ |
| i18n translations | ✅ | ✅ |
| Full login flow | ❌ | ✅ |
| Language switcher | ❌ | ✅ |

**Note:** The login API endpoints require session context from the ZeroBias platform. Running locally, API calls will return `401 Unauthorized`. This is expected - use local dev for **UI/styling work**, then deploy to test the full authentication flow.

### Development Server with API Proxy

The recommended way to run locally is using the dev server, which:
- Serves static files from the `dist/` folder
- Proxies `/dana/api/*` requests to a real ZeroBias environment
- Fixes MIME type issues for ES modules (`.js`, `.cjs`, `.mjs`)

```bash
# Default: proxies to https://api.ci.zerobias.com (dev/CI environment)
npm run dev

# Proxy to CI environment (explicit)
npm run dev:ci

# Proxy to QA environment
npm run dev:qa

# Proxy to Production environment
npm run dev:prod

# Custom environment
PROXY_TARGET=https://api.your-env.zerobias.com npm run dev
```

Then navigate to: **http://localhost:8080/en_us/login.html**

### How the Proxy Works

When running locally, the login page makes API calls like:
- `GET /dana/api/v2/login/profile/{email}`
- `GET /dana/api/v2/login/locales`

These calls are intercepted by the local Express server and proxied to the configured ZeroBias API endpoint (default: `https://api.ci.zerobias.com`).

```
Browser → localhost:8080/dana/api/v2/login/profile/user@example.com
                ↓
         [Express Proxy]
                ↓
        api.ci.zerobias.com/dana/api/v2/login/profile/user@example.com
```

**Note:** ZeroBias uses separate API subdomains:
- CI/Dev: `api.ci.zerobias.com`
- QA: `api.qa.zerobias.com`
- Production: `api.app.zerobias.com`

### Static-Only Mode (No API)

If you only need to preview the UI without API functionality:

```bash
npm start
```

This uses `http-server` to serve static files but API calls will fail (404).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build for production deployment |
| `npm run build:local` | Build with `--local` flag |
| `npm run dev` | Build + start dev server (proxy to api.ci.zerobias.com) |
| `npm run dev:ci` | Build + start dev server (proxy to api.ci.zerobias.com) |
| `npm run dev:qa` | Build + start dev server (proxy to api.qa.zerobias.com) |
| `npm run dev:prod` | Build + start dev server (proxy to api.app.zerobias.com) |
| `npm start` | Build + serve with http-server (no proxy) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Port for the local dev server |
| `PROXY_TARGET` | `https://api.ci.zerobias.com` | ZeroBias API endpoint to proxy calls to |

## Troubleshooting

### Error: glob does not provide an export named 'default'

This means glob v9+ was installed. Ensure your package.json has the override:

```json
{
  "overrides": {
    "glob": "^8.1.0"
  }
}
```

Then delete `node_modules` and `package-lock.json` and run `npm install` again.

### API calls return 404

Make sure you're using `npm run dev` (not `npm start`) to enable the API proxy.

### MIME type error: "application/node"

If you see an error like:
```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "application/node"
```

This is caused by Express 5 + ESM. The dev server includes a workaround that manually serves `.js`, `.cjs`, and `.mjs` files with the correct `application/javascript` MIME type. Ensure you're using the latest `server.js`.

### 401 Unauthorized on login API calls

**This is expected for local development.** The login API endpoints (`/dana/api/v2/login/profile/*`, `/dana/api/v2/login/locales`) require session context that only exists when served from the ZeroBias platform.

**What this means:**
- You can still preview and test UI/styling locally
- Full login flow testing requires deployment to a ZeroBias environment
- The 401 errors in the browser console are normal for local dev

### Login fails after deployment

If login fails when deployed to a real environment:
1. Verify the target environment is accessible
2. Confirm your email exists in that environment
3. Check the environment's identity provider is configured correctly

## Files

```
package/w3geekery/
├── server.js           # Express dev server with API proxy
├── package.json        # Scripts and dependencies
├── src/
│   ├── assets/
│   │   ├── custom.css        # Custom styles
│   │   ├── metadata.json     # Page metadata
│   │   └── translations/     # i18n files
│   ├── partials/
│   │   ├── head.hbs          # Custom <head> content
│   │   └── scripts.hbs       # Custom scripts
│   └── views/
│       ├── login.hbs         # Login page template
│       └── ...               # Other page templates
└── dist/                     # Built output (generated)
    ├── assets/
    └── en_us/
        ├── login.html
        └── ...
```

## Deployment

### Deployment Environments

For `zerobias-org/app` and `zerobias-org/login` repositories:
- **No dev environment** - We only deploy to QA and Production
- **QA**: `qa.zerobias.com`
- **Production**: `app.zerobias.com`

**Note:** The publishing pipeline is currently under construction. API keys may vary by environment - check with the team for current deployment procedures.

### What Gets Deployed

Only the `dist/` folder contents are deployed. The following files are **local development only** and should NOT be deployed:
- `server.js` - Local dev server (not needed in production)
- `LOCAL_DEV.md` - This documentation
- `node_modules/` - Dependencies

The build process (`npm run build`) generates the `dist/` folder which contains the static HTML, CSS, JS, and assets needed for production.

## Creating a New Login Package

1. Copy this package directory as a template
2. Update `package.json` with your package name
3. Customize templates in `src/views/` and `src/partials/`
4. Update styles in `src/assets/custom.css`
5. Update metadata in `src/assets/metadata.json`
6. Run `npm run dev` to test locally
7. Run `npm run build` to generate production `dist/` folder

## CI / Deploy Notes

The `uat` (and other environment) deploys assume an IAM role whose name is
namespaced by GitHub org:

| Repo | Role name pattern |
|---|---|
| `zerobias-com/login` (platform) | `gh-login-{env}-custom-ui` |
| `zerobias-org/login` (this repo) | `gh-zb-org-login-{env}-custom-ui` |

The `zb-org` infix distinguishes this repo's trust policy from the
platform-login repo's. If a deploy fails at the OIDC
`AssumeRoleWithWebIdentity` step, verify `.github/workflows/deploy.yml`
references the `gh-zb-org-login-*` form.

### Branch -> AWS account mapping

UAT infra lives in the **prod** AWS account, not dev. The
`.github/workflows/dispatch.yml` branch logic maps:

| Branch | AWS account | `ENV_NAME` |
|---|---|---|
| `main` | prod | prod |
| `uat`  | prod | uat  |
| `qa`   | dev  | qa   |
| `dev`  | dev  | dev  |

This matches the pattern in `zerobias-org/app`. If a deploy fails with
`Not authorized to perform sts:AssumeRoleWithWebIdentity` and the role
ARN looks correct, the next thing to check is whether the account ID
passed into `role-to-assume` matches the account the role actually
lives in (prod for `uat`, dev for `qa`/`dev`).
