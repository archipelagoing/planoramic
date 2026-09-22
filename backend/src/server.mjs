import dotenv from 'dotenv';
import {fileURLToPath} from 'node:url';
import {readConfig} from './config.mjs';
import {createApp} from './app.mjs';

dotenv.config({path: fileURLToPath(new URL('../.env', import.meta.url))});
try {
  const config = readConfig();
  const server = createApp(config).listen(config.port, config.host, () => {
    console.log(
      JSON.stringify({
        event: 'listening',
        host: config.host,
        port: config.port,
        storage: 'memory',
      }),
    );
  });
  server.on('error', error => {
    console.error(JSON.stringify({event: 'listen_failed', code: error.code}));
    process.exitCode = 1;
  });
  const stop = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
