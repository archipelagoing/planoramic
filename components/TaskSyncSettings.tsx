import React, {useState} from 'react';
import {View, Linking} from 'react-native';
import Text from './AppText';
import GlassButton from './GlassButton';
import {useTheme} from '../theme/ThemeProvider';
import {useTasks, taskRequest} from '../theme/TasksProvider';
import {API_URL} from '../services/calendar';

export default function TaskSyncSettings() {
  const {calendarId, setCalendar, busy, ready, error} = useTasks();
  const {colors} = useTheme();
  const [calendars, setCalendars] = useState<{id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState('');
  return (
    <View style={{gap: 14}}>
      <Text
        accessibilityRole="header"
        style={{fontSize: 22, color: colors.text}}>
        Shared task calendar
      </Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
        <GlassButton
          label={loading ? 'Loading calendars...' : 'Choose calendar'}
          icon="calendar-search"
          disabled={loading || busy || !ready}
          onPress={async () => {
            setLoading(true);
            setFailure('');
            try {
              const result = await taskRequest<{
                calendars: {id: string; name: string}[];
              }>('task-calendars');
              setCalendars(result.calendars);
              if (!result.calendars.length)
                setFailure('No editable calendars found.');
            } catch (err) {
              setFailure((err as Error).message);
            } finally {
              setLoading(false);
            }
          }}
        />
        <GlassButton
          label="Reconnect Google"
          icon="open-in-new"
          onPress={() => {
            Linking.openURL(`${API_URL}/connect`).catch(() =>
              setFailure('Could not open the connection page.'),
            );
          }}
        />
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Shared task calendar"
        style={{gap: 8, alignItems: 'flex-start'}}>
        <GlassButton
          label="Local tasks only"
          radio
          selected={!calendarId}
          disabled={busy || !ready}
          onPress={() => setCalendar('')}
        />
        {calendarId && !calendars.some(c => c.id === calendarId) && (
          <Text style={{color: colors.muted, fontSize: 16}}>
            Connected calendar: {calendarId}
          </Text>
        )}
        {calendars.map(calendar => (
          <GlassButton
            key={calendar.id}
            label={calendar.name}
            radio
            selected={calendarId === calendar.id}
            disabled={busy}
            onPress={() => setCalendar(calendar.id)}
          />
        ))}
      </View>
      {!!(failure || error) && (
        <Text accessibilityRole="alert" style={{color: colors.error}}>
          {failure || error}
        </Text>
      )}
    </View>
  );
}
