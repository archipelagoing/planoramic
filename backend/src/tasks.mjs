import {ApiError} from './errors.mjs';

export function createTaskClient(getToken, fetchImpl = fetch) {
  const root = 'https://www.googleapis.com/calendar/v3';
  async function call(path, method = 'GET', body, optional = false) {
    let response;
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await getToken(attempt > 0);
      response = await fetchImpl(`${root}${path}`, {
        method,
        signal: AbortSignal.timeout(15000),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        ...(body ? {body: JSON.stringify(body)} : {}),
      });
      if (response.status !== 401) break;
    }
    if (optional && [404, 410].includes(response.status)) return null;
    if (response.status === 403)
      throw new ApiError(
        403,
        'TASK_PERMISSION_REQUIRED',
        'Reconnect Google to grant calendar write access, and choose a calendar you can edit.',
      );
    if (!response.ok)
      throw new ApiError(
        502,
        'TASK_SYNC_FAILED',
        'Google Calendar could not sync tasks. Try again.',
      );
    return response.status === 204 ? null : response.json();
  }
  async function pages(path) {
    const items = [];
    for (let page = 0, token = ''; page < 30; page++) {
      const data = await call(
        `${path}${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`,
      );
      items.push(...(data.items || []));
      if (!data.nextPageToken) return items;
      token = data.nextPageToken;
    }
    throw new ApiError(
      422,
      'TASK_LIMIT',
      'Too many tasks or calendars to load.',
    );
  }
  async function calendar(id) {
    if (typeof id !== 'string' || !id || id.length > 1024)
      throw new ApiError(400, 'INVALID_CALENDAR', 'Choose a shared calendar.');
    const entry = await call(
      `/users/me/calendarList/${encodeURIComponent(id)}`,
    );
    if (!['owner', 'writer'].includes(entry.accessRole))
      throw new ApiError(
        403,
        'READ_ONLY_CALENDAR',
        'Choose a calendar you can edit.',
      );
    return `/calendars/${encodeURIComponent(id)}/events`;
  }
  function taskFromEvent(event, calendarId) {
    const props = event.extendedProperties?.shared || {};
    return {
      id: event.id,
      calendarId,
      title: props.taskTitle || event.summary || '',
      due: event.start?.date || '',
      person: props.person || '',
      color: props.personColor || '#7189bf',
      completed: props.completed === 'true',
      synced: true,
    };
  }
  return {
    async calendars() {
      return (
        await pages(
          '/users/me/calendarList?minAccessRole=writer&maxResults=250',
        )
      )
        .filter(c => ['owner', 'writer'].includes(c.accessRole))
        .map(c => ({id: c.id, name: c.summaryOverride || c.summary || c.id}));
    },
    async list(calendarId) {
      const path = await calendar(calendarId);
      return (
        await pages(
          `${path}?sharedExtendedProperty=planoramicTask%3Dv1&maxResults=250`,
        )
      )
        .filter(e => e.status !== 'cancelled')
        .map(e => taskFromEvent(e, calendarId));
    },
    async mutate(input) {
      const {calendarId, action, task} = input || {};
      if (
        !['save', 'delete'].includes(action) ||
        !task ||
        !/^[a-v0-9]{5,64}$/.test(task.id)
      )
        throw new ApiError(400, 'INVALID_TASK', 'Invalid task request.');
      const path = await calendar(calendarId);
      const existing = await call(`${path}/${task.id}`, 'GET', undefined, true);
      if (
        existing &&
        existing.extendedProperties?.shared?.planoramicTask !== 'v1'
      )
        throw new ApiError(
          409,
          'TASK_CONFLICT',
          'This event is not a Planoramic task.',
        );
      if (action === 'delete') {
        if (existing) await call(`${path}/${task.id}`, 'DELETE');
        return {deleted: true};
      }
      const date = new Date(`${task.due}T00:00:00Z`);
      if (
        typeof task.title !== 'string' ||
        !task.title.trim() ||
        task.title.length > 200 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(task.due || '') ||
        !Number.isFinite(+date) ||
        date.toISOString().slice(0, 10) !== task.due ||
        typeof task.person !== 'string' ||
        task.person.length > 60 ||
        !/^#[a-fA-F0-9]{6}$/.test(task.color || '') ||
        typeof task.completed !== 'boolean'
      )
        throw new ApiError(
          400,
          'INVALID_TASK',
          'Add a title and valid due date to sync this task.',
        );
      date.setUTCDate(date.getUTCDate() + 1);
      const colorIds = {
        '#7189bf': '9',
        '#539c82': '10',
        '#bc718b': '4',
        '#b7914b': '5',
        '#9576b8': '3',
      };
      const payload = {
        summary: `${task.completed ? '[Done] ' : ''}${task.person ? `${task.person}: ` : ''}${task.title.trim()}`,
        start: {date: task.due},
        end: {date: date.toISOString().slice(0, 10)},
        colorId: colorIds[task.color] || '9',
        extendedProperties: {
          shared: {
            ...(existing?.extendedProperties?.shared || {}),
            planoramicTask: 'v1',
            taskTitle: task.title.trim(),
            person: task.person,
            personColor: task.color,
            completed: String(task.completed),
          },
        },
      };
      const saved = existing
        ? await call(`${path}/${task.id}`, 'PATCH', payload)
        : await call(path, 'POST', {id: task.id, ...payload});
      return taskFromEvent(saved, calendarId);
    },
  };
}
