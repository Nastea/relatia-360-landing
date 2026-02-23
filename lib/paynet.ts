/**
 * Paynet configuration helper
 * Returns appropriate values based on PAYNET_ENV (test/live)
 */

export function getApiHost(): string {
  const env = process.env.PAYNET_ENV;
  if (env === 'live') {
    return process.env.PAYNET_API_HOST_LIVE || '';
  }
  return process.env.PAYNET_API_HOST_TEST || '';
}

export function getPortalHost(): string {
  const env = process.env.PAYNET_ENV;
  if (env === 'live') {
    return process.env.PAYNET_PORTAL_HOST_LIVE || '';
  }
  return process.env.PAYNET_PORTAL_HOST_TEST || '';
}

export function getNotifySecret(): string {
  const env = process.env.PAYNET_ENV;
  if (env === 'live') {
    return process.env.PAYNET_NOTIFY_SECRET_KEY_LIVE || '';
  }
  return process.env.PAYNET_NOTIFY_SECRET_KEY_TEST || '';
}

/** Format date for Paynet API: YYYY-MM-DDTHH:mm:ss in Moldova (Chisinau) timezone so "today" is correct for the merchant. */
export function formatPaynetDate(d: Date): string {
  const s = d.toLocaleString('en-CA', {
    timeZone: 'Europe/Chisinau',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return s.replace(', ', 'T'); // "YYYY-MM-DD, HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
}

