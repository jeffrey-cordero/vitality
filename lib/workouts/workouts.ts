"use server";
import { z } from "zod";
import {
   VitalityResponse,
   sendSuccessMessage,
   sendErrorMessage
} from "@/lib/global/state";
import prisma from "@/lib/database/client";

export type Workout = {
  id: string;
  user_id: string;
  title: string;
  date: string | Date;
  image: string;
  description: string;
  tags: Tag[];
};

// Define the Zod schema for the Tag type
const TagSchema = z.object({
   user_id: z.string(),
   id: z.string(),
   title: z.string(),
   color: z.string()
});

const urlRegex =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
const nextMediaRegex =
  /^\/_next\/static\/media\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+\.jpg$/;

const workoutsSchema = z.object({
   user_id: z
      .string()
      .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, {
         message: "Invalid UUID format"
      }),
   id: z
      .string()
      .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, {
         message: "Invalid UUID format"
      }),
   title: z
      .string()
      .trim()
      .min(1, { message: "A title must be at least 1 character" }),
   date: z.date().max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
      message: "A birthday must not be after today"
   }),
   description: z.string().optional().or(z.literal("")),
   image: z
      .string()
      .refine((value) => urlRegex.test(value) || nextMediaRegex.test(value), {
         message: "Invalid URL or media path"
      })
      .or(z.literal("")),
   tags: z.array(TagSchema).optional()
});

export async function addWorkout(workout: Workout): Promise<VitalityResponse> {
   try {
      // Validate the feedback form first
      const fields = workoutsSchema.safeParse(workout);

      if (!fields.success) {
      // Return the field errors
         const errors = fields.error.flatten();

         // Only error caught should be related to invalid UUID format for ID
         if (
            !(
               errors.fieldErrors.id !== undefined &&
          Object.keys(errors.fieldErrors).length == 1
            )
         ) {
            return sendErrorMessage(
               "Error",
               "Invalid workout tag fields",
               errors.fieldErrors
            );
         }
      }

      const newWorkout = await prisma.workouts.create({
         data: {
            user_id: workout.user_id,
            title: workout.title,
            date: workout.date,
            image: workout.image,
            // Nested create operation to add entries to the workout_applied_tags table
            workout_applied_tags: {
               create: workout.tags.map((tag: Tag) => {
                  return {
                     tag_id: tag.id
                  };
               })
            }
         }
      });

      return sendSuccessMessage("Successfully added new workout", newWorkout);
   } catch (error: any) {
      // Possibly an error with database, authentication, or network
      console.error(error);

      return sendErrorMessage(
         "Failure",
         "Internal Server Error. Please try again later.",
         {}
      );
   }
}

export async function editWorkout(
   workout: Workout,
   method: "update" | "delete"
): Promise<VitalityResponse> {
   console.log(method);
   return sendSuccessMessage("Missing implementation", workout);
}

export async function removeWorkouts(workouts: Workout[]): Promise<VitalityResponse> {
   try {
      const ids: string[] = workouts.map((workout: Workout) => workout.id);

      const response = await prisma.workouts.deleteMany({
         where: {
            id: {
               in: ids
            }
         }
      });

      console.log(`Successfully deleted ${response.count} workout${response.count === 1 ? '' : 's'}`);
      return sendSuccessMessage(`Successfully deleted ${response.count} workout${response.count === 1 ? '' : 's'}`);
   } catch (error: any) {
      console.error(error);

      return sendErrorMessage(
         "Failure",
         "Internal Server Error. Please try again later.",
         {}
      );
   }
}

export type Tag = {
  user_id: string;
  id: string;
  title: string;
  color: string;
};

const workoutTagSchema = z.object({
   user_id: z
      .string()
      .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, {
         message: "Invalid UUID format"
      }),
   id: z
      .string()
      .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, {
         message: "Invalid UUID format"
      }),
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

