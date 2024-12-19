"use server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma/client";
import { z } from "zod";
import { userSchema } from "@/lib/global/zod";
import { users as User } from "@prisma/client";
import { verifyImageURL } from "@/lib/home/workouts/shared";
import { sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";

const updateSchema = userSchema.extend({
   image: z
      .string()
      .refine((value) => verifyImageURL(value), {
         message: "Image URL must be valid"
      }).or(z.literal(""))
      .optional(),
   mail: z
      .boolean({
         message: "Email notification preference is required"
      })
      .optional(),
   sms: z
      .boolean({
         message: "SMS notification preference is required"
      })
      .optional()
});

export async function updateUserPreference(
   user_id: string,
   preference: "mail" | "sms",
   value: boolean
): Promise<VitalityResponse<void>> {
   try {
      await prisma.users.update({
         where: {
            id: user_id
         },
         data: {
            [preference]: value
         }
      });

      return sendSuccessMessage(`Updated ${preference === "mail" ? "email" : "SMS"} notification preference`, null);
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function verifyUserAttribute(
   user_id: string,
   attribute: "email" | "phone"
): Promise<VitalityResponse<void>> {
   try {
      await prisma.users.update({
         where: {
            id: user_id
         },
         data: {
            [`${attribute}_verified`]: true
         }
      });

      return sendSuccessMessage(`Successful ${attribute === "phone" ? "phone number" : "email"} verification`, null);
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updateUserPassword(
   user_id:string,
   oldPassword: string,
   newPassword: string,
   confirmPassword: string
): Promise<VitalityResponse<void>> {
   const passwordSchema = userSchema.shape.password;
   const errors = Object.fromEntries(Object.entries({
      oldPassword: passwordSchema.safeParse(oldPassword).error?.errors[0].message ?? undefined,
      newPassword: passwordSchema.safeParse(newPassword).error?.errors[0].message ?? undefined,
      confirmPassword: passwordSchema.safeParse(confirmPassword).error?.errors[0].message ?? undefined
   })
      .filter(([_, error]) => error !== undefined)
      .map(([key, error]) => [key, [error]])
   );

   if (Object.keys(errors).length > 0) {
      return sendErrorMessage("Invalid password fields", errors);
   } else if (newPassword !== confirmPassword) {
      return sendErrorMessage("Invalid password fields", {
         newPassword: ["Passwords do not match"],
         confirmPassword: ["Passwords do not match"]
      });
   } else {
      try {
         // Validate old password
         const user = await prisma.users.findFirst({
            where: {
               id: user_id
            },
            select: {
               password: true
            }
         });

         if (!user) {
            // Invalid user ID
            return sendErrorMessage(
               "User does not exist based on user ID",
               null
            );
         } else if (!await bcrypt.compare(oldPassword, user.password)) {
            // Incorrect old password provided
            return sendErrorMessage("Invalid password fields", {
               oldPassword: ["Old password does not match"]
            });
         } else if (oldPassword === newPassword) {
            return sendErrorMessage("Invalid password fields", {
               newPassword: ["New password must not match old password"]
            });
         } else {
            // Update password
            const hashedPassword = await bcrypt.hash(newPassword, await bcrypt.genSaltSync(10));

            await prisma.users.update({
               where: {
                  id: user_id
               },
               data: {
                  password: hashedPassword
               }
            });

            return sendSuccessMessage("Updated password", null);

         }
      } catch (error) {
         return sendFailureMessage(error);
      }
   }

}

export async function updateUserAttribute<T extends keyof User>(
   user_id: string,
   attribute: T,
   value: User[T]
): Promise<VitalityResponse<void>> {
   // Only update valid user attributes outside of the ID
   if (attribute === "id" || !(attribute in updateSchema.shape)) {
      return sendFailureMessage(new Error("Updating user attribute must be valid"));
   }

   const attributeSchema = updateSchema.shape[attribute.toLowerCase()];
   const field = attributeSchema?.safeParse(value);

   if (!field?.success) {
      return sendErrorMessage("Invalid user attribute", {
         [attribute]: [field.error.errors[0].message]
      });
   } else if (attribute === "username" || attribute === "email" || attribute === "phone") {
      // Account for unique attribute database constraints
      const existingUser = await prisma.users.findFirst({
         where: {
            [attribute] : value,
            NOT: {
               id: user_id
            }
         }
      });

      if (existingUser) {
         return sendErrorMessage("Account attribute conflicts", {
            [attribute]: [`${attribute[0].toUpperCase() + attribute.substring(1)} already taken`]
         });
      }
   }

   try {
      await prisma.users.update({
         where: {
            id: user_id
         },
         data: {
            email_verified: attribute === "email" ? false : undefined,
            phone_verified: attribute === "phone" ? false : undefined,
            [attribute]: value
         }
      });

      return sendSuccessMessage(`Updated ${attribute}`, null);
   } catch (error) {
      return sendFailureMessage(error);
   }
}