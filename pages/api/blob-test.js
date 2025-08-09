import { put } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ ok: false, error: 'BLOB_READ_WRITE_TOKEN not configured' });
    }

    const key = `healthchecks/${Date.now()}.txt`;
    const result = await put(key, `ok ${new Date().toISOString()}`, {
      access: 'public',
      contentType: 'text/plain',
      token,
    });

    return res.status(200).json({ ok: true, url: result.url, pathname: result.pathname });
  } catch (err) {
    console.error('blob-test error:', err);
    return res.status(500).json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}
