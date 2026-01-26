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
 * Local Development Server for SME Mart Login
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
 *                  Default: https://api.ci.zerobias.com
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
const PROXY_TARGET = process.env.PROXY_TARGET || 'https://api.ci.zerobias.com';

console.log(`
╔════════════════════════════════════════════════════════════╗
║         SME Mart Login - Local Development Server          ║
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
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY ERROR] ${err.message}`);
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Proxy error',
        message: err.message,
        target: PROXY_TARGET
      });
    }
  }
}));

// Manually serve JavaScript files with correct MIME type
// This fixes the "application/node" issue with ES modules in Express 5
app.use((req, res, next) => {
  const isJsFile = req.path.endsWith('.js') || req.path.endsWith('.cjs') || req.path.endsWith('.mjs');
  if (isJsFile) {
    const filePath = path.join(__dirname, 'dist', req.path);
    if (fs.existsSync(filePath)) {
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
