import {CalendarEvent, eventDate} from './calendar';
export function eventsOnDay(
  events: CalendarEvent[],
  now: Date,
): CalendarEvent[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return events.filter((event) => {
    const from = eventDate(event);
    let until = event.end?.dateTime
      ? new Date(event.end.dateTime)
      : event.end?.date
      ? eventDate({...event, start: {date: event.end.date}})
      : null;
    if (!until || !Number.isFinite(+until)) {
      if (event.allDay || event.start.date) {
        until = new Date(from);
        until.setDate(until.getDate() + 1);
      } else return +from >= +start && +from < +end;
    }
    return +from < +end && +until > +start;
  });
}
