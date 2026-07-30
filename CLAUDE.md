# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The **ZeroBias Community Login Repository** provides white-label custom login page templates for the ZeroBias platform. Customers can clone this repository to create branded login experiences using Handlebars templates and the Dana Login SDK.

**Repository Role:** Custom Login Pages - White-label authentication UI

This repository allows organizations to customize the login experience with their own branding, styles, and assets while maintaining integration with the platform's authentication system (Dana).

## Architecture

### Repository Structure

```
login/
├── package/                    # Custom login packages, one per company
│   ├── login-starter/         # copy-me template (private — never published or deployed)
│   ├── miraxr/                # company package
│   └── workworlds/            # company package
│       ├── src/
│       │   ├── assets/        # custom CSS, images, translations, metadata
│       │   ├── partials/      # head.hbs + scripts.hbs (both required)
│       │   └── views/         # all six page templates (required)
│       ├── .npmrc             # registry auth — required for npm install
│       ├── server.js          # local dev proxy server
│       └── package.json
├── .github/                    # GitHub Actions workflows
├── lerna.json                  # Monorepo configuration
├── AGENTS.md                   # instructions for AI assistants
└── README.md                   # repository overview
```

## Core Concepts

### Dana Login SDK

The **Dana Login SDK** (`@zerobias-com/dana-login-sdk`, published to `pkg.zerobias.org`) provides:
- The page layout and framing partials (`__head`, `__header`, `__footer`, `__scripts`)
- Metalsmith static site generator (`metalsmith.js`)
- Default styles and flag assets
- ZeroBias brand chrome served from `cdn.zerobias.com`
- A package scaffold, `npx dana-login-init`
- Authentication integration with the Dana service

**Pages** (all six supplied by the consumer package — the SDK ships no `views` directory):
`login`, `access_denied`, `eula`, `request_access`, `session_expired`, `shared_session`

### Template Override System

The SDK owns the page shell; a package fills it in. Package templates are **composed into** the
SDK's layout, not swapped for it.

- `src/views/*.hbs` — the body of each page. All six are required.
- `src/partials/head.hbs` — rendered at the END of the SDK's `__head.hbs` via `{{> head}}`, so
  package tags come after the SDK's. **It does not replace `__head.hbs`.**
- `src/partials/scripts.hbs` — same, at the end of the body. Must exist; may be empty.
- `src/assets/translations/*.json` — one file per locale. **Read verbatim with no fallback to SDK
  defaults**: a missing key renders the literal string `Missing translation: some.key`.
- `src/assets/metadata.json` — `org.name`, `org.favicon`, and anything else, available to all
  templates.

### ZeroBias brand chrome

The favicon and "Powered by ZeroBias" lockup come from `cdn.zerobias.com` via the SDK. Packages do
not commit copies. Override the favicon by setting `org.favicon` in `metadata.json` — not by adding
a `<link rel="icon">`.

---

## Development Workflow

### Creating a New Custom Login

**1. Set up environment:**
```bash
# Set ZB_TOKEN for npm package authentication
export ZB_TOKEN="your-api-key-here"

# Add to shell profile for persistence
echo 'export ZB_TOKEN="your-api-key-here"' >> ~/.bashrc
```

