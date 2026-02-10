import { createHash } from 'crypto';

/**
 * Checks if a string looks like a plausible access token.
 * We expect long, URL-safe strings.
 */
export function isLikelyToken(text: string): boolean {
  const candidate = text.trim();
  // 24–128 chars, URL-safe
  return /^[A-Za-z0-9_-]{24,128}$/.test(candidate);
}

/**
 * Extract token from a Telegram message text.
 * Supports:
 * - "/start access_<token>"
 * - plain token text
 */
export function extractTokenFromText(text: string): string | null {
  const trimmed = text.trim();

  if (trimmed.startsWith('/start')) {
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1 && parts[1].startsWith('access_')) {
      const token = parts[1].slice('access_'.length);
      return isLikelyToken(token) ? token : null;
    }
    return null;
  }

  return isLikelyToken(trimmed) ? trimmed : null;
}

/**
 * Returns a SHA-256 hash of the token (hex-encoded).
 * Used instead of storing raw tokens where possible.
 */
export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}


