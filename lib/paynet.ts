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

