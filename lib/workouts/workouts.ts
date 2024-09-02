"use server";
import { z } from "zod";
import { FormResponse, sendSuccessMessage, sendErrorMessage } from "@/lib/global/form";

export type Workout = {
   id?: string;
   title: string;
   date: string | Date;
   image: string;
   tags: string[];
};

const workoutsSchema = z.object({
   title: z
      .string()
      .trim()
      .min(1, { message: "A title must be at least 1 character" }),
   date: z
      .date()
      .max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
         message: "A birthday must not be after today"
      }),
   description: z
      .string()
      .optional()
      .or(z.literal("")),
   image: z
      .string()
      .url()
      .optional().or(z.literal("")),
   tags: z
      .array(z.string())
});


export type Exercise = {
   id?: string;
   workoutId: string;
   interval: string;
}

/*
-- Bicep Curl (Exercise)
      -- #1 (order) 30 lbs (weight) x 10 (repetitions) [set 1]
      -- ... [set x]

-- Zone 2 Cardio
      -- #1 (order) 01:00:00 (interval) 10lbs (weight ~ optional)
*/
// HH:MM:SS
const intervalRegex: RegExp = /^\d{1,}:\d{2}:\d{2}(\.\d+)?\s*$/;

export async function addWorkout(workout: Workout): Promise<FormResponse> {
   try {
      // Validate the feedback form first
      const fields = workoutsSchema.safeParse(workout);

      if (!(fields.success)) {
         return sendErrorMessage("Error", "Message.", fields.error.flatten().fieldErrors);
      }

      return sendSuccessMessage("Missing implementation", undefined);
   } catch (error: any) {
      console.error(error);
   }

   return sendErrorMessage("Failure", "Missing implementation", { system: ["Under construction"] });
}
