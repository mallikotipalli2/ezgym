import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authUser = extractUser(req);
  if (!authUser) return res.status(401).json({ error: 'Not authenticated' });

  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Password is required to confirm deletion' });
  }

  try {
    // Verify password
    const { data: user } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', authUser.userId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    // Delete user — CASCADE will remove workouts, exercises, sets
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', authUser.userId);

    if (deleteError) {
      console.error('Delete account error:', deleteError);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
