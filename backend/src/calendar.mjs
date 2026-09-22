import {ApiError} from './errors.mjs';

export function createCalendarClient(config, fetchImpl = fetch) {
  return async ({timeMin, timeMax}) => {
    let accessToken = config.getAccessToken
      ? await config.getAccessToken(false)
      : config.calendarToken;
    if (!accessToken) {
      throw new ApiError(
        503,
        'CALENDAR_NOT_CONNECTED',
        'Google Calendar is not connected. Complete OAuth setup or configure a temporary development access token.',
      );
    }
    const events = [];
    // Bound the entire multi-calendar fetch, including pagination and retries.
    const signal = AbortSignal.timeout(30000);
    try {
      async function getPage(url, listing = false) {
        let response = await fetchImpl(url, {
          headers: {Authorization: `Bearer ${accessToken}`},
          signal,
        });
        if (response.status === 401 && config.getAccessToken) {
          accessToken = await config.getAccessToken(true);
          response = await fetchImpl(url, {
            headers: {Authorization: `Bearer ${accessToken}`},
            signal,
          });
        }
        if (response.status === 401) {
          throw new ApiError(
            503,
            'CALENDAR_REAUTH_REQUIRED',
            'Google access expired or was revoked. Reconnect the calendar.',
          );
        }
        if (response.status === 403) {
          throw new ApiError(
            503,
            'CALENDAR_ACCESS_DENIED',
            listing
              ? 'Reconnect Google and grant calendar list access to include your other calendars.'
              : 'A calendar could not be read. Check its sharing permissions and try again.',
          );
        }
        if (!response.ok) {
          throw new ApiError(
            502,
            'CALENDAR_UPSTREAM_ERROR',
            'Google Calendar could not return events.',
          );
        }
        return response.json();
      }
      async function pages(url, listing = false) {
        const items = [];
        for (let page = 0; page < 20; page++) {
          const data = await getPage(url, listing);
          items.push(...(data.items || []));
          if (!data.nextPageToken) return items;
          url.searchParams.set('pageToken', data.nextPageToken);
        }
        throw new ApiError(
          422,
          'CALENDAR_RANGE_TOO_LARGE',
          'Too many calendars or events. Request a shorter date range.',
        );
      }
      let calendars = [
        {id: config.calendarId || 'primary', summary: 'Calendar'},
      ];
      if (config.includeAllCalendars) {
        const listUrl = new URL(
          'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        );
        listUrl.search = new URLSearchParams({
          minAccessRole: 'reader',
          showHidden: 'true',
          maxResults: '250',
        });
        const listed = await pages(listUrl, true);
        calendars = [
          ...new Map(
            listed
              .filter(
                calendar =>
                  !calendar.deleted &&
                  [
                    'reader',
                    'writer',
                    'writerWithoutPrivateAccess',
                    'owner',
                  ].includes(calendar.accessRole),
              )
              .map(calendar => [calendar.id, calendar]),
          ).values(),
        ];
      }
      for (const calendar of calendars) {
        const url = new URL(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events`,
        );
        url.search = new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '250',
        });
        for (const event of await pages(url)) {
          if (event.status === 'cancelled') continue;
          events.push({
            id: event.id,
            calendarId: calendar.id,
            calendarName:
              calendar.summaryOverride || calendar.summary || calendar.id,
            title: event.summary || '(Untitled)',
            start: event.start,
            end: event.end,
            allDay: Boolean(event.start?.date),
            location: event.location || '',
            description: event.description || '',
          });
        }
      }
      events.sort(
        (a, b) =>
          Date.parse(a.start?.dateTime || a.start?.date) -
            Date.parse(b.start?.dateTime || b.start?.date) ||
          a.calendarId.localeCompare(b.calendarId) ||
          a.id.localeCompare(b.id),
      );
      return {events, timeMin, timeMax, calendarCount: calendars.length};
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        502,
        'CALENDAR_UNAVAILABLE',
        'Google Calendar request failed or timed out.',
      );
    }
  };
}
