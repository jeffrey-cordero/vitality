"use server";
import { z } from 'zod';
import { PrismaClient, feedback } from '@prisma/client';
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage } from '@/lib/form';

const feedbackSchema = z.object({
   name: z.string().trim().min(1, { message: 'A valid name is required' }),
   email: z.string().trim().email({ message: 'A valid email is required' }),
   message: z.string().trim().min(1, { message: 'Message is required' })
});

export async function sendFeedback(feedback: feedback): Promise<SubmissionStatus>  {
   // Validate the feedback form first
   const fields = feedbackSchema.safeParse(feedback);

   if (!fields.success) {
      return sendErrorMessage("errors", fields.error.flatten().fieldErrors);
   }

   const prisma = new PrismaClient();

   try {
      await prisma.$connect();

      // Add new message into the database for further review on improvement of the app
      await prisma.feedback.create({
         data: feedback
      });

      return sendSuccessMessage();
   } catch (err) {
      console.log(err);
   } finally {
      prisma.$disconnect();
   }

   return sendErrorMessage("failure");
}
 