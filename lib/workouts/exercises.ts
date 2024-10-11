"use server";
import prisma from "@/lib/database/client";
import { z } from "zod";
import {
   VitalityResponse,
   sendSuccessMessage,
   sendErrorMessage
} from "@/lib/global/state";

export type Set = {
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
  sets: Set[];
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

export async function editExerciseTitle(
   id: string, title: string
): Promise<VitalityResponse<boolean>> {
   try {
      // Ensure new title is valid
      const newTitle = title.trim();

      if (newTitle.length === 0) {
         const error: string = "A title must be at least 1 character";

         return sendErrorMessage("Error", error, false, null);
      } else if (newTitle.length > 50) {
         const error: string = "A title must be at most 50 characters";

         return sendErrorMessage("Error", error, false, null);
      } else {
         // Update exercise with new title
         await prisma.exercises.update({
            where: {
               id: id
            },
            data: {
               title: title
            }
         });
   
         return sendSuccessMessage("Successfully updated exercise name", true);
      }
   } catch (error) {
      console.error(error);

      return sendErrorMessage(
         "Failure",
         error.meta?.message,
         false,
         { system: error.meta?.message }
      );
   }
}