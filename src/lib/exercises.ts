import type { ExerciseDefinition } from '@/types';

export const exerciseLibrary: ExerciseDefinition[] = [
  // ──────────────────────────────────────────────
  // 🔴 PUSH DAY — Chest + Shoulders + Triceps
  // ──────────────────────────────────────────────

  // Chest (main)
  { name: 'Bench Press (Barbell)', category: ['push'], muscleGroup: 'Chest', equipment: 'Barbell' },
  { name: 'Bench Press (Dumbbell)', category: ['push'], muscleGroup: 'Chest', equipment: 'Dumbbells' },
  { name: 'Incline Bench Press', category: ['push'], muscleGroup: 'Chest', equipment: 'Barbell' },
  { name: 'Incline Dumbbell Press', category: ['push'], muscleGroup: 'Chest', equipment: 'Dumbbells' },
  { name: 'Decline Bench Press', category: ['push'], muscleGroup: 'Chest', equipment: 'Barbell' },
  { name: 'Chest Fly (Machine)', category: ['push'], muscleGroup: 'Chest', equipment: 'Machine' },
  { name: 'Chest Fly (Cable)', category: ['push'], muscleGroup: 'Chest', equipment: 'Cable' },
  { name: 'Chest Fly (Dumbbell)', category: ['push'], muscleGroup: 'Chest', equipment: 'Dumbbells' },
  { name: 'Machine Chest Press', category: ['push'], muscleGroup: 'Chest', equipment: 'Machine' },
  { name: 'Push-Ups', category: ['push'], muscleGroup: 'Chest', equipment: 'Bodyweight' },

  // Shoulders (main)
  { name: 'Shoulder Press (Overhead Press)', category: ['push'], muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { name: 'Dumbbell Shoulder Press', category: ['push'], muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { name: 'Arnold Press', category: ['push'], muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { name: 'Dumbbell Lateral Raises', category: ['push'], muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { name: 'Cable Lateral Raises', category: ['push'], muscleGroup: 'Shoulders', equipment: 'Cable' },
  { name: 'Front Raises', category: ['push'], muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { name: 'Machine Shoulder Press', category: ['push'], muscleGroup: 'Shoulders', equipment: 'Machine' },

  // Triceps (main)
  { name: 'Tricep Dips', category: ['push'], muscleGroup: 'Triceps', equipment: 'Bodyweight' },
  { name: 'Tricep Pushdown', category: ['push'], muscleGroup: 'Triceps', equipment: 'Cable' },
  { name: 'Skull Crushers', category: ['push'], muscleGroup: 'Triceps', equipment: 'Barbell' },
  { name: 'Overhead Tricep Extension', category: ['push'], muscleGroup: 'Triceps', equipment: 'Dumbbell' },
  { name: 'Close Grip Bench Press', category: ['push'], muscleGroup: 'Triceps', equipment: 'Barbell' },
  { name: 'Tricep Kickbacks', category: ['push'], muscleGroup: 'Triceps', equipment: 'Dumbbells' },
  { name: 'Diamond Push-Ups', category: ['push'], muscleGroup: 'Triceps', equipment: 'Bodyweight' },

  // ──────────────────────────────────────────────
  // 🔵 PULL DAY — Back + Biceps + Rear Delts
  // ──────────────────────────────────────────────

  // Back (main)
  { name: 'Pull-Ups', category: ['pull'], muscleGroup: 'Back', equipment: 'Bodyweight' },
  { name: 'Chin-Ups', category: ['pull'], muscleGroup: 'Back', equipment: 'Bodyweight' },
  { name: 'Lat Pulldown', category: ['pull'], muscleGroup: 'Back', equipment: 'Cable' },
  { name: 'Barbell Row', category: ['pull'], muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Dumbbell Row', category: ['pull'], muscleGroup: 'Back', equipment: 'Dumbbells' },
  { name: 'Seated Cable Row', category: ['pull'], muscleGroup: 'Back', equipment: 'Cable' },
  { name: 'T-Bar Row', category: ['pull'], muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Pendlay Row', category: ['pull'], muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Rack Pulls', category: ['pull'], muscleGroup: 'Back', equipment: 'Barbell' },
  { name: 'Straight Arm Pulldown', category: ['pull'], muscleGroup: 'Back', equipment: 'Cable' },

  // Rear Delts
  { name: 'Face Pulls', category: ['pull'], muscleGroup: 'Rear Delts', equipment: 'Cable' },
  { name: 'Reverse Flyes', category: ['pull'], muscleGroup: 'Rear Delts', equipment: 'Dumbbells' },

  // Biceps (main)
  { name: 'Bicep Curls (Barbell)', category: ['pull'], muscleGroup: 'Biceps', equipment: 'Barbell' },
  { name: 'Bicep Curls (Dumbbell)', category: ['pull'], muscleGroup: 'Biceps', equipment: 'Dumbbells' },
  { name: 'Hammer Curls', category: ['pull'], muscleGroup: 'Biceps', equipment: 'Dumbbells' },
  { name: 'Preacher Curl', category: ['pull'], muscleGroup: 'Biceps', equipment: 'Barbell' },
  { name: 'Concentration Curl', category: ['pull'], muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { name: 'Cable Curl', category: ['pull'], muscleGroup: 'Biceps', equipment: 'Cable' },
  { name: 'Incline Dumbbell Curl', category: ['pull'], muscleGroup: 'Biceps', equipment: 'Dumbbells' },

  // Traps
  { name: 'Shrugs', category: ['pull'], muscleGroup: 'Traps', equipment: 'Dumbbells' },
  { name: 'Barbell Shrugs', category: ['pull'], muscleGroup: 'Traps', equipment: 'Barbell' },

  // ──────────────────────────────────────────────
  // 🟢 LEG DAY — Quads + Hamstrings + Glutes + Calves
  // ──────────────────────────────────────────────

  // Quads (main)
  { name: 'Back Squat', category: ['legs'], muscleGroup: 'Quads', equipment: 'Barbell' },
  { name: 'Front Squat', category: ['legs'], muscleGroup: 'Quads', equipment: 'Barbell' },
  { name: 'Leg Press', category: ['legs'], muscleGroup: 'Quads', equipment: 'Machine' },
  { name: 'Hack Squat', category: ['legs'], muscleGroup: 'Quads', equipment: 'Machine' },
  { name: 'Leg Extension', category: ['legs'], muscleGroup: 'Quads', equipment: 'Machine' },
  { name: 'Lunges', category: ['legs'], muscleGroup: 'Quads', equipment: 'Dumbbells' },
  { name: 'Walking Lunges', category: ['legs'], muscleGroup: 'Quads', equipment: 'Dumbbells' },
  { name: 'Bulgarian Split Squat', category: ['legs'], muscleGroup: 'Quads', equipment: 'Dumbbells' },
  { name: 'Goblet Squat', category: ['legs'], muscleGroup: 'Quads', equipment: 'Dumbbell' },
  { name: 'Step-Ups', category: ['legs'], muscleGroup: 'Quads', equipment: 'Dumbbells' },

  // Hamstrings (main)
  { name: 'Deadlift', category: ['legs'], muscleGroup: 'Hamstrings', equipment: 'Barbell' },
  { name: 'Romanian Deadlift', category: ['legs'], muscleGroup: 'Hamstrings', equipment: 'Barbell' },
  { name: 'Leg Curl', category: ['legs'], muscleGroup: 'Hamstrings', equipment: 'Machine' },
  { name: 'Stiff-Leg Deadlift', category: ['legs'], muscleGroup: 'Hamstrings', equipment: 'Barbell' },
  { name: 'Good Mornings', category: ['legs'], muscleGroup: 'Hamstrings', equipment: 'Barbell' },

  // Glutes (main)
  { name: 'Hip Thrusts', category: ['legs'], muscleGroup: 'Glutes', equipment: 'Barbell' },
  { name: 'Glute Bridge', category: ['legs'], muscleGroup: 'Glutes', equipment: 'Bodyweight' },
  { name: 'Sumo Deadlift', category: ['legs'], muscleGroup: 'Glutes', equipment: 'Barbell' },
  { name: 'Hip Abduction', category: ['legs'], muscleGroup: 'Glutes', equipment: 'Machine' },
  { name: 'Cable Kickbacks', category: ['legs'], muscleGroup: 'Glutes', equipment: 'Cable' },

  // Calves (main)
  { name: 'Calf Raises', category: ['legs'], muscleGroup: 'Calves', equipment: 'Machine' },
  { name: 'Seated Calf Raise', category: ['legs'], muscleGroup: 'Calves', equipment: 'Machine' },

  // ──────────────────────────────────────────────
  // 🫀 CARDIO — Fat Loss + Stamina
  // ──────────────────────────────────────────────

  // LISS (Low Intensity Steady State) — 20-40 min
  { name: 'Walking (Treadmill Incline)', category: ['cardio'], muscleGroup: 'LISS', equipment: 'Treadmill' },
  { name: 'Cycling', category: ['cardio'], muscleGroup: 'LISS', equipment: 'Bike' },
  { name: 'Light Jogging', category: ['cardio'], muscleGroup: 'LISS', equipment: 'Treadmill' },
  { name: 'Elliptical', category: ['cardio'], muscleGroup: 'LISS', equipment: 'Elliptical' },
  { name: 'Stair Climber', category: ['cardio'], muscleGroup: 'LISS', equipment: 'Machine' },
  { name: 'Rowing Machine', category: ['cardio'], muscleGroup: 'LISS', equipment: 'Rower' },

  // HIIT (High Intensity Interval Training) — 10-20 min
  { name: 'Sprint Intervals', category: ['cardio'], muscleGroup: 'HIIT', equipment: 'Treadmill' },
  { name: 'Jump Rope', category: ['cardio'], muscleGroup: 'HIIT', equipment: 'Jump Rope' },
  { name: 'Burpees', category: ['cardio'], muscleGroup: 'HIIT', equipment: 'Bodyweight' },
  { name: 'Mountain Climbers', category: ['cardio'], muscleGroup: 'HIIT', equipment: 'Bodyweight' },
  { name: 'Box Jumps', category: ['cardio'], muscleGroup: 'HIIT', equipment: 'Box' },
  { name: 'Battle Ropes', category: ['cardio'], muscleGroup: 'HIIT', equipment: 'Ropes' },
  { name: 'Kettlebell Swings', category: ['cardio'], muscleGroup: 'HIIT', equipment: 'Kettlebell' },
  { name: 'HIIT Circuit', category: ['cardio'], muscleGroup: 'HIIT', equipment: 'Various' },

  // Sports Cardio
  { name: 'Swimming', category: ['cardio'], muscleGroup: 'Sports', equipment: 'Pool' },
  { name: 'Football', category: ['cardio'], muscleGroup: 'Sports', equipment: 'None' },
  { name: 'Basketball', category: ['cardio'], muscleGroup: 'Sports', equipment: 'None' },
];

export const getExercisesForType = (type: string): ExerciseDefinition[] => {
  if (type === 'custom') return exerciseLibrary;
  return exerciseLibrary.filter((ex) => ex.category.includes(type as any));
};

export const getMuscleGroups = (type: string): string[] => {
  const exercises = getExercisesForType(type);
  return [...new Set(exercises.map((ex) => ex.muscleGroup))];
};
