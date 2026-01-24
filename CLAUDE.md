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
├── package/                    # Custom login packages
│   └── miraxr/                # Example: Mira XR custom login
│       ├── src/
│       │   ├── assets/        # Custom CSS, images, fonts
│       │   ├── partials/      # Handlebars partial overrides
│       │   └── views/         # Handlebars view overrides
│       ├── package.json
│       └── README.md
├── .github/                    # GitHub Actions workflows
├── lerna.json                  # Monorepo configuration
└── README.md                   # Repository overview
```

## Core Concepts

### Dana Login SDK

The **Dana Login SDK** (`@com/dana-login-sdk`) provides:
- Base Handlebars templates for login flow
- Express.js server for local development
- Metalsmith static site generator
- Default styles and assets
- Authentication integration with Dana service

**Login Flow Pages:**
- Login page (username/password)
- Multi-factor authentication (MFA)
- Password reset request
- Password reset confirmation
- Email verification
- Error pages

### Template Override System

Custom login packages override templates by:
1. Copying templates from SDK to local `views/` or `partials/`
2. Modifying templates with custom branding
3. Adding custom CSS in `assets/`
4. Building static site with Metalsmith

**Template Hierarchy:**
1. Local `views/` and `partials/` (highest priority)
2. SDK default templates (fallback)

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

**2. Create new login package:**
```bash
# Copy example
cp -r package/miraxr package/my-company

cd package/my-company

# Update package.json
# Change name to @zerobias-org/login-my-company
# Update version, description, etc.

# Install dependencies
npm install
```

**3. Local development:**
```bash
# Edit server.js for local dev (if using server mode)
# Change basePath from '/:domain' to ''

# Build and start local server
npm start

# Navigate to http://localhost:8080
```

**4. Customize templates:**
```bash
# Copy templates from SDK to override
cp node_modules/@com/dana-login-sdk/views/login.hbs src/views/
cp node_modules/@com/dana-login-sdk/partials/head.hbs src/partials/

# Edit templates with your branding
# Add custom CSS to src/assets/custom.css
```

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
```handlebars
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>

  <!-- SDK default styles -->
  <link rel="stylesheet" href="/public/styles.css">

  <!-- Custom styles -->
  <link rel="stylesheet" href="/assets/custom.css">
</head>
```

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
3. **Test all pages:** Login, MFA, password reset, email verification
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

Login packages depend on `@com/dana-login-sdk`:
- Check SDK version in package.json
- Update SDK for new features or security patches
- Review SDK changelog before upgrading

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
cp -r miraxr acme-corp
cd acme-corp

# 2. Update package.json
# name: "@zerobias-org/login-acme-corp"
# version: "1.0.0"

# 3. Install
npm install

# 4. Add branding
mkdir -p src/assets
# Add logo.png, custom.css

# 5. Override templates
cp node_modules/@com/dana-login-sdk/views/login.hbs src/views/
cp node_modules/@com/dana-login-sdk/partials/head.hbs src/partials/

# 6. Customize
# Edit src/views/login.hbs - add logo, change text
# Edit src/assets/custom.css - add company colors

# 7. Build
npm run build

# 8. Deploy
aws s3 sync dist/ s3://zerobias-login/acme-corp/
aws cloudfront create-invalidation --distribution-id XXX --paths "/acme-corp/*"

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

- **[Root CLAUDE.md](../../CLAUDE.md)** - Meta-repo guidance
- **[com/dana/CLAUDE.md](../../com/dana/CLAUDE.md)** - Authentication service
- **[com/devops/CLAUDE.md](../../com/devops/CLAUDE.md)** - Deployment workflows
- **[package/miraxr/README.md](package/miraxr/README.md)** - Example login package
- **[README.md](README.md)** - Repository overview
- **Dana Login SDK** - NPM package documentation

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
