import React, {createContext, useContext, useEffect, useReducer} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  initialTimer,
  TimerAction,
  TimerMode,
  TimerState,
  timerLabel,
  timerReducer,
} from './timer';
import {palette, TVButton} from './ui';

const TimerContext = createContext<{
  state: TimerState;
  dispatch: React.Dispatch<TimerAction>;
} | null>(null);
export function PomodoroProvider({children}: {children: React.ReactNode}) {
  const [state, dispatch] = useReducer(timerReducer, initialTimer);
  useEffect(() => {
    if (state.endsAt === null) return;
    dispatch({type: 'tick', now: Date.now()});
    const timer = setInterval(
      () => dispatch({type: 'tick', now: Date.now()}),
      1000,
    );
    return () => clearInterval(timer);
  }, [state.endsAt]);
  return (
    <TimerContext.Provider value={{state, dispatch}}>
      {children}
    </TimerContext.Provider>
  );
}
export function PomodoroScreen() {
  const timer = useContext(TimerContext)!;
  const {state, dispatch} = timer;
  const running = state.endsAt !== null;
  const modes: {id: TimerMode; label: string}[] = [
    {id: 'focus', label: 'Focus'},
    {id: 'short', label: 'Short break'},
    {id: 'long', label: 'Long break'},
  ];
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Time for one thing at a time</Text>
      <View style={styles.row}>
        {modes.map((mode) => (
          <TVButton
            key={mode.id}
            preferred={mode.id === 'focus'}
            label={mode.label}
            selected={state.mode === mode.id}
            onPress={() => dispatch({type: 'mode', mode: mode.id})}
          />
        ))}
      </View>
      <Text
        accessibilityRole="timer"
        accessibilityLabel={`Time remaining ${timerLabel(state.remaining)}`}
        style={styles.timer}>
        {timerLabel(state.remaining)}
      </Text>
      <Text accessibilityLiveRegion="polite" style={styles.body}>
        {state.finished
          ? state.mode === 'focus'
            ? 'Focus complete. Take a break.'
            : 'Break complete. Ready to focus?'
          : running
          ? 'Session in progress'
          : 'Ready when you are'}
      </Text>
      <View style={styles.row}>
        <TVButton
          label={running ? 'Pause' : 'Start'}
          onPress={() => dispatch({type: 'toggle', now: Date.now()})}
        />
        <TVButton label="Reset" onPress={() => dispatch({type: 'reset'})} />
        <TVButton
          label="− 1 min"
          disabled={running || state.minutes[state.mode] <= 1}
          onPress={() => dispatch({type: 'adjust', delta: -1})}
        />
        <Text style={styles.duration}>{state.minutes[state.mode]} min</Text>
        <TVButton
          label="+ 1 min"
          disabled={running || state.minutes[state.mode] >= 90}
          onPress={() => dispatch({type: 'adjust', delta: 1})}
        />
      </View>
      <Text style={styles.body}>
        {state.completed} focus {state.completed === 1 ? 'session' : 'sessions'}{' '}
        completed
      </Text>
      <Text style={styles.note}>
        Continues when you switch sections · Resets if Hearth closes
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 18,
  },
  heading: {color: palette.text, fontSize: 23, marginBottom: 8},
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    color: palette.accent,
    fontSize: 88,
    lineHeight: 108,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginVertical: 8,
  },
  body: {color: palette.text, fontSize: 18, marginVertical: 9},
  duration: {
    color: palette.text,
    fontSize: 18,
    minWidth: 62,
    textAlign: 'center',
  },
  note: {color: palette.muted, fontSize: 14, marginTop: 4},
});
