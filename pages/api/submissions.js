import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(200).json({ success: true, submissions: [], count: 0, note: 'Supabase not configured' });
    }

    // Fetch submissions from Supabase table
    const { data: submissions, error } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch submissions' });
    }

    // Transform data to match frontend expectations
    const transformedSubmissions = submissions.map(sub => ({
      id: sub.id,
      name: sub.name,
      studentClass: sub.student_class,
      thought: sub.thought,
      imageUrl: sub.image_url,
      timestamp: sub.timestamp,
      likes: sub.likes || 0
    }));

    return res.status(200).json({
      success: true,
      submissions: transformedSubmissions,
      count: transformedSubmissions.length,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
