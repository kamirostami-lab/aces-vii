export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const redirectUri = `${url.origin}/api/auth/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
  
  return Response.redirect(githubAuthUrl, 302);
}
