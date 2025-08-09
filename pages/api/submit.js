import { supabaseAdmin } from '../../lib/supabase';

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

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Decode base64 image and upload to Supabase Storage
    const [meta, base64Data] = image.split(',');
    const mime = (meta || '').match(/data:(.*);base64/);
    const mimeType = mime ? mime[1] : 'image/png';
    const ext = mimeType.split('/')[1] || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(fileName);

    // Create submission record in Supabase
    const submission = {
      name: name.trim(),
      student_class: studentClass.trim(),
      thought: thought.trim(),
      image_url: publicUrl,
      likes: 0,
    };

    // Insert into Supabase table
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('submissions')
      .insert([submission])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    return res.status(200).json({ success: true, submissionId: insertData.id, submission: insertData });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Increase body size limit to support base64 images
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
