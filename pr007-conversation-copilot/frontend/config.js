/**
 * Nimad Copilot — Runtime Environment Configuration
 * 
 * Supports:
 *   1. Direct FastAPI serving (http://127.0.0.1:8000)
 *   2. Cloudflare Worker Edge Proxy (/api/* and /ws/*)
 *   3. Cloudflare Quick Tunnel (https://*.trycloudflare.com)
 *   4. Query parameter override: ?api=https://your-backend.trycloudflare.com
 */

(function () {
  try {
    var params = new URLSearchParams(window.location.search);
    var apiOverride = params.get('api') || params.get('backend');
    if (apiOverride) {
      var cleaned = apiOverride.replace(/\/$/, '');
      localStorage.setItem('copilot_api_base', cleaned);
    }
  } catch (e) {}

  var savedBase = localStorage.getItem('copilot_api_base');
  if (savedBase) {
    window.__COPILOT_API_BASE__ = savedBase;
    try {
      var u = new URL(savedBase);
      window.__COPILOT_WS_HOST__ = u.host;
    } catch (_) {}
  }
})();
