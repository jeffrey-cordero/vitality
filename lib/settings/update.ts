"use server";
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
});

export async function updateUserAttribute<T extends keyof User>(
   user_id: string,
   attribute: T,
   value: User[T]
): Promise<VitalityResponse<void>> {
   const isVerification: boolean = attribute === "email_verified" || attribute === "phone_verified";

   // Only update valid user attributes outside of the ID
   if (attribute === "id" || !(attribute in updateSchema.shape) && !isVerification) {
      return sendFailureMessage(new Error("Updating user attribute must be valid"));
   }

   const attributeSchema = updateSchema.shape[attribute.toLowerCase()];
   const field = attributeSchema?.safeParse(value);

   if (!field?.success && !isVerification) {
      return sendErrorMessage("Error caught while updating user attribute", {
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
         return sendErrorMessage("Error caught while updating user attribute", {
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

      return sendSuccessMessage(`Successfully updated ${attribute}`, null);
   } catch (error) {
      return sendFailureMessage(error);
   }
}