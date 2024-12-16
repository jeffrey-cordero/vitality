"use server";
import validator from "validator";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma/client";
import { z } from "zod";
import { sendSuccessMessage, sendErrorMessage, sendFailureMessage, VitalityResponse } from "@/lib/global/response";

export type Registration = {
  name: string;
  birthday: Date;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone?: string;
};

const registrationSchema = z.object({
   name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(200, { message: "Name must be at most 200 characters" }),
   birthday: z
      .date({
         required_error: "Birthday is required",
         invalid_type_error: "Birthday is required"
      })
      .max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
         message: "Birthday cannot be in the future"
      }),
   username: z
      .string()
      .trim()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(30, { message: "Username must be at most 30 characters" }),
   password: z
      .string({
         message: "Password is required"
      })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
         message:
        "Password must contain at least 8 characters, " +
        "one uppercase letter, one lowercase letter, " +
        "one number, and one special character (@$!%*#?&)"
      }),
   confirmPassword: z
      .string({
         message: "Confirm password is required"
      })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
         message:
        "Password must contain at least 8 characters, " +
        "one uppercase letter, one lowercase letter, " +
        "one number, and one special character (@$!%*#?&)"
      }),
   email: z
      .string({
         message: "Email is required"
      })
      .trim()
      .email({ message: "Email is required" }),
   phone: z
      .string()
      .trim()
      .refine(validator.isMobilePhone, {
         message: "Valid phone number is required, if provided"
      })
      .optional()
});

export async function signup(
   registration: Registration
): Promise<VitalityResponse<null>> {
   if (registration?.phone?.trim().length === 0) {
      delete registration.phone;
   }

   const fields = registrationSchema.safeParse(registration);

   if (!fields.success) {
      return sendErrorMessage(
         "Invalid user registration fields",
         fields.error.flatten().fieldErrors
      );
   } else if (registration.password !== registration.confirmPassword) {
      return sendErrorMessage("Invalid user registration fields", {
         password: ["Passwords do not match"],
         confirmPassword: ["Passwords do not match"]
      });
   }

   try {
      const registration = fields.data;
      const salt = await bcrypt.genSaltSync(10);
      const hashedPassword = await bcrypt.hash(registration.password, salt);

      const existingUsers = await prisma.users.findMany({
         where: {
            OR: [
               { username: registration.username.trim() },
               { email: registration.email.trim() },
               { phone: registration.phone?.trim() }
            ]
         }
      });

      if (!existingUsers || existingUsers.length === 0) {
         // Valid new user registration
         await prisma.users.create({
            data: {
               username: registration.username.trim(),
               name: registration.name.trim(),
               email: registration.email.trim(),
               password: hashedPassword,
               birthday: registration.birthday,
               phone: registration.phone?.trim()
            }
         });

         return sendSuccessMessage("Successfully registered", null);
      } else {
         // Account for taken username, email, and/or phone constraints
         const errors = {};

         for (const user of existingUsers) {
            if (user.username === registration.username) {
               errors["username"] = ["Username already taken"];
            }

            if (user.email === registration.email) {
               errors["email"] = ["Email already taken"];
            }

            if (user.phone === registration.phone) {
               errors["phone"] = ["Phone number already taken"];
            }
         }

         return sendErrorMessage("Account registration conflicts", errors);
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}