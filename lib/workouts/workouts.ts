"use server";
import { z } from "zod";
import { FormResponse, sendSuccessMessage, sendErrorMessage } from "@/lib/global/form";
import prisma from "@/lib/database/client";

export type Workout = {
   id?: string;
   title: string;
   date: string | Date;
   image: string;
   tags: string[];
};

const workoutsSchema = z.object({
   title: z
      .string()
      .trim()
      .min(1, { message: "A title must be at least 1 character" }),
   date: z
      .date()
      .max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
         message: "A birthday must not be after today"
      }),
   description: z
      .string()
      .optional()
      .or(z.literal("")),
   image: z
      .string()
      .url()
      .optional().or(z.literal("")),
   tags: z
      .array(z.string())
});


export type Exercise = {
   id?: string;
   workoutId: string;
   interval: string;
}

/*
-- Bicep Curl (Exercise)
      -- #1 (order) 30 lbs (weight) x 10 (repetitions) [set 1]
      -- ... [set x]

-- Zone 2 Cardio
      -- #1 (order) 01:00:00 (interval) 10lbs (weight ~ optional)
*/
// HH:MM:SS
const intervalRegex: RegExp = /^\d{1,}:\d{2}:\d{2}(\.\d+)?\s*$/;

export async function addWorkout(workout: Workout): Promise<FormResponse> {
   try {
      // Validate the feedback form first
      const fields = workoutsSchema.safeParse(workout);

      if (!(fields.success)) {
         return sendErrorMessage("Error", "Message.", fields.error.flatten().fieldErrors);
      }

      return sendSuccessMessage("Missing implementation", undefined);
   } catch (error: any) {
      console.error(error);
   }

   return sendErrorMessage("Failure", "Missing implementation", { system: ["Under construction"] });
}

export type Tag = {
   user_id: string;
   id?: string;
   title: string;
   color: string;
}

const workoutTagSchema = z.object({
   user_id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, {
      message: "Invalid UUID format",
   }),
   id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, {
      message: "Invalid UUID format",
   }),
   title: z.string().min(1, {
      message: "Workout tag must be at least 1 character"
   }).max(30, {
      message: "Workout tag must be less than 30 characters"
   }),
   color: z.string().regex(/^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/, {
      message: "A valid color is required"
   })
});

export async function fetchWorkoutTags(userId: string): Promise<FormResponse> {
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

      return sendSuccessMessage("Workout Tags", {
         tags: result
      });
   } catch (error) {
      return sendErrorMessage("Failure", "Internal Server Error. Please try again later.", {});
   }
}

export async function addWorkoutTag(tag: Tag): Promise<FormResponse> {
   const fields = workoutTagSchema.safeParse(tag);

   if (!(fields.success)) {
      return sendErrorMessage(
         "Error",
         "Invalid workout tag fields", {
            search: fields.error.flatten().fieldErrors.title ?? []
         },
      );
   }

   try {
      await prisma.workout_tags.create({
         data: {
            user_id: tag.user_id,
            title: tag.title.trim(),
            color: tag.color.trim()
         }
      });

      return sendSuccessMessage("Successfully added workout tag");
   } catch (error: any) {
      if (error.code === "P2002" && error.meta?.modelName === "workout_tags"
            && error.meta?.target?.includes("user_id") && error.meta?.target?.includes("title")) {
         // Workout tags must be unique
         return sendErrorMessage("Error", "Workout tag already exists", { search: ["Workout tag already exists"] });
      } else {
         return sendErrorMessage("Failure", "Internal Server Error. Please try again later.", {});
      }
   }
}

export async function updateWorkoutTag(tag: Tag): Promise<FormResponse> {
   const fields = workoutTagSchema.safeParse(tag);

   if (tag.id === undefined) {
      return sendErrorMessage("Failure", "Missing Workout Tag ID", {});
   }

   if (!(fields.success)) {
      return sendErrorMessage("Error", "Invalid workout tag fields", fields.error.flatten().fieldErrors);
   }

   try {
      await prisma.workout_tags.update({
         where: {
            id: tag.id,
         },
         data: {
            user_id: tag.user_id,
            title: tag.title.trim(),
            color: tag.color.trim()
         }
      });

      return sendSuccessMessage("Successfully updated workout tag");
   } catch (error: any) {
      if (error.code === "P2002" && error.meta?.modelName === "workout_tags"
            && error.meta?.target?.includes("user_id") && error.meta?.target?.includes("title")) {
         // Workout tags must be unique by their title
         return sendErrorMessage("Error", "Workout tag title already exists", { title: ["Workout tag title already exists"] });
      } else {
         return sendErrorMessage("Failure", "Internal Server Error. Please try again later.", {});
      }
   }
}