"use server";
import prisma from "@/lib/database/client";
import { z } from "zod";
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage } from "@/lib/global/form";

export type Workout = {};
const workoutSchema = z.object({});

export async function addWorkout(workout: Workout): Promise<SubmissionStatus> {

   try {
      console.log(workout, workoutSchema);
      const items = prisma.workouts.findMany();
      console.log(items);
      return sendSuccessMessage("Missing implementation", {});
   } catch (error: any) {
      console.error(error);
   }

   return sendErrorMessage("Failure", "Missing implementation");
}
