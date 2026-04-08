import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ezgym-secret-key-change-in-production';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

function extractUser(req: VercelRequest): { userId: string; username: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    return payload;
  } catch {
    return null;
  }
}

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = extractUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    if (req.method === 'GET') {
      const { data } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, created_at')
        .eq('id', user.userId)
        .single();

      if (!data) return res.status(404).json({ error: 'User not found' });

      return res.status(200).json({
        profile: {
          userId: data.id,
          username: data.username,
          displayName: data.display_name || '',
          avatarUrl: data.avatar_url || '',
          createdAt: data.created_at,
        },
      });
    }

    if (req.method === 'PUT') {
      const { displayName, avatarUrl } = req.body || {};

      const updates: Record<string, unknown> = {};
      if (typeof displayName === 'string') updates.display_name = displayName.trim().slice(0, 50);
      if (typeof avatarUrl === 'string') updates.avatar_url = avatarUrl;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Nothing to update' });
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.userId);

      if (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Profile API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
