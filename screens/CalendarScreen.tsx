import Text from '../components/AppText';
import FlameText from '../components/FlameText';
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
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
import GlassButton from '../components/GlassButton';
import ThemeControl from '../components/ThemeControl';
import CalendarCanvas from '../components/CalendarCanvas';
import {darkGlassCard, darkGlassFocus} from '../components/DarkGlassEdges';
import {lightGlassCard} from '../components/lightGlassCard';
import CalendarOverview from '../components/CalendarOverview';
import CalendarWidgets from '../components/CalendarWidgets';
import {useWorkspace} from '../theme/WorkspaceProvider';
import {Colors, focusStyle, glassStyle, useTheme} from '../theme/ThemeProvider';
import {sampleEvents} from '../services/sampleEvents';
import {clearDevice, loadDevice, saveDevice} from '../services/deviceStorage';

function Action({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const refresh = label === 'Refresh' || label.startsWith('Refreshing');
  return (
    <GlassButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      icon={
        refresh
          ? 'refresh'
          : label.includes('Preview')
            ? 'calendar-outline'
            : 'link-variant'
      }
      iconOnly={refresh}
    />
  );
}
function EventRow({event}: {event: CalendarEvent}) {
  const {colors, dark, reduceMotion} = useTheme();
  const styles = makeStyles(colors, dark);
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
        glassStyle(colors, dark, focused || pressed),
        !dark && lightGlassCard,
        (focused || pressed) && styles.focused,
        focusStyle(colors, dark, focused, reduceMotion, 1.015),
        dark && darkGlassCard,
        dark && focused && darkGlassFocus,
      ]}>
      <FlameText neutral style={styles.time}>
        {time}
      </FlameText>
      <View style={styles.eventBody}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={[styles.secondary, styles.context]}>
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
  const {hidden, setSnapshot} = useWorkspace();
  const [range, setRange] = useState<'today' | 'week'>('week');
  const {colors, storageError, dark} = useTheme();
  const styles = useMemo(() => makeStyles(colors, dark), [colors, dark]);
  const [preview, setPreview] = useState(true);
  const [restoring, setRestoring] = useState(true);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [restoreError, setRestoreError] = useState('');
  const [examples] = useState(sampleEvents);
  const [device, setDevice] = useState<Device | null>(null);
  const [pairing, setPairing] = useState<Pairing | null>(null);
  const [pairAttempt, setPairAttempt] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [response, setResponse] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reconnect, setReconnect] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const sections = useMemo(
    () =>
      eventSections(
        (preview ? examples : response?.events || []).filter(
          event =>
            !hidden.includes(event.calendarId) &&
            (range === 'week' ||
              eventDate(event).toDateString() === new Date().toDateString()),
        ),
      ),
    [preview, examples, response, hidden, range],
  );
  useEffect(() => {
    setSnapshot({
      events:
        restoring || restoreError
          ? []
          : preview
            ? examples
            : response?.events || [],
      preview: !restoring && preview,
      loading: restoring || loading,
      error: restoreError || error,
      updatedAt,
    });
  }, [
    preview,
    examples,
    response,
    loading,
    restoring,
    restoreError,
    error,
    updatedAt,
    setSnapshot,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    setRestoring(true);
    setRestoreError('');
    loadDevice(controller.signal)
      .then(saved => {
        if (!controller.signal.aborted) {
          setDevice(saved);
          setPreview(!saved);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRestoreError(
            'Could not restore this display. Check the connection and try again.',
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRestoring(false);
      });
    return () => controller.abort();
  }, [restoreAttempt]);

  useEffect(() => {
    if (restoring || restoreError || preview || device) {
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
          const saved = await saveDevice(
            {
              deviceId: result.deviceId,
              deviceCredential: result.deviceCredential,
            },
            controller.signal,
          );
          if (!active()) return;
          setDevice(saved);
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
  }, [restoring, restoreError, preview, device, pairAttempt]);

  useEffect(() => {
    if (preview || !device) {
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setReconnect(false);
    request<EventResponse>(
      Platform.OS === 'web'
        ? '/api/display/events'
        : `/api/devices/${device.deviceId}/events`,
      controller.signal,
      device.deviceCredential,
    )
      .then(data => {
        if (!controller.signal.aborted) {
          setResponse(data);
          setUpdatedAt(new Date());
        }
      })
      .catch(async err => {
        if (controller.signal.aborted) {
          return;
        }
        if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
          try {
            await clearDevice();
          } catch {
            if (!controller.signal.aborted)
              setError('Could not clear the saved pairing. Try Refresh again.');
            return;
          }
          if (controller.signal.aborted) return;
          setResponse(null);
          setUpdatedAt(null);
          setDevice(null);
        } else {
          setError(err.message);
          setReconnect(
            err instanceof ApiError &&
              [
                'CALENDAR_REAUTH_REQUIRED',
                'CALENDAR_ACCESS_DENIED',
                'CALENDAR_NOT_CONNECTED',
              ].includes(err.code || ''),
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [preview, device, refresh]);

  if (restoring || restoreError) {
    return (
      <CalendarCanvas style={styles.page}>
        <View style={styles.center}>
          {restoring ? (
            <>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.secondary}>Restoring display...</Text>
            </>
          ) : (
            <>
              <Text accessibilityRole="alert" style={styles.error}>
                {restoreError}
              </Text>
              <Action
                label="Retry"
                onPress={() => setRestoreAttempt(value => value + 1)}
              />
            </>
          )}
        </View>
      </CalendarCanvas>
    );
  }

  return (
    <CalendarCanvas style={styles.page}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <FlameText style={styles.eyebrow}>PLANORAMIC</FlameText>
          <FlameText accessibilityRole="header" style={styles.title}>
            Upcoming Events
          </FlameText>
          <Text style={[styles.secondary, styles.context]}>
            {preview
              ? 'Sample events · Preview'
              : `Next seven days${response ? ` · ${response.calendarCount} calendars` : ''}`}
          </Text>
        </View>
        <View style={styles.tools}>
          <CalendarWidgets />
          <ThemeControl />
          {preview ? (
            <Action
              label="Connect calendar"
              onPress={() => setPreview(false)}
            />
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
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Calendar range"
        style={{flexDirection: 'row', gap: 10, marginBottom: 16}}>
        <GlassButton
          label="Today"
          radio
          selected={range === 'today'}
          onPress={() => setRange('today')}
        />
        <GlassButton
          label="Week"
          radio
          selected={range === 'week'}
          onPress={() => setRange('week')}
        />
      </View>
      {!!storageError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {storageError}
        </Text>
      )}
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
            !error && <ActivityIndicator size="large" color={colors.accent} />
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
          {!preview && !!error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
              {response ? ' Showing previously loaded events.' : ''}
            </Text>
          )}
          {!preview && reconnect && (
            <View style={styles.reconnect}>
              <Text
                selectable
                style={styles.address}>{`${API_URL}/connect`}</Text>
              {Platform.OS === 'web' && (
                <Action
                  label="Reconnect Google"
                  onPress={() => {
                    Linking.openURL(`${API_URL}/connect`).catch(() =>
                      setError('Unable to open the connection page.'),
                    );
                  }}
                />
              )}
            </View>
          )}
          {!preview && updatedAt && (
            <FlameText neutral style={styles.updated}>
              Updated{' '}
              {updatedAt.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </FlameText>
          )}
          {!preview && loading && !response ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.secondary}>Loading your calendars…</Text>
            </View>
          ) : (
            <View
              style={{flex: 1, flexDirection: 'row', gap: 20, minHeight: 0}}>
              <SectionList
                style={{flex: 1, minWidth: 0}}
                ListHeaderComponent={
                  range === 'week' ? (
                    <CalendarOverview
                      variant="week"
                      events={preview ? examples : response?.events || []}
                      device={device}
                      preview={preview}
                      hidden={hidden}
                      refreshToken={refresh}
                    />
                  ) : null
                }
                sections={sections}
                keyExtractor={item => `${item.calendarId}:${item.id}`}
                contentContainerStyle={styles.list}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({section}) => (
                  <FlameText
                    neutral
                    accessibilityRole="header"
                    style={styles.day}>
                    {section.title}
                  </FlameText>
                )}
                renderItem={({item}) => <EventRow event={item} />}
                ListEmptyComponent={
                  <Text style={styles.secondary}>
                    {error
                      ? 'Use Refresh to try again.'
                      : hidden.length
                        ? 'No events in your visible calendars for this view.'
                        : range === 'today'
                          ? 'No events today.'
                          : 'No upcoming events in the next seven days.'}
                  </Text>
                }
              />
            </View>
          )}
        </>
      )}
    </CalendarCanvas>
  );
}
const makeStyles = (colors: Colors, dark: boolean) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingLeft: Platform.OS === 'web' ? 28 : 88,
      paddingRight: 28,
      paddingTop: 24,
    },
    header: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: dark ? 28 : 20,
      gap: 16,
    },
    tools: {
      maxWidth: '100%',
      flexShrink: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 16,
      zIndex: 10,
    },
    heading: {flexShrink: 1},
    eyebrow: {
      fontStyle: 'italic',
      color: colors.accent,
      fontSize: 16,
      letterSpacing: 0,
      fontWeight: '700',
    },
    title: {
      color: colors.text,
      fontSize: 32,
      fontWeight: '700',
      marginVertical: 8,
    },
    secondary: {color: colors.muted, fontSize: 20, lineHeight: 28},
    context: {fontStyle: 'italic'},
    focused: {borderColor: colors.accent},
    event: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 20,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor: colors.surface,
      padding: dark ? 26 : 20,
      marginBottom: dark ? 18 : 12,
    },
    time: {
      color: colors.rose,
      fontSize: 23,
      ...(dark ? {width: 140, flexShrink: 0} : {minWidth: 130}),
    },
    eventBody: {flex: 1, minWidth: 180},
    eventTitle: {
      color: colors.text,
      fontSize: 25,
      fontWeight: '600',
      marginBottom: 8,
    },
    description: {
      color: colors.text,
      fontSize: 20,
      lineHeight: 28,
      marginTop: 14,
    },
    day: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '600',
      marginTop: dark ? 30 : 20,
      marginBottom: dark ? 18 : 14,
    },
    list: {paddingBottom: 40, paddingHorizontal: 16},
    updated: {color: colors.muted, fontSize: 16, marginBottom: 6},
    error: {
      color: colors.error,
      fontSize: 20,
      lineHeight: 28,
      marginVertical: 16,
    },
    center: {padding: 40, alignItems: 'center', gap: 16},
    reconnect: {gap: 12, marginBottom: 16},
    pairCard: {
      paddingVertical: 24,
      gap: 16,
    },
    address: {color: colors.accent, fontSize: 22},
    code: {
      color: colors.accent,
      fontSize: 44,
      letterSpacing: 0,
      fontWeight: '700',
    },
  });
