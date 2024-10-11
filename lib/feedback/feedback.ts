"use server";
import prisma from "@/lib/database/client";
import { z } from "zod";
import {
   VitalityResponse,
   sendSuccessMessage,
   sendErrorMessage
} from "@/lib/global/state";

export type Feedback = {
  name: string;
  email: string;
  message: string;
};

const feedbackSchema = z.object({
   name: z.string().trim().min(1, { message: "A valid name is required." }),
   email: z.string().trim().email({ message: "A valid email is required." }),
   message: z.string().trim().min(1, { message: "Message is required." })
});

export async function sendFeedback(
   feedback: Feedback
): Promise<VitalityResponse<null>> {
   // Validate the feedback form first
   const fields = feedbackSchema.safeParse(feedback);

   if (!fields.success) {
      return sendErrorMessage(
         "Error",
         "Message.",
         null,
         fields.error.flatten().fieldErrors
      );
   }

   try {
      // Add new feedback into the database for further improvement of the application
      await prisma.feedback.create({
         data: null
      });

      return sendSuccessMessage("Successfully received your feedback!", null);
   } catch (error) {
      console.error(error);

      return sendErrorMessage(
         "Failure",
         "Internal Server Error. Please try again later.",
         null,
         { system: error.meta?.message }
      );
   }
}
