// Cloudflare Worker — Ace Strategies / IAA Member Authentication
// Handles auth-gated routes; all other requests pass through to static assets.
//
// Required env vars (set via `wrangler secret put`):
//   SESSION_SECRET   — random 32+ byte string for HMAC signing
//   RESEND_API_KEY   — Resend API key for magic link emails
//
// Required KV namespaces (bind in wrangler.jsonc):
//   MEMBER_EMAILS    — approved member emails  (key: "member:<email>", value: "1")
//   MAGIC_TOKENS     — one-time login tokens   (key: "token:<hex>",   value: email, TTL: 900s)

const SESSION_COOKIE = 'ace_member_session';
const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days (seconds)
const MAGIC_LINK_TTL = 900;                  // 15 minutes (seconds)

// ---------------------------------------------------------------------------
// Crypto helpers
// ---------------------------------------------------------------------------

async function hmacSign(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createSessionToken(email, secret) {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  const payload = `${email}|${expiry}`;
  const sig = await hmacSign(payload, secret);
  return `${btoa(payload)}.${sig}`;
}

async function verifySessionToken(token, secret) {
  try {
    const dot = token.indexOf('.');
    if (dot === -1) return null;
    const payload = atob(token.slice(0, dot));
    const sig = token.slice(dot + 1);
    const bar = payload.lastIndexOf('|');
    const email = payload.slice(0, bar);
    const expiry = parseInt(payload.slice(bar + 1), 10);
    if (!email || isNaN(expiry) || Math.floor(Date.now() / 1000) > expiry) return null;
    const expected = await hmacSign(payload, secret);
    // Constant-time comparison to prevent timing attacks
    if (sig.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0 ? email : null;
  } catch {
    return null;
  }
}

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp(`(?:^|;\\s*)${encodeURIComponent(name)}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function redirect(url) {
  return Response.redirect(url, 302);
}

// ---------------------------------------------------------------------------
// Route: GET /alliance/members/* — check session cookie
// ---------------------------------------------------------------------------

async function handleMembersRoute(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (token) {
    const email = await verifySessionToken(token, env.SESSION_SECRET);
    if (email) return env.ASSETS.fetch(request);
  }
  const dest = new URL('/alliance/login/', request.url);
  dest.searchParams.set('next', new URL(request.url).pathname);
  return redirect(dest.href);
}

// ---------------------------------------------------------------------------
// Route: POST /alliance/login/ — issue magic link
// ---------------------------------------------------------------------------

async function handleLoginPost(request, env) {
  let email, honeypot;
  try {
    const form = await request.formData();
    email = (form.get('email') || '').toLowerCase().trim();
    honeypot = form.get('_gotcha') || '';
  } catch {
    return redirect(new URL('/alliance/login/?error=invalid', request.url).href);
  }

  // Reject honeypot fills (bots)
  if (honeypot) return redirect(new URL('/alliance/login/?sent=1', request.url).href);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirect(new URL('/alliance/login/?error=email', request.url).href);
  }

  // Always show the same "check your email" response — prevents member enumeration
  const approved = await env.MEMBER_EMAILS.get(`member:${email}`);
  if (approved) {
    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    await env.MAGIC_TOKENS.put(`token:${token}`, email, { expirationTtl: MAGIC_LINK_TTL });

    const verifyUrl = new URL(`/alliance/verify/?token=${token}`, request.url).href;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Invest Australia Alliance <noreply@acestrategies.au>',
        to: [email],
        subject: 'Your Alliance member login link',
        html: `
          <div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;color:#1a2b45;">
            <img src="https://acestrategies.au/assets/repository/images/ui/logo/iaa-silver.webp" alt="Invest Australia Alliance" style="height:40px;margin-bottom:32px;">
            <h1 style="font-size:1.5rem;font-weight:600;margin-bottom:16px;">Your member login link</h1>
            <p style="color:#555;margin-bottom:24px;">Click the button below to access the Alliance Members Portal. This link expires in 15 minutes and can only be used once.</p>
            <a href="${verifyUrl}" style="display:inline-block;background:#C9A961;color:#1a2b45;padding:14px 28px;text-decoration:none;border-radius:4px;font-weight:600;">Access Members Portal</a>
            <p style="margin-top:32px;font-size:0.85rem;color:#999;">If you did not request this link, you can safely ignore this email.</p>
          </div>
        `,
      }),
    });
  }

  return redirect(new URL('/alliance/login/?sent=1', request.url).href);
}

// ---------------------------------------------------------------------------
// Route: GET /alliance/verify/ — validate token, issue session cookie
// ---------------------------------------------------------------------------

async function handleVerify(request, env) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!token) return redirect(new URL('/alliance/login/?error=invalid', request.url).href);

  const email = await env.MAGIC_TOKENS.get(`token:${token}`);
  if (!email) return redirect(new URL('/alliance/login/?error=expired', request.url).href);

  await env.MAGIC_TOKENS.delete(`token:${token}`);

  const sessionToken = await createSessionToken(email, env.SESSION_SECRET);
  const cookie = [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionToken)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${SESSION_DURATION}`,
  ].join('; ');

  return new Response(null, {
    status: 302,
    headers: { Location: '/alliance/members/', 'Set-Cookie': cookie },
  });
}

// ---------------------------------------------------------------------------
// Routes: /api/auth — GitHub OAuth for Decap CMS
// ---------------------------------------------------------------------------

function handleCorsPrelight() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://acestrategies.au',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function handleOAuthStart(request, env) {
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/callback`;
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
  return Response.redirect(githubUrl, 302);
}

async function handleOAuthCallback(request, env) {
  const code = new URL(request.url).searchParams.get('code');
  if (!code) return new Response('Missing code parameter', { status: 400 });

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (tokenData.error) return new Response(`GitHub error: ${tokenData.error_description}`, { status: 400 });

    const origin = new URL(request.url).origin;
    const html = `<!DOCTYPE html><html><head><title>Authentication Complete</title>
<style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#1a2b45;color:white}.box{text-align:center;padding:40px;background:rgba(255,255,255,0.05);border-radius:12px;border:1px solid #C9A961}h1{color:#C9A961;margin-bottom:16px}p{opacity:.8}</style>
</head><body><div class="box"><h1>Authentication Successful</h1><p>You may now close this window and return to the CMS.</p></div>
<script>(function(){var t=${JSON.stringify(tokenData.access_token)};window.opener.postMessage({provider:'github',token:t},${JSON.stringify(origin)});}());</script>
</body></html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Route: GET /alliance/logout/ — clear session cookie
// ---------------------------------------------------------------------------

function handleLogout(request) {
  const expired = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0',
  ].join('; ');
  return new Response(null, {
    status: 302,
    headers: { Location: '/alliance/login/', 'Set-Cookie': expired },
  });
}

// ---------------------------------------------------------------------------
// Main fetch handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/alliance/members')) return handleMembersRoute(request, env);
    if (pathname === '/alliance/logout' || pathname === '/alliance/logout/') return handleLogout(request);
    if (pathname === '/alliance/verify' || pathname === '/alliance/verify/') return handleVerify(request, env);
    if ((pathname === '/alliance/login' || pathname === '/alliance/login/') && request.method === 'POST') return handleLoginPost(request, env);

    // GitHub OAuth for Decap CMS
    if (request.method === 'OPTIONS') return handleCorsPrelight();
    if (pathname === '/api/auth' || pathname === '/api/auth/') return handleOAuthStart(request, env);
    if (pathname === '/api/auth/callback') return handleOAuthCallback(request, env);

    return env.ASSETS.fetch(request);
  },
};
