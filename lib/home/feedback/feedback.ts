"use server";
import { z } from "zod";

import { authorizeAction } from "@/lib/authentication/session";
import { sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";
import { uuidSchema } from "@/lib/global/zod";
import prisma from "@/lib/prisma/client";

export type Feedback = {
   user_id: string;
   name: string;
   email: string;
   message: string;
};

const feedbackSchema = z.object({
   user_id: uuidSchema("user", "required"),
   name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(200, { message: "Name must be at most 200 characters" }),
   email: z
      .string({
         message: "Email is required"
      })
      .trim()
      .email({ message: "Email is required" }),
   message: z.
      string()
      .trim()
      .min(2, { message: "Message must be at least 2 characters" })
});

export async function sendFeedback(user_id: string, feedback: Feedback): Promise<VitalityResponse<boolean>>  {
   try {
      authorizeAction(user_id);

      const fields = feedbackSchema.safeParse(feedback);

      if (!fields.success) {
         return sendErrorMessage("Invalid feedback fields", fields.error.flatten().fieldErrors);
      } else {
         await prisma.feedback.create({
            data: {
               user_id: user_id,
               name: feedback.name.trim(),
               email: feedback.email.trim(),
               message: feedback.message.trim()
            }
         });

         return sendSuccessMessage("Feedback sent successfully", true);
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}