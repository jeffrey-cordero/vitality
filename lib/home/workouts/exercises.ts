"use server";
import prisma from "@/lib/prisma/client";
import { z } from "zod";
import {
   sendSuccessMessage,
   sendErrorMessage,
   sendFailureMessage,
   VitalityResponse
} from "@/lib/global/response";
import { formatWorkout } from "@/lib/home/workouts/shared";
import { uuidSchema } from "@/lib/global/zod";
import { Workout } from "./workouts";

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
      .max(60, {
         message: "Minutes cannot exceed 60"
      })
      .optional()
      .nullable(),
   seconds: z
      .number()
      .min(0, {
         message: "Seconds must be non-negative"
      })
      .max(60, {
         message: "Seconds cannot exceed 60"
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

function isEmptyExerciseSet(set: ExerciseSet) {
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
   exercise: Exercise
): Promise<VitalityResponse<Exercise>> {
   try {
      const fields = newExerciseSchema.safeParse(exercise);

      if (!fields.success) {
         return sendErrorMessage(
            "Invalid exercise fields",
            fields.error.flatten().fieldErrors
         );
      }

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

      // Ensure ordering variable remains within 0th indexing range
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
   exercise: Exercise,
   method: "name" | "sets"
): Promise<VitalityResponse<Exercise>> {
   try {
      const fields = exerciseSchema.safeParse(exercise);

      if (!fields.success) {
         return sendErrorMessage(
            "Invalid exercise fields",
            fields.error.flatten().fieldErrors
         );
      }

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

      // Validate existing entry
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
         const newName = exercise.name.trim();

         const newExercise = await prisma.exercises.update({
            where: {
               id: exercise.id,
               workout_id: exercise.workout_id
            },
            data: {
               name: newName
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
         const { creating, updating, removing, error, errors } =
        await getExerciseSetUpdates(existingExercise, exercise);

         if (error) {
            return sendErrorMessage(error, errors);
         }

         const newExercise = await prisma.exercises.update({
            where: {
               id: exercise.id,
               workout_id: exercise.workout_id
            },
            data: {
               sets: {
                  deleteMany: removing,
                  createMany: creating,
                  updateMany: updating
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
  creating: { data: ExerciseSet[] };
  updating: { where: { id: string; exercise_id: string }; data: ExerciseSet }[];
  removing: { id: { in: string[] }};
  error?: string;
  errors?: Record<string, string[] | undefined>
}> {
   const existingExerciseSets: string[] = existingExercise?.sets.map(
      (set) => set.id
   );
   const newExerciseSets: Set<string> = new Set(
      newExercise.sets.map((set) => set.id)
   );

   // Format formatting create/update entries and determine set IDs to remove
   const creating = [];
   const updating = [];
   const removing: string[] = existingExerciseSets.filter(
      (id) => !newExerciseSets.has(id)
   );

   for (let i = 0; i < newExercise.sets.length; i++) {
      const set = newExercise.sets[i];

      // Handle validating new or existing exercise set fields
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
      } else if (isEmptyExerciseSet(set)) {
         return {
            creating: null,
            updating: null,
            removing: null,
            error: "All exercise sets must be non-empty",
            errors: null
         };
      } else {
         const isNewExerciseSet = !set.id || set.id.trim() === "";

         const newExerciseSet: ExerciseSet = {
            ...newExercise.sets[i],
            set_order: i,
            text: newExercise.sets[i].text?.trim(),
            id: isNewExerciseSet ? undefined : set.id,
            exercise_id: undefined
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
      removing: { id: { in: removing } }
   };
}

export async function updateExercises(
   workout: Workout
): Promise<VitalityResponse<Exercise[]>> {
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
      // Fetch existing tags first for data integrity
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
         formatWorkout(newWorkout).exercises
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
      (exercise) => exercise.id
   );
   const newExercisesIds: Set<string> = new Set(
      workout.exercises.map((exercise) => exercise.id)
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
      updating: updating,
      removing:  { id: { in: removing } }
   };
}