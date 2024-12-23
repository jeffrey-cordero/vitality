"use server";
import { users as User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authorizeAction } from "@/lib/authentication/session";
import { sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";
import { userSchema } from "@/lib/global/zod";
import { verifyImageURL } from "@/lib/home/workouts/shared";
import prisma from "@/lib/prisma/client";

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

async function validateUser(
   user_id: string,
   attribute: string
): Promise<User | null> {
   // Helper method to verify user existence and attribute value
   try {
      return await prisma.users.findFirst({
         where: {
            id: user_id
         },
         select: {
            [attribute]: true
         }
      }) as any;
   } catch (error) {
      return null;
   }
}

export async function updatePreference(
   user_id: string,
   preference: "mail" | "sms",
   value: boolean
): Promise<VitalityResponse<void>> {
   try {
      await authorizeAction(user_id);

      const user: User | null = await validateUser(user_id, preference);

      if (user === null) {
         return sendErrorMessage(
            "User does not exist based on user ID",
            null
         );
      } else if (user[preference] === value) {
         return sendSuccessMessage(
            `No changes in ${preference === "mail" ? "email" : "SMS"} notification preference`,
            null
         );
      } else {
         await prisma.users.update({
            where: {
               id: user_id
            },
            data: {
               [preference]: value
            }
         });

         return sendSuccessMessage(
            `Updated ${preference === "mail" ? "email" : "SMS"} notification preference`,
            null
         );
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updatePassword(
   user_id:string,
   oldPassword: string,
   newPassword: string,
   confirmPassword: string
): Promise<VitalityResponse<void>> {
   try {
      await authorizeAction(user_id);

      // Format errors object for backend response, if any
      const passwordSchema = userSchema.shape.password;
      const validatePassword = (password: string) => {
         return passwordSchema.safeParse(password).error?.errors[0].message;
      };

      const errors = Object.fromEntries(["oldPassword", "newPassword", "confirmPassword"]
         .map((key) => [key, validatePassword(eval(key))])
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
         // Validate old password value
         const user: User | null = await validateUser(user_id, "password");

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
            // New password must be different
            return sendErrorMessage("Invalid password fields", {
               newPassword: ["New password must not match old password"]
            });
         } else {
            const hashedPassword: string = await bcrypt.hash(newPassword, await bcrypt.genSaltSync(10));

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
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updateAttribute<T extends keyof User>(
   user_id: string,
   attribute: T,
   value: User[T]
): Promise<VitalityResponse<void>> {
   try {
      await authorizeAction(user_id);

      // Invalid attribute type
      if (!(attribute in updateSchema.shape) || attribute === "id") {
         return sendFailureMessage(new Error("Updating user attribute must be valid"));
      }

      const user: User | null = await validateUser(user_id, attribute);

      if (user === null) {
         return sendErrorMessage(
            "User does not exist based on user ID",
            null
         );
      } else if (user[attribute] === value) {
         return sendSuccessMessage(`No updates for ${attribute}`, null);
      }

      const attributeSchema = updateSchema.shape[attribute.toLowerCase()];
      const field = attributeSchema.safeParse(value);

      if (!field.success) {
         // Invalid attribute value
         return sendErrorMessage("Invalid user attribute", {
            [attribute]: [field.error.errors[0].message]
         });
      } else if (attribute === "username" || attribute === "email" || attribute === "phone") {
         // Valid unique attribute doesn't already exist
         const conflict: User | null = await prisma.users.findFirst({
            where: {
               [attribute] : value,
               NOT: {
                  id: user_id
               }
            }
         });

         if (conflict) {
            return sendErrorMessage("Account attribute conflicts", {
               [attribute]: [`${attribute[0].toUpperCase() + attribute.substring(1)} already taken`]
            });
         }
      }

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

export async function verifyAttribute(
   user_id: string,
   attribute: "email_verified" | "phone_verified"
): Promise<VitalityResponse<void>> {
   try {
      await authorizeAction(user_id);

      const user: User | null = await validateUser(user_id, attribute);

      if (user === null) {
         return sendErrorMessage(
            "User does not exist based on user ID",
            null
         );
      } else if (user[attribute] === true) {
         return sendSuccessMessage(
            `${attribute === "phone_verified" ? "Phone number" : "Email"} is already verified`,
            null
         );
      } else {
         await prisma.users.update({
            where: {
               id: user_id
            },
            data: {
               [attribute]: true
            }
         });

         return sendSuccessMessage(
            `Successful ${attribute === "phone_verified" ? "phone number" : "email"} verification`,
            null
         );
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function deleteAccount(
   user_id: string
): Promise<VitalityResponse<void>> {
   try {
      await authorizeAction(user_id);

      const user: User | null = await validateUser(user_id, "username");

      if (user === null) {
         return sendErrorMessage(
            "User does not exist based on user ID",
            null
         );
      } else {
         await prisma.users.delete({
            where: {
               id: user_id
            }
         });

         return sendSuccessMessage("Successful account deletion", null);
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}