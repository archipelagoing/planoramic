import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {request} from '../services/calendar';
import {loadDevice} from '../services/deviceStorage';

export const personColors = [
  '#7189bf',
  '#539c82',
  '#bc718b',
  '#b7914b',
  '#9576b8',
];
export type Person = {id: string; name: string; color: string};
export type Task = {
  id: string;
  title: string;
  due: string;
  person: string;
  color: string;
  completed: boolean;
  calendarId: string;
  synced: boolean;
};
type Data = {
  tasks: Task[];
  people: Person[];
  calendarId: string;
  owners: Record<string, string>;
};
const empty: Data = {tasks: [], people: [], calendarId: '', owners: {}};
export async function taskRequest<T>(path: string, body?: object) {
  const controller = new AbortController();
  const device = await loadDevice(controller.signal);
  if (!device)
    throw new Error('Pair this display before connecting a shared calendar.');
  return request<T>(
    `${Platform.OS === 'web' ? '/api/display' : `/api/devices/${device.deviceId}`}/${path}`,
    controller.signal,
    device.deviceCredential,
    body,
  );
}
function useTasksState() {
  const [data, setData] = useState<Data>(empty);
  const current = useRef(data);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const writes = useRef(Promise.resolve());
  const key = useRef('planoramic.tasks.local');
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const device = await loadDevice(new AbortController().signal);
        key.current = `planoramic.tasks.${device?.deviceId || 'local'}`;
        const raw =
          Platform.OS === 'web'
            ? localStorage.getItem(key.current)
            : await SecureStore.getItemAsync(key.current);
        if (raw) {
          const saved = JSON.parse(raw);
          if (
            !Array.isArray(saved.tasks) ||
            !Array.isArray(saved.people) ||
            typeof saved.calendarId !== 'string' ||
            !saved.owners ||
            typeof saved.owners !== 'object'
          )
            throw new Error('Invalid task storage');
          if (active) {
            current.current = saved;
            setData(saved);
          }
        }
      } catch {
        if (active)
          setError(
            'Task storage could not be restored. Refresh before making changes.',
          );
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const update = (fn: (value: Data) => Data) => {
    const next = fn(current.current);
    current.current = next;
    setData(next);
    writes.current = writes.current.then(async () => {
      try {
        if (Platform.OS === 'web')
          localStorage.setItem(key.current, JSON.stringify(next));
        else await SecureStore.setItemAsync(key.current, JSON.stringify(next));
      } catch {
        setError('Changes could not be saved on this device.');
      }
    });
  };
  const run = async (fn: () => Promise<void>) => {
    if (lock.current || !ready) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Task sync failed.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const save = async (task: Task) => {
    const next = {...task, synced: false};
    update(value => ({
      ...value,
      tasks: [...value.tasks.filter(t => t.id !== next.id), next],
    }));
    if (next.due && next.calendarId) {
      const saved = await taskRequest<Task>('tasks', {
        action: 'save',
        calendarId: next.calendarId,
        task: next,
      });
      update(value => ({
        ...value,
        tasks: value.tasks.map(t => (t.id === next.id ? saved : t)),
      }));
    }
  };
  const refresh = () =>
    run(async () => {
      const calendarId = current.current.calendarId;
      if (!calendarId) return;
      for (const task of current.current.tasks.filter(
        t =>
          !t.synced && t.due && (!t.calendarId || t.calendarId === calendarId),
      ))
        await save({...task, calendarId});
      const result = await taskRequest<{tasks: Task[]}>(
        `tasks?${new URLSearchParams({calendarId})}`,
      );
      update(value => ({
        ...value,
        tasks: [
          ...value.tasks.filter(t => t.calendarId !== calendarId),
          ...result.tasks,
        ],
      }));
    });
  useEffect(() => {
    if (!ready || !data.calendarId) return;
    // Background refresh only reads. Pending local changes are retried explicitly.
    const pull = async () => {
      if (lock.current) return;
      const calendarId = current.current.calendarId;
      try {
        const result = await taskRequest<{tasks: Task[]}>(
          `tasks?${new URLSearchParams({calendarId})}`,
        );
        if (current.current.calendarId !== calendarId || lock.current) return;
        update(value => {
          const pending = value.tasks.filter(
            t => t.calendarId === calendarId && !t.synced,
          );
          return {
            ...value,
            tasks: [
              ...value.tasks.filter(t => t.calendarId !== calendarId),
              ...pending,
              ...result.tasks.filter(t => !pending.some(p => p.id === t.id)),
            ],
          };
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Shared tasks could not be loaded.',
        );
      }
    };
    pull();
    const timer = setInterval(pull, 60000);
    return () => clearInterval(timer);
  }, [ready, data.calendarId]);
  return {
    ...data,
    ready,
    busy,
    error,
    refresh,
    setCalendar: (calendarId: string) =>
      update(value => ({...value, calendarId})),
    addPerson: (name: string, color: string) =>
      update(value => ({
        ...value,
        people: [
          ...value.people,
          {id: `person${Date.now()}`, name: name.trim().slice(0, 60), color},
        ],
      })),
    assignCalendar: (calendarId: string, personId: string) =>
      update(value => ({
        ...value,
        owners: {...value.owners, [calendarId]: personId},
      })),
    personForCalendar: (calendarId: string) =>
      data.people.find(p => p.id === data.owners[calendarId]),
    saveTask: (task: Task) => run(() => save(task)),
    deleteTask: (task: Task) =>
      run(async () => {
        if (task.calendarId)
          await taskRequest('tasks', {
            action: 'delete',
            calendarId: task.calendarId,
            task,
          });
        update(value => ({
          ...value,
          tasks: value.tasks.filter(t => t.id !== task.id),
        }));
      }),
  };
}
const Context = createContext<ReturnType<typeof useTasksState> | null>(null);
export function TasksProvider({children}: {children: React.ReactNode}) {
  return (
    <Context.Provider value={useTasksState()}>{children}</Context.Provider>
  );
}
export function useTasks() {
  const value = useContext(Context);
  if (!value) throw new Error('TasksProvider required');
  return value;
}
