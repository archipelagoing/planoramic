export function readConfig(env = process.env) {
  if (env.NODE_ENV === 'production') {
    throw new Error(
      'This development backend needs persistent storage and deployment hardening before production use.',
    );
  }
  if (!env.DEV_API_KEY || env.DEV_API_KEY.length < 32) {
    throw new Error(
      'Set DEV_API_KEY to a random value of at least 32 characters in backend/.env.',
    );
  }
  const port = Number(env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535.');
  }
  const webOrigin = env.WEB_ORIGIN || 'http://localhost:5173';
  const url = new URL(webOrigin);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== webOrigin) {
    throw new Error(
      'WEB_ORIGIN must be an HTTP origin without a path or trailing slash.',
    );
  }
  const googleClientId = env.GOOGLE_CLIENT_ID || '';
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET || '';
  if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
    throw new Error(
      'Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or leave both empty.',
    );
  }
  const googleRedirectUri =
    env.GOOGLE_REDIRECT_URI || `http://localhost:${port}/auth/google/callback`;
  const redirect = new URL(googleRedirectUri);
  if (
    !['http:', 'https:'].includes(redirect.protocol) ||
    redirect.pathname !== '/auth/google/callback' ||
    redirect.search ||
    redirect.hash ||
    redirect.username ||
    redirect.password ||
    (redirect.protocol === 'http:' &&
      !['localhost', '127.0.0.1', '[::1]'].includes(redirect.hostname))
  ) {
    throw new Error(
      'GOOGLE_REDIRECT_URI must end in /auth/google/callback and use HTTPS or local loopback HTTP.',
    );
  }
  return {
    host: env.HOST || '127.0.0.1',
    port,
    webOrigin,
    displayOrigin: env.DISPLAY_ORIGIN || 'http://localhost:8081',
    apiKey: env.DEV_API_KEY,
    calendarToken: env.GOOGLE_CALENDAR_ACCESS_TOKEN || '',
    calendarId: env.GOOGLE_CALENDAR_ID || 'primary',
    googleClientId,
    googleClientSecret,
    googleRedirectUri,
    backendOrigin: redirect.origin,
  };
}
