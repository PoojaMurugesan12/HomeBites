import { spawn } from 'child_process';
import path from 'path';

console.log('==================================================');
console.log('  HOMEBITES — Cloud Kitchen Growth & Intelligence  ');
console.log('==================================================');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

// 1. Start Server
console.log('[Dev Runner] Starting backend API server on port 5000...');
const serverProc = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(__dirname, '../server'),
  stdio: 'inherit',
  shell: true
});

// 2. Start Client Vite Dev Server
console.log('[Dev Runner] Starting frontend Vite server on port 5173...');
const clientProc = spawn(npxCmd, ['vite', '--host', '127.0.0.1', '--port', '5173'], {
  cwd: path.resolve(__dirname, '../client'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n[Dev Runner] Shutting down HomeBites processes...');
  try {
    serverProc.kill();
    clientProc.kill();
  } catch (e) {
    //
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
