import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Pe subdomeniile de mai jos, rădăcina (/) afișează landing-ul respectiv,
 * fără să schimbe URL-ul din bară. Restul domeniilor rămân neatinse.
 */
const SUBDOMAIN_LANDINGS: Record<string, string> = {
  'banii.liliadubita.md': '/psihologia-banilor',
  'intensiv.liliadubita.md': '/intensiv',
};

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const landing = SUBDOMAIN_LANDINGS[host];
  if (landing && req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = landing;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

// Rulează doar pe rădăcină — zero impact pe alte rute/asset-uri.
export const config = {
  matcher: '/',
};
