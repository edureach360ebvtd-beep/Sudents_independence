import { put, list } from '@vercel/blob';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, studentClass, thought, image } = req.body;

    if (!name || !studentClass || !thought || !image) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const wordCount = thought.trim().split(/\s+/).length;
    if (wordCount > 25) {
      return res.status(400).json({ error: 'Thought must be 25 words or less' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'Blob token not configured' });
    }

    // Decode base64 image and upload to Vercel Blob
    const [meta, base64Data] = image.split(',');
    const mime = (meta || '').match(/data:(.*);base64/);
    const mimeType = mime ? mime[1] : 'image/png';
    const ext = mimeType.split('/')[1] || 'png';
    const fileName = `${nanoid()}.${ext}`;

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const upload = await put(`uploads/${fileName}`,
      imageBuffer,
      {
        access: 'public',
        contentType: mimeType,
        token,
      }
    );
    const publicUrl = upload.url;

    // Load existing submissions from Vercel Blob (data/submissions.json)
    let existing = [];
    let submissionsBlobUrl = '';
    const listed = await list({ prefix: 'data/', token });
    const subFile = listed.blobs.find(b => b.pathname === 'data/submissions.json');
    if (subFile) {
      submissionsBlobUrl = subFile.url;
      try {
        const resp = await fetch(submissionsBlobUrl);
        const json = await resp.json();
        existing = Array.isArray(json) ? json : [];
      } catch {
        existing = [];
      }
    }

    // Create and persist submission
    const submission = {
      id: nanoid(),
      name: name.trim(),
      studentClass: studentClass.trim(),
      thought: thought.trim(),
      imageUrl: publicUrl,
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    existing.push(submission);
    // Write back to Blob (overwrite, no random suffix so path stays constant)
    await put(
      'data/submissions.json',
      JSON.stringify(existing, null, 2),
      {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        token,
      }
    );

    return res.status(200).json({ success: true, submissionId: submission.id });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