export async function fetchWorkoutsInformation(
   userId: string
): Promise<Workout[]> {
   try {
      const workoutsWithTags = await prisma.workouts.findMany({
         include: {
            workout_applied_tags: {
               include: {
                  workout_tags: true
               }
            }
         },
         where: {
            user_id: userId
         },
         orderBy: {
            date: "desc"
         }
      });

      const formattedWorkouts = workoutsWithTags.map((workout) => {
         return {
            id: workout.id,
            user_id: userId,
            title: workout.title,
            date: workout.date,
            description: workout.description ?? "",
            image: workout.image ?? "",
            tags: workout.workout_applied_tags.map(
               (applied_tag) => applied_tag.workout_tags
            )
         };
      });

      return formattedWorkouts;
   } catch (error) {
      console.error(error);
      return [];
   }
}

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
      console.error(error);
      return [];
   }
}

export async function addWorkoutTag(tag: Tag): Promise<VitalityResponse> {
   const fields = workoutTagSchema.safeParse(tag);

   if (!fields.success) {
      // Return the field errors
      const errors = fields.error.flatten();

      // Only error should be title being too long or short
      if (errors.fieldErrors.title) {
         return sendErrorMessage("Error", "Invalid workout tag fields", {
            search: errors.fieldErrors.title ?? [""]
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
   } catch (error: any) {
      if (
         error.code === "P2002" &&
      error.meta?.modelName === "workout_tags" &&
      error.meta?.target?.includes("user_id") &&
      error.meta?.target?.includes("title")
      ) {
      // Workout tags must be unique
         return sendErrorMessage("Error", "Workout tag already exists", {
            search: ["Workout tag already exists"]
         });
      } else {
         return sendErrorMessage(
            "Failure",
            "Internal Server Error. Please try again later.",
            {}
         );
      }
   }
}

export async function updateWorkoutTag(
   tag: Tag,
   method: "update" | "delete"
): Promise<VitalityResponse> {
   const fields = workoutTagSchema.safeParse(tag);

   // Handle invalid tag id's and user fields
   if (tag.id === undefined) {
      return sendErrorMessage("Failure", "Missing Workout Tag ID", {});
   } else if (!fields.success) {
      return sendErrorMessage(
         "Error",
         "Invalid workout tag fields",
         fields.error.flatten().fieldErrors
      );
   }

   try {
      // Handle update/delete workout tags
      switch (method) {
      case "update":
         await prisma.workout_tags.update({
            where: {
               id: tag.id
            },
            data: tag
         });

         return sendSuccessMessage("Successfully updated workout tag");
      case "delete":
         await prisma.workout_tags.delete({
            where: {
               id: tag.id
            }
         });

         return sendSuccessMessage("Successfully deleted workout tag");
      default:
         return sendErrorMessage(
            "Failure",
            "Invalid Workout Tag Update Method",
            {}
         );
      }
   } catch (error: any) {
      if (
         error.code === "P2002" &&
      error.meta?.modelName === "workout_tags" &&
      error.meta?.target?.includes("user_id") &&
      error.meta?.target?.includes("title")
      ) {
      // Workout tags must be unique by their title
         return sendErrorMessage("Error", "Workout tag title already exists", {
            title: ["Workout tag title already exists"]
         });
      } else {
         return sendErrorMessage(
            "Failure",
            "Internal Server Error. Please try again later.",
            {}
         );
      }
   }
}

// Exercises - <TODO>
/*
-- Bicep Curl (Exercise)
      -- #1 (order) 30 lbs (weight) x 10 (repetitions) [set 1]
      -- ... [set x]

-- Zone 2 Cardio
      -- #1 (order) 01:00:00 (interval) 10lbs (weight ~ optional)
*/
// export type Exercise = {
//   id?: string;
//   workoutId: string;
//   interval: string;
// };

// const exerciseSchema = z.object({
//    // HH:MM:SS
//    interval: z.string().regex(/^\d{1,}:\d{2}:\d{2}(\.\d+)?\s*$/)
// });
