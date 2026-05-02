const BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019de987-7abc-7cf9-a778-fc29f4e3940c';

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(payload));
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const upstream = await fetch(BLOB_URL, { method: 'GET' });
      const text = await upstream.text();
      res.status(upstream.status).setHeader('Content-Type', 'application/json; charset=utf-8');
      res.send(text);
      return;
    }

    if (req.method === 'PUT') {
      const payload = req.body && typeof req.body === 'object' ? req.body : {};
      const upstream = await fetch(BLOB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await upstream.text();
      res.status(upstream.status).setHeader('Content-Type', 'application/json; charset=utf-8');
      res.send(text || '{}');
      return;
    }

    json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    json(res, 500, { error: err && err.message ? err.message : 'Sync proxy failed' });
  }
}
