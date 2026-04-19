// Cloudflare Worker — GitHub OAuth for Decap CMS
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://acestrategies.au',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    // Step 1: Initial auth request — redirect to GitHub
    if (url.pathname === '/api/auth') {
      const redirectUri = `https://${env.WORKER_DOMAIN}/api/auth/callback`;
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
      
      return Response.redirect(githubAuthUrl, 302);
    }
    
    // Step 2: Callback — exchange code for token
    if (url.pathname === '/api/auth/callback') {
      const code = url.searchParams.get('code');
      
      if (!code) {
        return new Response('Missing code parameter', { status: 400 });
      }
      
      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code: code,
          }),
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
          return new Response(`GitHub error: ${tokenData.error_description}`, { status: 400 });
        }
        
        // Return success page that posts token back to CMS
        const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authentication Complete</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a2b45; color: white; }
    .box { text-align: center; padding: 40px; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid #C9A961; }
    h1 { color: #C9A961; margin-bottom: 16px; }
    p { opacity: 0.8; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Authentication Successful</h1>
    <p>You may now close this window and return to the CMS.</p>
  </div>
  <script>
    (function() {
      var token = ${JSON.stringify(tokenData.access_token)};
      window.opener.postMessage({ provider: 'github', token: token }, 'https://acestrategies.au');
    })();
  </script>
</body>
</html>`;
        
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' },
        });
        
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    return new Response('Not found', { status: 404 });
  },
};
