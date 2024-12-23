"use server";
import { z } from "zod";

import { authorizeAction } from "@/lib/authentication/session";
import { sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";
import { uuidSchema } from "@/lib/global/zod";
import { formateDatabaseWorkout } from "@/lib/home/workouts/shared";
import { Workout } from "@/lib/home/workouts/workouts";
import prisma from "@/lib/prisma/client";

export type ExerciseSet = {
  id: string;
  exercise_id: string;
  set_order: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  weight?: number;
  repetitions?: number;
  text?: string;
};

const MAX_NUMBER: number = 2147483647;

const setSchema = z.object({
   id: uuidSchema("set", "required"),
   exercise_id: uuidSchema("exercise", "required"),
   set_order: z.number().min(0, {
      message: "Set order must be non-negative"
   }),
   hours: z
      .number()
      .min(0, {
         message: "Hours must be non-negative"
      })
      .max(MAX_NUMBER, {
         message: "Value exceeds the maximum limit for a number"
      })
      .optional()
      .nullable(),
   minutes: z
      .number()
      .min(0, {
         message: "Minutes must be non-negative"
      })
      .max(59, {
         message: "Minutes cannot exceed 59"
      })
      .optional()
      .nullable(),
   seconds: z
      .number()
      .min(0, {
         message: "Seconds must be non-negative"
      })
      .max(59, {
         message: "Seconds cannot exceed 59"
      })
      .optional()
      .nullable(),
   weight: z
      .number()
      .min(0, {
         message: "Weight must be non-negative"
      })
      .max(MAX_NUMBER, {
         message: "Value exceeds the maximum limit for a number"
      })
      .optional()
      .nullable(),
   repetitions: z
      .number()
      .min(0, {
         message: "Repetitions must be non-negative"
      })
      .max(MAX_NUMBER, {
         message: "Value exceeds the maximum limit for a number"
      })
      .optional()
      .nullable(),
   text: z.string().optional().nullable()
});

const newSetSchema = setSchema.extend({
   id: uuidSchema("set", "new")
});

export type Exercise = {
  id: string;
  workout_id: string;
  name: string;
  exercise_order: number;
  sets: ExerciseSet[];
};

const exerciseSchema = z.object({
   id: uuidSchema("exercise", "required"),
   workout_id: uuidSchema("workout", "required"),
   exercise_order: z.number().min(0, {
      message: "Exercise order must be non-negative"
   }),
   name: z
      .string()
      .trim()
      .min(1, { message: "A name must be at least 1 character." })
      .max(50, { message: "A name must be at most 50 characters." })
});

const newExerciseSchema = exerciseSchema.extend({
   id: uuidSchema("exercise", "new")
});

export async function isEmptyExerciseSet(set: ExerciseSet) {
   return (
      !set.weight &&
      !set.repetitions &&
      !set.hours &&
      !set.minutes &&
      !set.seconds &&
      set.text?.trim() === ""
   );
}

export async function addExercise(
   user_id: string,
   exercise: Exercise
): Promise<VitalityResponse<Exercise>> {
   try {
      await authorizeAction(user_id);

      const fields = newExerciseSchema.safeParse(exercise);

      if (!fields.success) {
         return sendErrorMessage(
            "Invalid exercise fields",
            fields.error.flatten().fieldErrors
         );
      }

      // Exercises must be connected to existing workouts
      const existingWorkout = await prisma.workouts.findFirst({
         where: {
            id: exercise.workout_id
         },
         include: {
            exercises: true
         }
      });

      if (!existingWorkout) {
         return sendErrorMessage(
            "Workout does not exist based on workout ID",
            null
         );
      }

      // Ensure ordering remains within 0th indexing bounds
      const currentExercisesSize: number = existingWorkout.exercises.length;

      if (exercise.exercise_order != currentExercisesSize) {
         return sendErrorMessage(
            "Exercise order must match current workout exercises length",
            null
         );
      } else if (exercise.sets.length > 0) {
         return sendErrorMessage(
            "Exercise sets must be empty",
            null
         );
      } else {
         const newExercise = await prisma.exercises.create({
            data: {
               workout_id: exercise.workout_id,
               name: exercise.name.trim(),
               exercise_order: exercise.exercise_order
            },
            include: {
               sets: {
                  orderBy: {
                     set_order: "asc"
                  }
               }
            }
         });

         return sendSuccessMessage("Successfully added new exercise", newExercise);
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updateExercise(
   user_id: string,
   exercise: Exercise,
   method: "name" | "sets"
): Promise<VitalityResponse<Exercise>> {
   try {
      await authorizeAction(user_id);

      const fields = exerciseSchema.safeParse(exercise);

      if (!fields.success) {
         return sendErrorMessage(
            "Invalid exercise fields",
            fields.error.flatten().fieldErrors
         );
      }

      // Validate existing workout and exercise entries
      const existingWorkout = await prisma.workouts.findFirst({
         where: {
            id: exercise.workout_id
         }
      });

      if (!existingWorkout) {
         return sendErrorMessage(
            "Workout does not exist based on workout ID",
            null
         );
      }

      const existingExercise = await prisma.exercises.findFirst({
         where: {
            id: exercise.id,
            workout_id: exercise.workout_id
         },
         include: {
            sets: {
               orderBy: {
                  set_order: "asc"
               }
            }
         }
      });

      if (!existingExercise) {
         return sendErrorMessage(
            "Exercise does not exist based on workout and/or exercise ID",
            null
         );
      }

      if (method === "name") {
         const trimmed = exercise.name.trim();

         const newExercise = await prisma.exercises.update({
            where: {
               id: exercise.id,
               workout_id: exercise.workout_id
            },
            data: {
               name: trimmed
            },
            include: {
               sets: {
                  orderBy: {
                     set_order: "asc"
                  }
               }
            }
         });

         return sendSuccessMessage(
            "Successfully updated exercise name",
            newExercise
         );
      } else {
         // Construct create, update, and delete exercise set arrays
         const { creating, updating, removing, error, errors } =
            await getExerciseSetUpdates(existingExercise, exercise);

         if (error !== null) {
            return sendErrorMessage(error, errors);
         }

         const newExercise = await prisma.exercises.update({
            where: {
               id: exercise.id,
               workout_id: exercise.workout_id
            },
            data: {
               sets: {
                  createMany: creating,
                  updateMany: updating,
                  deleteMany: removing
               }
            },
            include: {
               sets: {
                  orderBy: {
                     set_order: "asc"
                  }
               }
            }
         });

         return sendSuccessMessage(
            "Successfully updated exercise sets",
            newExercise
         );
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function getExerciseSetUpdates(
   existingExercise: any,
   newExercise: Exercise
): Promise<{
  creating: { data: ExerciseSet[] } | null;
  updating: { where: { id: string; exercise_id: string }; data: ExerciseSet }[] | null;
  removing: { id: { in: string[] }} | null;
  error: null | string;
  errors: null | Record<string, string[] | undefined>
}> {
   const existingExerciseSets: string[] = existingExercise?.sets.map(
      (set: ExerciseSet) => set.id
   );
   const newExerciseSets: Set<string> = new Set(
      newExercise.sets.map(
         (set: ExerciseSet) => set.id
      )
   );

   // Format formatting create/update entries and determine set IDs to remove
   const creating = [];
   const updating = [];
   const removing: string[] = existingExerciseSets.filter(
      (id: string) => !newExerciseSets.has(id)
   );

   for (let i = 0; i < newExercise.sets.length; i++) {
      const set: ExerciseSet = newExercise.sets[i];

      // Handle validating constructing or existing exercise set fields
      const fields = set.id.trim() === ""
         ? newSetSchema.safeParse(set) : setSchema.safeParse(set);

      if (!fields.success) {
         return {
            creating: null,
            updating: null,
            removing: null,
            error: `Invalid exercise set fields for set with ID \`${set.id}\``,
            errors: fields.error.flatten().fieldErrors
         };
      } else if (await isEmptyExerciseSet(set)) {
         return {
            creating: null,
            updating: null,
            removing: null,
            error: "All exercise sets must be valid and non-empty",
            errors: null
         };
      } else {
         const isNewExerciseSet: boolean = !set.id || set.id.trim() === "";

         const newExerciseSet: ExerciseSet = {
            ...newExercise.sets[i],
            exercise_id: undefined,
            id: isNewExerciseSet ? undefined : set.id,
            set_order: i,
            text: newExercise.sets[i].text?.trim()
         };

         if (isNewExerciseSet) {
            creating.push(newExerciseSet);
         } else {
            updating.push({
               where: {
                  id: newExerciseSet.id,
                  exercise_id: newExerciseSet.exercise_id
               },
               data: newExerciseSet
            });
         }
      }
   }

   return {
      creating: { data: creating },
      updating: updating,
      removing: { id: { in: removing } },
      error: null,
      errors: null
   };
}

export async function updateExercises(
   workout: Workout
): Promise<VitalityResponse<Exercise[]>> {
   // Validate workout ID and all exercise entries
   if (!uuidSchema("workout", "required").safeParse(workout.id).success) {
      return sendErrorMessage("Invalid workout ID fields", {
         workout_id: ["ID for workout must be in UUID format"]
      });
   }

   for (const exercise of workout.exercises) {
      const fields = exerciseSchema.safeParse(exercise);

      if (!fields.success) {
         return sendErrorMessage(
            "Invalid exercise fields",
            fields.error.flatten().fieldErrors
         );
      }
   }

   try {
      // Ensure workout exists in the database
      const existingWorkout = await prisma.workouts.findFirst({
         where: {
            id: workout.id
         },
         include: {
            exercises: {
               include: {
                  sets: {
                     orderBy: {
                        set_order: "asc"
                     }
                  }
               }
            }
         }
      });

      if (!existingWorkout) {
         return sendErrorMessage(
            "Workout does not exist based on workout ID",
            null
         );
      }

      // Construct update and delete exercise arrays
      const { updating, removing } = await getExercisesUpdates(
         existingWorkout,
         workout
      );

      const newWorkout = await prisma.workouts.update({
         where: {
            id: workout.id
         },
         data: {
            exercises: {
               deleteMany:removing,
               updateMany: updating
            }
         },
         include: {
            exercises: {
               include: {
                  sets: {
                     orderBy: {
                        set_order: "asc"
                     }
                  }
               },
               orderBy: {
                  exercise_order: "asc"
               }
            }
         }
      });

      return sendSuccessMessage(
         "Successfully updated workout exercise ordering",
         formateDatabaseWorkout(newWorkout).exercises
      );
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function getExercisesUpdates(
   existingWorkout: any,
   workout: Workout
): Promise<{
  updating: {
    where: { id: string; workout_id: string };
    data: { exercise_order: number };
  }[];
  removing: { id: { in: string[] }};
}> {
   const existingExercisesIds: string[] = existingWorkout.exercises.map(
      (exercise: Exercise) => exercise.id
   );
   const newExercisesIds: Set<string> = new Set(
      workout.exercises.map(
         (exercise: Exercise) => exercise.id
      )
   );

   // Format updating exercise entries and determine removing exercise ID's
   const removing: string[] = existingExercisesIds.filter(
      (id: string) => !newExercisesIds.has(id)
   );

   const updating = workout.exercises.map((exercise: Exercise, index: number) => ({
      where: {
         id: exercise.id,
         workout_id: exercise.workout_id
      },
      data: {
         exercise_order: index
      }
   }));

   return {
      removing:  { id: { in: removing } },
      updating: updating
   };
}