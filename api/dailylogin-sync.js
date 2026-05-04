const BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019df16f-6c41-7879-8dec-6af1591ab09b';

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
    if (req.method === 'GET') {
      var upstream = await fetch(BLOB_URL, { method: 'GET' });
      var text = await upstream.text();
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(text);
      return;
    }

    if (req.method === 'PUT') {
      var jsonBody;
      try {
        jsonBody = await getPutJsonBody(req);
      } catch (parseErr) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Invalid JSON body', detail: String(parseErr.message || parseErr) }));
        return;
      }
      if (!jsonBody || typeof jsonBody !== 'object') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
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
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(textPut || '{}');
      return;
    }

    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: err && err.message ? err.message : 'Sync proxy failed' }));
  }
};
