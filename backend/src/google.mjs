import {OAuth2Client} from 'google-auth-library';
import {ApiError} from './errors.mjs';

export const CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/calendar.events.readonly';
export const CALENDAR_LIST_SCOPE =
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly';
export const CALENDAR_WRITE_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

export function createGoogleProvider(config) {
  const client = () =>
    new OAuth2Client({
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
      redirectUri: config.googleRedirectUri,
      transporterOptions: {timeout: 10000, retry: false},
    });
  return {
    authorizationUrl({state, nonce, challenge}) {
      return client().generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['openid', 'email', CALENDAR_WRITE_SCOPE, CALENDAR_LIST_SCOPE],
        state,
        nonce,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      });
    },
    async exchange({code, verifier, nonce}) {
      try {
        const oauth = client();
        const {tokens} = await oauth.getToken({code, codeVerifier: verifier});
        const scopes = new Set((tokens.scope || '').split(' '));
        if ((!scopes.has(CALENDAR_SCOPE) && !scopes.has(CALENDAR_WRITE_SCOPE)) || !scopes.has(CALENDAR_LIST_SCOPE))
          throw new ApiError(
            403,
            'CALENDAR_PERMISSION_REQUIRED',
            'Allow calendar list and calendar event access when connecting Google.',
          );
        if (!tokens.id_token || !tokens.access_token)
          throw new Error('Missing tokens');
        const ticket = await oauth.verifyIdToken({
          idToken: tokens.id_token,
          audience: config.googleClientId,
        });
        const payload = ticket.getPayload();
        if (!payload?.sub || payload.nonce !== nonce || !payload.email_verified)
          throw new Error('Invalid identity');
        return {
          user: {id: `google:${payload.sub}`, email: payload.email},
          tokens,
        };
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
          502,
          'GOOGLE_LOGIN_FAILED',
          'Google sign-in could not be verified. Please try connecting again.',
        );
      }
    },
    async refresh(tokens) {
      try {
        const oauth = client();
        oauth.setCredentials(tokens);
        const {credentials} = await oauth.refreshAccessToken();
        return credentials;
      } catch (error) {
        if (error.response?.data?.error === 'invalid_grant') {
          throw new ApiError(
            503,
            'CALENDAR_REAUTH_REQUIRED',
            'Google access expired or was revoked. Reconnect Google.',
          );
        }
        throw new ApiError(
          502,
          'GOOGLE_REFRESH_FAILED',
          'Google token refresh failed. Try again shortly.',
        );
      }
    },
  };
}
