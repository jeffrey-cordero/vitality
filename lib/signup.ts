"use server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage } from "@/lib/form";
import { bcrypt } from "bcryptjs";

export type Registration = {
   name: string;
   birthday: string | Date;
   username: string;
   password: string;
   confirmPassword: string;
   email: string;
   phone?: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const registrationSchema = z.object({
   name: z.string().min(2, { message: "A name must be at least 2 characters" }),
   birthday: z.date().min(new Date(new Date().getFullYear() - 200, 0, 1), { message: "A birthday must not be before 200 years ago" }).max(new Date(), { message: "A birthday must not be after today" }),
   username: z.string().trim().min(3, { message: "A username must be at least 3 characters" }).max(30, { message: "A username must be at most 30 characters" }),
   password: z.string().regex(passwordRegex, { message: "A password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number" }),
   confirmPassword: z.string().regex(passwordRegex, { message: "A password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number" }),
   email: z.string().trim().email({ message: "A valid email is required" }),
   phone: z.string().min(10).max(20).transform((phone) => phone.replace(/\D/g, "")).optional(),
});

export async function signUp (user: Registration): Promise<SubmissionStatus> {
   const fields = registrationSchema.safeParse(user);

   if (!(fields.success)) {
      return sendErrorMessage("Error", fields.error.flatten().fieldErrors);
   }

   const prisma = new PrismaClient();

   try {
      const validatedRegistration = {
         username: user.username.trim(),
         password: "",
         birthday: user.birthday,
         name: user.name.trim(),
         email: user.email.trim(),
      };

      bcrypt.hash(user.password, 10, function (error : Error, password : string) {
         if (!(error)) {
            validatedRegistration["password"] = password;
         }
      });

      if (validatedRegistration["password"] === "") {
         throw new Error("Could not successfully store password.");
      }

      if (user.phone) {
         validatedRegistration["phone"] = user.phone;
      }

      await prisma.$connect();

      // TODO --> Account for a testing parameter
      // prisma.user.create({
      //    data: validatedRegistration
      // });

      return sendSuccessMessage("Successfully registered");
   } catch (error) {
      console.log(error);
   }

   return sendErrorMessage("Failure");
}

