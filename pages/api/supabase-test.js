import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ ok: false, error: 'Supabase not configured' });
    }

    // Test database connection
    const { data, error } = await supabaseAdmin
      .from('submissions')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    // Test storage connection by checking bucket exists
    const { data: buckets, error: storageError } = await supabaseAdmin.storage.listBuckets();
    
    if (storageError) {
      return res.status(500).json({ ok: false, error: `Storage error: ${storageError.message}` });
    }

    const uploadsBucket = buckets.find(bucket => bucket.name === 'uploads');
    if (!uploadsBucket) {
      return res.status(500).json({ ok: false, error: 'uploads bucket not found' });
    }

    return res.status(200).json({ 
      ok: true, 
      database: 'connected',
      storage: 'connected',
      submissionsCount: data?.length || 0,
      bucket: uploadsBucket.name
    });
  } catch (err) {
    console.error('supabase-test error:', err);
    return res.status(500).json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}
