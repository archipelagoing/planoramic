import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  API_URL,
  ApiError,
  CalendarEvent,
  Device,
  EventResponse,
  Pairing,
  eventDate,
  eventSections,
  request,
} from '../services/calendar';
import {sampleEvents} from '../services/sampleEvents';

// Credentials stay in process memory; reopening the app requires pairing again.
let pairedDevice: Device | null = null;
function Action({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        (focused || pressed) && styles.focused,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.buttonText, focused && styles.focusedButtonText]}>
        {label}
      </Text>
    </Pressable>
  );
}
function EventRow({event}: {event: CalendarEvent}) {
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const time = event.allDay
    ? 'All day'
    : eventDate(event).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{expanded}}
      accessibilityLabel={`${event.title}, ${time}, ${event.calendarName}. Select for details.`}
      onPress={() => setExpanded(value => !value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({pressed}) => [
        styles.event,
        (focused || pressed) && styles.focused,
      ]}>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.eventBody}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.secondary}>
          {event.calendarName}
          {event.location ? ` · ${event.location}` : ''}
        </Text>
        {expanded && (
          <Text style={styles.description}>
            {event.description || 'No additional details.'}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default function CalendarScreen() {
  const [preview, setPreview] = useState(!pairedDevice);
  const [examples] = useState(sampleEvents);
  const [device, setDevice] = useState<Device | null>(pairedDevice);
  const [pairing, setPairing] = useState<Pairing | null>(null);
  const [pairAttempt, setPairAttempt] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [response, setResponse] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const sections = useMemo(
    () => eventSections(preview ? examples : response?.events || []),
    [preview, examples, response],
  );

  useEffect(() => {
    if (preview || device) {
      return;
    }
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const active = () => !controller.signal.aborted;
    setPairing(null);
    setError('');
    async function poll(session: Pairing) {
      try {
        if (Date.now() >= Date.parse(session.expiresAt)) {
          if (active()) {
            setPairAttempt(value => value + 1);
          }
          return;
        }
        const result = await request<{status: string} & Device>(
          `/api/pairings/${session.sessionId}`,
          controller.signal,
          session.sessionSecret,
        );
        if (!active()) {
          return;
        }
        if (result.status === 'paired') {
          pairedDevice = {
            deviceId: result.deviceId,
            deviceCredential: result.deviceCredential,
          };
          setDevice(pairedDevice);
          setPairing(null);
          return;
        }
        timer = setTimeout(() => {
          poll(session);
        }, 5000);
      } catch (err) {
        if (!active()) {
          return;
        }
        if (err instanceof ApiError && [401, 410].includes(err.status)) {
          setPairAttempt(value => value + 1);
        } else {
          setError((err as Error).message);
        }
      }
    }
    request<Pairing>('/api/devices/register', controller.signal, undefined, {
      name: Platform.OS === 'web' ? 'Browser calendar' : 'TV calendar',
    })
      .then(session => {
        if (active()) {
          setPairing(session);
          poll(session);
        }
      })
      .catch(err => {
        if (active()) {
          setError(err.message);
        }
      });
    return () => {
      controller.abort();
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [preview, device, pairAttempt]);

  useEffect(() => {
    if (preview || !device) {
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    request<EventResponse>(
      `/api/devices/${device.deviceId}/events`,
      controller.signal,
      device.deviceCredential,
    )
      .then(data => {
        if (!controller.signal.aborted) {
          setResponse(data);
          setUpdatedAt(new Date());
        }
      })
      .catch(err => {
        if (controller.signal.aborted) {
          return;
        }
        if (err instanceof ApiError && err.status === 401) {
          pairedDevice = null;
          setResponse(null);
          setUpdatedAt(null);
          setDevice(null);
        } else {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [preview, device, refresh]);

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>PLANORAMIC</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Upcoming Events
          </Text>
          <Text style={styles.secondary}>
            {preview
              ? 'Sample events · Preview'
              : `Next seven days${response ? ` · ${response.calendarCount} calendars` : ''}`}
          </Text>
        </View>
        {preview ? (
          <Action label="Connect calendar" onPress={() => setPreview(false)} />
        ) : device ? (
          <Action
            label={loading ? 'Refreshing…' : 'Refresh'}
            disabled={loading}
            onPress={() => setRefresh(value => value + 1)}
          />
        ) : (
          <Action
            label="Preview sample events"
            onPress={() => setPreview(true)}
          />
        )}
      </View>
      {!preview && !device ? (
        <View style={styles.pairCard}>
          <Text style={styles.eventTitle}>Connect this display</Text>
          <Text style={styles.secondary}>
            Open the address below, sign in with Google, and enter this code.
          </Text>
          <Text selectable style={styles.address}>
            {API_URL ? `${API_URL}/connect` : 'Backend address not configured'}
          </Text>
          {pairing ? (
            <>
              <Text selectable style={styles.code}>
                {pairing.pairingCode}
              </Text>
              <Text style={styles.secondary}>
                Waiting for pairing · Code renews after 10 minutes
              </Text>
            </>
          ) : (
            !error && <ActivityIndicator size="large" color="#FF9900" />
          )}
          {Platform.OS === 'web' && API_URL && (
            <Action
              label="Open pairing page"
              onPress={() => {
                Linking.openURL(`${API_URL}/connect`).catch(() =>
                  setError('Open the pairing address in another tab.'),
                );
              }}
            />
          )}
          {!!error && (
            <>
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
              <Action
                label="Retry pairing"
                onPress={() => setPairAttempt(value => value + 1)}
              />
            </>
          )}
        </View>
      ) : (
        <>
          {preview && (
            <Text style={styles.secondary}>
              Use Up / Down to browse. Select an event to show details.
            </Text>
          )}
          {!preview && !!error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
              {response ? ' Showing previously loaded events.' : ''}
            </Text>
          )}
          {!preview && updatedAt && (
            <Text style={styles.updated}>
              Updated{' '}
              {updatedAt.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          )}
          {!preview && loading && !response ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#FF9900" />
              <Text style={styles.secondary}>Loading your calendars…</Text>
            </View>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={item => `${item.calendarId}:${item.id}`}
              contentContainerStyle={styles.list}
              stickySectionHeadersEnabled={false}
              renderSectionHeader={({section}) => (
                <Text accessibilityRole="header" style={styles.day}>
                  {section.title}
                </Text>
              )}
              renderItem={({item}) => <EventRow event={item} />}
              ListEmptyComponent={
                <Text style={styles.secondary}>
                  {error
                    ? 'Use Refresh to try again.'
                    : 'No upcoming events in the next seven days.'}
                </Text>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#12181F',
    paddingLeft: Platform.OS === 'web' ? 28 : 88,
    paddingRight: 28,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  heading: {flexShrink: 1},
  eyebrow: {
    color: '#FF9900',
    fontSize: 16,
    letterSpacing: 3,
    fontWeight: '700',
  },
  title: {color: '#F5F7FA', fontSize: 38, fontWeight: '700', marginVertical: 8},
  secondary: {color: '#B9C8D8', fontSize: 20, lineHeight: 28},
  button: {
    backgroundColor: '#FF9900',
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignSelf: 'flex-start',
  },
  buttonText: {color: '#12181F', fontSize: 21, fontWeight: '700'},
  disabled: {opacity: 0.5},
  focusedButtonText: {color: '#FFFFFF'},
  focused: {borderColor: '#FFFFFF', backgroundColor: '#396080'},
  event: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 12,
    backgroundColor: '#232F3E',
    padding: 20,
    marginBottom: 12,
  },
  time: {color: '#FFBB55', fontSize: 23, minWidth: 130},
  eventBody: {flex: 1, minWidth: 180},
  eventTitle: {
    color: '#F5F7FA',
    fontSize: 25,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {color: '#F5F7FA', fontSize: 20, lineHeight: 28, marginTop: 14},
  day: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 14,
  },
  list: {paddingBottom: 40},
  updated: {color: '#B9C8D8', fontSize: 16, marginBottom: 6},
  error: {color: '#FFB4AB', fontSize: 20, lineHeight: 28, marginVertical: 16},
  center: {padding: 40, alignItems: 'center', gap: 16},
  pairCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#232F3E',
    gap: 16,
  },
  address: {color: '#9FD0FF', fontSize: 22},
  code: {color: '#FF9900', fontSize: 44, letterSpacing: 6, fontWeight: '700'},
});
