export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. API routes & Edge Mock Fallback (Prevent HTTP 404s on API endpoints)
    if (url.pathname.startsWith('/api/') || url.pathname === '/healthz') {
      const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // If remote backend configured (e.g. Cloudflare tunnel or HTTPS VPS):
      const backendUrl = env.BACKEND_URL;
      const isRemoteBackend = backendUrl && !backendUrl.includes('127.0.0.1') && !backendUrl.includes('localhost');

      if (isRemoteBackend) {
        try {
          const target = new URL(url.pathname + url.search, backendUrl);
          const reqHeaders = new Headers(request.headers);
          reqHeaders.set('Host', new URL(backendUrl).host);

          return await fetch(new Request(target, {
            method: request.method,
            headers: reqHeaders,
            body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
            redirect: 'follow',
          }));
        } catch (err) {
          console.error('Remote backend proxy error, falling back to edge responses:', err);
        }
      }

      // Edge fallback for meeting creation
      if (url.pathname === '/api/v1/meetings/create') {
        let body = {};
        try { body = await request.json(); } catch (_) {}
        const sessionId = crypto.randomUUID();
        const code = sessionId.substring(0, 8);
        return new Response(JSON.stringify({
          session_id: sessionId,
          title: body.title || 'Live Meeting Room',
          objective: body.objective || '',
          mode: body.mode || 'group',
          display_name: body.host_name || 'Host',
          role: 'host',
          access_token: 'demo_' + sessionId,
          meeting_url: `/session.html?id=${sessionId}`,
          meeting_code: code,
          is_fallback: true
        }), { status: 200, headers: corsHeaders });
      }

      // Edge fallback for meeting join
      if (url.pathname === '/api/v1/meetings/join') {
        let body = {};
        try { body = await request.json(); } catch (_) {}
        let rawId = (body.meeting_id_or_url || '').trim();
        if (rawId.includes('id=')) rawId = new URLSearchParams(rawId.split('?')[1]).get('id') || rawId;
        else if (rawId.includes('/session/')) rawId = rawId.split('/session/')[1].split('?')[0];
        const sessionId = rawId || crypto.randomUUID();
        return new Response(JSON.stringify({
          session_id: sessionId,
          title: 'Meeting Room',
          display_name: body.display_name || 'Participant',
          role: 'attendee',
          access_token: 'demo_' + sessionId,
          meeting_url: `/session.html?id=${sessionId}`,
          meeting_code: sessionId.substring(0, 8),
          is_fallback: true
        }), { status: 200, headers: corsHeaders });
      }

      // Edge fallback for meeting public info
      if (url.pathname.includes('/public-info')) {
        const parts = url.pathname.split('/');
        const sId = parts[parts.indexOf('meetings') + 1] || 'demo-session';
        return new Response(JSON.stringify({
          id: sId,
          title: 'Live Meeting Room',
          owner_name: 'Host',
          mode: 'group',
          is_active: true
        }), { status: 200, headers: corsHeaders });
      }

      // Edge fallback for session fetching
      if (url.pathname.startsWith('/api/v1/sessions/')) {
        const parts = url.pathname.split('/');
        const sId = parts[parts.indexOf('sessions') + 1];
        if (request.method === 'GET' && !url.pathname.includes('/transcript') && !url.pathname.includes('/insights')) {
          return new Response(JSON.stringify({
            id: sId,
            title: 'Live Meeting Room',
            objective: 'Live Conversation Copilot Session',
            mode: 'group',
            status: 'active',
            created_at: new Date().toISOString()
          }), { status: 200, headers: corsHeaders });
        }
        if (request.method === 'GET') {
          return new Response(JSON.stringify([]), { status: 200, headers: corsHeaders });
        }
      }

      // Edge fallback for auth/me
      if (url.pathname === '/api/v1/auth/me') {
        return new Response(JSON.stringify({
          id: 'user-demo-1',
          email: 'demo@nimad.ai',
          display_name: 'Presenter (Host)'
        }), { status: 200, headers: corsHeaders });
      }

      // Edge health check
      if (url.pathname === '/healthz' || url.pathname === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          service: 'nimad-cloudflare-edge',
          backend_configured: isRemoteBackend
        }), { status: 200, headers: corsHeaders });
      }
    }

    // 2. SPA Route Rewrite for clean meeting URLs (/session/:id)
    if (url.pathname.startsWith('/session/') && !url.pathname.includes('.')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const sId = parts[1] || '';
      const sessionUrl = new URL(`/session.html?id=${sId}`, request.url);
      return env.ASSETS.fetch(new Request(sessionUrl, request));
    }

    // 3. Serve static asset directly
    const assetResponse = await env.ASSETS.fetch(request);

    // If Cloudflare Assets returned a 3xx redirect to the exact same path, break the redirect loop
    if ([301, 302, 307, 308].includes(assetResponse.status)) {
      const loc = assetResponse.headers.get('Location') || '';
      if (loc === url.pathname || loc === url.href || loc.endsWith(url.pathname)) {
        const directUrl = new URL(url.pathname.endsWith('.html') ? url.pathname : url.pathname + '.html', request.url);
        return env.ASSETS.fetch(new Request(directUrl, request));
      }
    }

    return assetResponse;
  }
};
