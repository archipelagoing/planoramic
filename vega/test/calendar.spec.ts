import {
  ApiError,
  CalendarEvent,
  dateRange,
  eventDate,
  eventTime,
  request,
} from '../src/calendar';

const event = (
  start: CalendarEvent['start'],
  allDay = false,
): CalendarEvent => ({
  id: 'event',
  calendarId: 'family',
  calendarName: 'Family',
  title: 'Dinner',
  start,
  allDay,
  location: '',
  description: '',
});

describe('Vega calendar API', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('registers without a device credential and sends the device name', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({pairingCode: 'ABCDEF12'}),
    });
    globalThis.fetch = fetchMock;
    const signal = new AbortController().signal;
    await request('/api/devices/register', signal, undefined, {
      name: 'Hearth Fire TV',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/devices/register'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({name: 'Hearth Fire TV'}),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  it('uses the paired credential and preserves the server error code for recovery', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: {code: 'UNAUTHORIZED', message: 'Pair again'},
      }),
    });
    globalThis.fetch = fetchMock;
    await expect(
      request(
        '/api/devices/display/events',
        new AbortController().signal,
        'test-device-credential',
      ),
    ).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Pair again',
    } as Partial<ApiError>);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer test-device-credential',
    );
  });

  it('forwards cancellation to an in-flight request', async () => {
    let forwardedSignal: AbortSignal | undefined;
    globalThis.fetch = jest.fn().mockImplementation((_url, options) => {
      forwardedSignal = options.signal;
      return new Promise((_resolve, reject) =>
        forwardedSignal!.addEventListener('abort', () =>
          reject(new Error('Aborted')),
        ),
      );
    });
    const controller = new AbortController();
    const pending = request('/health', controller.signal);
    controller.abort();
    await expect(pending).rejects.toThrow('Aborted');
    expect(forwardedSignal?.aborted).toBe(true);
  });
});

describe('calendar date handling', () => {
  it('keeps all-day dates at local midnight instead of parsing them as UTC', () => {
    const date = eventDate(event({date: '2026-10-23'}, true));
    expect([
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
    ]).toEqual([2026, 9, 23, 0]);
    expect(eventTime(event({date: '2026-10-23'}, true))).toBe('All day');
  });

  it('uses local calendar boundaries across the daylight-saving transition', () => {
    const start = new Date(2026, 9, 30, 17, 45);
    const range = dateRange('week', start);
    const min = new Date(range.timeMin);
    const max = new Date(range.timeMax);
    expect([min.getDate(), min.getHours()]).toEqual([30, 0]);
    expect([max.getMonth(), max.getDate(), max.getHours()]).toEqual([10, 6, 0]);
    const today = dateRange('today', start);
    expect(new Date(today.timeMax).getDate()).toBe(31);
  });
});
