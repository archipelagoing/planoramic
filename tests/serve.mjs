import express from '../backend/node_modules/express/index.js';
import {createApp} from '../backend/src/app.mjs';
import {readConfig} from '../backend/src/config.mjs';

const app = express();
app.use(express.static('dist'));
app.use(
  createApp(
    readConfig({
      DEV_API_KEY: 'browser-test-controller-key-with-32-characters',
      DISPLAY_ORIGIN: 'http://localhost:8088',
    }),
    {
      logger: () => {},
      calendar: async range => ({...range, events: [], calendarCount: 1}),
    },
  ),
);
app.listen(8088, 'localhost');
