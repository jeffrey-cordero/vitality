"use server";
import prisma from "@/lib/database/client";
import { z } from "zod";
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage } from "@/lib/global/form";

export type Workout = {};
const workoutSchema = z.object({});

export async function addWorkout(workout: Workout): Promise<SubmissionStatus> {
   try {
      await prisma.$connect();
      console.log(workout, workoutSchema);
      return sendSuccessMessage("Missing implementation", {});
   } catch (error: any) {
      console.error(error);
   }

   return sendErrorMessage("Failure", "Missing implementation");
}
