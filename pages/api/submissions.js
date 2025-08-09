import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    // Graceful fallback: if no token, return empty list so UI doesn't break during setup
    if (!token) {
      return res.status(200).json({ success: true, submissions: [], count: 0, note: 'Blob token not configured' });
    }
    let items = [];
    // List to find data/submissions.json (public blob)
    const listed = await list({ prefix: 'data/', token });
    const subFile = listed.blobs.find(b => b.pathname === 'data/submissions.json');
    if (subFile) {
      try {
        const resp = await fetch(subFile.url);
        const json = await resp.json();
        items = Array.isArray(json) ? json : [];
      } catch {
        items = [];
      }
    }

    const sortedSubmissions = items.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return res.status(200).json({
      success: true,
      submissions: sortedSubmissions,
      count: sortedSubmissions.length,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
