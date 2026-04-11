export default async (request, context) => {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/alliance/members/')) return context.next();
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return Response.redirect(`https://${context.env.AUTH_DOMAIN}/login`, 302);
  try {
    const validation = await fetch(`https://${context.env.AUTH_DOMAIN}/cdn-cgi/access/verify`, { headers: { 'Cookie': `CF_Authorization=${jwt}` } });
    if (!validation.ok) throw new Error('Invalid token');
    return context.next();
  } catch (e) {
    return new Response('Access Denied', { status: 403 });
  }
};
export const config = { path: "/alliance/members/*" };
