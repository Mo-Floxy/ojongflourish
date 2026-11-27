import app from './app.js';
import { assertProductionSecrets, env } from './config/env.js';
import { pingDatabase } from './db/pool.js';

assertProductionSecrets();

const server = app.listen(env.port, () => {
  console.log(`AETHRA API listening on http://localhost:${env.port}`);
  pingDatabase()
    .then(() => console.log('Database connection: connected'))
    .catch((error) => console.warn(`Database connection: unavailable — ${error.message}`));
});

const shutdown = () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
