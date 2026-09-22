import React, {useEffect, useMemo, useState} from 'react';
import {Platform, Pressable, View, useWindowDimensions} from 'react-native';
import Text from './AppText';
import GlassButton from './GlassButton';
import {darkGlassCard} from './DarkGlassEdges';
import {lightGlassCard} from './lightGlassCard';
import {glassStyle, useTheme} from '../theme/ThemeProvider';
import {
  CalendarEvent,
  Device,
  EventResponse,
  eventDate,
  request,
} from '../services/calendar';

function localDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
function onDay(event: CalendarEvent, day: Date) {
  const start = eventDate(event);
  let end = event.end?.dateTime
    ? new Date(event.end.dateTime)
    : event.end?.date
      ? eventDate({...event, start: {date: event.end.date}})
      : event.allDay
        ? addDays(start, 1)
        : new Date(+start + 1);
  return +start < +addDays(day, 1) && +end > +day;
}
function timeLabel(event: CalendarEvent) {
  return event.allDay
    ? 'All day'
    : eventDate(event).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });
}

function DateButton({
  date,
  selected,
  today,
  count,
  onPress,
}: {
  date: Date;
  selected: boolean;
  today: boolean;
  count: number;
  onPress: () => void;
}) {
  const {colors} = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${date.toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}${count ? `, ${count} events` : ''}`}
      accessibilityState={{selected}}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '14.285714%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: selected ? colors.accentSoft : 'transparent',
        borderWidth: 1,
        borderColor: focused
          ? colors.text
          : today
            ? colors.accent
            : 'transparent',
      }}>
      <Text style={{fontSize: 15, color: colors.text}}>{date.getDate()}</Text>
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          marginTop: 3,
          backgroundColor: count ? colors.accent : 'transparent',
        }}
      />
    </Pressable>
  );
}

export function Clock({now, compact = false}: {now: Date; compact?: boolean}) {
  const {colors} = useTheme();
  const hour = (now.getHours() % 12) * 30 + now.getMinutes() / 2;
  const minute = now.getMinutes() * 6 + now.getSeconds() / 10;
  return (
    <View style={{alignItems: 'center', gap: compact ? 6 : 12}}>
      <View style={compact ? {width: 72, height: 72} : undefined}>
        <View
          testID="analog-clock"
          accessibilityLabel={`Analog clock, ${now.toLocaleTimeString(undefined, {hour: 'numeric', minute: '2-digit'})}`}
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            position: 'relative',
            ...(compact
              ? ({
                  position: 'absolute',
                  left: -54,
                  top: -54,
                  transform: [{scale: 0.4}],
                } as const)
              : {}),
          }}>
          {Array.from({length: 12}, (_, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: 88,
                top: 7,
                width: 2,
                height: 164,
                transform: [{rotate: `${i * 30}deg`}],
              }}>
              <View
                style={{
                  width: 2,
                  height: i % 3 === 0 ? 12 : 6,
                  backgroundColor: colors.muted,
                }}
              />
            </View>
          ))}
          {[
            ['12', 76, 19],
            ['3', 139, 75],
            ['6', 76, 135],
            ['9', 15, 75],
          ].map(([label, left, top]) => (
            <Text
              key={label}
              style={{
                position: 'absolute',
                left: left as number,
                top: top as number,
                width: 28,
                textAlign: 'center',
                fontSize: 20,
                color: colors.text,
              }}>
              {label}
            </Text>
          ))}
          <View
            testID="clock-hour-hand"
            style={{
              position: 'absolute',
              left: 87,
              top: 42,
              width: 4,
              height: 94,
              transform: [{rotate: `${hour}deg`}],
            }}>
            <View
              style={{
                width: 4,
                height: 49,
                borderRadius: 2,
                backgroundColor: colors.text,
              }}
            />
          </View>
          <View
            testID="clock-minute-hand"
            style={{
              position: 'absolute',
              left: 88,
              top: 23,
              width: 2,
              height: 132,
              transform: [{rotate: `${minute}deg`}],
            }}>
            <View
              style={{
                width: 2,
                height: 68,
                borderRadius: 1,
                backgroundColor: colors.text,
              }}
            />
          </View>
          <View
            style={{
              position: 'absolute',
              left: 85,
              top: 85,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.accent,
            }}
          />
        </View>
      </View>
      <Text
        testID="digital-clock"
        style={{
          fontSize: compact ? 16 : 30,
          color: colors.text,
          fontVariant: ['tabular-nums'],
        }}>
        {now.toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>
      {!compact && (
        <Text style={{fontSize: 16, color: colors.muted, fontStyle: 'italic'}}>
          {now.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      )}
    </View>
  );
}

export default function CalendarOverview({
  events,
  device,
  preview,
  hidden,
  refreshToken,
  variant = 'all',
}: {
  events: CalendarEvent[];
  device: Device | null;
  preview: boolean;
  hidden: string[];
  refreshToken: number;
  variant?: 'all' | 'week' | 'panel';
}) {
  const {colors, dark} = useTheme();
  const {width} = useWindowDimensions();
  const [now, setNow] = useState(() => new Date());
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selected, setSelected] = useState<Date | null>(null);
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (preview || !device || variant === 'week') return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setMonthEvents([]);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    const query = new URLSearchParams({
      timeMin: month.toISOString(),
      timeMax: end.toISOString(),
    });
    request<EventResponse>(
      `${Platform.OS === 'web' ? '/api/display/events' : `/api/devices/${device.deviceId}/events`}?${query}`,
      controller.signal,
      device.deviceCredential,
    )
      .then(data => {
        if (!controller.signal.aborted) setMonthEvents(data.events);
      })
      .catch(err => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [month, device, preview, refreshToken, retry, variant]);
  const visible = useMemo(
    () => events.filter(event => !hidden.includes(event.calendarId)),
    [events, hidden],
  );
  const monthly = useMemo(
    () =>
      (preview ? events : monthEvents).filter(
        event => !hidden.includes(event.calendarId),
      ),
    [preview, events, monthEvents, hidden],
  );
  const today = localDay(now);
  const dates = Array.from({length: 7}, (_, i) => addDays(today, i));
  const monthDays = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const selectedEvents = selected
    ? monthly
        .filter(event => onDay(event, selected))
        .sort((a, b) => +eventDate(a) - +eventDate(b))
    : [];
  const panel = [
    glassStyle(colors, dark),
    dark ? darkGlassCard : lightGlassCard,
    {padding: 18, borderRadius: 18},
  ];
  return (
    <View style={{gap: 20, marginTop: 12, marginBottom: 24}}>
      <View
        style={{
          flexDirection: width >= 1200 ? 'row' : 'column',
          gap: 20,
          alignItems: 'flex-start',
        }}>
        {variant !== 'panel' && (
          <View style={{flex: 1, width: '100%', minWidth: 0, gap: 14}}>
            <Text
              accessibilityRole="header"
              style={{fontSize: 22, color: colors.text}}>
              Week at a glance
            </Text>
            <View
              testID="week-overview"
              style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
              {dates.map(day => {
                const daily = visible.filter(event => onDay(event, day));
                return (
                  <View
                    key={+day}
                    style={[
                      ...panel,
                      {
                        width:
                          width >= 1800 ? '13%' : width >= 700 ? '31%' : '47%',
                        minHeight: 110,
                        padding: 12,
                        borderRadius: 8,
                      },
                    ]}>
                    <Text style={{fontSize: 16, color: colors.muted}}>
                      {day.toLocaleDateString(undefined, {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                    {daily.length ? (
                      daily.slice(0, 3).map(event => (
                        <Text
                          key={`${event.calendarId}:${event.id}`}
                          numberOfLines={2}
                          style={{
                            color: colors.text,
                            fontSize: 16,
                            marginTop: 10,
                          }}>
                          {timeLabel(event)} · {event.title}
                        </Text>
                      ))
                    ) : (
                      <Text
                        style={{
                          color: colors.muted,
                          fontSize: 16,
                          marginTop: 12,
                        }}>
                        No events
                      </Text>
                    )}
                    {daily.length > 3 && (
                      <Text
                        style={{
                          color: colors.muted,
                          fontSize: 14,
                          marginTop: 8,
                        }}>
                        +{daily.length - 3} more
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
        {variant !== 'week' && (
          <View style={{width: '100%', gap: 16}}>
            <View testID="month-overview" style={panel}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                  marginBottom: 12,
                }}>
                <GlassButton
                  label="Previous month"
                  icon="chevron-left"
                  iconOnly
                  onPress={() => {
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() - 1, 1),
                    );
                    setSelected(null);
                  }}
                />
                <Text
                  accessibilityRole="header"
                  style={{
                    fontSize: 18,
                    color: colors.text,
                    flex: 1,
                    textAlign: 'center',
                  }}>
                  {month.toLocaleDateString(undefined, {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <GlassButton
                  label="Next month"
                  icon="chevron-right"
                  iconOnly
                  onPress={() => {
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() + 1, 1),
                    );
                    setSelected(null);
                  }}
                />
              </View>
              <View style={{flexDirection: 'row'}}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => (
                  <Text
                    key={i}
                    style={{
                      width: '14.285714%',
                      textAlign: 'center',
                      color: colors.muted,
                      fontSize: 14,
                      marginBottom: 8,
                    }}>
                    {label}
                  </Text>
                ))}
              </View>
              <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                {Array.from({length: month.getDay()}, (_, i) => (
                  <View
                    key={`blank${i}`}
                    style={{width: '14.285714%', height: 40}}
                  />
                ))}
                {Array.from(
                  {length: monthDays},
                  (_, i) =>
                    new Date(month.getFullYear(), month.getMonth(), i + 1),
                ).map(date => (
                  <DateButton
                    key={+date}
                    date={date}
                    selected={!!selected && +date === +selected}
                    today={+date === +today}
                    count={
                      loading || error
                        ? 0
                        : monthly.filter(event => onDay(event, date)).length
                    }
                    onPress={() => setSelected(date)}
                  />
                ))}
              </View>
              <View style={{marginTop: 12}}>
                <GlassButton
                  label="Current month"
                  icon="calendar-today"
                  onPress={() => {
                    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                    setSelected(null);
                  }}
                />
              </View>
              {loading && (
                <Text
                  accessibilityLiveRegion="polite"
                  style={{color: colors.muted, marginTop: 12}}>
                  Loading month...
                </Text>
              )}
              {!!error && (
                <View style={{gap: 8, marginTop: 12}}>
                  <Text accessibilityRole="alert" style={{color: colors.error}}>
                    {error}
                  </Text>
                  <GlassButton
                    label="Retry month"
                    icon="refresh"
                    onPress={() => setRetry(value => value + 1)}
                  />
                </View>
              )}
              {selected && !loading && !error && (
                <View style={{gap: 10, marginTop: 16}}>
                  <Text style={{color: colors.text, fontSize: 18}}>
                    {selected.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  {!selectedEvents.length && (
                    <Text style={{color: colors.muted}}>
                      No events{preview ? ' in this preview' : ''}.
                    </Text>
                  )}
                  {selectedEvents.map(event => (
                    <View key={`${event.calendarId}:${event.id}`}>
                      <Text style={{color: colors.text, fontSize: 16}}>
                        {timeLabel(event)} · {event.title}
                      </Text>
                      <Text
                        style={{
                          color: colors.muted,
                          fontStyle: 'italic',
                          fontSize: 15,
                        }}>
                        {event.calendarName}
                        {event.location ? ` · ${event.location}` : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={panel}>
              <Clock now={now} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
