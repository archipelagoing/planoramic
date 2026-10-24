import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useKeplerBackHandler} from '@amazon-devices/react-native-kepler';
import {
  ApiError,
  CalendarEvent,
  Device,
  EventResponse,
  Pairing,
  dateRange,
  eventDate,
  eventTime,
  request,
} from './calendar';

import {TVButton} from './ui';
import {Clock} from './Clock';
import {WeatherProvider, WeatherPreview, WeatherScreen} from './WeatherPanel';
import {PomodoroProvider, PomodoroScreen} from './Pomodoro';
import {BriefScreen, CalendarSources, CalendarSource} from './Panels';

const failureMessage = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : 'Cannot reach the calendar service. Check the backend and TV connection, then retry.';
const eventKey = (event: CalendarEvent) => `${event.calendarId}:${event.id}`;

export function App() {
  return (
    <WeatherProvider>
      <PomodoroProvider>
        <HearthApp />
      </PomodoroProvider>
    </WeatherProvider>
  );
}

function HearthApp() {
  const [section, setSection] = useState<
    'calendar' | 'brief' | 'weather' | 'pomo' | 'sources'
  >('calendar');
  const [hidden, setHidden] = useState<string[]>([]);
  const [sources, setSources] = useState<CalendarSource[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [pairing, setPairing] = useState<Pairing | null>(null);
  const [pairAttempt, setPairAttempt] = useState(0);
  const [pairError, setPairError] = useState('');
  const [view, setView] = useState<'today' | 'week'>('week');
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(new Date());
  const [loaded, setLoaded] = useState<{
    key: string;
    events: CalendarEvent[];
    calendars: number;
    at: Date;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [detail, setDetail] = useState(false);
  const [focused, setFocused] = useState('');
  const back = useKeplerBackHandler();
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const effectiveView = section === 'brief' ? 'week' : view;
  const rangeKey = `${device?.deviceId}:${effectiveView}:${dayKey}`;
  const rawData = loaded?.key === rangeKey ? loaded : null;
  const data = rawData
    ? {
        ...rawData,
        events: rawData.events.filter(
          (event) => !hidden.includes(event.calendarId),
        ),
      }
    : null;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const subscription = back.addEventListener('backPress', () => {
      if (detail) {
        setDetail(false);
        return true;
      }
      if (section !== 'calendar') {
        setSection('calendar');
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [back, detail, section]);

  useEffect(() => {
    if (device) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    setPairing(null);
    setPairError('');
    async function poll(session: Pairing) {
      if (controller.signal.aborted) return;
      if (Date.now() >= Date.parse(session.expiresAt)) {
        setPairAttempt((value) => value + 1);
        return;
      }
      try {
        const result = await request<{status: string} & Device>(
          `/api/pairings/${session.sessionId}`,
          controller.signal,
          session.sessionSecret,
        );
        if (controller.signal.aborted) return;
        if (
          result.status === 'paired' &&
          result.deviceId &&
          result.deviceCredential
        ) {
          setDevice({
            deviceId: result.deviceId,
            deviceCredential: result.deviceCredential,
          });
          setPairing(null);
          return;
        }
        setPairError('');
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && [401, 410].includes(err.status)) {
          setPairAttempt((value) => value + 1);
          return;
        }
        setPairError(failureMessage(err));
      }
      timer = setTimeout(() => {
        void poll(session);
      }, 5000);
    }
    void request<Pairing>(
      '/api/devices/register',
      controller.signal,
      undefined,
      {name: 'Hearth Fire TV'},
    )
      .then((session) => {
        if (controller.signal.aborted) return;
        setPairing(session);
        void poll(session);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setPairError(failureMessage(err));
      });
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [device, pairAttempt]);

  useEffect(() => {
    if (!device) return;
    const controller = new AbortController();
    const range = dateRange(effectiveView);
    setLoading(true);
    setError('');
    const query = `timeMin=${encodeURIComponent(
      range.timeMin,
    )}&timeMax=${encodeURIComponent(range.timeMax)}`;
    void request<EventResponse>(
      `/api/devices/${device.deviceId}/events?${query}`,
      controller.signal,
      device.deviceCredential,
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(result.events))
          throw new Error('Invalid events response');
        const events = result.events
          .filter((event) => Number.isFinite(+eventDate(event)))
          .sort((a, b) => +eventDate(a) - +eventDate(b));
        setSources((previous) => {
          const known = new Map(previous.map((source) => [source.id, source]));
          for (const event of events)
            known.set(event.calendarId, {
              id: event.calendarId,
              name: event.calendarName,
            });
          return [...known.values()];
        });
        setLoaded({
          key: rangeKey,
          events,
          calendars: result.calendarCount,
          at: new Date(),
        });
        setSelected(
          (previous) =>
            events.find(
              (event) => eventKey(event) === (previous && eventKey(previous)),
            ) ||
            events[0] ||
            null,
        );
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
          setDevice(null);
          setLoaded(null);
          setSelected(null);
          setDetail(false);
          return;
        }
        setError(failureMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [device, effectiveView, dayKey, refresh, rangeKey]);

  function reconnect() {
    setDetail(false);
    setSelected(null);
    setLoaded(null);
    setDevice(null);
    setSources([]);
    setHidden([]);
    setPairAttempt((value) => value + 1);
  }
  const next = data?.events.find(
    (event) => !event.allDay && +eventDate(event) >= +now,
  );
  const activeEvent =
    selected &&
    data?.events.find((event) => eventKey(event) === eventKey(selected));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>YOUR HOUSEHOLD, AT A GLANCE</Text>
          <Text style={styles.title}>Hearth</Text>
        </View>
        <Clock />
      </View>
      {!detail && (
        <View style={styles.toolbar}>
          {(
            [
              ['calendar', 'Calendar'],
              ['brief', 'Brief'],
              ['weather', 'Weather'],
              ['pomo', 'Pomodoro'],
              ['sources', 'Calendars'],
            ] as const
          ).map(([id, label]) => (
            <TVButton
              key={id}
              label={label}
              selected={section === id}
              onPress={() => setSection(id)}
            />
          ))}
        </View>
      )}
      {detail ? null : section === 'weather' ? (
        <WeatherScreen />
      ) : section === 'pomo' ? (
        <PomodoroScreen />
      ) : !device ? (
        <View style={styles.pairCard}>
          <Text style={styles.heading}>Connect your calendars</Text>
          <Text style={styles.body}>
            On your Mac, open http://localhost:3001/connect
          </Text>
          <Text style={styles.body}>
            Sign in with Google, then enter this display's pairing code.
          </Text>
          {pairing ? (
            <Text selectable style={styles.code}>
              {pairing.pairingCode}
            </Text>
          ) : !pairError ? (
            <ActivityIndicator color="#E4BC87" size="large" />
          ) : null}
          <Text style={styles.muted}>
            {pairing
              ? 'Waiting for pairing · Code renews after 10 minutes'
              : pairError
              ? 'Connection needs attention'
              : 'Connecting to the calendar service…'}
          </Text>
          {!!pairError && (
            <Text accessibilityRole="alert" style={styles.error}>
              {pairError}
            </Text>
          )}
          <TVButton
            label={pairing ? 'Get a new code' : 'Retry connection'}
            preferred
            onPress={() => setPairAttempt((value) => value + 1)}
          />
        </View>
      ) : section === 'sources' ? (
        <CalendarSources
          sources={sources}
          hidden={hidden}
          onToggle={(id) =>
            setHidden((previous) =>
              previous.includes(id)
                ? previous.filter((value) => value !== id)
                : [...previous, id],
            )
          }
        />
      ) : section === 'brief' ? (
        <BriefScreen
          events={data?.events || []}
          now={now}
          loading={loading}
          error={error}
          onOpenEvent={(event) => {
            setSelected(event);
            setDetail(true);
          }}
          onCalendar={() => setSection('calendar')}
          onRefresh={() => setRefresh((value) => value + 1)}
        />
      ) : (
        <>
          <View style={styles.toolbar}>
            <TVButton
              label={view === 'today' ? 'Today · selected' : 'Today'}
              preferred
              disabled={detail}
              onPress={() => {
                setView('today');
                setDetail(false);
              }}
            />
            <TVButton
              label={view === 'week' ? 'Next 7 days · selected' : 'Next 7 days'}
              disabled={detail}
              onPress={() => {
                setView('week');
                setDetail(false);
              }}
            />
            <TVButton
              label={loading ? 'Refreshing…' : 'Refresh'}
              disabled={loading || detail}
              onPress={() => setRefresh((value) => value + 1)}
            />
            <TVButton
              label="Pair again"
              disabled={detail}
              onPress={reconnect}
            />
          </View>
          <View style={styles.status}>
            {loading && <ActivityIndicator color="#E4BC87" />}
            <Text style={styles.muted}>
              {loading
                ? 'Loading your calendars…'
                : data
                ? `${data.events.length} events · ${
                    data.calendars
                  } calendars · Updated ${data.at.toLocaleTimeString(
                    undefined,
                    {hour: 'numeric', minute: '2-digit'},
                  )}`
                : 'Calendar'}
            </Text>
          </View>
          {!!error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
              {data ? ' Showing previously loaded events.' : ''}
            </Text>
          )}
          <View style={styles.content}>
            <FlatList
              style={styles.list}
              contentContainerStyle={styles.listContent}
              data={data?.events || []}
              keyExtractor={eventKey}
              ListEmptyComponent={
                !loading ? (
                  <Text style={styles.body}>
                    {error
                      ? 'Use Refresh to try again.'
                      : 'No upcoming events in this date range.'}
                  </Text>
                ) : null
              }
              renderItem={({item}) => (
                <Pressable
                  focusable={!detail}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}, ${eventTime(item)}, ${
                    item.calendarName
                  }`}
                  onFocus={() => {
                    setFocused(eventKey(item));
                    setSelected(item);
                  }}
                  onBlur={() => setFocused('')}
                  onPress={() => {
                    setSelected(item);
                    setDetail(true);
                  }}
                  style={[
                    styles.event,
                    focused === eventKey(item) && styles.focus,
                  ]}>
                  <Text style={styles.eventDate}>
                    {eventDate(item).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {eventTime(item)}
                  </Text>
                  <Text numberOfLines={2} style={styles.eventTitle}>
                    {item.title}
                  </Text>
                  <Text style={styles.muted}>{item.calendarName}</Text>
                </Pressable>
              )}
            />
            <View style={styles.sidebar}>
              <Text style={styles.eyebrow}>NEXT UP</Text>
              <Text style={styles.heading}>
                {next?.title ||
                  (loading ? 'Loading…' : 'No upcoming timed events')}
              </Text>
              {next && (
                <Text style={styles.body}>
                  {eventDate(next).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  · {eventTime(next)}
                </Text>
              )}
              <WeatherPreview />
              {activeEvent && (
                <View style={styles.preview}>
                  <Text style={styles.eyebrow}>SELECTED EVENT</Text>
                  <Text style={styles.heading}>{activeEvent.title}</Text>
                  <Text style={styles.body}>{activeEvent.calendarName}</Text>
                  {!!activeEvent.location && (
                    <Text style={styles.body}>{activeEvent.location}</Text>
                  )}
                  <Text style={styles.muted}>Press Select for details</Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}
      {detail && activeEvent && (
        <View style={styles.overlay}>
          <TVButton
            label="Back to calendar"
            preferred
            onPress={() => setDetail(false)}
          />
          <ScrollView style={styles.detailScroll}>
            <Text style={styles.eyebrow}>{activeEvent.calendarName}</Text>
            <Text style={styles.title}>{activeEvent.title}</Text>
            <Text style={styles.body}>
              {eventDate(activeEvent).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              · {eventTime(activeEvent)}
            </Text>
            {!!activeEvent.location && (
              <Text style={styles.body}>{activeEvent.location}</Text>
            )}
            <Text style={styles.description}>
              {activeEvent.description || 'No additional details.'}
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#18251F',
    paddingHorizontal: 48,
    paddingVertical: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  eyebrow: {color: '#D4B78F', fontSize: 13, letterSpacing: 2, marginBottom: 8},
  title: {color: '#F8F0E4', fontSize: 40, fontWeight: '600', marginBottom: 10},
  date: {color: '#D4CABB', fontSize: 19},
  heading: {
    color: '#F8F0E4',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  body: {color: '#E2DDCF', fontSize: 19, lineHeight: 28, marginBottom: 12},
  muted: {color: '#B9C5BB', fontSize: 15, lineHeight: 22},
  error: {color: '#FFBEAC', fontSize: 17, marginVertical: 8},
  pairCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  code: {
    color: '#E4BC87',
    fontSize: 58,
    letterSpacing: 10,
    fontWeight: '700',
    marginVertical: 20,
  },
  toolbar: {flexDirection: 'row', gap: 12, marginBottom: 8},
  button: {
    backgroundColor: '#304237',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    marginVertical: 5,
  },
  buttonText: {color: '#F8F0E4', fontSize: 17, fontWeight: '600'},
  focus: {borderColor: '#E4BC87', backgroundColor: '#435E4C'},
  disabled: {opacity: 0.6},
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    minHeight: 26,
  },
  content: {flex: 1, flexDirection: 'row', gap: 24},
  list: {flex: 1.6},
  listContent: {padding: 4, paddingBottom: 24},
  event: {
    backgroundColor: '#24372B',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    padding: 16,
    marginBottom: 12,
  },
  eventDate: {color: '#E4BC87', fontSize: 16, marginBottom: 7},
  eventTitle: {
    color: '#F8F0E4',
    fontSize: 23,
    fontWeight: '600',
    marginBottom: 7,
  },
  sidebar: {flex: 1, backgroundColor: '#24372B', borderRadius: 14, padding: 24},
  preview: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: '#516154',
  },
  overlay: {
    position: 'absolute',
    top: 20,
    bottom: 20,
    left: 32,
    right: 32,
    backgroundColor: '#24372B',
    borderColor: '#E4BC87',
    borderWidth: 2,
    borderRadius: 18,
    padding: 28,
  },
  detailScroll: {flex: 1, marginTop: 20},
  description: {color: '#E2DDCF', fontSize: 20, lineHeight: 30, marginTop: 16},
});
