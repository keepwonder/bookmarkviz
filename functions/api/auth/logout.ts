// POST /api/auth/logout — clear session cookie

import { clearSessionHeaders } from '../../lib/session';
import type { Env } from '../../lib/auth';

export const onRequestPost: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      ...clearSessionHeaders(),
    },
  });
};
