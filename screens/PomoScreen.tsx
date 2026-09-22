import React from 'react';
import {View} from 'react-native';
import WorkspacePage from '../components/WorkspacePage';
import Text from '../components/AppText';
import GlassButton from '../components/GlassButton';
import {useTheme} from '../theme/ThemeProvider';
import {useWorkspace} from '../theme/WorkspaceProvider';

export default function PomoScreen() {
  const {colors} = useTheme();
  const timer = useWorkspace();
  const modes = [
    {id: 'focus', label: 'Focus'},
    {id: 'short', label: 'Short break'},
    {id: 'long', label: 'Long break'},
  ] as const;
  const time = `${String(Math.floor(timer.remaining / 60)).padStart(2, '0')}:${String(timer.remaining % 60).padStart(2, '0')}`;
  return (
    <WorkspacePage title="Pomo" subtitle="Time for one thing at a time">
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Timer mode"
        style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
        {modes.map(mode => (
          <GlassButton
            key={mode.id}
            label={mode.label}
            radio
            selected={mode.id === timer.timerMode}
            onPress={() => timer.selectTimer(mode.id)}
          />
        ))}
      </View>
      <View style={{alignItems: 'center', gap: 24, paddingVertical: 24}}>
        <Text
          accessibilityRole="timer"
          accessibilityLabel={`Time remaining ${time}`}
          testID="pomo-time"
          style={{
            color: colors.text,
            fontSize: 72,
            lineHeight: 90,
            fontVariant: ['tabular-nums'],
            height: 90,
          }}>
          {time}
        </Text>
        <Text
          accessibilityLiveRegion="polite"
          style={{color: colors.muted, fontSize: 20}}>
          {timer.finished
            ? timer.timerMode === 'focus'
              ? 'Focus complete. Take a break.'
              : 'Break complete. Ready to focus?'
            : timer.running
              ? 'Session in progress'
              : 'Ready when you are'}
        </Text>
        <View style={{flexDirection: 'row', gap: 16}}>
          <GlassButton
            label={timer.running ? 'Pause' : 'Start'}
            icon={timer.running ? 'pause' : 'play'}
            onPress={timer.toggleTimer}
          />
          <GlassButton
            label="Reset timer"
            icon="restart"
            iconOnly
            onPress={timer.resetTimer}
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
          <GlassButton
            label="Decrease duration"
            icon="minus"
            iconOnly
            disabled={timer.running || timer.minutes[timer.timerMode] <= 1}
            onPress={() => timer.adjustTimer(-1)}
          />
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              width: 100,
              textAlign: 'center',
            }}>
            {timer.minutes[timer.timerMode]} min
          </Text>
          <GlassButton
            label="Increase duration"
            icon="plus"
            iconOnly
            disabled={timer.running || timer.minutes[timer.timerMode] >= 90}
            onPress={() => timer.adjustTimer(1)}
          />
        </View>
        <Text style={{color: colors.muted, fontSize: 18}}>
          {timer.completed} focus{' '}
          {timer.completed === 1 ? 'session' : 'sessions'} completed
        </Text>
      </View>
    </WorkspacePage>
  );
}
