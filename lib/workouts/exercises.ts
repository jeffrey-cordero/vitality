import { z } from "zod";
import {
   VitalityResponse,
   sendSuccessMessage,
   sendErrorMessage
} from "@/lib/global/state";

export type Set = {
  id: string;
  exerciseId: string;
  hours?: number;
  minutes?: number;
  seconds: number;
  weight?: number;
  repetitions?: number;
  text?: string;
};

const setSchema = z.object({
   id: z.string(),
   exercise_id: z.string(),
   hours: z.number().min(1).optional(),
   minutes: z.number().min(1).optional(),
   seconds: z.number().min(1),
   weight: z.number().min(1).optional(),
   repetitions: z.number().min(1).optional(),
   text: z.string().optional()
});

export type Exercise = {
  id: string;
  user_id: string;
  workout_id: string;
  title: string;
  sets: Set[];
};

const exerciseSchema = z.object({
   id: z.string().optional(),
   workout_id: z.string(),
   title: z
      .string()
      .trim()
      .min(1, { message: "A title must be at least 1 character" })
      .max(50, { message: "A title must be at most 50 characters" }),
   sets: z.array(setSchema)
});

export async function addExercise(
   exercise: Exercise
): Promise<VitalityResponse<Exercise>> {
   try {
      const fields = exerciseSchema.safeParse(exercise);

      if (!fields.success) {
         return sendErrorMessage(
            "Error",
            "Invalid exercise fields",
            exercise,
            fields.error.flatten().fieldErrors
         );
      }

      return sendSuccessMessage("Missing implementation", exercise);
   } catch (error) {
      console.error(error);
      return sendErrorMessage(
         "Failure",
         "Internal Server Error. Please try again later.",
         exercise,
         {}
      );
   }
}
