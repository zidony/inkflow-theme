import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const host = process.env.SMOKE_HOST || '127.0.0.1';
const port = Number(process.env.SMOKE_PORT || 4173);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

function getSafePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const normalized = path.normalize(pathname === '/' ? '/index.html' : pathname);
  const filePath = path.join(distDir, normalized);

  if (!filePath.startsWith(distDir)) return null;
  return filePath;
}

const server = createServer(async (req, res) => {
  const filePath = getSafePath(req.url || '/');
  if (!filePath || !existsSync(filePath)) {
    sendNotFound(res);
    return;
  }

  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) {
    sendNotFound(res);
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, {
    'Content-Length': fileStat.size,
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Smoke server listening on http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
