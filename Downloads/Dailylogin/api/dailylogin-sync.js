const BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019e2c73-8362-7ae3-8289-1f43cc920cc7';
const EMPTY_BLOB_PAYLOAD = JSON.stringify({
  version: 1,
  logs: [],
  deletedLogIds: {},
  updatedAt: new Date().toISOString()
});

function setJsonHeaders(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readJsonBodyFromStream(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    req.on('data', function (chunk) {
      chunks.push(chunk);
    });
    req.on('end', function () {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }
      var raw = Buffer.concat(chunks).toString('utf8');
      if (!raw || !raw.trim()) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

async function getPutJsonBody(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  return readJsonBodyFromStream(req);
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      setJsonHeaders(res);
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method === 'GET') {
      var upstream = await fetch(BLOB_URL, { method: 'GET' });
      var text = await upstream.text();
      if (upstream.status === 404 || /blob\s+not\s+found/i.test(text)) {
        res.statusCode = 200;
        setJsonHeaders(res);
        res.end(EMPTY_BLOB_PAYLOAD);
        return;
      }
      res.statusCode = upstream.status;
      setJsonHeaders(res);
      res.end(text);
      return;
    }

    if (req.method === 'PUT') {
      var jsonBody;
      try {
        jsonBody = await getPutJsonBody(req);
      } catch (parseErr) {
        res.statusCode = 400;
        setJsonHeaders(res);
        res.end(JSON.stringify({ error: 'Invalid JSON body', detail: String(parseErr.message || parseErr) }));
        return;
      }
      if (!jsonBody || typeof jsonBody !== 'object') {
        res.statusCode = 400;
        setJsonHeaders(res);
        res.end(JSON.stringify({ error: 'Empty or invalid JSON body' }));
        return;
      }

      var upstreamPut = await fetch(BLOB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonBody)
      });
      var textPut = await upstreamPut.text();
      res.statusCode = upstreamPut.status;
      setJsonHeaders(res);
      res.end(textPut || '{}');
      return;
    }

    res.statusCode = 405;
    setJsonHeaders(res);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (err) {
    res.statusCode = 500;
    setJsonHeaders(res);
    res.end(JSON.stringify({ error: err && err.message ? err.message : 'Sync proxy failed' }));
  }
};
