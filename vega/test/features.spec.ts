import {initialTimer, timerReducer, timerLabel} from '../src/timer';
import {parseWeather, weatherLabel} from '../src/weather';
import {eventsOnDay} from '../src/brief';
import {CalendarEvent} from '../src/calendar';

test('timer catches up after delayed ticks and counts a completed focus only once', () => {
  const running = timerReducer(initialTimer, {type: 'toggle', now: 1000});
  const late = timerReducer(running, {type: 'tick', now: 61000});
  expect(late.remaining).toBe(1440);
  const done = timerReducer(late, {type: 'tick', now: 1600000});
  expect(done).toMatchObject({
    remaining: 0,
    completed: 1,
    finished: true,
    endsAt: null,
  });
  expect(timerReducer(done, {type: 'tick', now: 1700000}).completed).toBe(1);
});
test('pause and resume preserve remaining time and breaks do not count as focus', () => {
  const running = timerReducer(initialTimer, {type: 'toggle', now: 0});
  const paused = timerReducer(running, {type: 'toggle', now: 60500});
  expect(paused.remaining).toBe(1440);
  const resumed = timerReducer(paused, {type: 'toggle', now: 100000});
  expect(resumed.endsAt).toBe(1540000);
  const short = timerReducer(resumed, {type: 'mode', mode: 'short'});
  const breakRunning = timerReducer(short, {type: 'toggle', now: 0});
  expect(
    timerReducer(breakRunning, {type: 'tick', now: 300000}).completed,
  ).toBe(0);
  expect(timerLabel(short.remaining)).toBe('05:00');
});
test('weather rejects missing data and excludes incomplete forecast days', () => {
  expect(() => parseWeather(null)).toThrow();
  expect(
    parseWeather({
      daily: {
        time: ['2026-10-23', '2026-10-24'],
        temperature_2m_max: [65, null],
        temperature_2m_min: [42, 40],
        weather_code: [0, 3],
      },
    }),
  ).toEqual([{date: '2026-10-23', high: 65, low: 42, code: 0}]);
  expect(weatherLabel(71)).toBe('Snow');
});
test('daily brief includes overlapping events and respects exclusive all-day end', () => {
  const base = {
    calendarId: 'home',
    calendarName: 'Home',
    title: 'Event',
    allDay: false,
    location: '',
    description: '',
  };
  const events: CalendarEvent[] = [
    {
      ...base,
      id: 'multi',
      start: {date: '2026-10-22'},
      end: {date: '2026-10-24'},
      allDay: true,
    },
    {
      ...base,
      id: 'ended',
      start: {date: '2026-10-22'},
      end: {date: '2026-10-23'},
      allDay: true,
    },
    {
      ...base,
      id: 'overnight',
      start: {dateTime: '2026-10-22T23:00:00'},
      end: {dateTime: '2026-10-23T01:00:00'},
    },
  ];
  expect(
    eventsOnDay(events, new Date(2026, 9, 23)).map((event) => event.id),
  ).toEqual(['multi', 'overnight']);
});
