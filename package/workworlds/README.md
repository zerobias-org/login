# Custom login pages for Work Worlds

White-label login page for the Work Worlds Electron desktop application.

## Auth Integration

Work Worlds uses Auth0 PKCE flow for Electron native auth:
- **Domain:** `dana.auth0.com`
- **Callback:** `workworlds://auth/callback`
- **Scopes:** `openid profile email offline_access`
- **Audience:** `https://api.app.zerobias.com`

## Development

```bash
export ZB_TOKEN="your-api-key"
npm install
npm start
# Navigate to http://localhost:3001
```
