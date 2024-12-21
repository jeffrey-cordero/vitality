"use server";
import prisma from "@/lib/prisma/client";
import { z } from "zod";
import { uuidSchema } from "@/lib/global/zod";
import { workout_applied_tags } from "@prisma/client";
import { Exercise } from "@/lib/home/workouts/exercises";
import { authorizeAction } from "@/lib/authentication/session";
import { formateDatabaseWorkout, verifyImageURL } from "@/lib/home/workouts/shared";
import { sendSuccessMessage, sendErrorMessage, sendFailureMessage, VitalityResponse } from "@/lib/global/response";

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

const workoutsSchema = z.object({
   user_id: uuidSchema("user", "required"),
   id: uuidSchema("workout", "required"),
   title: z
      .string()
      .trim()
      .min(1, { message: "Title must be at least 1 character" })
      .max(50, { message: "Title must be at most 50 characters" }),
   date: z
      .date({
         required_error: "Date is required",
         invalid_type_error: "Date is required"
      })
      .max(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), {
         message: "Date must not be after today"
      }),
   description: z.string().optional().or(z.literal("")),
   image: z
      .string()
      .refine((value) => verifyImageURL(value), {
         message: "Image URL must be valid"
      }).or(z.literal("")),
   tags: z.array(z.string()).optional()
});

const newWorkoutSchema = workoutsSchema.extend({
   id: uuidSchema("workout", "new")
});

export async function fetchWorkouts(
   user_id: string
): Promise<Workout[]> {
   try {
      await authorizeAction(user_id);

      const workouts = await prisma.workouts.findMany({
         include: {
            workout_applied_tags: {
               select: {
                  workout_id: true,
                  tag_id: true
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
            user_id: user_id
         },
         orderBy: {
            date: "desc"
         }
      });

      return workouts.map(
         (workout) => formateDatabaseWorkout(workout)
      );
   } catch (error) {
      return [];
   }
}

export async function addWorkout(
   user_id: string,
   workout: Workout,
): Promise<VitalityResponse<Workout>> {
   try {
      await authorizeAction(user_id);

      const fields = newWorkoutSchema.safeParse(workout);

      if (!fields.success) {
         return sendErrorMessage("Invalid workout fields",
            fields.error.flatten().fieldErrors,
         );
      }

      // Create a new workout with basic properties
      const newWorkout = await prisma.workouts.create({
         data: {
            user_id: user_id,
            title: workout.title.trim(),
            date: workout.date,
            description: workout.description?.trim(),
            image: workout.image?.trim(),
            workout_applied_tags: {
               create: workout.tagIds.map(
                  (id: string) => ({ tag_id: id })
               )
            }
         },
         include: {
            workout_applied_tags: {
               select: {
                  workout_id: true,
                  tag_id: true
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

      return sendSuccessMessage("Added new workout", formateDatabaseWorkout(newWorkout));
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updateWorkout(
   user_id: string,
   workout: Workout,
): Promise<VitalityResponse<Workout>> {
   try {
      await authorizeAction(user_id);

      const fields = workoutsSchema.safeParse(workout);

      if (!fields.success) {
         return sendErrorMessage("Invalid workout fields",
            fields.error.flatten().fieldErrors,
         );
      } else {
         // Fetch existing tags first for create, update, delete tag arrays
         const existingWorkout = await prisma.workouts.findFirst({
            where: {
               id: workout.id,
               user_id: user_id
            },
            include: {
               workout_applied_tags: {
                  select: {
                     workout_id: true,
                     tag_id: true
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

         if (!existingWorkout) {
            return sendErrorMessage(
               "Workout does not exist based on user and/or workout ID",
               null
            );
         }

         const { adding, removing } = await getAppliedWorkoutTagUpdates(existingWorkout, workout);

         const updatedWorkout = await prisma.workouts.update({
            where: {
               id: workout.id,
               user_id: user_id
            },
            data: {
               title: workout.title.trim(),
               date: workout.date,
               description: workout.description?.trim(),
               image: workout.image?.trim(),
               workout_applied_tags: {
                  deleteMany: {
                     tag_id: { in: removing }
                  },
                  createMany: {
                     data: adding.map(
                        (tagId: string) => ({ tag_id: tagId })
                     )
                  }
               }
            },
            include: {
               workout_applied_tags: {
                  select: {
                     workout_id: true,
                     tag_id: true
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
            formateDatabaseWorkout(updatedWorkout),
         );
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function getAppliedWorkoutTagUpdates(
   existingWorkout: any,
   newWorkout: Workout
): Promise<{
   existing: string[],
   adding: string[];
   removing: string[]
}> {
   // Extract existing applied tag IDs
   const existing: Set<string> = new Set(
      existingWorkout.workout_applied_tags.map(
         (tag: workout_applied_tags) => tag.tag_id
      )
   );

   // Determine tags ID's to add and remove from existing workout
   const adding: Set<string> = new Set(newWorkout.tagIds);

   const addingTags: string[] = Array.from(adding).filter(
      (id: string) => !existing.has(id)
   );

   const removingTags: string[] = Array.from(existing).filter(
      (id: string)  => !adding.has(id)
   );

   const existingTags: string[] = Array.from(existing).filter(
      (id: string)  => existing.has(id) && adding.has(id)
   );

   return {
      existing: existingTags,
      adding: addingTags,
      removing: removingTags
   };
}

export async function deleteWorkouts(
   user_id: string,
   workouts: Workout[],
): Promise<VitalityResponse<number>> {
   try {
      await authorizeAction(user_id);

      // Validate user and workout(s) ID's prior to a potential delete operation
      const errors = {};

      if (!uuidSchema("user", "required").safeParse(user_id).success) {
         errors["user_id"] = ["ID for user must be in UUID format"];
      }

      const ids: string[] = [];

      for (const workout of workouts) {
         if (!uuidSchema("workout", "required").safeParse(workout.id).success) {
            errors["id"] = ["ID for all workouts must be in UUID format"];
            break;
         }

         ids.push(workout.id);
      }

      if (Object.keys(errors).length > 0) {
         return sendErrorMessage("Invalid workout ID fields", errors);
      }

      const response = await prisma.workouts.deleteMany({
         where: {
            id: {
               in: ids
            },
            user_id: user_id
         }
      });

      return sendSuccessMessage(
         `Deleted ${response.count} workout${response.count === 1 ? "" : "s"}`,
         response.count,
      );
   } catch (error) {
      return sendFailureMessage(error);
   }
}