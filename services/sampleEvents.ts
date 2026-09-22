import type {CalendarEvent} from './calendar';

// Relative local dates keep the preview useful whenever the app is opened.
export function sampleEvents(now = new Date()): CalendarEvent[] {
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const date = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, '0'),
    String(tomorrow.getDate()).padStart(2, '0'),
  ].join('-');
  return [
    {
      id: 'sample-birthday',
      calendarId: 'sample-family',
      calendarName: 'Family',
      title: 'Alex’s birthday',
      start: {date},
      allDay: true,
      location: '',
      description: 'Remember to call Alex and wish them a happy birthday.',
    },
    {
      id: 'sample-planning',
      calendarId: 'sample-work',
      calendarName: 'Work',
      title: 'Weekly planning',
      start: {
        dateTime: new Date(new Date(tomorrow).setHours(10)).toISOString(),
      },
      allDay: false,
      location: 'Studio',
      description:
        'Review the week’s priorities and choose the next milestone.',
    },
    {
      id: 'sample-dinner',
      calendarId: 'sample-family',
      calendarName: 'Family',
      title: 'Dinner together',
      start: {
        dateTime: new Date(new Date(tomorrow).setHours(18, 30)).toISOString(),
      },
      allDay: false,
      location: 'Home',
      description: 'A relaxed evening with everyone around the table.',
    },
    {
      id: 'sample-walk',
      calendarId: 'sample-personal',
      calendarName: 'Personal',
      title: 'Morning walk',
      start: {
        dateTime: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 2,
          9,
        ).toISOString(),
      },
      allDay: false,
      location: 'Riverside park',
      description: 'Bring water and enjoy a little time outdoors.',
    },
  ];
}
