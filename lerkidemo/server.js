const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(payload));
};

const serveFile = (filePath, res, headOnly) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
    });
    if (headOnly) {
      res.end();
      return;
    }
    res.end(data);
  });
};

const sanitizePath = (urlPath) => {
  const safePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    return null;
  }
  return safePath;
};

const handleContact = (req, res) => {
  let body = '';
  const limit = 1024 * 1024;

  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > limit) {
      req.destroy();
    }
  });

  req.on('end', () => {
    const contentType = req.headers['content-type'] || '';
    let data = {};

    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(body || '{}');
      } catch (error) {
        data = {};
      }
    } else {
      data = Object.fromEntries(new URLSearchParams(body));
    }

    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim();
    const phone = String(data.phone || '').trim();

    console.log(
      `[contact] ${new Date().toISOString()} name=${name || 'unknown'} email=${email} phone=${phone}`
    );

    sendJson(res, 200, {
      ok: true,
      message: 'Tack! Vi h\u00f6r av oss snart.'
    });
  });
};

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  const method = req.method || 'GET';
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (method === 'POST' && url.pathname === '/api/contact') {
    handleContact(req, res);
    return;
  }

  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD, POST' });
    res.end('Method not allowed');
    return;
  }

  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = sanitizePath(requestedPath);

  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err) {
      if (requestedPath === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    if (stat.isDirectory()) {
      serveFile(path.join(filePath, 'index.html'), res, method === 'HEAD');
      return;
    }

    serveFile(filePath, res, method === 'HEAD');
  });
});

server.listen(PORT, () => {
  console.log(`Lekri site running at http://localhost:${PORT}`);
});
