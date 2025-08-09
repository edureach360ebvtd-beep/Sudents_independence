import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Get all likes
    const { data: likes, error: likesErr } = await supabaseAdmin
      .from('likes')
      .select('*')
      .order('created_at', { ascending: false });

    if (likesErr) {
      console.error('Likes fetch error:', likesErr);
      return res.status(500).json({ error: 'Failed to fetch likes' });
    }

    // Get table info (constraints)
    const { data: constraints, error: constraintsErr } = await supabaseAdmin
      .rpc('get_table_constraints', { table_name: 'likes' })
      .single();

    return res.status(200).json({
      success: true,
      likes: likes || [],
      likesCount: (likes || []).length,
      // constraints: constraints || 'rpc not available',
      note: 'Check likes table data and constraints'
    });
  } catch (error) {
    console.error('Debug likes error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
