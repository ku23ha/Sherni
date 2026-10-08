// Vercel Serverless Function: /api/poems
// Handles reading and saving Audrita's poetry to Supabase or persistent backend

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Handle GET - retrieve all poems
  if (req.method === 'GET') {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({
        status: 'local_fallback',
        message: 'Supabase credentials not configured in Vercel environment variables. Using browser storage.',
        poems: []
      });
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/poems?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }

      const data = await response.json();
      return res.status(200).json({ status: 'ok', poems: data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Handle POST - save new poem
  if (req.method === 'POST') {
    try {
      const { title, language, tag, verse, date, notes } = req.body || {};

      if (!title || !verse) {
        return res.status(400).json({ error: 'Title and verse are required.' });
      }

      const newPoem = {
        title: title.trim(),
        language: language || 'english',
        tag: tag || 'Silence & Reflection',
        verse: verse.trim(),
        date: date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        notes: notes || '',
        created_at: new Date().toISOString()
      };

      if (!supabaseUrl || !supabaseKey) {
        // Return success with local instruction so frontend persists to localStorage
        return res.status(200).json({
          status: 'saved_locally',
          message: 'Saved to local browser archive. Add SUPABASE_URL and SUPABASE_KEY to Vercel to sync across all devices.',
          poem: newPoem
        });
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/poems`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newPoem)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }

      const created = await response.json();
      return res.status(201).json({ status: 'ok', poem: created[0] || newPoem });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
