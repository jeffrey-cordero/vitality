"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage } from "@/lib/form";

export interface Feedback {
   name: string;
   email: string;
   message: string;
}

const feedbackSchema = z.object({
   name: z.string().trim().min(1, { message: "A valid name is required." }),
   email: z.string().trim().email({ message: "A valid email is required." }),
   message: z.string().trim().min(1, { message: "Message is required." })
});
// TODO --> Specific response messages, form field trimming
export async function sendFeedback (feedback: Feedback): Promise<SubmissionStatus>  {
   // Validate the feedback form first
   const fields = feedbackSchema.safeParse(feedback);

   if (!(fields.success)) {
      return sendErrorMessage("Error", "Message.", fields.error.flatten().fieldErrors);
   }

   const prisma = new PrismaClient();

   try {
      await prisma.$connect();

      return sendSuccessMessage("Successfully received your feedback!");

      // Add new feedback into the database for further improvement of the application
      // TODO --> Account for testing
      await prisma.feedback.create({
         data: feedback
      });

      return sendSuccessMessage("Successfully received your feedback!");
   } catch (err) {
      console.error(err);
   } finally {
      prisma.$disconnect();
      return sendErrorMessage("Failure", "Message.");
   }
}
