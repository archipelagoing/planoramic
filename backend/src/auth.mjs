import {createHash, randomBytes} from 'node:crypto';
import {ApiError} from './errors.mjs';
import {createGoogleProvider} from './google.mjs';

const random = () => randomBytes(32).toString('base64url');
const hash = value => createHash('sha256').update(value).digest('base64url');
const SESSION_COOKIE = 'planoramic_session';
const STATE_COOKIE = 'planoramic_oauth';
function cookie(req, name) {
  return (req.headers.cookie || '')
    .split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function createAuth(
  config,
  {now = Date.now, provider = createGoogleProvider(config)} = {},
) {
  const transactions = new Map();
  const sessions = new Map();
  const accounts = new Map();
  const refreshing = new Map();
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.googleRedirectUri?.startsWith('https:'),
    path: '/',
  };
  const configured = Boolean(
    config.googleClientId && config.googleClientSecret,
  );
  function prune(map) {
    for (const [key, entry] of map)
      if (entry.expiresAt <= now()) map.delete(key);
    if (map.size >= 1000)
      throw new ApiError(
        503,
        'AUTH_CAPACITY_REACHED',
        'Local authentication capacity reached.',
      );
  }
  function current(req) {
    const credential = cookie(req, SESSION_COOKIE);
    const session = credential && sessions.get(hash(credential));
    if (!session) return null;
    if (session.expiresAt <= now()) {
      sessions.delete(hash(credential));
      return null;
    }
    return accounts.get(session.userId) || null;
  }
  function requireUser(req) {
    const account = current(req);
    if (!account)
      throw new ApiError(401, 'UNAUTHORIZED', 'Sign in with Google first.');
    return account;
  }
  function checkOrigin(req) {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      ![config.backendOrigin, config.webOrigin].includes(req.get('Origin'))
    ) {
      throw new ApiError(
        403,
        'INVALID_ORIGIN',
        'Request origin is not allowed.',
      );
    }
  }
  function clearSession(req, res) {
    const credential = cookie(req, SESSION_COOKIE);
    if (credential) sessions.delete(hash(credential));
    res.clearCookie(SESSION_COOKIE, cookieOptions);
  }
  async function accessToken(userId, force = false) {
    const account = accounts.get(userId);
    if (!account?.tokens)
      throw new ApiError(
        503,
        'CALENDAR_REAUTH_REQUIRED',
        'Reconnect your Google calendar.',
      );
    const tokens = account.tokens;
    if (!force && tokens.access_token && tokens.expiry_date > now() + 60000)
      return tokens.access_token;
    if (!tokens.refresh_token)
      throw new ApiError(
        503,
        'CALENDAR_REAUTH_REQUIRED',
        'Reconnect Google to grant offline access.',
      );
    if (!refreshing.has(userId)) {
      const job = (async () => {
        try {
          const updated = await provider.refresh(tokens);
          if (!updated.access_token)
            throw new ApiError(
              502,
              'GOOGLE_REFRESH_FAILED',
              'Google did not return an access token.',
            );
          // Do not undo a disconnect or overwrite credentials from a newer sign-in.
          if (account.tokens !== tokens)
            throw new ApiError(
              409,
              'CONNECTION_CHANGED',
              'Calendar connection changed. Retry the request.',
            );
          account.tokens = {
            ...tokens,
            ...updated,
            refresh_token: updated.refresh_token || tokens.refresh_token,
          };
          return account.tokens.access_token;
        } catch (error) {
          if (
            error.code === 'CALENDAR_REAUTH_REQUIRED' &&
            account.tokens === tokens
          )
            account.tokens = null;
          throw error;
        }
      })().finally(() => refreshing.delete(userId));
      refreshing.set(userId, job);
    }
    return refreshing.get(userId);
  }
  function mount(app, limiter) {
    app.use('/auth', limiter);
    app.get('/auth/google', async (req, res) => {
      if (!configured)
        throw new ApiError(
          503,
          'GOOGLE_NOT_CONFIGURED',
          'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env, then restart the backend.',
        );
      prune(transactions);
      const oldState = cookie(req, STATE_COOKIE);
      if (oldState) transactions.delete(hash(oldState));
      const state = random();
      const verifier = random();
      const nonce = random();
      transactions.set(hash(state), {
        verifier,
        nonce,
        expiresAt: now() + 600000,
      });
      res.cookie(STATE_COOKIE, state, {...cookieOptions, maxAge: 600000});
      res.redirect(
        provider.authorizationUrl({state, nonce, challenge: hash(verifier)}),
      );
    });
    app.get('/auth/google/callback', async (req, res) => {
      const state = req.query.state;
      const browserState = cookie(req, STATE_COOKIE);
      const transaction =
        typeof state === 'string' &&
        browserState === state &&
        transactions.get(hash(state));
      if (!transaction || transaction.expiresAt <= now())
        throw new ApiError(
          400,
          'INVALID_OAUTH_STATE',
          'Sign-in expired or belongs to another browser. Start again from /connect.',
        );
      transactions.delete(hash(state));
      res.clearCookie(STATE_COOKIE, cookieOptions);
      if (req.query.error)
        throw new ApiError(
          400,
          'GOOGLE_CONSENT_DENIED',
          'Google access was not granted. Start again from /connect.',
        );
      if (typeof req.query.code !== 'string' || !req.query.code)
        throw new ApiError(
          400,
          'INVALID_OAUTH_CODE',
          'Missing Google authorization code.',
        );
      const {user, tokens} = await provider.exchange({
        code: req.query.code,
        ...transaction,
      });
      const previous = accounts.get(user.id);
      const merged = {
        ...tokens,
        refresh_token: tokens.refresh_token || previous?.tokens?.refresh_token,
      };
      if (!merged.refresh_token)
        throw new ApiError(
          403,
          'OFFLINE_ACCESS_REQUIRED',
          'Reconnect Google and grant offline calendar access.',
        );
      prune(sessions);
      if (!previous && accounts.size >= 1000)
        throw new ApiError(
          503,
          'AUTH_CAPACITY_REACHED',
          'Local account capacity reached.',
        );
      if (previous) {
        previous.user = user;
        previous.tokens = merged;
      } else accounts.set(user.id, {user, tokens: merged});
      clearSession(req, res);
      const credential = random();
      sessions.set(hash(credential), {
        userId: user.id,
        expiresAt: now() + 86400000,
      });
      res.cookie(SESSION_COOKIE, credential, {
        ...cookieOptions,
        maxAge: 86400000,
      });
      res.redirect('/connect');
    });
    app.get('/auth/me', (req, res) => {
      const account = current(req);
      res.json({
        configured,
        user: account?.user || null,
        calendarConnected: Boolean(account?.tokens),
      });
    });
    app.post('/auth/logout', (req, res) => {
      checkOrigin(req);
      clearSession(req, res);
      res.status(204).end();
    });
    app.post('/auth/disconnect', (req, res) => {
      checkOrigin(req);
      const account = requireUser(req);
      account.tokens = null;
      // All sessions lose access. Device event calls fail until the owner reconnects.
      for (const [key, session] of sessions)
        if (session.userId === account.user.id) sessions.delete(key);
      clearSession(req, res);
      res.status(204).end();
    });
  }
  return {mount, current, requireUser, checkOrigin, accessToken};
}
