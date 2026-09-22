const element = id => document.getElementById(id);
async function api(path, options) {
  const response = await fetch(path, {credentials: 'same-origin', ...options});
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Request failed.');
  return data;
}
async function status() {
  const data = await api('/auth/me');
  element('status').textContent = !data.configured
    ? 'Google setup is needed: add the client ID and secret to backend/.env and restart. See docs/google-calendar-setup.md.'
    : data.user
      ? `Signed in as ${data.user.email}. ${data.calendarConnected ? 'Calendar connected.' : 'Reconnect Google to restore calendar access.'}`
      : 'Ready to connect your Google account.';
  element('login').hidden =
    !data.configured || Boolean(data.user && data.calendarConnected);
  element('controls').hidden = !data.user;
}
element('refresh').addEventListener('click', async () => {
  element('refresh').disabled = true;
  element('events').replaceChildren();
  element('feedback').textContent = 'Loading events…';
  try {
    const {events, calendarCount} = await api('/api/calendar/events');
    element('feedback').textContent = events.length
      ? `Upcoming events for the next seven days across ${calendarCount} calendars:`
      : `No upcoming events in the next seven days across ${calendarCount} calendars.`;
    for (const event of events) {
      const row = document.createElement('li');
      const start = event.allDay
        ? `${event.start.date} (all day)`
        : new Date(event.start.dateTime).toLocaleString();
      row.textContent = `${event.title}\n${start}\n${event.calendarName}${event.location ? `\n${event.location}` : ''}`;
      element('events').append(row);
    }
  } catch (error) {
    element('feedback').textContent = error.message;
    element('login').hidden = false;
  } finally {
    element('refresh').disabled = false;
  }
});
element('pair-form').addEventListener('submit', async event => {
  event.preventDefault();
  element('pair-submit').disabled = true;
  element('pair-feedback').textContent = 'Pairing…';
  try {
    await api('/api/pairings/claim', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        code: element('pair-code').value.trim().toUpperCase(),
      }),
    });
    element('pair-feedback').textContent =
      'Display paired. Your calendar will appear there shortly.';
    element('pair-code').value = '';
  } catch (error) {
    element('pair-feedback').textContent = error.message;
  } finally {
    element('pair-submit').disabled = false;
  }
});
for (const action of ['logout', 'disconnect']) {
  element(action).addEventListener('click', async () => {
    try {
      await api(`/auth/${action}`, {method: 'POST'});
      element('events').replaceChildren();
      element('feedback').textContent =
        action === 'logout'
          ? 'Signed out. Paired TVs can still access your calendar.'
          : 'Calendar disconnected from this server.';
      await status();
    } catch (error) {
      element('feedback').textContent = error.message;
    }
  });
}
status().catch(error => {
  element('status').textContent = error.message;
});