Requires Node 22.21.1+ (the SDK's `engines` floor).

**2. Create new login package:**
```bash
# Copy the starter — NOT miraxr or workworlds, both of which are years out of
# date and still depend on the deprecated @auditmation scope.
cp -r package/login-starter package/my-company

cd package/my-company

# Update package.json
# Change name to @zerobias-org/login-my-company, drop "private": true
# Update description

# Install dependencies (needs ZB_TOKEN + the package's .npmrc — keep that file)
npm install
```

`package/login-starter/README.md` carries the authoritative customization checklist.

**3. Local development:**
```bash
# Build and start the local dev server with API proxy
npm run dev

# Navigate to http://localhost:8080/en_us/login.html

# Proxy targets: dev -> api.uat (default), dev:qa, dev:prod,
# or PROXY_TARGET=https://api.example.zerobias.com npm run dev
```

Sign-in cannot complete locally — API calls return `401` without platform session context. That is
expected. Local development covers layout, styling, and copy; the real flow is tested on a deployed
environment.

**4. Customize templates:**

The starter already contains all six views plus both required partials — edit them in place. There
is nothing to copy out of the SDK, and no `views` directory exists there to copy from.

```bash
# Edit src/views/*.hbs with your branding
# Replace src/assets/visuals/logo.svg
# Update every user-facing string in src/assets/translations/en_US.json
# Add custom CSS to src/assets/custom.css
```

Change translation **values**; never delete keys. There is no fallback to SDK defaults, so a missing
key renders the literal string `Missing translation: some.key` on the page.

**5. Build for deployment:**
```bash
npm run build

# Output: dist/
# Contains static HTML, CSS, JS ready for S3/CDN
```

---

## Template Customization

### Handlebars Templates

**Views (src/views/):**
- `login.hbs` - Main login page
- `mfa.hbs` - Multi-factor authentication
- `reset-password.hbs` - Password reset request
- `reset-password-confirm.hbs` - Password reset form
- `verify-email.hbs` - Email verification
- `error.hbs` - Error page

**Partials (src/partials/):**
- `head.hbs` - HTML head section (CSS, meta tags)
- `header.hbs` - Page header
- `footer.hbs` - Page footer
- `scripts.hbs` - JavaScript includes

**Example Override (src/views/login.hbs):**
```handlebars
{{> head title="Login - My Company"}}

<div class="login-container my-custom-class">
  <img src="/assets/my-logo.png" alt="My Company" class="logo">

  <h1>Welcome to My Company Portal</h1>

  <form action="/login" method="POST">
    <input type="text" name="username" placeholder="Email" required>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit">Sign In</button>
  </form>

  <a href="/reset-password">Forgot Password?</a>
</div>

{{> footer}}
{{> scripts}}
```

---

### Custom Styling

**Create custom CSS (src/assets/custom.css):**
```css
/* Override default styles */
.login-container {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 40px;
  max-width: 400px;
  margin: 100px auto;
}

.logo {
  max-width: 200px;
  margin-bottom: 20px;
}

button[type="submit"] {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}
```

**Link custom CSS (src/partials/head.hbs):**

This partial is a *fragment*, not a whole `<head>` — the SDK supplies the document shell and its own
stylesheets, then renders this at the end via `{{> head}}`. Add only what you need:

```handlebars
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" type="text/css" href="/assets/custom.css" />
```

Do not add a `<link rel="icon">` here — the SDK supplies the favicon from the ZeroBias CDN. To use
your own, set `org.favicon` in `src/assets/metadata.json`.

---

## Deployment

### Building for Production

```bash
cd package/my-company

# Build static site
npm run build

# Output directory: dist/
# Contains: HTML, CSS, JS, assets
```

### Deploy to S3 + CloudFront

**Via GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
- name: Build login package
  run: |
    cd package/my-company
    npm install
    npm run build

- name: Deploy to S3
  run: |
    aws s3 sync package/my-company/dist/ \
      s3://zerobias-login/my-company/

- name: Invalidate CloudFront
  run: |
    aws cloudfront create-invalidation \
      --distribution-id ${{ secrets.CLOUDFRONT_DIST_ID }} \
      --paths "/my-company/*"
```

**Manual Deployment:**
```bash
cd package/my-company
npm run build

# Upload to S3
aws s3 sync dist/ s3://zerobias-login/my-company/ \
  --acl public-read

# Invalidate CDN cache
aws cloudfront create-invalidation \
  --distribution-id XXXXXXXXXXXX \
  --paths "/my-company/*"
```

### Configure Custom Domain

**1. Map domain to login package:**
```
https://login.mycompany.com → https://cdn.zerobias.com/login/my-company/
```

**2. Register domain in Dana:**
```bash
# Via platform admin or API
curl -X POST https://api.zerobias.com/dana/login-domains \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "domain": "login.mycompany.com",
    "package": "my-company",
    "orgId": "org-uuid"
  }'
```

**3. Update DNS:**
```
CNAME login.mycompany.com → cdn.zerobias.com
```

---

## Common Development Commands

### Package-Specific

```bash
cd package/my-company

# Install dependencies
npm install

# Build static site
npm run build

# Build for local development
npm run build-local

# Start local server (if configured)
npm start

# Test
npm test
```

### Root Level (Monorepo)

```bash
# Build all login packages
npm run build

# Publish packages
npm run lerna:publish

# Test all packages
npm run lerna:test
```

---

## Integration with Dana

### Authentication Flow

1. **User visits custom domain:** `https://login.mycompany.com`
2. **CDN serves static login page:** From S3 bucket
3. **User submits credentials:** Form posts to Dana API
4. **Dana validates credentials:** Returns JWT token in cookie
5. **Redirect to portal:** With authenticated session

### Dana API Endpoints

