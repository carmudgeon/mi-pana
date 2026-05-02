/**
 * Security headers service worker for GitHub Pages.
 *
 * GitHub Pages does not support custom HTTP response headers, so we use a
 * service worker to intercept navigation requests and inject the headers that
 * browsers require to be present on the HTTP response (not in <meta> tags):
 *
 *   X-Frame-Options          — blocks clickjacking via legacy header
 *   X-Content-Type-Options   — prevents MIME-type sniffing
 *   Content-Security-Policy  — frame-ancestors directive (meta CSP ignores it)
 *   Referrer-Policy          — controls Referer header leakage
 *   Permissions-Policy       — restricts access to browser APIs
 *
 * The service worker only modifies navigation responses (HTML documents).
 * All other requests (JS, CSS, images, API calls) pass through unmodified.
 */

const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  // frame-ancestors must be in a real HTTP header — meta CSP ignores it.
  // 'none' means this page cannot be embedded in any iframe anywhere.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "img-src 'self' data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
};

self.addEventListener('install', () => {
  // Activate immediately — don't wait for existing tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all open clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only intercept same-origin navigation requests (HTML documents).
  // Let all other requests (API, assets, Supabase) pass through untouched.
  if (
    request.mode !== 'navigate' ||
    !request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  event.respondWith(
    fetch(request).then((response) => {
      // Clone the response and inject security headers
      const headers = new Headers(response.headers);
      for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        headers.set(name, value);
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }),
  );
});
