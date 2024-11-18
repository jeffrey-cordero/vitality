"use server";
import prisma from "@/client";
import { z } from "zod";
import {
   sendSuccessMessage,
   sendErrorMessage,
   sendFailureMessage,
   VitalityResponse
} from "@/lib/global/response";
import { formatWorkout } from "@/lib/home/workouts/shared";
import { uuidSchema } from "@/lib/global/zod";

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

const MAX_INTEGER = 2147483647;

const setSchema = z.object({
   id: uuidSchema("user", "required"),
   exercise_id: uuidSchema("exercise", "required"),
   hours: z
      .number()
      .min(0, {
         message: "Hours must be non-negative"
      })
      .max(MAX_INTEGER, {
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
      .max(MAX_INTEGER, {
         message: "Value exceeds the maximum limit for a number"
      })
      .optional()
      .nullable(),
   repetitions: z
      .number()
      .min(0, {
         message: "Repetitions must be non-negative"
      })
      .max(MAX_INTEGER, {
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
   name: z
      .string()
      .trim()
      .min(1, { message: "A name must be at least 1 character." })
      .max(50, { message: "A name must be at most 50 characters." }),
   sets: z.array(setSchema)
});

const newExerciseSchema = exerciseSchema.extend({
   id: uuidSchema("exercise", "new")
});

export async function addExercise(
   exercise: Exercise,
): Promise<VitalityResponse<Exercise>> {
   try {
      const fields = newExerciseSchema.safeParse(exercise);

      if (!fields.success) {
         return sendErrorMessage(
            "Invalid exercise fields",
            fields.error.flatten().fieldErrors,
         );
      }

      const newExercise = await prisma.exercises.create({
         data: {
            workout_id: exercise.workout_id,
            name: exercise.name,
            exercise_order: exercise.exercise_order
         }
      });

      return sendSuccessMessage("Successfully added new exercise", {
         ...exercise,
         id: newExercise.id
      });
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updateExercise(
   exercise: Exercise,
   method: "name" | "sets",
): Promise<VitalityResponse<Exercise>> {
   try {
      if (method === "name") {
         // Update exercise name
         const name = exercise.name.trim();

         if (name.length === 0) {
            const error: string = "A name must be at least 1 character";

            return sendErrorMessage(error, { name: [error] });
         } else if (name.length > 50) {
            const error: string = "A name must be at most 50 characters";

            return sendErrorMessage(error, { name: [error] });
         } else {
            // Update exercise with new name
            await prisma.exercises.update({
               where: {
                  id: exercise.id,
                  workout_id: exercise.workout_id
               },
               data: {
                  name: exercise.name
               }
            });

            return sendSuccessMessage("Successfully updated exercise name", {
               ...exercise,
               name: name
            });
         }
      } else {
         const isEmptySet = (set: ExerciseSet) => {
            return (
               set.weight === null &&
               set.repetitions === null &&
               set.hours === null &&
               set.minutes === null &&
               set.seconds === null &&
               set.text?.trim() === ""
            );
         };

         for (const set of exercise.sets) {
            const fields = set.id.trim() === "" ? newSetSchema.safeParse(set) : setSchema.safeParse(set);

            if (!fields.success) {
               return sendErrorMessage(
                  `Invalid exercise set fields for set ID ${set.id}`,
                  fields.error.flatten().fieldErrors,
               );
            } else if (isEmptySet(set)) {
               return sendErrorMessage(
                  "Set must be non-empty.",
                  null
               );
            }
         }

         // Update exercise sets while referring to current exercise entry
         const existingExercise = await prisma.exercises.findUnique({
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

         const existingExerciseSets: string[] = existingExercise?.sets.map((set) => set.id) || [];
         const newExerciseSets: Set<string> = new Set(exercise.sets.map(
            (set) => set.id,
         ));

         // Determine IDs to remove
         const exerciseSetsToRemove: string[] = existingExerciseSets.filter(
            (id) => !newExerciseSets.has(id),
         );

         // Determine sets to create or update
         const exerciseSetsToCreate = [];
         const exerciseSetsToUpdate = [];

         for (let i = 0; i < exercise.sets.length; i++) {
            const exerciseSet: ExerciseSet = {
               ...exercise.sets[i],
               set_order: i
            };

            if (exerciseSet.id === undefined || exerciseSet.id.trim() === "") {
               exerciseSetsToCreate.push({
                  set_order: exerciseSet.set_order,
                  weight: exerciseSet.weight,
                  repetitions: exerciseSet.repetitions,
                  hours: exerciseSet.hours,
                  minutes: exerciseSet.minutes,
                  seconds: exerciseSet.seconds,
                  text: exerciseSet.text
               });
            } else {
               exerciseSetsToUpdate.push({
                  where: {
                     id: exerciseSet.id
                  },
                  data: {
                     ...exerciseSet,
                     exercise_id: undefined
                  }
               });
            }
         }

         const newExercise = await prisma.exercises.update({
            where: {
               id: exercise.id,
               workout_id: exercise.workout_id
            },
            data: {
               sets: {
                  deleteMany: {
                     id: { in: exerciseSetsToRemove }
                  },
                  createMany: {
                     data: exerciseSetsToCreate
                  },
                  updateMany: exerciseSetsToUpdate
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
            newExercise,
         );
      }
   } catch (error) {
      return sendFailureMessage(error);
   }
}

export async function updateExercises(
   workout_id: string,
   exercises: Exercise[],
): Promise<VitalityResponse<Exercise[]>> {
   // TODO: // Handle missing exercise-related id's or invalid user fields
   for (const exercise of exercises) {
      const fields = exerciseSchema.safeParse(exercise);

      if (!fields.success) {
         return sendErrorMessage(
            "Invalid exercise fields",
            fields.error.flatten().fieldErrors,
         );
      }
   }

   try {
      // Fetch existing tags first for data integrity
      const existingWorkout = await prisma.workouts.findUnique({
         where: {
            id: workout_id
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

      // Extract exercise IDs
      const existingExercisesIds: string[] = existingWorkout?.exercises.map((exercise) => exercise.id) ?? [];
      const newExercisesIds: Set<string> = new Set(exercises.map(
         (exercise) => exercise.id,
      ));

      // Determine exercise's to remove and update ordering accordingly
      const exerciseIdsToRemove: string[] = existingExercisesIds.filter(
         (id: string) => !newExercisesIds.has(id),
      );

      const workout = await prisma.workouts.update({
         where: {
            id: workout_id
         },
         data: {
            exercises: {
               deleteMany: {
                  id: { in: exerciseIdsToRemove }
               },
               updateMany: Array.from(newExercisesIds).map((id: string, index: number) => ({
                  where: {
                     id: id
                  },
                  data: {
                     exercise_order: index
                  }
               }))
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
         "Successfully updated workout exercises",
         formatWorkout(workout).exercises,
      );
   } catch (error) {
      return sendFailureMessage(error);
   }
}