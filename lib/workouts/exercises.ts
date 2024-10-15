"use server";
import prisma from "@/lib/database/client";
import { z } from "zod";
import {
   VitalityResponse,
   sendSuccessMessage,
   sendErrorMessage
} from "@/lib/global/state";
import { formatWorkout } from "./shared";

export type ExerciseSet = {
  id: string;
  exercise_id: string;
  set_order: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  weight?: number;
  repetitions?: number;
  text?: string;
};

const setSchema = z.object({
   id: z.string(),
   exercise_id: z.string(),
   hours: z.number().min(0, {
      message: "Hours must be non-negative."
   }).optional(),
   minutes: z.number().min(0, {
      message: "Minutes must be non-negative."
   }).optional(),
   seconds:z.number().min(0, {
      message: "Seconds must be non-negative."
   }).optional(),
   weight: z.number().min(0, {
      message: "Weight must be non-negative."
   }).optional(),
   repetitions: z.number().min(0, {
      message: "Repetitions must be non-negative."
   }).optional(),
   text: z.string().optional()
});

export type Exercise = {
  id: string;
  user_id: string;
  workout_id: string;
  title: string;
  exercise_order: number;
  sets: ExerciseSet[];
};

const exerciseSchema = z.object({
   id: z.string().optional(),
   workout_id: z.string(),
   title: z
      .string()
      .trim()
      .min(1, { message: "A title must be at least 1 character." })
      .max(50, { message: "A title must be at most 50 characters." }),
   sets: z.array(setSchema)
});

export async function addExercise(
   exercise: Exercise
): Promise<VitalityResponse<Exercise>> {
   try {
      const fields = exerciseSchema.safeParse(exercise);

      if (!(fields.success)) {
         return sendErrorMessage(
            "Error",
            "Invalid exercise fields",
            exercise,
            fields.error.flatten().fieldErrors
         );
      }

      const newExercise = await prisma.exercises.create({
         data: {
            workout_id: exercise.workout_id,
            title: exercise.title,
            exercise_order: exercise.exercise_order
         }
      });

      return sendSuccessMessage("Successfully added new exercise", {
         ...exercise,
         id: newExercise.id
      });
   } catch (error) {
      console.error(error);

      return sendErrorMessage(
         "Failure",
         error.meta?.message,
         exercise,
         { system: error.meta?.message }
      );
   }
}

export async function updateExercise(
   exercise: Exercise, method: "title" | "sets"
): Promise<VitalityResponse<null>> {
   try {
      if (method === "title") {
         // Update exercise title
         const title = exercise.title.trim();

         if (title.length === 0) {
            const error: string = "A title must be at least 1 character";

            return sendErrorMessage("Error", error, null, null);
         } else if (title.length > 50) {
            const error: string = "A title must be at most 50 characters";

            return sendErrorMessage("Error", error, null, null);
         } else {
            // Update exercise with new title
            await prisma.exercises.update({
               where: {
                  id: exercise.id
               },
               data: {
                  title: exercise.title
               }
            });

            return sendSuccessMessage("Successfully updated exercise name", null);
         }
      } else {
         // Update exercise sets
         return sendSuccessMessage("Missing implementation for update exercise sets", null);
      }
   } catch (error) {
      console.error(error);

      return sendErrorMessage(
         "Failure",
         error.meta?.message,
         null,
         { system: error.meta?.message }
      );
   }
}

export async function updateExercises(workoutId: string,
   exercises: Exercise[]): Promise<VitalityResponse<Exercise[]>> {
   for (const exercise of exercises) {
      const fields = exerciseSchema.safeParse(exercise);
      if (!(fields.success)) {
         return sendErrorMessage(
            "Error",
            `Invalid exercise fields(ID = ${exercise.id})`,
            null,
            fields.error.flatten().fieldErrors
         );
      }
   }
   try {
      // Fetch existing tags first for data integrity
      const existingWorkout = await prisma.workouts.findUnique({
         where: {
            id: workoutId
         },
         include: {
            exercises: {
               include: {
                  sets: true
               }
            }
         }
      });

      // Extract exercise IDs
      const existingExerciseIdsArray: string[] = existingWorkout?.exercises.map((exercise) => exercise.id) ?? [];
      const currentExerciseIdsSet: Set<string> = new Set(exercises.map((exercise) => exercise.id));

      // Determine exercise's to update and/or remove
      const updatingExercises = Object.fromEntries(exercises.map(exercise => [exercise.id, exercise]));

      const exerciseIdsToUpdate: string[] = existingExerciseIdsArray.filter(
         (id: string) => currentExerciseIdsSet.has(id)
      );

      const exerciseIdsToRemove: string[] = existingExerciseIdsArray.filter(
         (id: string) => !(currentExerciseIdsSet.has(id))
      );

      const workout = await prisma.workouts.update({
         where: { id: workoutId },
         data: {
            exercises: {
               // Update existing ordering for reorder or deletion methods
               deleteMany: {
                  id: { in: exerciseIdsToRemove }
               },
               updateMany: exerciseIdsToUpdate.map((id: string, index: number) => ({
                  where: {
                     id: id
                  },
                  data: {
                     exercise_order: index
                  }
               }))
            }
         },
         include: {
            exercises: {
               include: {
                  sets: true
               },
               orderBy: {
                  exercise_order: "asc"
               }
            }
         }
      });

      return sendSuccessMessage("Successfully updated workout exercises", formatWorkout(workout).exercises);
   } catch (error) {
      console.error(error);

      return sendErrorMessage(
         "Failure",
         error.meta?.message,
         null,
         { system: error.meta?.message }
      );
   }
}