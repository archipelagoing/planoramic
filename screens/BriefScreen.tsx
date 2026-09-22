import React from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import WorkspacePage from '../components/WorkspacePage';
import Text from '../components/AppText';
import GlassButton from '../components/GlassButton';
import {useTheme} from '../theme/ThemeProvider';
import {useWorkspace} from '../theme/WorkspaceProvider';
import {eventDate} from '../services/calendar';

export default function BriefScreen() {
  const {colors} = useTheme();
  const {snapshot, hidden} = useWorkspace();
  const navigation = useNavigation<any>();
  const now = new Date();
  const events = snapshot.events
    .filter(event => !hidden.includes(event.calendarId))
    .sort((a, b) => +eventDate(a) - +eventDate(b));
  const today = events.filter(
    event => eventDate(event).toDateString() === now.toDateString(),
  );
  const next = events.find(event => !event.allDay && +eventDate(event) >= +now);
  return (
    <WorkspacePage
      title="Brief"
      subtitle={
        snapshot.preview
          ? 'Sample events · Preview'
          : now.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })
      }>
      {snapshot.loading && (
        <Text style={{color: colors.muted}}>Loading your schedule...</Text>
      )}
      {!!snapshot.error && (
        <Text accessibilityRole="alert" style={{color: colors.error}}>
          {snapshot.error}
        </Text>
      )}
      <View style={{gap: 14}}>
        <Text
          accessibilityRole="header"
          style={{color: colors.text, fontSize: 24}}>
          Today
        </Text>
        <Text style={{color: colors.text, fontSize: 28}}>
          {today.length} {today.length === 1 ? 'event' : 'events'}
        </Text>
        {!today.length && !snapshot.loading && (
          <Text style={{color: colors.muted, fontSize: 18}}>
            No events on your visible calendars today.
          </Text>
        )}
        {today.map(event => (
          <View
            key={`${event.calendarId}:${event.id}`}
            style={{
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderColor: colors.border,
              gap: 6,
            }}>
            <Text style={{color: colors.text, fontSize: 22}}>
              {event.title}
            </Text>
            <Text style={{color: colors.muted, fontSize: 18}}>
              {event.allDay
                ? 'All day'
                : eventDate(event).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
            </Text>
            <Text
              style={{color: colors.muted, fontSize: 18, fontStyle: 'italic'}}>
              {event.calendarName}
              {event.location ? ` · ${event.location}` : ''}
            </Text>
          </View>
        ))}
      </View>
      <View style={{gap: 10}}>
        <Text
          accessibilityRole="header"
          style={{color: colors.text, fontSize: 24}}>
          Next up
        </Text>
        <Text style={{color: colors.text, fontSize: 26}}>
          {next?.title ||
            (snapshot.loading ? 'Loading...' : 'No upcoming timed events')}
        </Text>
        {next && (
          <Text style={{color: colors.muted, fontSize: 18}}>
            {eventDate(next).toLocaleString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        )}
      </View>
      <View style={{alignSelf: 'flex-start'}}>
        <GlassButton
          label="Open calendar"
          icon="calendar"
          onPress={() => navigation.navigate('Calendar')}
        />
      </View>
    </WorkspacePage>
  );
}
