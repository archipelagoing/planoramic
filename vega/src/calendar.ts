// Local development: VDA reverse maps the TV's port 3001 to the Mac backend.
export const API_ORIGIN = 'http://127.0.0.1:3001';

export interface CalendarEvent {
  id: string;
  calendarId: string;
  calendarName: string;
  title: string;
  start: {date?: string; dateTime?: string};
  end?: {date?: string; dateTime?: string};
  allDay: boolean;
  location: string;
  description: string;
  color?: string;
}
export interface Device {
  deviceId: string;
  deviceCredential: string;
}
export interface Pairing {
  sessionId: string;
  sessionSecret: string;
  pairingCode: string;
  expiresAt: string;
}
export interface EventResponse {
  events: CalendarEvent[];
  calendarCount: number;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export async function request<T>(
  path: string,
  signal: AbortSignal,
  credential?: string,
  body?: object,
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort);
  if (signal.aborted) abort();
  // Multi-calendar Google fetching can take longer than a simple local API call.
  const timeout = setTimeout(abort, 60000);
  try {
    const response = await fetch(`${API_ORIGIN}${path}`, {
      method: body ? 'POST' : 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body ? {'Content-Type': 'application/json'} : {}),
        ...(credential ? {Authorization: `Bearer ${credential}`} : {}),
      },
      ...(body ? {body: JSON.stringify(body)} : {}),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error?.code || 'API_ERROR',
        data.error?.message || 'Calendar request failed.',
      );
    }
    return data as T;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', abort);
  }
}

export function eventDate(event: CalendarEvent): Date {
  if (event.start.dateTime) return new Date(event.start.dateTime);
  const [year, month, day] = (event.start.date || '').split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function dateRange(view: 'today' | 'week', now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + (view === 'today' ? 1 : 7));
  return {timeMin: start.toISOString(), timeMax: end.toISOString()};
}

export function eventTime(event: CalendarEvent) {
  if (event.allDay || event.start.date) return 'All day';
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };
  const start = eventDate(event).toLocaleTimeString(undefined, options);
  const end = event.end?.dateTime ? new Date(event.end.dateTime) : null;
  return end && Number.isFinite(+end)
    ? `${start} – ${end.toLocaleTimeString(undefined, options)}`
    : start;
}
