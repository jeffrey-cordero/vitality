'use server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { FormStatus } from '@/components/global/form';

export type FeedbackForm = {
   name: string;
   email: string;
   message: string;
};

const feedbackSchema = z.object({
   name: z.string().trim().min(1, { message: 'A valid name is required' }),
   email: z.string().trim().email({ message: 'A valid email is required' }),
   message: z.string().trim().min(1, { message: 'Message is required' })
});

export async function sendFeedback(feedback: FeedbackForm): Promise<FormStatus>  {
   // Validate the feedback form first
   const fields = feedbackSchema.safeParse(feedback);

   if (!fields.success) {
      return {
         status: 'errors',
         errors : fields.error.flatten().fieldErrors
      }
   }

   const prisma = new PrismaClient();

   try {
      prisma.$connect();
      const tableNames = await prisma.$queryRaw`SELECT table_name
      FROM information_schema.tables
      `;

      console.log(tableNames);
   } catch (err) {
      console.log(err);
   } finally {
      prisma.$disconnect();
   }

   return {
      status : 'success',
      data : {}
   }
}
 