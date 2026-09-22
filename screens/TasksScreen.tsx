import React, {useState} from 'react';
import {View, TextInput, Switch, Platform, Alert} from 'react-native';
import WorkspacePage from '../components/WorkspacePage';
import Text from '../components/AppText';
import GlassButton from '../components/GlassButton';
import {useTasks, Task, personColors} from '../theme/TasksProvider';
import {useTheme, glassStyle} from '../theme/ThemeProvider';
import {useFont} from '../theme/FontProvider';

export default function TasksScreen() {
  const {
    tasks,
    people,
    calendarId,
    saveTask,
    deleteTask,
    refresh,
    busy,
    ready,
    error,
  } = useTasks();
  const {colors, dark} = useTheme();
  const {family, fontScale} = useFont();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [person, setPerson] = useState('');
  const [editing, setEditing] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'open' | 'done' | 'all'>('open');
  const date = new Date(`${due}T00:00:00Z`);
  const validDate =
    !due ||
    (/^\d{4}-\d{2}-\d{2}$/.test(due) &&
      Number.isFinite(+date) &&
      date.toISOString().slice(0, 10) === due);
  const selected = people.find(p => p.name === person);
  const clear = () => {
    setTitle('');
    setDue('');
    setPerson('');
    setEditing(null);
  };
  const field = {
    ...glassStyle(colors, dark),
    fontFamily: family,
    fontSize: 18 * fontScale,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
  };
  const shown = tasks
    .filter(
      t =>
        (!t.calendarId || t.calendarId === calendarId) &&
        (filter === 'all' || t.completed === (filter === 'done')),
    )
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  return (
    <WorkspacePage
      title="Tasks"
      subtitle={calendarId ? 'Shared calendar tasks' : 'Local tasks'}>
      {!!error && (
        <Text accessibilityRole="alert" style={{color: colors.error}}>
          {error}
        </Text>
      )}
      <View style={{gap: 12}}>
        <TextInput
          accessibilityLabel="Task title"
          placeholder="Task title"
          placeholderTextColor={colors.muted}
          maxLength={200}
          value={title}
          onChangeText={setTitle}
          style={field}
        />
        <TextInput
          accessibilityLabel="Due date"
          placeholder="Due date (YYYY-MM-DD)"
          placeholderTextColor={colors.muted}
          maxLength={10}
          value={due}
          onChangeText={setDue}
          style={field}
        />
        {!validDate && (
          <Text accessibilityRole="alert" style={{color: colors.error}}>
            Enter a valid date in YYYY-MM-DD format.
          </Text>
        )}
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Assigned person"
          style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
          <GlassButton
            label="Unassigned"
            radio
            selected={!person}
            onPress={() => setPerson('')}
          />
          {people.map(p => (
            <GlassButton
              key={p.id}
              label={p.name}
              radio
              selected={person === p.name}
              onPress={() => setPerson(p.name)}
            />
          ))}
        </View>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
          <GlassButton
            label={editing ? 'Save task' : 'Add task'}
            icon="plus"
            disabled={!ready || busy || !title.trim() || !validDate}
            onPress={async () => {
              await saveTask({
                id:
                  editing?.id ||
                  `task${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
                title: title.trim(),
                due,
                person,
                color: selected?.color || editing?.color || personColors[0],
                completed: editing?.completed || false,
                calendarId: editing?.calendarId || (due ? calendarId : ''),
                synced: false,
              });
              clear();
            }}
          />
          {editing && <GlassButton label="Cancel edit" onPress={clear} />}
          {calendarId && (
            <GlassButton
              label="Sync tasks"
              icon="sync"
              disabled={busy || !ready}
              onPress={refresh}
            />
          )}
        </View>
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Task filter"
        style={{flexDirection: 'row', gap: 8, flexWrap: 'wrap'}}>
        {(['open', 'done', 'all'] as const).map(value => (
          <GlassButton
            key={value}
            label={{open: 'Open', done: 'Completed', all: 'All'}[value]}
            radio
            selected={filter === value}
            onPress={() => setFilter(value)}
          />
        ))}
      </View>
      {!shown.length && (
        <Text style={{color: colors.muted, fontSize: 18}}>
          {ready ? 'No tasks in this view.' : 'Loading tasks...'}
        </Text>
      )}
      {shown.map(task => (
        <View
          key={task.id}
          style={[
            glassStyle(colors, dark),
            {
              padding: 18,
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: task.color,
              gap: 12,
            },
          ]}>
          <View style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
            <Switch
              accessibilityLabel={`Complete ${task.title}`}
              value={task.completed}
              disabled={busy}
              onValueChange={completed => saveTask({...task, completed})}
              trackColor={{false: colors.muted, true: task.color}}
              thumbColor={colors.surface}
              {...(Platform.OS === 'web'
                ? {activeThumbColor: colors.text}
                : {})}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: 22,
                flex: 1,
                textDecorationLine: task.completed ? 'line-through' : 'none',
              }}>
              {task.title}
            </Text>
          </View>
          <Text style={{color: colors.muted, fontSize: 16}}>
            {task.person || 'Unassigned'} · {task.due || 'No due date'} ·{' '}
            {task.synced
              ? 'Synced'
              : task.calendarId
                ? 'Sync pending'
                : 'Local only'}
          </Text>
          <View style={{flexDirection: 'row', gap: 10}}>
            <GlassButton
              label={`Edit ${task.title}`}
              icon="pencil"
              iconOnly
              disabled={busy}
              onPress={() => {
                setEditing(task);
                setTitle(task.title);
                setDue(task.due);
                setPerson(task.person);
              }}
            />
            <GlassButton
              label={`Delete ${task.title}`}
              icon="delete-outline"
              iconOnly
              disabled={busy}
              onPress={() => {
                if (Platform.OS === 'web') {
                  if (
                    window.confirm(
                      `Delete "${task.title}"${task.calendarId ? ' from the shared calendar' : ''}?`,
                    )
                  )
                    deleteTask(task);
                } else
                  Alert.alert('Delete task?', task.title, [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => deleteTask(task),
                    },
                  ]);
              }}
            />
          </View>
        </View>
      ))}
    </WorkspacePage>
  );
}
