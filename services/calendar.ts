import {Platform} from 'react-native';

export const API_URL: string = (
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web' ? 'http://localhost:3001' : '')
).replace(/\/$/, '');

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
  timeMin: string;
  timeMax: string;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}
export async function request<T>(
  path: string,
  signal: AbortSignal,
  credential?: string,
  body?: object,
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      'Set EXPO_PUBLIC_API_URL to your backend’s LAN address, then restart Expo.',
    );
  }
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal.addEventListener('abort', cancel);
  if (signal.aborted) {
    controller.abort();
  }
  const timeout = setTimeout(cancel, 40000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: body ? 'POST' : 'GET',
      signal: controller.signal,
      headers: {
        ...(body ? {'Content-Type': 'application/json'} : {}),
        ...(credential ? {Authorization: `Bearer ${credential}`} : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials:
        Platform.OS === 'web' && path.startsWith('/api/display/')
          ? 'include'
          : 'omit',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error?.message || 'Calendar request failed.',
        data.error?.code,
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(
      'Cannot reach the calendar service. Check the backend and network, then try again.',
    );
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', cancel);
  }
}

// Calendar dates have no timezone: construct local midnight rather than parsing as UTC.
export function eventDate(event: CalendarEvent): Date {
  if (event.start.date) {
    const [year, month, day] = event.start.date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(event.start.dateTime || '');
}
export function eventSections(events: CalendarEvent[]) {
  const groups = new Map<string, {title: string; data: CalendarEvent[]}>();
  for (const event of [...events].sort(
    (a, b) => eventDate(a).getTime() - eventDate(b).getTime(),
  )) {
    const date = eventDate(event);
    if (Number.isNaN(date.getTime())) {
      continue;
    }
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!groups.has(key)) {
      groups.set(key, {
        title: date.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        data: [],
      });
    }
    groups.get(key)!.data.push(event);
  }
  return [...groups.values()];
}
