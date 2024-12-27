
"use server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { normalizePhoneNumber } from "@/lib/authentication/shared";
import { sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";
import { userSchema } from "@/lib/global/zod";
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

      // Check for existing users with the same username, email, and/or phone with normalized values
      const normalizedUsername = registration.username.toLowerCase().trim();
      const normalizedEmail = registration.email.trim().toLowerCase();
      const normalizedPhone = registration.phone ? normalizePhoneNumber(registration.phone) : undefined;

      const conflicts = await prisma.users.findMany({
         where: {
            OR: [
               { username_normalized: normalizedUsername },
               { email_normalized: normalizedEmail },
               { phone_normalized: normalizedPhone }
            ]
         }
      });

      if (!conflicts || conflicts.length === 0) {
         // Valid new user registration
         const hashedPassword = await bcrypt.hash(registration.password, await bcrypt.genSaltSync(10));

         await prisma.users.create({
            data: {
               username: registration.username.trim(),
               username_normalized: normalizedUsername,
               name: registration.name.trim(),
               email: registration.email.trim(),
               email_normalized: normalizedEmail,
               password: hashedPassword,
               birthday: registration.birthday,
               phone: registration.phone?.trim(),
               phone_normalized: normalizedPhone
            }
         });

         return sendSuccessMessage("Successfully registered", null);
      } else {
         // Account for taken username, email, and/or phone constraints
         const errors = {};

         for (const user of conflicts) {
            user.username_normalized === normalizedUsername && (errors["username"] = ["Username already taken"]);
            user.email_normalized === normalizedEmail && (errors["email"] = ["Email already taken"]);
            user.phone_normalized === normalizedPhone && (errors["phone"] = ["Phone number already taken"]);
         }

         return sendErrorMessage("Account registration conflicts", errors);
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}