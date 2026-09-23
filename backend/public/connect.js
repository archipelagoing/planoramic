import {attachFlameText} from './flame-text.js';
const element = id => document.getElementById(id);
let flameCleanups = [];
function updateFlame() {
  flameCleanups.forEach(cleanup => cleanup());
  const dark = document.documentElement.dataset.theme === 'dark';
  flameCleanups = element('flame-toggle').checked
    ? [
        ...document.querySelectorAll(
          dark
            ? '.brand.flame-text, h1.flame-text, .appearance [aria-pressed="true"] .icon'
            : '.brand.flame-text, h1.flame-text',
        ),
      ].map(node =>
        attachFlameText(node, {
          dark,
        }),
      )
    : [];
}
element('flame-toggle').addEventListener('change', updateFlame);
const fontKey = 'planoramic.font';
const fontPicker = element('font-picker');
const fontIds = [
  'montserrat',
  'instrument',
  'garamond',
  'infant',
  'averia-light',
];
try {
  const saved = localStorage.getItem(fontKey);
  const restored = saved === 'averia' ? 'averia-light' : saved;
  if (fontIds.includes(restored)) fontPicker.value = restored;
} catch {}
document.documentElement.dataset.font = fontPicker.value;
updateFlame();
fontPicker.addEventListener('change', () => {
  document.documentElement.dataset.font = fontPicker.value;
  updateFlame();
  try {
    localStorage.setItem(fontKey, fontPicker.value);
    element('font-feedback').hidden = true;
  } catch {
    element('font-feedback').hidden = false;
    element('font-feedback').textContent =
      'Font will only be saved for this session.';
  }
});
const appearanceKey = 'planoramic.appearance';
const systemAppearance = window.matchMedia('(prefers-color-scheme: dark)');
let appearance = 'system';
try {
  const saved = localStorage.getItem(appearanceKey);
  if (['light', 'dark', 'system'].includes(saved)) appearance = saved;
} catch {}
function applyAppearance() {
  document.documentElement.dataset.theme =
    appearance === 'system'
      ? systemAppearance.matches
        ? 'dark'
        : 'light'
      : appearance;
  document.querySelectorAll('button[data-theme]').forEach(button => {
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.theme === appearance),
    );
  });
  updateFlame();
}
document.querySelectorAll('button[data-theme]').forEach(button => {
  button.addEventListener('click', () => {
    appearance = button.dataset.theme;
    applyAppearance();
    try {
      localStorage.setItem(appearanceKey, appearance);
      element('appearance-feedback').hidden = true;
    } catch {
      element('appearance-feedback').hidden = false;
      element('appearance-feedback').textContent =
        'Appearance will only be saved for this session.';
    }
  });
});
systemAppearance.addEventListener('change', applyAppearance);
applyAppearance();
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
  updateFlame();
  element('feedback').textContent = 'Loading events…';
  try {
    const {events, calendarCount} = await api('/api/calendar/events');
    element('feedback').textContent = events.length
      ? `Upcoming events for the next seven days across ${calendarCount} calendars:`
      : `No upcoming events in the next seven days across ${calendarCount} calendars.`;
    for (const event of events) {
      const row = document.createElement('li');
      const date = new Date(
        event.allDay ? `${event.start.date}T12:00:00` : event.start.dateTime,
      );
      const time = document.createElement('span');
      time.className = 'event-time flame-text';
      time.textContent = event.allDay
        ? 'All day'
        : date.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
      const details = document.createElement('div');
      const title = document.createElement('h2');
      title.className = 'event-title';
      title.textContent = event.title;
      const meta = document.createElement('p');
      meta.className = 'event-meta';
      const dateLabel = document.createElement('span');
      dateLabel.className = 'event-date flame-text';
      dateLabel.textContent = date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      meta.append(
        dateLabel,
        document.createTextNode(
          ` · ${[event.calendarName, event.location].filter(Boolean).join(' · ')}`,
        ),
      );
      details.append(title, meta);
      row.append(time, details);
      element('events').append(row);
    }
  } catch (error) {
    element('feedback').textContent = error.message;
    element('login').hidden = false;
  } finally {
    element('refresh').disabled = false;
    updateFlame();
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
      updateFlame();
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
