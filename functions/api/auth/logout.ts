// POST /api/auth/logout — clear session cookie

import type { Env } from '../../lib/auth';

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  const url = new URL(request.url);
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  const headers = new Headers();
  headers.set('Location', '/');
  headers.append('Set-Cookie', `bookmarkviz_session=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`);
  return new Response(null, { status: 302, headers });
};
