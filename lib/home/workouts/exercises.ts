"use server";
import { z } from "zod";

import { authorizeAction } from "@/lib/authentication/session";
import prisma from "@/lib/database/client";
import { sendErrorMessage, sendFailureMessage, sendSuccessMessage, VitalityResponse } from "@/lib/global/response";
import { uuidSchema } from "@/lib/global/zod";
import { formatDatabaseExercise, formatDatabaseWorkout } from "@/lib/home/workouts/shared";
import { Workout } from "@/lib/home/workouts/workouts";

export type ExerciseEntry = {
  id: string;
  exercise_id: string;
  entry_order: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  weight?: number;
  repetitions?: number;
  text?: string;
};

const MAX_ENTRY_NUMBER: number = 2147483647;

const exerciseEntrySchema = z.object({
   id: uuidSchema("entry", "required"),
   exercise_id: uuidSchema("exercise", "required"),
   entry_order: z.number().min(0, {
      message: "Entry order must be non-negative"
   }),
   hours: z
      .number()
      .min(0, {
         message: "Hours must be non-negative"
      })
      .max(MAX_ENTRY_NUMBER, {
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
      .max(MAX_ENTRY_NUMBER, {
         message: "Value exceeds the maximum limit for a number"
      })
      .optional()
      .nullable(),
   repetitions: z
      .number()
      .min(0, {
         message: "Repetitions must be non-negative"
      })
      .max(MAX_ENTRY_NUMBER, {
         message: "Value exceeds the maximum limit for a number"
      })
      .optional()
      .nullable(),
   text: z.string().optional().nullable()
});

const newExerciseEntrySchema = exerciseEntrySchema.extend({
   id: uuidSchema("entry", "new")
});

export type Exercise = {
  id: string;
  workout_id: string;
  name: string;
  exercise_order: number;
  entries: ExerciseEntry[];
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

export async function isEmptyExerciseEntry(entry: ExerciseEntry) {
   return (
      !entry.weight &&
      !entry.repetitions &&
      !entry.hours &&
      !entry.minutes &&
      !entry.seconds &&
      entry.text?.trim() === ""
   );
}

export async function addExercise(user_id: string, exercise: Exercise): Promise<VitalityResponse<Exercise>> {
   try {
      await authorizeAction(user_id);

      const fields = newExerciseSchema.safeParse(exercise);

      if (!fields.success) {
         return sendErrorMessage(
            "Invalid exercise fields",
            fields.error.flatten().fieldErrors
         );
      }

      // Exercises must be related to existing workouts
      const existingWorkout = formatDatabaseWorkout(await prisma.workouts.findFirst({
         where: {
            id: exercise.workout_id
         },
         include: {
            exercises: true
         }
      }));

      if (!existingWorkout) {
         return sendErrorMessage(
            "Workout does not exist based on workout ID",
            null
         );
      }

      // Ensure ordering remains within 0th indexing bounds
      const totalExercises: number = existingWorkout.exercises.length;

      if (exercise.exercise_order != totalExercises) {
         return sendErrorMessage(
            "Exercise order must match current workout exercises length",
            null
         );
      } else if (exercise.entries.length > 0) {
         return sendErrorMessage(
            "Exercise entries must be empty",
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
               exercise_entries: {
                  orderBy: {
                     entry_order: "asc"
                  }
               }
            }
         });

         return sendSuccessMessage("Successfully added new exercise", formatDatabaseExercise(newExercise));
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updateExercise(user_id: string, exercise: Exercise, method: "name" | "entries"): Promise<VitalityResponse<Exercise>> {
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
      const existingWorkout = formatDatabaseWorkout(await prisma.workouts.findFirst({
         where: {
            id: exercise.workout_id
         }
      }));

      if (!existingWorkout) {
         return sendErrorMessage(
            "Workout does not exist based on workout ID",
            null
         );
      }

      const existingExercise = formatDatabaseExercise(await prisma.exercises.findFirst({
         where: {
            id: exercise.id,
            workout_id: exercise.workout_id
         },
         include: {
            exercise_entries: {
               orderBy: {
                  entry_order: "asc"
               }
            }
         }
      }));

      if (!existingExercise) {
         return sendErrorMessage(
            "Exercise does not exist based on workout and/or exercise ID",
            null
         );
      }

      if (method === "name") {
         const updates = exercise.name.trim();

         const newExercise = await prisma.exercises.update({
            where: {
               id: exercise.id,
               workout_id: exercise.workout_id
            },
            data: {
               name: updates
            },
            include: {
               exercise_entries: {
                  orderBy: {
                     entry_order: "asc"
                  }
               }
            }
         });

         return sendSuccessMessage(
            "Successfully updated exercise name",
            formatDatabaseExercise(newExercise)
         );
      } else {
         // Construct create, update, and delete exercise entry arrays
         const { creating, updating, removing, error, errors } = await getExerciseEntryOrderUpdates(existingExercise, exercise);

         if (error !== null) {
            return sendErrorMessage(error, errors);
         }

         const newExercise = await prisma.exercises.update({
            where: {
               id: exercise.id,
               workout_id: exercise.workout_id
            },
            data: {
               exercise_entries: {
                  createMany: creating,
                  updateMany: updating,
                  deleteMany: removing
               }
            },
            include: {
               exercise_entries: {
                  orderBy: {
                     entry_order: "asc"
                  }
               }
            }
         });

         return sendSuccessMessage(
            "Successfully updated exercise entries",
            formatDatabaseExercise(newExercise)
         );
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function getExerciseEntryOrderUpdates(
   existingExercise: any,
   newExercise: Exercise
): Promise<{
  creating: { data: ExerciseEntry[] } | null;
  updating: { where: { id: string; exercise_id: string }; data: ExerciseEntry }[] | null;
  removing: { id: { in: string[] }} | null;
  error: null | string;
  errors: null | Record<string, string[] | undefined>
}> {
   const existingExerciseEntries: string[] = existingExercise?.entries.map(
      (entry: ExerciseEntry) => entry.id
   );
   const newExerciseEntries: Set<string> = new Set(
      newExercise.entries.map(
         (entry: ExerciseEntry) => entry.id
      )
   );

   // Format create/update/delete entries arrays
   const creating = [];
   const updating = [];
   const removing: string[] = existingExerciseEntries.filter(
      (id: string) => !newExerciseEntries.has(id)
   );

   for (let i = 0; i < newExercise.entries.length; i++) {
      const entry: ExerciseEntry = newExercise.entries[i];

      // Handle validating constructing or existing exercise entry fields
      const fields = entry.id.trim() === "" ? newExerciseEntrySchema.safeParse(entry) : exerciseEntrySchema.safeParse(entry);

      if (!fields.success) {
         return {
            creating: null,
            updating: null,
            removing: null,
            error: `Invalid exercise entry fields for entry with ID \`${entry.id}\``,
            errors: fields.error.flatten().fieldErrors
         };
      } else if (await isEmptyExerciseEntry(entry)) {
         return {
            creating: null,
            updating: null,
            removing: null,
            error: "All exercise entries must be valid and non-empty",
            errors: null
         };
      } else {
         const isNewEntry: boolean = !entry.id || entry.id.trim() === "";

         const newExerciseEntry: ExerciseEntry = {
            ...newExercise.entries[i],
            exercise_id: undefined,
            id: isNewEntry ? undefined : entry.id,
            entry_order: i,
            text: newExercise.entries[i].text?.trim()
         };

         if (isNewEntry) {
            creating.push(newExerciseEntry);
         } else {
            updating.push({
               where: {
                  id: newExerciseEntry.id,
                  exercise_id: newExerciseEntry.exercise_id
               },
               data: newExerciseEntry
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

export async function updateExercises(user_id: string, workout: Workout): Promise<VitalityResponse<Exercise[]>> {
   try {
      await authorizeAction(user_id);

      // Validate workout ID and all exercise entries
      if (!uuidSchema("workout", "required").safeParse(workout.id).success) {
         return sendErrorMessage("Invalid workout fields", {
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

      // Ensure workout exists in the database
      const existingWorkout = formatDatabaseWorkout(await prisma.workouts.findFirst({
         where: {
            id: workout.id
         },
         include: {
            exercises: {
               include: {
                  exercise_entries: {
                     orderBy: {
                        entry_order: "asc"
                     }
                  }
               }
            }
         }
      }));

      if (!existingWorkout) {
         return sendErrorMessage(
            "Workout does not exist based on workout ID",
            null
         );
      }

      // Construct update/deleteMan exercise lists based on new workout exercises
      const { updating, removing } = await getExerciseOrderUpdates(existingWorkout, workout);

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
                  exercise_entries: {
                     orderBy: {
                        entry_order: "asc"
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
         formatDatabaseWorkout(newWorkout).exercises
      );
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function getExerciseOrderUpdates(
   existingWorkout: any,
   workout: Workout
): Promise<{
  updating: { where: { id: string; workout_id: string }; data: { exercise_order: number } }[];
  removing: { id: { in: string[] }};
}> {
   const existingExerciseIds: string[] = existingWorkout.exercises.map(
      (exercise: Exercise) => exercise.id
   );
   const newExerciseIds: Set<string> = new Set(
      workout.exercises.map(
         (exercise: Exercise) => exercise.id
      )
   );

   // Format update/delete exercise arrays
   const updating = workout.exercises.map((exercise: Exercise, index: number) => ({
      where: {
         id: exercise.id,
         workout_id: exercise.workout_id
      },
      data: {
         exercise_order: index
      }
   }));

   const removing: string[] = existingExerciseIds.filter(
      (id: string) => !newExerciseIds.has(id)
   );

   return {
      updating: updating,
      removing:  { id: { in: removing } }
   };
}