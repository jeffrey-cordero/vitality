"use server";
import validator from "validator";
import bcrypt from "bcryptjs";
import prisma from "@/client";
import { z } from "zod";
import {
   VitalityResponse,
   sendSuccessMessage,
   sendErrorMessage
} from "@/lib/global/state";

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
         "Error",
         "Invalid user registration fields",
         null,
         fields.error.flatten().fieldErrors
      );
   } else if (!(registration.password === registration.confirmPassword)) {
      return sendErrorMessage("Error", "Invalid user registration fields", null, {
         password: ["Passwords do not match"],
         confirmPassword: ["Passwords do not match"]
      });
   }

   try {
      const userRegistration = fields.data;

      const salt = await bcrypt.genSaltSync(10);
      userRegistration.password = await bcrypt.hash(registration.password, salt);

      if (registration.phone) {
         userRegistration["phone"] = registration.phone;
      }

      const existingUsers = await prisma.users.findMany({
         where: {
            OR: [
               { email: registration.email },
               { username: registration.username },
               { phone: registration.phone }
            ]
         }
   });

      if (!existingUsers || existingUsers.length === 0) {
         await prisma.users.create({
            data: {
               username: userRegistration.username,
               name: userRegistration.name,
               email: userRegistration.email,
               password: userRegistration.password,
               birthday: userRegistration.birthday,
               phone: userRegistration.phone
            }
         });

         return sendSuccessMessage("Successfully registered", null);
      } else {
         // Handle taken username, email, and/or phone errors
         const errors = {};

         for (const existingUser of existingUsers) {
            if (existingUser.username === userRegistration.username) {
               errors["username"] = ["Username already taken"];
            }

            if (existingUser.email === userRegistration.email) {
               errors["email"] = ["Email already taken"];
            }

            if (existingUser.phone === userRegistration.phone) {
               errors["phone"] = ["Phone number already taken"];
            }
         }

         return sendErrorMessage("Error", "Internal database conflicts", null, errors);
      }
   } catch (error) {
      console.error(error);

      return sendErrorMessage("Failure", error?.message, null, {
         system: error?.message
      });
   }
}
