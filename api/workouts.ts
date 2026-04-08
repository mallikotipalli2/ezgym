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
      // Load all workouts for user
      const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.userId)
        .order('started_at', { ascending: false });

      const { data: exercises } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.userId)
        .order('order', { ascending: true });

      const { data: sets } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('user_id', user.userId);

      const { data: gymSessions } = await supabase
        .from('gym_sessions')
        .select('*')
        .eq('user_id', user.userId)
        .order('started_at', { ascending: false });

      return res.status(200).json({
        workouts: workouts || [],
        exercises: exercises || [],
        sets: sets || [],
        gymSessions: gymSessions || [],
      });
    }

    if (req.method === 'PUT') {
      // Upsert workouts, exercises, and sets
      const { workouts, exercises, sets, gymSessions } = req.body || {};

      if (workouts?.length) {
        const mapped = workouts.map((w: any) => ({
          id: w.id,
          user_id: user.userId,
          type: w.type,
          name: w.name,
          started_at: w.startedAt,
          completed_at: w.completedAt || null,
          status: w.status,
          notes: w.notes || null,
        }));
        await supabase.from('workouts').upsert(mapped, { onConflict: 'id' });
      }

      if (exercises?.length) {
        const mapped = exercises.map((e: any) => ({
          id: e.id,
          user_id: user.userId,
          workout_id: e.workoutId,
          name: e.name,
          category: e.category,
          order: e.order,
          notes: e.notes || null,
        }));
        await supabase.from('exercises').upsert(mapped, { onConflict: 'id' });
      }

      if (sets?.length) {
        const mapped = sets.map((s: any) => ({
          id: s.id,
          user_id: user.userId,
          exercise_id: s.exerciseId,
          workout_id: s.workoutId,
          set_number: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          unit: s.unit,
          completed: s.completed,
          completed_at: s.completedAt || null,
        }));
        await supabase.from('workout_sets').upsert(mapped, { onConflict: 'id' });
      }

      if (gymSessions?.length) {
        const mapped = gymSessions.map((g: any) => ({
          id: g.id,
          user_id: user.userId,
          started_at: g.startedAt,
          ended_at: g.endedAt || null,
          duration_ms: g.durationMs || 0,
          status: g.status,
        }));
        await supabase.from('gym_sessions').upsert(mapped, { onConflict: 'id' });
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Workouts API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