**POST /login:**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "domain": "mycompany.com"
}
```

**POST /reset-password:**
```json
{
  "email": "user@example.com",
  "domain": "mycompany.com"
}
```

**POST /verify-email:**
```json
{
  "token": "email-verification-token",
  "domain": "mycompany.com"
}
```

---

## Best Practices

### Template Development

1. **Start with minimal overrides:** Only override what you need to customize
2. **Keep authentication logic intact:** Don't modify form actions or required fields
3. **Test all six pages:** `login`, `access_denied`, `eula`, `request_access`, `session_expired`, `shared_session`
4. **Mobile responsive:** Ensure templates work on all devices
5. **Accessibility:** Include ARIA labels, keyboard navigation

### Styling

1. **Use custom.css:** Don't modify SDK styles directly
2. **CSS specificity:** Use specific selectors to override SDK styles
3. **Brand consistency:** Match company brand guidelines
4. **Loading performance:** Optimize images, minimize CSS

### Security

1. **Never hardcode credentials:** Use environment variables
2. **HTTPS only:** Always deploy to HTTPS endpoints
3. **CSP headers:** Implement Content Security Policy
4. **Form validation:** Client and server-side validation

---

## Important Notes

### SDK Version

Login packages depend on `@zerobias-com/dana-login-sdk`, published to `pkg.zerobias.org`:
- Check the SDK version in the package's `package.json`
- Update the SDK for new features or security patches
- Review the SDK changelog before upgrading

The older `@auditmation/dana-login-sdk` scope is **deprecated**. `miraxr` and `workworlds` still pin
it (`0.7.2` and `0.5.8`) and are not valid references for new work — copy `package/login-starter`
instead.

### Template Changes

When SDK updates templates:
1. Review changes in SDK
2. Update local overrides if needed
3. Test all login flows
4. Redeploy login package

### Domain Configuration

Each custom login requires:
- Unique S3 path (e.g., `/login/company-name/`)
- Domain registration in Dana
- DNS CNAME record
- SSL certificate (CloudFront handles this)

---

## Example: Creating Branded Login

**Step-by-step example:**

```bash
# 1. Set up
export ZB_TOKEN="your-token"
cd package
cp -r login-starter acme-corp
cd acme-corp

# 2. Update package.json
# name: "@zerobias-org/login-acme-corp"
# remove "private": true
# update description

# 3. Install (keep .npmrc — npm install 404s without it)
npm install

# 4. Run it before changing anything, to confirm the setup works
npm run dev
# http://localhost:8080/en_us/login.html

# 5. Add branding
# Replace src/assets/visuals/logo.svg
# Edit src/assets/custom.css — brand tokens are in :root at the top

# 6. Customize copy
# Edit src/assets/metadata.json      — org.name
# Edit src/assets/translations/en_US.json — every user-facing string, including
#   footer.privacy_policy_url / terms_of_use_url / help_url, which otherwise
#   ship as dead links
# Edit src/views/*.hbs as needed

# 7. Build
npm run build

# 8. Deploy — open a PR to the uat branch. Merging triggers Dispatch Deploys,
#    which detects the changed package and runs Deploy App for it.
#    Promote by opening the same branch against qa, then main.

# 9. Configure
# Register login.acme.com in Dana
# Update DNS: CNAME login.acme.com → cdn.zerobias.com
```

---

## Troubleshooting

### Build Fails

**Problem:** `npm run build` fails with errors

**Solutions:**
1. Check node version (>= 16.0.0)
2. Clear node_modules and reinstall
3. Verify ZB_TOKEN is set
4. Check Metalsmith configuration

### Templates Not Overriding

**Problem:** Local templates not being used

**Solutions:**
1. Verify templates in correct directory (src/views/ or src/partials/)
2. Check template file names match SDK names
3. Rebuild with `npm run build`
4. Clear browser cache

### CSS Not Loading

**Problem:** Custom CSS not applied

**Solutions:**
1. Verify custom.css in src/assets/
2. Check link tag in head.hbs
3. Clear CDN cache after deployment
4. Check browser developer tools for 404 errors

### Authentication Fails

**Problem:** Login doesn't work after deployment

**Solutions:**
1. Check form action points to Dana API
2. Verify domain registered in Dana
3. Check DNS configuration
4. Test with browser developer tools (network tab)

---

## Related Documentation

- **[package/login-starter/README.md](package/login-starter/README.md)** - the copy-me template and
  its customization checklist (start here)
- **[AGENTS.md](AGENTS.md)** - instructions for AI assistants working in this repo
- **[README.md](README.md)** - repository overview
- **Dana Login SDK** - `@zerobias-com/dana-login-sdk`, source in `zerobias-com/dana` under
  `login-sdk/`

---

## Support

For custom login development:
1. Review example login package (miraxr)
2. Check Dana Login SDK documentation
3. Test locally before deploying
4. Consult platform team for domain setup

---

**Last Updated:** 2025-11-11
**Maintainers:** ZeroBias Community
