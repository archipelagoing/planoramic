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
  const [revision, setRevision] = useState(0);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const lock = useRef(false);
  const writes = useRef(Promise.resolve());
  const key = useRef('planoramic.tasks.local');
  useEffect(() => {
    let active = true;
    setReady(false);
    (async () => {
      try {
        await writes.current;
        const device = await loadDevice(new AbortController().signal);
        if (!active) return;
        const fallback =
          key.current === 'planoramic.tasks.local' ? current.current : empty;
        key.current = `planoramic.tasks.${device?.workspaceId || device?.deviceId || 'local'}`;
        const raw =
          Platform.OS === 'web'
            ? localStorage.getItem(key.current)
            : await SecureStore.getItemAsync(key.current);
        if (!raw && active) {
          current.current = fallback;
          setData(fallback);
          if (
            fallback.tasks.length ||
            fallback.people.length ||
            fallback.calendarId ||
            Object.keys(fallback.owners).length
          ) {
            if (Platform.OS === 'web')
              localStorage.setItem(key.current, JSON.stringify(fallback));
            else
              await SecureStore.setItemAsync(
                key.current,
                JSON.stringify(fallback),
              );
          }
        }
        if (raw) {
          const saved = JSON.parse(raw);
          if (
            !Array.isArray(saved.tasks) ||
            !saved.tasks.every(
              (task: Task) =>
                task &&
                typeof task.id === 'string' &&
                typeof task.title === 'string' &&
                typeof task.due === 'string' &&
                typeof task.person === 'string' &&
                /^#[a-fA-F0-9]{6}$/.test(task.color) &&
                typeof task.completed === 'boolean' &&
                typeof task.calendarId === 'string' &&
                typeof task.synced === 'boolean',
            ) ||
            !Array.isArray(saved.people) ||
            !saved.people.every(
              (person: Person) =>
                person &&
                typeof person.id === 'string' &&
                typeof person.name === 'string' &&
                personColors.includes(person.color),
            ) ||
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
        if (active) setReady(true);
      } catch {
        if (active)
          setError(
            'Task storage could not be restored. Refresh before making changes.',
          );
      }
    })();
    return () => {
      active = false;
    };
  }, [restoreAttempt]);
  const update = (fn: (value: Data) => Data) => {
    if (!ready) return;
    const next = fn(current.current);
    current.current = next;
    setData(next);
    const storageKey = key.current;
    writes.current = writes.current.then(async () => {
      try {
        if (Platform.OS === 'web')
          localStorage.setItem(storageKey, JSON.stringify(next));
        else await SecureStore.setItemAsync(storageKey, JSON.stringify(next));
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
    if (!next.due && next.calendarId) {
      await taskRequest('tasks', {
        action: 'delete',
        calendarId: next.calendarId,
        task: next,
      });
      next.calendarId = '';
    }
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
      setRevision(value => value + 1);
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
    revision,
    reloadWorkspace: () => setRestoreAttempt(value => value + 1),
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
        setRevision(value => value + 1);
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
