"use server";
import prisma from "@/lib/prisma/client";
import { z } from "zod";
import { uuidSchema } from "@/lib/global/zod";
import { sendSuccessMessage, sendErrorMessage, sendFailureMessage, VitalityResponse } from "@/lib/global/response";

const colors = new Set([
   "rgb(55, 55, 55)",
   "rgb(90, 90, 90)",
   "rgb(96, 59, 44)",
   "rgb(133, 76, 29)",
   "rgb(131, 94, 51)",
   "rgb(43, 89, 63)",
   "rgb(40, 69, 108)",
   "rgb(73, 47, 100)",
   "rgb(105, 49, 76)",
   "rgb(110, 54, 48)"
]);

export type Tag = {
  user_id: string;
  id: string;
  title: string;
  color: string;
};

const workoutTagSchema = z.object({
   user_id: uuidSchema("user", "required"),
   id: uuidSchema("workout tag", "required"),
   title: z
      .string()
      .trim()
      .min(3, {
         message: "Title must be at least 3 characters"
      })
      .max(30, {
         message: "Title must be at most 30 characters"
      }),
   color: z.string().trim().refine((string) => colors.has(string), {
      message: "Color must be one of the default options"
   })
});

const newWorkoutTagSchema = workoutTagSchema.extend({
   id: uuidSchema("workout tag", "new")
});

export async function fetchWorkoutTags(
   userId: string
): Promise<Tag[]> {
   try {
      return await prisma.workout_tags.findMany({
         where: {
            user_id: userId
         }
      });
   } catch (error) {
      return [];
   }
}

export async function addWorkoutTag(
   tag: Tag
): Promise<VitalityResponse<Tag>> {
   const fields = newWorkoutTagSchema.safeParse(tag);

   if (!fields.success) {
      const errors = fields.error.flatten().fieldErrors;
      return sendErrorMessage("Invalid workout tag fields", errors);
   }

   try {
      // Workout tags are unique based on their titles
      const existingTag = await prisma.workout_tags.findFirst({
         where: {
            title: tag.title.trim(),
            user_id: tag.user_id
         }
      });

      if (existingTag) {
         return sendErrorMessage("Workout tag title already exists", {
            title: ["Workout tag title already exists"]
         });
      }

      const newTag: Tag = await prisma.workout_tags.create({
         data: {
            user_id: tag.user_id,
            title: tag.title.trim(),
            color: tag.color.trim()
         }
      });

      return sendSuccessMessage("Successfully created workout tag", newTag);
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updateWorkoutTag(
   tag: Tag,
   method: "update" | "delete"
): Promise<VitalityResponse<Tag>> {
   const fields = workoutTagSchema.safeParse(tag);

   if (!fields.success) {
      return sendErrorMessage(
         "Invalid workout tag fields",
         fields.error.flatten().fieldErrors
      );
   }

   try {
      // Ensure the workout tag already exists
      const existingTag = await prisma.workout_tags.findFirst({
         where: {
            id: tag.id.trim(),
            user_id: tag.user_id.trim()
         }
      });

      if (!existingTag) {
         return sendErrorMessage(
            "Workout tag does not exist based on user and/or tag ID",
            null
         );
      }

      // Update or remove the workout tag
      switch (method) {
         case "update":
            // Ensure updating title with a different ID doesn't already exist
            const workoutTagTitleEntry = await prisma.workout_tags.findFirst({
               where: {
                  title: tag.title.trim(),
                  user_id: tag.user_id,
                  NOT: {
                     id: tag.id
                  }
               }
            });

            if (workoutTagTitleEntry) {
               return sendErrorMessage(
                  "Workout tag title already exists", {
                     title: ["Workout tag title already exists"]
                  }
               );
            } else {
               const newTag = await prisma.workout_tags.update({
                  where: {
                     id: tag.id,
                     user_id: tag.user_id
                  },
                  data: {
                     title: tag.title.trim(),
                     color: tag.color.trim()
                  }
               });

               return sendSuccessMessage("Successfully updated workout tag", newTag);
            }
         case "delete":
            const deletedTag = await prisma.workout_tags.delete({
               where: {
                  id: tag.id,
                  user_id: tag.user_id
               }
            });

            return sendSuccessMessage(
               "Successfully deleted workout tag",
               deletedTag
            );
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}