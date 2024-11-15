"use server";
import prisma from "@/client";
import { z } from "zod";
import { uuidSchema } from "@/lib/global/zod";
import { Workout } from "@/lib/home/workouts/workouts";
import {
   sendSuccessMessage,
   sendErrorMessage,
   sendFailureMessage,
   VitalityResponse
} from "@/lib/global/response";

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
      return await prisma.workout_tags.findMany({
         where: {
            user_id: userId
         }
      });
   } catch (error) {
      return [];
   }
}

export async function addWorkoutTag(tag: Tag): Promise<VitalityResponse<Tag>> {
   const fields = workoutTagSchema.safeParse(tag);

   if (!fields.success) {
      return sendErrorMessage(
         "Invalid workout tag fields",
         fields.error.flatten().fieldErrors
      );
   }

   try {
      const existingTag = await prisma.workout_tags.findFirst({
         where: {
            title: tag.title.trim(),
            user_id: tag.user_id.trim()
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

      return sendSuccessMessage("Successfully added new workout tag", newTag);
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updateWorkoutTag(
   tag: Tag,
   method: "update" | "delete"
): Promise<VitalityResponse<Tag>> {
   const fields = workoutTagSchema.safeParse(tag);
   // Handle missing tag-related id's or invalid user fields
   if (tag.user_id.trim() === "") {
      return sendErrorMessage("Missing user ID", null);
   } else if (tag.id.trim() === "") {
      return sendErrorMessage("Missing workout tag ID", null);
   } else if (!fields.success) {
      return sendErrorMessage(
         "Invalid workout tag fields",
         fields.error.flatten().fieldErrors
      );
   }

   try {
      // Ensure the workout tag exists
      const existingTag = await prisma.workout_tags.findFirst({
         where: {
            id: tag.id.trim(),
            user_id: tag.user_id.trim()
         }
      });

      if (!existingTag) {
         return sendErrorMessage(
            "Workout tag does not exist based on user ID and/or tag ID",
            null
         );
      }

      // Update or remove the workout tag
      switch (method) {
         case "update":
            const newTag = await prisma.workout_tags.update({
               where: {
                  id: tag.id
               },
               data: {
                  title: tag.title.trim(),
                  color: tag.color.trim()
               }
            });

            return sendSuccessMessage(
               "Successfully updated workout tag",
               newTag
            );
         case "delete":
            const deletedTag = await prisma.workout_tags.delete({
               where: {
                  id: tag.id
               }
            });

            return sendSuccessMessage(
               "Successfully deleted workout tag",
               deletedTag
            );
         default:
            return sendErrorMessage("Invalid Workout Tag Update Method", null);
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function getAppliedWorkoutTagUpdates(
   existingWorkout,
   newWorkout: Workout
): Promise<{ adding: string[]; removing: string[] }> {
   // Extract existing applied tag IDs
   const existing: Set<string> = new Set(
      existingWorkout?.workout_applied_tags.map((tag) => tag.tag_id) || []
   );

   // Determine tags ID's to add and remove from existing workout
   const adding: Set<string> = new Set(newWorkout.tagIds);

   const addingTags: string[] = Array.from(adding).filter(
      (id) => !existing.has(id)
   );

   const removingTags: string[] = Array.from(existing).filter(
      (id) => !adding.has(id)
   );

   return {
      adding: addingTags,
      removing: removingTags
   };
}