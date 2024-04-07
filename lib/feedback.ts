'use server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

export type FeedbackForm = {
   name: string;
   email: string;
   message: string;
};

const feedbackSchema = z.object({
   name: z.string().min(2, { message: 'Name is required' }),
   email: z.string().email({ message: 'Email is required' }),
   message: z.string().min(1, { message: 'Message is required' })
})

export async function sendFeedback(feedback: FeedbackForm): Promise<any>  {
   // Validate the feedback form first
   try {
      feedbackSchema.parse(feedback);
   } catch (err) {
      return JSON.parse(JSON.stringify(err));
   }
   
   const prisma = new PrismaClient();

   
   try {
      prisma.$connect();

      return 'success';

   } catch (err) {
      console.log(err);
      return  'error';
   } finally {
      prisma.$disconnect();
   }
}
 