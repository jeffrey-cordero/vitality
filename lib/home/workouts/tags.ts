"use server";
import prisma from "@/client";
import { z } from "zod";
import {
   sendSuccessMessage,
   sendErrorMessage,
   sendFailureMessage,
   VitalityResponse
} from "@/lib/global/response";
import { uuidSchema } from "@/lib/global/zod";

export type Tag = {
  user_id: string;
  id: string;
  title: string;
  color: string;
};

const workoutTagSchema = z.object({
   user_id: uuidSchema,
   id: uuidSchema,
   title: z
      .string()
      .min(1, {
         message: "Workout tag must be at least 1 character"
      })
      .max(30, {
         message: "Workout tag must be less than 30 characters"
      }),
   color: z.string().regex(/^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/, {
      message: "A valid color is required"
   })
});

export async function fetchWorkoutTags(userId: string): Promise<Tag[]> {
   try {
      const tags = await prisma.workout_tags.findMany({
         where: {
            user_id: userId
         }
      });

      const result: Tag[] = [];

      for (let i = 0; i < tags.length; i++) {
         result.push({
            user_id: tags[i].user_id,
            id: tags[i].id,
            title: tags[i].title,
            color: tags[i].color
         });
      }

      return result;
   } catch (error) {
      return [];
   }
}

export async function addWorkoutTag(tag: Tag): Promise<VitalityResponse<Tag>> {
   const fields = workoutTagSchema.safeParse(tag);

   if (!fields.success) {
      // Return the field errors
      const errors = fields.error.flatten();

      // Only error should be proposed tag title not being a valid length
      if (errors.fieldErrors.title) {
         return sendErrorMessage("Invalid workout tag fields", {
            title: errors.fieldErrors.title ?? [""]
         });
      }
   }

   try {
      const newTag: Tag = await prisma.workout_tags.create({
         data: {
            user_id: tag.user_id,
            title: tag.title,
            color: tag.color
         }
      });

      return sendSuccessMessage("Successfully added new workout tag", newTag);
   } catch (error) {

      if (
         error.code === "P2002" &&
         error.meta?.modelName === "workout_tags" &&
         error.meta?.target?.includes("user_id") &&
         error.meta?.target?.includes("title")
      ) {
         // Workout tags must be unique
         return sendErrorMessage("Workout tag already exists", {
            search: ["Workout tag already exists"]
         });
      } else {
         return sendErrorMessage(error?.message, {
            system: [error?.message]
         });
      }
   }
}

export async function updateWorkoutTag(
   tag: Tag,
   method: "update" | "delete",
): Promise<VitalityResponse<Tag>> {
   const fields = workoutTagSchema.safeParse(tag);

   // Handle invalid tag id's and user fields
   if (tag.id === undefined) {
      return sendErrorMessage("Missing Workout Tag ID", null);
   } else if (!fields.success) {
      return sendErrorMessage(
         "Invalid workout tag fields",
         fields.error.flatten().fieldErrors,
      );
   }

   try {
      // Handle update/delete workout tags
      switch (method) {
         case "update":
            const newTag = await prisma.workout_tags.update({
               where: {
                  id: tag.id
               },
               data: tag
            });

            return sendSuccessMessage("Successfully updated workout tag", newTag);
         case "delete":
            const deletedTag = await prisma.workout_tags.delete({
               where: {
                  id: tag.id
               }
            });

            return sendSuccessMessage("Successfully deleted workout tag", deletedTag);
         default:
            return sendErrorMessage(
               "Invalid Workout Tag Update Method",
               null
            );
      }
   } catch (error) {
      if (
         error.code === "P2002" &&
         error.meta?.modelName === "workout_tags" &&
         error.meta?.target?.includes("user_id") &&
         error.meta?.target?.includes("title")
      ) {
         // Workout tags must be unique by their title
         return sendErrorMessage("Workout tag title already exists", {
            title: ["Workout tag title already exists"]
         },
         );
      } else {
         console.error(error);
         return sendFailureMessage(error?.message);
      }
   }
}