"use server";
import prisma from "@/lib/database/client";
import { z } from "zod";
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage } from "@/lib/global/form";

export type Workout = {};
const intervalRegex: RegExp = /^(-?\d+ years? )?(-?\d+ months? )?(-?\d+ days? )?(-?\d+ hours?:)?(-?\d+ minutes?:)?(-?\d+(\.\d+)? seconds?)?$/;
const workoutsSchema = z.object({
   title: z
      .string()
      .trim()
      .min(2, { message: "A title must be at least 2 characters" }),
   date: z
      .date()
      .max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
         message: "A birthday must not be after today"
      })
});

export async function addWorkout(workout: Workout): Promise<SubmissionStatus> {
   try {

      return sendSuccessMessage("Missing implementation", undefined);
   } catch (error: any) {
      console.error(error);
   }

   return sendErrorMessage("Failure", "Missing implementation");
}
