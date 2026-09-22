import React from 'react';
import {Platform, Switch, View} from 'react-native';
import WorkspacePage from '../components/WorkspacePage';
import Text from '../components/AppText';
import {useTheme} from '../theme/ThemeProvider';
import {useWorkspace} from '../theme/WorkspaceProvider';
import PeopleSettings, {CalendarPerson} from '../components/PeopleSettings';

export default function HouseholdScreen() {
  const {colors} = useTheme();
  const {snapshot, hidden, setCalendarVisible, filterError} = useWorkspace();
  const calendars = [
    ...new Map(
      snapshot.events.map(event => [event.calendarId, event.calendarName]),
    ).entries(),
  ];
  return (
    <WorkspacePage
      title="Household"
      subtitle={
        snapshot.preview
          ? 'Sample calendars · Preview'
          : 'Calendars with events in the next seven days'
      }>
      <PeopleSettings />
      {!!filterError && (
        <Text accessibilityRole="alert" style={{color: colors.error}}>
          {filterError}
        </Text>
      )}
      {!!snapshot.error && (
        <Text accessibilityRole="alert" style={{color: colors.error}}>
          {snapshot.error}
        </Text>
      )}
      {snapshot.loading && (
        <Text style={{color: colors.muted}}>Loading calendars...</Text>
      )}
      {!snapshot.loading && !calendars.length && (
        <Text style={{color: colors.muted, fontSize: 20}}>
          No calendars with upcoming events.
        </Text>
      )}
      {calendars.map(([id, name]) => (
        <View
          key={id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20,
            paddingVertical: 18,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}>
          <View style={{flex: 1, gap: 6}}>
            <Text style={{color: colors.text, fontSize: 24}}>{name}</Text>
            <Text style={{color: colors.muted, fontSize: 18}}>
              {snapshot.events.filter(event => event.calendarId === id).length}{' '}
              {snapshot.events.filter(event => event.calendarId === id)
                .length === 1
                ? 'event'
                : 'events'}
            </Text>
            <CalendarPerson calendarId={id} />
          </View>
          <Switch
            thumbColor={colors.surface}
            {...(Platform.OS === 'web'
              ? {activeThumbColor: colors.surface}
              : {})}
            accessibilityLabel={`Show ${name}`}
            value={!hidden.includes(id)}
            onValueChange={visible => setCalendarVisible(id, visible)}
            trackColor={{false: colors.muted, true: colors.accent}}
          />
        </View>
      ))}
    </WorkspacePage>
  );
}
