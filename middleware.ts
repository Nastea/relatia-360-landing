import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Pe subdomeniul `banii.liliadubita.md`, rădăcina (/) afișează landing-ul
 * evenimentului (/psihologia-banilor), fără să schimbe URL-ul din bară.
 * Restul domeniilor rămân neatinse.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  if (host === 'banii.liliadubita.md' && req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/psihologia-banilor';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

// Rulează doar pe rădăcină — zero impact pe alte rute/asset-uri.
export const config = {
  matcher: '/',
};
