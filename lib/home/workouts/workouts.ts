"use server";
import prisma from "@/client";
import { z } from "zod";
import {
   VitalityResponse,
   sendSuccessMessage,
   sendErrorMessage
} from "@/lib/global/state";
import { formatWorkout } from "@/lib/home/workouts/shared";
import { Exercise } from "@/lib/home/workouts/exercises";
import { uuidSchema } from "@/lib/global/zod";

export type Workout = {
  id: string;
  user_id: string;
  title: string;
  date: Date;
  image: string;
  description: string;
  tagIds: string[];
  exercises: Exercise[];
};

const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp|svg))$/i;
const nextMediaRegex =
  /^\/workouts\/(bike|cardio|default|hike|legs|lift|machine|run|swim|weights)\.png$/;

const workoutsSchema = z.object({
   user_id: uuidSchema,
   id: uuidSchema,
   title: z
      .string()
      .trim()
      .min(1, { message: "A title must be at least 1 character" })
      .max(50, { message: "A title must be at most 50 characters" }),
   date: z
      .date({
         required_error: "Date for workout is required",
         invalid_type_error: "A valid date is required"
      })
      .max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
         message: "A workout date must not be after today"
      }),
   description: z.string().optional().or(z.literal("")),
   image: z
      .string()
      .refine((value) => urlRegex.test(value) || nextMediaRegex.test(value), {
         message: "Invalid URL"
      })
      .or(z.literal("")),
   tags: z.array(z.string()).optional()
});

export async function fetchWorkouts(userId: string): Promise<Workout[]> {
   try {
      const workoutsWithTags = await prisma.workouts.findMany({
         include: {
            workout_applied_tags: {
               include: {
                  workout_tags: true
               }
            },
            exercises: {
               include: {
                  sets: true
               },
               orderBy: {
                  exercise_order: "asc"
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
         return formatWorkout(workout);
      });

      return formattedWorkouts;
   } catch (error) {
      console.error(error);

      return [];
   }
}

export async function addWorkout(
   workout: Workout,
): Promise<VitalityResponse<Workout>> {
   try {
      // Validate the feedback form first
      const fields = workoutsSchema.safeParse(workout);

      if (!fields.success) {
         return sendErrorMessage(
            "Error",
            "Invalid workout tag fields",
            workout,
            fields.error.flatten().fieldErrors,
         );
      }

      // Create new workout with basic properties and an additional nested create operation for applied workout tags
      const newWorkout = await prisma.workouts.create({
         data: {
            user_id: workout.user_id,
            title: workout.title,
            date: workout.date,
            image: workout.image,
            description: workout.description,
            workout_applied_tags: {
               create: workout.tagIds.map((tagId: string) => {
                  return {
                     tag_id: tagId
                  };
               })
            }
         },
         include: {
            workout_applied_tags: {
               include: {
                  workout_tags: true
               }
            },
            exercises: {
               include: {
                  sets: true
               },
               orderBy: {
                  exercise_order: "asc"
               }
            }
         }
      });

      return sendSuccessMessage("Added new workout", formatWorkout(newWorkout));
   } catch (error) {
      console.error(error);

      return sendErrorMessage("Failure", error.meta?.message, workout, {
         system: error.meta?.message
      });
   }
}

export async function updateWorkout(
   workout: Workout,
): Promise<VitalityResponse<Workout>> {
   try {
      const fields = workoutsSchema.safeParse(workout);

      if (!fields.success) {
         return sendErrorMessage(
            "Error",
            "Invalid workout fields",
            workout,
            fields.error.flatten().fieldErrors,
         );
      } else {
         // Fetch existing tags first for data integrity
         const existingWorkout = await prisma.workouts.findUnique({
            where: {
               id: workout.id
            },
            include: {
               workout_applied_tags: {
                  include: {
                     workout_tags: true
                  }
               },
               exercises: {
                  include: {
                     sets: true
                  },
                  orderBy: {
                     exercise_order: "asc"
                  }
               }
            }
         });

         // Extract existing tag IDs
         const existingAppliedTags: Set<string> = new Set(existingWorkout?.workout_applied_tags.map((tag) => tag.tag_id) || []);

         // Determine tags to connect and disconnect
         const newAppliedTags: Set<string> = new Set(workout.tagIds);

         const tagsToRemove: string[] = Array.from(existingAppliedTags).filter(
            (id) => !newAppliedTags.has(id),
         );
         const tagsToAdd: string[] = Array.from(newAppliedTags).filter(
            (id) => !existingAppliedTags.has(id),
         );

         const updatedWorkout = await prisma.workouts.update({
            where: { id: workout.id },
            data: {
               title: workout.title,
               description: workout.description,
               date: workout.date,
               image: workout.image,
               workout_applied_tags: {
                  // Disconnect existing applied tags
                  deleteMany: {
                     tag_id: { in: tagsToRemove }
                  },
                  // Create new applied tags
                  createMany: {
                     data: tagsToAdd.map((tagId: string) => ({
                        tag_id: tagId
                     }))
                  }
               }
            },

            include: {
               workout_applied_tags: {
                  include: {
                     workout_tags: true
                  }
               },
               exercises: {
                  include: {
                     sets: true
                  },
                  orderBy: {
                     exercise_order: "asc"
                  }
               }
            }
         });

         return sendSuccessMessage(
            "Successfully updated workout",
            formatWorkout(updatedWorkout),
         );
      }
   } catch (error) {
      console.error(error);

      return sendErrorMessage("Failure", error.meta?.message, workout, {
         system: error.meta?.message
      });
   }
}

export async function removeWorkouts(
   workouts: Workout[],
): Promise<VitalityResponse<number>> {
   try {
      const ids: string[] = workouts.map((workout: Workout) => workout.id);

      const response = await prisma.workouts.deleteMany({
         where: {
            id: {
               in: ids
            }
         }
      });

      return sendSuccessMessage(
         `Deleted ${response.count} workout${response.count === 1 ? "" : "s"}`,
         response.count,
      );
   } catch (error) {
      console.error(error);

      return sendErrorMessage("Failure", error.meta?.message, 0, {
         system: error.meta?.message
      });
   }
}
