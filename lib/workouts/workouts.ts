"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage } from "@/lib/global/form";

export type Workout = {};
const workoutSchema = z.object({});

export async function addWorkout(workout: Workout): Promise<SubmissionStatus> {
   const prisma = new PrismaClient();

   try {
      await prisma.$connect();
      console.log(workout, workoutSchema);
      return sendSuccessMessage("Missing implementation", {});
   } catch (error: any) {
      console.error(error);
   } finally {
      await prisma.$disconnect();
   }

   return sendErrorMessage("Failure", "Missing implementation");
}
