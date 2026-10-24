import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CalendarEvent, eventDate, eventTime} from './calendar';
import {eventsOnDay} from './brief';
import {palette, TVButton} from './ui';
import {WeatherPreview} from './WeatherPanel';

export function BriefScreen({
  events,
  now,
  loading,
  error,
  onOpenEvent,
  onCalendar,
  onRefresh,
}: {
  events: CalendarEvent[];
  now: Date;
  loading: boolean;
  error: string;
  onOpenEvent: (event: CalendarEvent) => void;
  onCalendar: () => void;
  onRefresh: () => void;
}) {
  const today = eventsOnDay(events, now);
  const next = events.find(
    (event) => !event.allDay && !event.start.date && +eventDate(event) >= +now,
  );
  const [focused, setFocused] = useState('');
  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <View>
          <Text style={styles.heading}>Your day, at a glance</Text>
          <Text style={styles.muted}>
            {loading
              ? 'Loading your schedule…'
              : `${today.length} ${
                  today.length === 1 ? 'event' : 'events'
                } today`}
          </Text>
        </View>
        <View style={styles.row}>
          <TVButton label="Open calendar" onPress={onCalendar} />
          <TVButton label="Refresh" disabled={loading} onPress={onRefresh} />
        </View>
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
          {events.length ? ' Showing previously loaded events.' : ''}
        </Text>
      )}
      <View style={styles.content}>
        <FlatList
          style={{flex: 1.5}}
          data={today}
          keyExtractor={(event) => `${event.calendarId}:${event.id}`}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color={palette.accent} />
            ) : (
              <Text style={styles.body}>
                {error
                  ? 'Use Refresh to try again.'
                  : 'No events on your calendars today.'}
              </Text>
            )
          }
          renderItem={({item}) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${eventTime(item)}`}
              onFocus={() => setFocused(`${item.calendarId}:${item.id}`)}
              onBlur={() => setFocused('')}
              onPress={() => onOpenEvent(item)}
              style={[
                styles.card,
                focused === `${item.calendarId}:${item.id}` && styles.focus,
              ]}>
              <Text style={styles.accent}>{eventTime(item)}</Text>
              <Text style={styles.heading}>{item.title}</Text>
              <Text style={styles.muted}>
                {item.calendarName}
                {item.location ? ` · ${item.location}` : ''}
              </Text>
            </Pressable>
          )}
        />
        <View style={styles.side}>
          <Text style={styles.eyebrow}>NEXT UP</Text>
          <Text style={styles.heading}>
            {next?.title || (loading ? 'Loading…' : 'No upcoming timed events')}
          </Text>
          {next && (
            <>
              <Text style={styles.body}>
                {eventDate(next).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.accent}>{eventTime(next)}</Text>
            </>
          )}
          <WeatherPreview />
        </View>
      </View>
    </View>
  );
}
export interface CalendarSource {
  id: string;
  name: string;
}
export function CalendarSources({
  sources,
  hidden,
  onToggle,
}: {
  sources: CalendarSource[];
  hidden: string[];
  onToggle: (id: string) => void;
}) {
  const [focused, setFocused] = useState('');
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Choose what Hearth shows</Text>
      <Text style={styles.muted}>
        Hiding a source affects the calendar, Brief, and Next up. It does not
        change your Google calendars.
      </Text>
      <Text style={styles.muted}>
        Sources appear here after their events load. Visibility resets when the
        app closes.
      </Text>
      <FlatList
        style={{marginTop: 16}}
        data={sources}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.body}>
            Load Next 7 days to discover calendars with events.
          </Text>
        }
        renderItem={({item}) => (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{checked: !hidden.includes(item.id)}}
            accessibilityLabel={item.name}
            onFocus={() => setFocused(item.id)}
            onBlur={() => setFocused('')}
            onPress={() => onToggle(item.id)}
            style={[styles.card, focused === item.id && styles.focus]}>
            <Text style={styles.heading}>
              {hidden.includes(item.id) ? '○ Hidden' : '● Visible'} ·{' '}
              {item.name}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {flex: 1},
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  row: {flexDirection: 'row', gap: 10},
  content: {flex: 1, flexDirection: 'row', gap: 20},
  heading: {
    color: palette.text,
    fontSize: 23,
    fontWeight: '600',
    marginVertical: 8,
  },
  body: {color: palette.text, fontSize: 19, lineHeight: 28, marginVertical: 10},
  muted: {color: palette.muted, fontSize: 15, lineHeight: 23},
  accent: {color: palette.accent, fontSize: 18, marginVertical: 5},
  eyebrow: {
    color: palette.accent,
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: 8,
  },
  card: {
    backgroundColor: palette.card,
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  focus: {borderColor: palette.accent, backgroundColor: palette.focus},
  side: {flex: 1, padding: 22, backgroundColor: palette.card, borderRadius: 14},
  error: {color: palette.error, fontSize: 16, marginBottom: 10},
});
