import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import express from 'express';
import cors from 'cors';
import {rateLimit} from 'express-rate-limit';
import {ApiError} from './errors.mjs';
import {createCalendarClient} from './calendar.mjs';
import {createTaskClient} from './tasks.mjs';
import {createAuth} from './auth.mjs';
import {fileURLToPath} from 'node:url';

const digest = value => createHash('sha256').update(value).digest();
const matches = (a, b) => timingSafeEqual(digest(a), digest(b));
const token = () => randomBytes(32).toString('hex');
const isoDate = value =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(
    value,
  ) &&
  Number.isFinite(Date.parse(value));

function body(req, allowed) {
  const value = req.body;
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some(key => !allowed.includes(key))
  ) {
    throw new ApiError(
      400,
      'INVALID_BODY',
      `Expected a JSON object with fields: ${allowed.join(', ')}.`,
    );
  }
  return value;
}

export function createApp(
  config,
  {
    now = Date.now,
    logger = console.log,
    calendar,
    googleProvider,
    calendarFetch = fetch,
  } = {},
) {
  const app = express();
  const auth = createAuth(config, {now, provider: googleProvider});
  const devices = new Map();
  const sessions = new Map();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.set('X-Request-Id', req.requestId);
    res.set('Cache-Control', 'no-store');
    res.set('Referrer-Policy', 'no-referrer');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    );
    const started = now();
    res.on('finish', () =>
      logger(
        JSON.stringify({
          requestId: req.requestId,
          method: req.method,
          route: req.route?.path || 'unmatched',
          status: res.statusCode,
          durationMs: now() - started,
        }),
      ),
    );
    next();
  });
  app.use(
    cors({
      origin: [config.webOrigin, config.displayOrigin],
      methods: ['GET', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );
  app.use(express.json({limit: '16kb'}));
  const bearer = req => {
    const match = /^Bearer ([^\s]+)$/.exec(req.get('Authorization') || '');
    if (!match)
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'A bearer credential is required.',
      );
    return match[1];
  };
  const controller = (req, res, next) => {
    if (req.get('Authorization')) {
      if (!matches(bearer(req), config.apiKey))
        throw new ApiError(
          401,
          'UNAUTHORIZED',
          'Invalid controller credential.',
        );
      req.ownerId = 'development';
    } else {
      auth.checkOrigin(req);
      req.ownerId = auth.requireUser(req).user.id;
    }
    next();
  };
  const deviceFor = req => {
    const device = devices.get(req.params.deviceId);
    if (!device || device.ownerId !== req.ownerId)
      throw new ApiError(404, 'DEVICE_NOT_FOUND', 'Device not found.');
    return device;
  };
  const deviceAuth = (req, res, next) => {
    const credential = bearer(req);
    const device = devices.get(req.params.deviceId);
    if (!device || !matches(credential, device.credential))
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid device credential.');
    req.device = device;
    next();
  };
  const publicDevice = device => ({
    id: device.id,
    name: device.name,
    settings: device.settings,
    revision: device.revision,
    appliedRevision: device.appliedRevision,
    lastSeenAt: device.lastSeenAt,
  });
  const limiter = (limit, windowMs) =>
    rateLimit({
      windowMs,
      limit,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (req, res, next) =>
        next(
          new ApiError(
            429,
            'RATE_LIMITED',
            'Too many requests. Try again later.',
          ),
        ),
    });
  app.get('/health', (req, res) =>
    res.json({status: 'ok', service: 'planoramic-backend', storage: 'memory'}),
  );
  app.use('/api', limiter(300, 60000));
  auth.mount(app, limiter(60, 60000));
  app.get('/connect', (req, res) =>
    res.sendFile(
      fileURLToPath(new URL('../public/connect.html', import.meta.url)),
    ),
  );
  app.use(
    '/connect-assets',
    express.static(fileURLToPath(new URL('../public', import.meta.url))),
  );

  app.post('/api/devices/register', limiter(10, 60000), (req, res) => {
    const {name} = body(req, ['name']);
    if (typeof name !== 'string' || !name.trim() || name.length > 80)
      throw new ApiError(
        400,
        'INVALID_NAME',
        'Device name must contain 1–80 characters.',
      );
    for (const [id, session] of sessions)
      if (session.expiresAt <= now()) sessions.delete(id);
    if (sessions.size >= 1000 || devices.size >= 1000)
      throw new ApiError(
        503,
        'CAPACITY_REACHED',
        'Development device capacity reached.',
      );
    let code;
    do {
      code = randomBytes(4).toString('hex').toUpperCase();
    } while ([...sessions.values()].some(session => session.code === code));
    const session = {
      id: randomUUID(),
      code,
      secret: token(),
      name: name.trim(),
      expiresAt: now() + 600000,
    };
    sessions.set(session.id, session);
    res.status(201).json({
      sessionId: session.id,
      pairingCode: code,
      sessionSecret: session.secret,
      expiresAt: new Date(session.expiresAt).toISOString(),
      pairingUrl: config.webOrigin,
    });
  });
  app.post(
    '/api/pairings/claim',
    limiter(10, 60000),
    controller,
    (req, res) => {
      const {code} = body(req, ['code']);
      if (typeof code !== 'string' || !/^[A-Fa-f0-9]{8}$/.test(code))
        throw new ApiError(
          400,
          'INVALID_CODE',
          'Enter the eight-character pairing code.',
        );
      const session = [...sessions.values()].find(
        value => value.code === code.toUpperCase() && value.expiresAt > now(),
      );
      if (!session)
        throw new ApiError(
          404,
          'PAIRING_NOT_FOUND',
          'Pairing code is invalid or expired.',
        );
      if (session.deviceId)
        throw new ApiError(
          409,
          'PAIRING_ALREADY_CLAIMED',
          'This code has already been used.',
        );
      const device = {
        id: randomUUID(),
        ownerId: req.ownerId,
        credential: token(),
        name: session.name,
        settings: {view: 'week'},
        revision: 0,
        appliedRevision: 0,
        lastSeenAt: null,
      };
      devices.set(device.id, device);
      session.deviceId = device.id;
      res.status(201).json({device: publicDevice(device)});
    },
  );
  app.get('/api/pairings/:sessionId', (req, res) => {
    const credential = bearer(req);
    const session = sessions.get(req.params.sessionId);
    if (!session || !matches(credential, session.secret))
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid pairing credential.');
    if (session.expiresAt <= now()) {
      sessions.delete(session.id);
      throw new ApiError(410, 'PAIRING_EXPIRED', 'Request a new pairing code.');
    }
    if (!session.deviceId) return res.json({status: 'pending'});
    const device = devices.get(session.deviceId);
    // Repeated polling returns the same credential until expiry, allowing retries.
    res.json({
      status: 'paired',
      deviceId: device.id,
      deviceCredential: device.credential,
    });
  });
  app.get('/api/devices', controller, (req, res) =>
    res.json({
      devices: [...devices.values()]
        .filter(device => device.ownerId === req.ownerId)
        .map(publicDevice),
    }),
  );
  app.post('/api/devices/:deviceId/control', controller, (req, res) => {
    const device = deviceFor(req);
    const {view, timeMin, timeMax, refresh} = body(req, [
      'view',
      'timeMin',
      'timeMax',
      'refresh',
    ]);
    if (
      (view === undefined && refresh !== true) ||
      (view !== undefined && !['today', 'week', 'range'].includes(view)) ||
      (refresh !== undefined && typeof refresh !== 'boolean')
    )
      throw new ApiError(
        400,
        'INVALID_CONTROL',
        'Provide a valid view or refresh: true.',
      );
    if (view === 'range') validateRange(timeMin, timeMax);
    else if (timeMin !== undefined || timeMax !== undefined)
      throw new ApiError(
        400,
        'INVALID_RANGE',
        'Date bounds require view: range.',
      );
    if (view)
      device.settings = view === 'range' ? {view, timeMin, timeMax} : {view};
    device.revision++;
    res.json({device: publicDevice(device)});
  });
  app.get('/api/devices/:deviceId/state', deviceAuth, (req, res) => {
    req.device.lastSeenAt = new Date(now()).toISOString();
    res.json({device: publicDevice(req.device)});
  });
  app.post('/api/devices/:deviceId/ack', deviceAuth, (req, res) => {
    const {revision} = body(req, ['revision']);
    if (
      !Number.isInteger(revision) ||
      revision < 0 ||
      revision > req.device.revision
    )
      throw new ApiError(
        400,
        'INVALID_REVISION',
        'Revision must refer to an issued display state.',
      );
    req.device.appliedRevision = Math.max(req.device.appliedRevision, revision);
    req.device.lastSeenAt = new Date(now()).toISOString();
    res.json({device: publicDevice(req.device)});
  });
  app.delete('/api/devices/:deviceId', controller, (req, res) => {
    const device = deviceFor(req);
    devices.delete(device.id);
    for (const [id, session] of sessions)
      if (session.deviceId === device.id) sessions.delete(id);
    res.status(204).end();
  });
  const events = async (req, res) => {
    if (
      Object.keys(req.query).some(key => !['timeMin', 'timeMax'].includes(key))
    )
      throw new ApiError(
        400,
        'INVALID_QUERY',
        'Only timeMin and timeMax are supported.',
      );
    const timeMin = req.query.timeMin ?? new Date(now()).toISOString();
    const timeMax =
      req.query.timeMax ?? new Date(now() + 7 * 86400000).toISOString();
    validateRange(timeMin, timeMax);
    const ownerId = req.device?.ownerId || req.ownerId;
    const client =
      calendar ||
      createCalendarClient(
        {
          ...config,
          includeAllCalendars: ownerId !== 'development',
          // A development token never substitutes for a Google user's own grant.
          calendarToken: ownerId === 'development' ? config.calendarToken : '',
          getAccessToken:
            ownerId === 'development'
              ? undefined
              : force => auth.accessToken(ownerId, force),
        },
        calendarFetch,
      );
    res.json(await client({timeMin, timeMax}));
  };
  const displayCookie = 'planoramic_display';
  const displayCookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.backendOrigin.startsWith('https:'),
    path: '/api/display',
  };
  app.use('/api/display', (req, res, next) => {
    if (
      ![config.displayOrigin, config.backendOrigin].includes(req.get('Origin'))
    ) {
      throw new ApiError(
        403,
        'INVALID_ORIGIN',
        'Display origin is not allowed.',
      );
    }
    next();
  });
  const browserDevice = (req, res, next) => {
    const value = (req.headers.cookie || '')
      .split(';')
      .map(part => part.trim())
      .find(part => part.startsWith(`${displayCookie}=`))
      ?.slice(displayCookie.length + 1);
    const [id, credential] = (value || '').split('.');
    const device = devices.get(id);
    if (!device || !credential || !matches(credential, device.credential)) {
      res.clearCookie(displayCookie, displayCookieOptions);
      throw new ApiError(401, 'UNAUTHORIZED', 'Pair this display to continue.');
    }
    req.device = device;
    next();
  };
  app.post('/api/display/session', (req, res) => {
    const {deviceId} = body(req, ['deviceId']);
    const credential = bearer(req);
    const device = devices.get(deviceId);
    if (!device || !matches(credential, device.credential)) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid device credential.');
    }
    res.cookie(displayCookie, `${device.id}.${credential}`, {
      ...displayCookieOptions,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
    res.json({deviceId: device.id, deviceCredential: ''});
  });
  app.get('/api/display/session', browserDevice, (req, res) => {
    res.json({deviceId: req.device.id, deviceCredential: ''});
  });
  app.get('/api/display/events', browserDevice, events);
  const taskClient = req =>
    createTaskClient(
      force => auth.accessToken(req.device.ownerId, force),
      calendarFetch,
    );
  app.get('/api/display/task-calendars', browserDevice, async (req, res) =>
    res.json({calendars: await taskClient(req).calendars()}),
  );
  app.get('/api/display/tasks', browserDevice, async (req, res) =>
    res.json({tasks: await taskClient(req).list(req.query.calendarId)}),
  );
  app.post('/api/display/tasks', browserDevice, async (req, res) =>
    res.json(await taskClient(req).mutate(req.body)),
  );
  app.get(
    '/api/devices/:deviceId/task-calendars',
    deviceAuth,
    async (req, res) =>
      res.json({calendars: await taskClient(req).calendars()}),
  );
  app.get('/api/devices/:deviceId/tasks', deviceAuth, async (req, res) =>
    res.json({tasks: await taskClient(req).list(req.query.calendarId)}),
  );
  app.post('/api/devices/:deviceId/tasks', deviceAuth, async (req, res) =>
    res.json(await taskClient(req).mutate(req.body)),
  );
  app.get('/api/calendar/events', controller, events);
  app.get('/api/devices/:deviceId/events', deviceAuth, events);
  app.use((req, res, next) =>
    next(new ApiError(404, 'NOT_FOUND', 'Endpoint not found.')),
  );
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const known = error instanceof ApiError;
    const malformed = error.type === 'entity.parse.failed';
    const tooLarge = error.type === 'entity.too.large';
    const status = known
      ? error.status
      : malformed
        ? 400
        : tooLarge
          ? 413
          : 500;
    // Never log headers, body, query strings, credentials, or upstream error text.
    const code = known
      ? error.code
      : malformed
        ? 'INVALID_JSON'
        : tooLarge
          ? 'BODY_TOO_LARGE'
          : 'INTERNAL_ERROR';
    logger(
      JSON.stringify({level: 'error', requestId: req.requestId, code, status}),
    );
    res.status(status).json({
      error: {
        code,
        message: known
          ? error.message
          : malformed
            ? 'Invalid JSON body.'
            : tooLarge
              ? 'Request body exceeds 16 KB.'
              : 'Unexpected server error.',
        requestId: req.requestId,
      },
    });
  });
  return app;
}

function validateRange(timeMin, timeMax) {
  if (
    !isoDate(timeMin) ||
    !isoDate(timeMax) ||
    Date.parse(timeMax) <= Date.parse(timeMin) ||
    Date.parse(timeMax) - Date.parse(timeMin) > 93 * 86400000
  ) {
    throw new ApiError(
      400,
      'INVALID_RANGE',
      'Use RFC3339 timestamps with offsets and an increasing range of at most 93 days.',
    );
  }
}
