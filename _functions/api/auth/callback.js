export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }
  
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
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authentication Complete</title>
  <style>
    body { font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a2b45; color: white; }
    .box { text-align: center; padding: 40px; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid #C9A961; }
    h1 { color: #C9A961; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Authentication Successful</h1>
    <p>You may now close this window and return to the CMS.</p>
  </div>
  <script>
    window.opener.postMessage({ provider: 'github', token: '${tokenData.access_token}' }, '*');
  </script>
</body>
</html>`;
  
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
