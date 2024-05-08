"use server";
import { PrismaClient } from "@prisma/client";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage } from "@/lib/form";

export interface User {
   name: string;
   birthday: Date;
   username: string;
   password: string;
   email: string;
   phone?: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const userSchema = z.object({
   name: z.string().min(2, { message: "A name must be at least 2 characters" }),
   birthday: z.date().min(new Date(new Date().getFullYear() - 200, 0, 1), { message: "A birthday must be after 200 years ago" }).max(new Date(), { message: "A birthday must be before today" }),
   username: z.string().trim().min(3, { message: "A username must be at least 3 characters" }).max(30, { message: "A username must be at most 30 characters" }),
   password: z.string().trim().regex(passwordRegex, { message: "A password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number" }),
   email: z.string().trim().email({ message: "A valid email is required" }),
   phone: z.string().min(10).max(20).transform((phone) => phone.replace(/\D/g, "")).optional(),
});

export async function authenticate (prevState: string | undefined, formData: FormData) {
   try {
      await signIn("credentials", formData);
   } catch (error) {
      if (error instanceof AuthError) {
         switch (error.type) {
         case "CredentialsSignin":
            return "Invalid credentials.";
         default:
            return "Something went wrong.";
         }
      }
      throw error;
   }
}

export async function register (user: User): Promise<SubmissionStatus> {
   const fields = userSchema.safeParse(user);

   if (!(fields.success)) {
      return sendErrorMessage("Error", fields.error.flatten().fieldErrors);
   }

   const prisma = new PrismaClient();

   try {
      await prisma.$connect();

      prisma.user.create({
         data: user
      });

      return sendSuccessMessage("Successfully registered");
   } catch (error) {
      console.log(error);
   }

   return sendErrorMessage("Failure");
}

