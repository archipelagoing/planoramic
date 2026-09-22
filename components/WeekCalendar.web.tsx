import React, {useEffect, useMemo, useRef, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type {WeekCalendarProps} from './WeekCalendar';
import {CalendarEvent, EventResponse, request} from '../services/calendar';
import {useTheme} from '../theme/ThemeProvider';
import {useFont} from '../theme/FontProvider';
import GlassButton from './GlassButton';
import {Clock} from './CalendarOverview';
import './week-calendar.css';
import {useTasks} from '../theme/TasksProvider';
import {useWeather, weatherLabel} from '../services/weather';

function weekRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return {start: start.toISOString(), end: end.toISOString()};
}

export default function WeekCalendar({
  events,
  device,
  preview,
  hidden,
  refreshToken,
}: WeekCalendarProps) {
  const {colors, dark} = useTheme();
  const {family, fontScale} = useFont();
  const {personForCalendar, owners, people} = useTasks();
  const weather = useWeather();
  const [view, setView] = useState<'week' | 'day'>('week');
  const main = useRef<FullCalendar>(null);
  const mini = useRef<FullCalendar>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [range, setRange] = useState(() => weekRange(new Date()));
  const [loaded, setLoaded] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [detail, setDetail] = useState<CalendarEvent | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (preview || !device) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setLoaded([]);
    const query = new URLSearchParams({
      timeMin: range.start,
      timeMax: range.end,
    });
    request<EventResponse>(`/api/display/events?${query}`, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setLoaded(data.events);
      })
      .catch(err => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [range.start, range.end, preview, device, refreshToken, retry]);
  useEffect(() => {
    if (detail) dialog.current?.showModal();
  }, [detail]);
  const items = useMemo(
    () =>
      (preview ? events : loaded)
        .filter(event => !hidden.includes(event.calendarId))
        .map(event => ({
          id: `${event.calendarId}:${event.id}`,
          title: event.title,
          start: event.start.dateTime || event.start.date,
          end: event.end?.dateTime || event.end?.date,
          allDay: event.allDay,
          borderColor:
            personForCalendar(event.calendarId)?.color ||
            (/^#[a-fA-F0-9]{6}$/.test(event.personColor || '')
              ? event.personColor
              : undefined),
          extendedProps: {
            source: event,
            person: personForCalendar(event.calendarId)?.name || event.person,
          },
        })),
    [preview, events, loaded, hidden, owners, people],
  );
  const choose = (date: Date, openDay = false) => {
    setSelectedDate(date);
    if (openDay) {
      setView('day');
      main.current?.getApi().changeView('timeGridDay', date);
    } else main.current?.getApi().gotoDate(date);
    mini.current?.getApi().gotoDate(date);
  };
  const move = (direction: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction * (view === 'week' ? 7 : 1));
    choose(date);
  };
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const dateButton = (date: Date, small = false) => (
    <button
      type="button"
      className={`date-circle ${small ? 'small' : ''} ${same(date, now) ? 'today' : ''} ${same(date, selectedDate) ? 'selected' : ''}`}
      aria-label={`Select ${date.toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}`}
      aria-pressed={same(date, selectedDate)}
      aria-current={same(date, now) ? 'date' : undefined}
      onClick={() => choose(date, true)}>
      {date.getDate()}
    </button>
  );
  return (
    <div
      className={`week-calendar ${dark ? 'dark' : 'light'}`}
      data-testid="timed-week"
      style={
        {
          '--ink': colors.text,
          '--muted': colors.muted,
          '--accent': colors.accent,
          '--line': colors.glassBorder,
          '--italic': `${family}_Italic`,
          '--font-scale': fontScale,
          fontFamily: family,
        } as React.CSSProperties
      }>
      <div className="week-toolbar">
        <div
          role="radiogroup"
          aria-label="Schedule view"
          style={{display: 'flex', gap: 8}}>
          <GlassButton
            label="Day"
            radio
            selected={view === 'day'}
            onPress={() => choose(selectedDate, true)}
          />
          <GlassButton
            label="Week"
            radio
            selected={view === 'week'}
            onPress={() => {
              setView('week');
              main.current?.getApi().changeView('timeGridWeek', selectedDate);
            }}
          />
        </div>
        <GlassButton label="Today" onPress={() => choose(new Date())} />
        <GlassButton
          label={view === 'week' ? 'Previous week' : 'Previous day'}
          icon="chevron-left"
          iconOnly
          circular
          onPress={() => move(-1)}
        />
        <GlassButton
          label={view === 'week' ? 'Next week' : 'Next day'}
          icon="chevron-right"
          iconOnly
          circular
          onPress={() => move(1)}
        />
        <h2>
          {selectedDate.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <span className="week-range">
          {new Date(range.start).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}{' '}
          -{' '}
          {new Date(+new Date(range.end) - 1).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      <div className="week-layout">
        <aside className="week-sidebar">
          <div className="mini-calendar" data-testid="side-month">
            <FullCalendar
              ref={mini}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              firstDay={1}
              headerToolbar={{left: 'title', center: '', right: 'prev,next'}}
              titleFormat={{month: 'long', year: 'numeric'}}
              height="auto"
              fixedWeekCount
              dayHeaderFormat={{weekday: 'narrow'}}
              dayCellContent={info => dateButton(info.date, true)}
            />
          </div>
          <div className="side-clock">
            <Clock now={now} compact />
          </div>
          <div className="weather-location">
            <span>East Brunswick, NJ · 08816</span>
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Weather by Open-Meteo
            </a>
            {weather.error && (
              <>
                <span role="status">{weather.error}</span>
                <GlassButton
                  label="Retry weather"
                  icon="refresh"
                  iconOnly
                  onPress={weather.retry}
                />
              </>
            )}
          </div>
        </aside>
        <section
          className="week-main"
          aria-label={view === 'week' ? 'Weekly schedule' : 'Daily schedule'}
          aria-busy={loading}>
          {loading && (
            <div role="status" className="week-status">
              Loading {view}...
            </div>
          )}
          {error && (
            <div role="alert" className="week-status">
              {error}{' '}
              <button
                type="button"
                onClick={() => setRetry(value => value + 1)}>
                Retry {view}
              </button>
            </div>
          )}
          <div className="week-horizontal-scroll">
            <div className={`week-grid ${view === 'day' ? 'day-grid' : ''}`}>
              <FullCalendar
                ref={main}
                plugins={[timeGridPlugin]}
                initialView="timeGridWeek"
                firstDay={1}
                headerToolbar={false}
                height="100%"
                allDaySlot
                nowIndicator
                scrollTime="07:00:00"
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                slotLabelFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  omitZeroMinute: true,
                  meridiem: 'short',
                }}
                slotEventOverlap={false}
                eventMinHeight={24}
                editable={false}
                events={items}
                datesSet={info =>
                  setRange(previous =>
                    previous.start === info.start.toISOString() &&
                    previous.end === info.end.toISOString()
                      ? previous
                      : {
                          start: info.start.toISOString(),
                          end: info.end.toISOString(),
                        },
                  )
                }
                dayHeaderContent={info => (
                  <div className="week-day">
                    <span>
                      {info.date.toLocaleDateString(undefined, {
                        weekday: 'short',
                      })}
                    </span>
                    {dateButton(info.date)}
                    {(() => {
                      const date = `${info.date.getFullYear()}-${String(info.date.getMonth() + 1).padStart(2, '0')}-${String(info.date.getDate()).padStart(2, '0')}`;
                      const forecast = weather.days.find(
                        day => day.date === date,
                      );
                      return (
                        <span className="day-weather">
                          {forecast
                            ? `${weatherLabel(forecast.code)} ${Math.round(forecast.high)}° / ${Math.round(forecast.low)}°F`
                            : 'Forecast unavailable'}
                        </span>
                      );
                    })()}
                  </div>
                )}
                eventClick={info => setDetail(info.event.extendedProps.source)}
                eventDidMount={info => {
                  info.el.setAttribute(
                    'title',
                    `${info.event.title}\n${info.event.extendedProps.source.calendarName}`,
                  );
                }}
                eventContent={info => (
                  <div className="week-event-content">
                    <strong>{info.event.title}</strong>
                    <span>{info.timeText}</span>
                    {info.event.extendedProps.person && (
                      <span>{info.event.extendedProps.person}</span>
                    )}
                    <em>
                      {info.event.extendedProps.source.location ||
                        info.event.extendedProps.source.calendarName}
                    </em>
                  </div>
                )}
              />
            </div>
          </div>
        </section>
      </div>
      <dialog
        ref={dialog}
        className="event-dialog"
        onClose={() => setDetail(null)}
        aria-labelledby="week-event-title">
        {detail && (
          <>
            <h2 id="week-event-title">{detail.title}</h2>
            <p>
              {detail.allDay
                ? 'All day'
                : new Date(detail.start.dateTime!).toLocaleString()}
              {detail.end?.dateTime
                ? ` - ${new Date(detail.end.dateTime).toLocaleString()}`
                : ''}
            </p>
            <p>
              <em>
                {detail.calendarName}
                {detail.location ? ` · ${detail.location}` : ''}
              </em>
            </p>
            {detail.description && (
              <p className="event-description">{detail.description}</p>
            )}
            <button type="button" onClick={() => dialog.current?.close()}>
              Close
            </button>
          </>
        )}
      </dialog>
    </div>
  );
}
