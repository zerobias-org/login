/**
 * ============================================================================
 * LOCAL DEVELOPMENT ONLY - DO NOT DEPLOY TO PRODUCTION
 * ============================================================================
 *
 * This server is for local development and testing only.
 * It should NOT be deployed to QA or Production environments.
 *
 * Production deployments should only include the dist/ folder contents.
 * ============================================================================
 *
 * Local Development Server for a ZeroBias custom login package
 *
 * This server:
 * 1. Serves static files from the dist/ folder (built by metalsmith)
 * 2. Proxies /dana/api/* requests to a real ZeroBias environment
 *
 * Usage:
 *   npm run dev
 *
 * Environment Variables:
 *   PROXY_TARGET - The ZeroBias environment to proxy API calls to
 *                  Default: https://api.uat.zerobias.com
 *   PORT - The port to run the local server on
 *          Default: 8080
 */

// Prevent accidental production usage
if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: This dev server should not be run in production!');
  console.error('Deploy the dist/ folder contents instead.');
  process.exit(1);
}

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuration
const PORT = process.env.PORT || 8080;
const PROXY_TARGET = process.env.PROXY_TARGET || 'https://api.uat.zerobias.com';

console.log(`
╔════════════════════════════════════════════════════════════╗
║          Login Starter - Local Development Server          ║
╠════════════════════════════════════════════════════════════╣
║  Static files: ./dist                                      ║
║  API Proxy:    /dana/api/* → ${PROXY_TARGET.padEnd(27)}║
║  Port:         ${String(PORT).padEnd(43)}║
╚════════════════════════════════════════════════════════════╝
`);

// Proxy /dana/api/* to the real ZeroBias environment
app.use('/dana/api', createProxyMiddleware({
  target: PROXY_TARGET,
  changeOrigin: true,
  secure: true,
  timeout: 30000,
  proxyTimeout: 30000,
  // http-proxy-middleware v3 nests event handlers under `on`. The v2 form
  // (top-level onProxyReq / onError) is silently ignored on v3 — no error, the
  // handlers just never fire.
  on: {
    proxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
    },
    error: (err, req, res) => {
      console.error(`[PROXY ERROR] ${err.message}`);
      if (res && !res.headersSent) {
        res.status(502).json({
          error: 'Proxy error',
          message: err.message,
          target: PROXY_TARGET
        });
      }
    }
  }
}));

// Manually serve JavaScript files with correct MIME type
// This fixes the "application/node" issue with ES modules in Express 5
const DIST_DIR = path.join(__dirname, 'dist');

app.use((req, res, next) => {
  const isJsFile = req.path.endsWith('.js') || req.path.endsWith('.cjs') || req.path.endsWith('.mjs');
  if (isJsFile) {
    // req.path is user-controlled, so resolve it and confirm the result is still
    // inside dist/ before reading. Without this, a traversing path could read any
    // .js file on disk. Dev-only server, but this is a template people copy.
    const filePath = path.resolve(DIST_DIR, '.' + path.posix.normalize(req.path));
    if (filePath.startsWith(DIST_DIR + path.sep) && fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.set('Content-Type', 'application/javascript; charset=utf-8');
      return res.send(content);
    }
  }
  next();
});

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Default route - serve en_us/login.html for root
app.get('/', (req, res) => {
  res.redirect('/en_us/login.html');
});

// Fallback for login paths
app.get('/login', (req, res) => {
  res.redirect('/en_us/login.html');
});

app.get('/login/', (req, res) => {
  res.redirect('/en_us/login.html');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Login page: http://localhost:${PORT}/en_us/login.html`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
