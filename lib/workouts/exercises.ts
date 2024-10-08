// Exercises - <TODO>

import { z } from "zod";

/*
-- Bicep Curl (Exercise)
      -- #1 (order) 30 lbs (weight) x 10 (repetitions) [set 1]
      -- ... [set x]

-- Zone 2 Cardio
      -- #1 (order) 10lbs (weight ~ optional) x 10 (repetitions ~ optional) - 01:00:00 (interval ~ optional)
*/
export type Exercise = {
  id?: string;
  workoutId: string;
  title: string;
  sets: Set[];
};

export type Set = {
      id: string;
      exercise_id: string;
      hours?: number;
      minutes?: number;
      seconds: number;
      weight?: number;
      repetitions? : number;
      text?: string;
}

const setSchema = z.object({
   // HH:MM:SS
   interval: z.string().regex(/^\d{1,}:\d{2}:\d{2}(\.\d+)?\s*$/)
});
