import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { submissionId, deviceId } = req.body || {};
    if (!submissionId || !deviceId) {
      return res.status(400).json({ error: 'submissionId and deviceId are required' });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Ensure the submission exists and get current likes
    const { data: sub, error: subErr } = await supabaseAdmin
      .from('submissions')
      .select('id, likes')
      .eq('id', submissionId)
      .single();

    if (subErr || !sub) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Attempt to insert like; ignore duplicates to enforce one-like-per-device
    const { data: likeInsert, error: likeErr } = await supabaseAdmin
      .from('likes')
      .insert({ submission_id: submissionId, device_id: deviceId }, { onConflict: 'submission_id,device_id', ignoreDuplicates: true })
      .select();

    if (likeErr) {
      console.error('Like insert error:', likeErr);
      return res.status(500).json({ error: 'Failed to record like' });
    }

    // If no row was inserted, the device already liked it
    const alreadyLiked = !likeInsert || likeInsert.length === 0;

    if (alreadyLiked) {
      return res.status(200).json({ success: true, alreadyLiked: true, likes: sub.likes });
    }

    // Increment likes count (simple read-then-write)
    const newLikes = (sub.likes || 0) + 1;
    const { data: updated, error: updErr } = await supabaseAdmin
      .from('submissions')
      .update({ likes: newLikes })
      .eq('id', submissionId)
      .select('likes')
      .single();

    if (updErr) {
      console.error('Like update error:', updErr);
      return res.status(500).json({ error: 'Failed to update like count' });
    }

    return res.status(200).json({ success: true, alreadyLiked: false, likes: updated.likes });
  } catch (err) {
    console.error('Like API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
