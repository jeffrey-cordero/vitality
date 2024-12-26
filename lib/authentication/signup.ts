
"use server";
import bcrypt from "bcryptjs";
import validator from "validator";
import { z } from "zod";

import { sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";
import { userSchema } from "@/lib/global/zod";
import { normalizePhoneNumber } from "@/lib/authentication/shared";
import prisma from "@/lib/prisma/client";

export type Registration = {
  name: string;
  birthday: Date;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone?: string;
};

const registrationSchema = userSchema.extend({
   confirmPassword: z
      .string({
         message: "Confirm password is required"
      })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
         message: "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (@$!%*#?&)"
      })
});

export async function signup(registration: Registration): Promise<VitalityResponse<null>> {
   try {
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

      // Check for existing users with the same username, email, and/or phone
      const emailNormalized = registration.email.trim().toLowerCase();
      const phoneNormalized = registration.phone ? normalizePhoneNumber(registration.phone) : null;

      const conflicts = await prisma.users.findMany({
         where: {
            OR: [
               { username: registration.username.trim() },
               { email_normalized: emailNormalized },
               { phone_normalized: phoneNormalized }
            ]
         }
      });

      if (!conflicts || conflicts.length === 0) {
         // Valid new user registration
         const hashedPassword = await bcrypt.hash(registration.password, await bcrypt.genSaltSync(10));

         await prisma.users.create({
            data: {
               username: registration.username.trim(),
               name: registration.name.trim(),
               email: registration.email.trim(),
               email_normalized: emailNormalized,
               password: hashedPassword,
               birthday: registration.birthday,
               phone: registration.phone?.trim(),
               phone_normalized: phoneNormalized
            }
         });

         return sendSuccessMessage("Successfully registered", null);
      } else {
         // Account for taken username, email, and/or phone constraints
         const errors = {};

         for (const user of conflicts) {
            user.username === registration.username && (errors["username"] = ["Username already taken"]);
            user.email_normalized === emailNormalized && (errors["email"] = ["Email already taken"]);
            user.phone_normalized === phoneNormalized && (errors["phone"] = ["Phone number already taken"]);
         }

         return sendErrorMessage("Account registration conflicts", errors);
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}