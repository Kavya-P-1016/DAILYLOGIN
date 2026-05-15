const fs = require('fs');
const http = require('http');
const path = require('path');
const syncHandler = require('./api/dailylogin-sync');

const root = __dirname;
const port = Number(process.env.PORT || 3000);

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(data);
  });
}

const server = http.createServer(function (req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/dailylogin-sync') {
    syncHandler(req, res);
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    sendFile(res, path.join(root, 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  if (url.pathname === '/favicon.svg') {
    sendFile(res, path.join(root, 'favicon.svg'), 'image/svg+xml; charset=utf-8');
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not found');
});

server.listen(port, '127.0.0.1', function () {
  console.log('Dailylogin dev server: http://127.0.0.1:' + port);
});
