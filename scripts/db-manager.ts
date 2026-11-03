import dotenv from 'dotenv';
import path from 'path';
import net from 'net';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = parseInt(process.env.EMBEDDED_PG_PORT || '5433', 10);
const dbDir = path.resolve(__dirname, '../.pgdata');

function checkPortOpen(targetPort: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1200);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.connect(targetPort, host);
  });
}

async function startDatabase() {
  const isOpen = await checkPortOpen(port);
  if (isOpen) {
    console.log(`[Database] PostgreSQL is already responding on port ${port}.`);
    return;
  }

  console.log(`[Database] Starting Embedded PostgreSQL on port ${port}...`);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const EmbeddedPostgres = require('embedded-postgres').default;

  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    port: port,
    user: 'postgres',
    password: 'password',
    database: 'homebites_dev',
    persistent: true
  });

  const isInitialized = fs.existsSync(path.join(dbDir, 'PG_VERSION'));
  if (!isInitialized) {
    console.log('[Database] Initialising data cluster for the first time...');
    await pg.initialise();
  }

  await pg.start();
  console.log(`[Database] Embedded PostgreSQL running and ready on port ${port}!`);

  const keepAlive = process.argv.includes('--daemon');
  if (keepAlive) {
    console.log('[Database] Running in daemon mode. Press Ctrl+C to stop.');
    process.on('SIGINT', async () => {
      console.log('\n[Database] Stopping PostgreSQL...');
      await pg.stop();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await pg.stop();
      process.exit(0);
    });
    // keep process open
    setInterval(() => {}, 10000);
  }
}

async function stopDatabase() {
  const isOpen = await checkPortOpen(port);
  if (!isOpen) {
    console.log(`[Database] No process responding on port ${port}.`);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const EmbeddedPostgres = require('embedded-postgres').default;
  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    port: port,
    user: 'postgres',
    password: 'password',
    database: 'homebites_dev'
  });
  await pg.stop();
  console.log('[Database] PostgreSQL stopped.');
}

const command = process.argv[2] || 'start';

if (command === 'start') {
  startDatabase().catch((err) => {
    console.error('[Database] Failed to start database:', err);
    process.exit(1);
  });
} else if (command === 'stop') {
  stopDatabase().catch((err) => {
    console.error('[Database] Failed to stop database:', err);
    process.exit(1);
  });
}
