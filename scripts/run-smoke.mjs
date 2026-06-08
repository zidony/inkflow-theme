import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = isWindows
      ? spawn(`${command} ${args.join(' ')}`, {
          stdio: 'inherit',
          shell: true,
          ...options,
        })
      : spawn(command, args, {
          stdio: 'inherit',
          shell: false,
          ...options,
        });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['scripts/smoke-server.mjs'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    const failTimer = setTimeout(() => {
      server.kill();
      reject(new Error('Smoke server did not start in time.'));
    }, 30_000);

    server.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      if (text.includes('Smoke server listening')) {
        clearTimeout(failTimer);
        resolve(server);
      }
    });

    server.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
    });

    server.on('error', (error) => {
      clearTimeout(failTimer);
      reject(error);
    });

    server.on('exit', (code) => {
      clearTimeout(failTimer);
      if (code && code !== 0) {
        reject(new Error(`Smoke server exited with code ${code}`));
      }
    });
  });
}

function stopServer(server) {
  if (!server || server.killed) return;
  server.kill(isWindows ? undefined : 'SIGTERM');
}

let server;

try {
  await run(isWindows ? 'npm.cmd' : 'npm', ['run', 'build']);
  server = await startServer();
  await run(isWindows ? 'npx.cmd' : 'npx', ['playwright', 'test']);
} finally {
  stopServer(server);
}
