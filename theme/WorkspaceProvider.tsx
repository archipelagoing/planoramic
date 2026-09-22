import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {CalendarEvent} from '../services/calendar';

type Snapshot = {
  events: CalendarEvent[];
  preview: boolean;
  loading: boolean;
  error: string;
  updatedAt: Date | null;
};
type TimerMode = 'focus' | 'short' | 'long';
const durations = {focus: 25, short: 5, long: 15};
function useWorkspaceState() {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    events: [],
    preview: false,
    loading: true,
    error: '',
    updatedAt: null,
  });
  const [hidden, setHidden] = useState<string[]>([]);
  const [filterError, setFilterError] = useState('');
  const changed = useRef(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw =
          Platform.OS === 'web'
            ? localStorage.getItem('planoramic.hiddenCalendars')
            : await SecureStore.getItemAsync('planoramic.hiddenCalendars');
        const saved: unknown = raw ? JSON.parse(raw) : [];
        if (
          active &&
          !changed.current &&
          Array.isArray(saved) &&
          saved.every(id => typeof id === 'string')
        )
          setHidden(saved);
      } catch {
        if (active)
          setFilterError('Calendar visibility could not be restored.');
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const setCalendarVisible = (id: string, visible: boolean) => {
    changed.current = true;
    const next = visible
      ? hidden.filter(value => value !== id)
      : [...new Set([...hidden, id])];
    setHidden(next);
    writes.current = writes.current.then(async () => {
      try {
        const raw = JSON.stringify(next);
        if (Platform.OS === 'web')
          localStorage.setItem('planoramic.hiddenCalendars', raw);
        else await SecureStore.setItemAsync('planoramic.hiddenCalendars', raw);
        setFilterError('');
      } catch {
        setFilterError(
          'Calendar visibility will only be saved for this session.',
        );
      }
    });
  };
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [minutes, setMinutes] = useState(durations);
  const [remaining, setRemaining] = useState(25 * 60);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [completed, setCompleted] = useState(0);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    if (deadline === null) return;
    let completedThisRun = false;
    const tick = () => {
      if (completedThisRun) return;
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) {
        completedThisRun = true;
        setDeadline(null);
        setFinished(true);
        if (timerMode === 'focus') setCompleted(value => value + 1);
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [deadline, timerMode]);
  const selectTimer = (mode: TimerMode) => {
    setDeadline(null);
    setTimerMode(mode);
    setRemaining(minutes[mode] * 60);
    setFinished(false);
  };
  const resetTimer = () => selectTimer(timerMode);
  const toggleTimer = () => {
    if (deadline !== null) {
      setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
      setDeadline(null);
    } else {
      const seconds = remaining || minutes[timerMode] * 60;
      setRemaining(seconds);
      setFinished(false);
      setDeadline(Date.now() + seconds * 1000);
    }
  };
  const adjustTimer = (delta: number) => {
    if (deadline !== null) return;
    const value = Math.max(1, Math.min(90, minutes[timerMode] + delta));
    setMinutes({...minutes, [timerMode]: value});
    setRemaining(value * 60);
    setFinished(false);
  };
  return {
    snapshot,
    setSnapshot,
    hidden,
    setCalendarVisible,
    filterError,
    timerMode,
    selectTimer,
    remaining,
    running: deadline !== null,
    toggleTimer,
    resetTimer,
    adjustTimer,
    minutes,
    completed,
    finished,
  };
}
const Workspace = createContext<ReturnType<typeof useWorkspaceState> | null>(
  null,
);
export function WorkspaceProvider({children}: {children: React.ReactNode}) {
  return (
    <Workspace.Provider value={useWorkspaceState()}>
      {children}
    </Workspace.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(Workspace);
  if (!value) throw new Error('WorkspaceProvider is required');
  return value;
}
