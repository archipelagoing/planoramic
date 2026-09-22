import test from 'node:test';
import assert from 'node:assert/strict';
import {createTaskClient} from '../src/tasks.mjs';

function fixture(role = 'writer') {
  const events = new Map();
  const writes = [];
  const tokens = [];
  const client = createTaskClient(
    async force => {
      tokens.push(force);
      return 'secret';
    },
    async (url, options) => {
      const path = new URL(url).pathname;
      const json = options.body ? JSON.parse(options.body) : undefined;
      if (path.endsWith('/calendarList'))
        return Response.json({
          items: [{id: 'shared', summary: 'Family', accessRole: role}],
        });
      if (path.includes('/calendarList/'))
        return Response.json({id: 'shared', accessRole: role});
      if (path.endsWith('/events') && options.method === 'GET')
        return Response.json({items: [...events.values()]});
      const id = path.split('/').at(-1);
      if (options.method === 'GET')
        return events.has(id)
          ? Response.json(events.get(id))
          : new Response(null, {status: 404});
      writes.push({method: options.method, json});
      if (options.method === 'DELETE') {
        events.delete(id);
        return new Response(null, {status: 204});
      }
      const event = {id: json.id || id, ...events.get(id), ...json};
      events.set(event.id, event);
      return Response.json(event);
    },
  );
  return {client, events, writes, tokens};
}
const task = {
  id: 'task123456',
  title: 'School forms',
  due: '2026-01-31',
  person: 'Alice',
  color: '#539c82',
  completed: false,
};
test('tasks insert with exclusive all-day end, person color, completion and idempotent update', async () => {
  const {client, events, writes} = fixture();
  const saved = await client.mutate({
    action: 'save',
    calendarId: 'shared',
    task,
  });
  assert.equal(saved.synced, true);
  assert.equal(saved.person, 'Alice');
  assert.equal(events.get(task.id).end.date, '2026-02-01');
  assert.equal(events.get(task.id).colorId, '10');
  await client.mutate({
    action: 'save',
    calendarId: 'shared',
    task: {...task, completed: true},
  });
  assert.equal(events.size, 1);
  assert.deepEqual(
    writes.map(w => w.method),
    ['POST', 'PATCH'],
  );
  assert.match(events.get(task.id).summary, /\[Done\]/);
  assert.equal((await client.list('shared'))[0].completed, true);
  await client.mutate({action: 'delete', calendarId: 'shared', task});
  assert.equal(events.size, 0);
  await client.mutate({action: 'delete', calendarId: 'shared', task});
  assert.equal(writes.length, 3);
});
test('ordinary events and read-only calendars cannot be changed', async () => {
  const {client, events, writes} = fixture();
  events.set(task.id, {id: task.id, summary: 'Not a task'});
  for (const action of ['save', 'delete'])
    await assert.rejects(
      client.mutate({action, calendarId: 'shared', task}),
      error => error.code === 'TASK_CONFLICT',
    );
  assert.equal(writes.length, 0);
  const readonly = fixture('reader');
  await assert.rejects(
    readonly.client.mutate({action: 'save', calendarId: 'shared', task}),
    error => error.code === 'READ_ONLY_CALENDAR',
  );
  assert.deepEqual(await readonly.client.calendars(), []);
});
test('invalid dates and task fields never write to Google', async () => {
  const {client, writes} = fixture();
  for (const change of [
    {due: '2026-02-30'},
    {due: ''},
    {title: ''},
    {color: 'red'},
    {completed: 'yes'},
    {id: '../../other'},
  ])
    await assert.rejects(
      client.mutate({
        action: 'save',
        calendarId: 'shared',
        task: {...task, ...change},
      }),
      error => error.code === 'INVALID_TASK',
    );
  assert.equal(writes.length, 0);
});
test('write scope failures ask for reconnection', async () => {
  const client = createTaskClient(
    async () => 'secret',
    async () => new Response(null, {status: 403}),
  );
  await assert.rejects(
    client.calendars(),
    error =>
      error.code === 'TASK_PERMISSION_REQUIRED' &&
      !error.message.includes('secret'),
  );
});
