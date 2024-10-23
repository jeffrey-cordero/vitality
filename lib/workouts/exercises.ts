"use server";
import prisma from "@/lib/database/client";
import { z } from "zod";
import {
   VitalityResponse,
   sendSuccessMessage,
   sendErrorMessage
} from "@/lib/global/state";
import { formatExercise, formatWorkout } from "./shared";

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

const setSchema = z.object({
   id: z.string(),
   exercise_id: z.string(),
   hours: z.number().min(0, {
      message: "Hours must be non-negative."
   }).optional(),
   minutes: z.number().min(0, {
      message: "Minutes must be non-negative."
   }).optional(),
   seconds:z.number().min(0, {
      message: "Seconds must be non-negative."
   }).optional(),
   weight: z.number().min(0, {
      message: "Weight must be non-negative."
   }).optional(),
   repetitions: z.number().min(0, {
      message: "Repetitions must be non-negative."
   }).optional(),
   text: z.string().optional()
});

export type Exercise = {
  id: string;
  workout_id: string;
  name: string;
  exercise_order: number;
  sets: ExerciseSet[];
};

const exerciseSchema = z.object({
   id: z.string(),
   workout_id: z.string(),
   name: z
      .string()
      .trim()
      .min(1, { message: "A name must be at least 1 character." })
      .max(50, { message: "A name must be at most 50 characters." }),
   sets: z.array(setSchema)
});

export async function addExercise(
   exercise: Exercise
): Promise<VitalityResponse<Exercise>> {
   try {
      const fields = exerciseSchema.safeParse(exercise);

      if (!(fields.success)) {
         return sendErrorMessage(
            "Error",
            "Invalid exercise fields",
            exercise,
            fields.error.flatten().fieldErrors
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
      console.error(error);

      return sendErrorMessage(
         "Failure",
         error.meta?.message,
         exercise,
         { system: error.meta?.message }
      );
   }
}

export async function addExerciseSet(set: ExerciseSet): Promise<VitalityResponse<Exercise | null>> {
   try {
      const fields = setSchema.safeParse(set);

      if (!(fields.success)) {
         return sendErrorMessage(
            "Error",
            "Invalid exercise set fields",
            null,
            fields.error.flatten().fieldErrors
         );
      } else if (Object.keys(set).length <= 3 || set.text?.trim().length === 0) {
         // Ensure at least one of the exercise fields are being used
         return sendErrorMessage(
            "Error",
            "Exercise set must use at least of one the provided inputs.",
            null,
            null
         );
      }

      const newExercise = await prisma.exercises.update({
         where: {
            id: set.exercise_id
         },
         data: {
            sets: {
               create: {
                  set_order: set.set_order,
                  weight: set.weight,
                  hours: set.hours,
                  minutes: set.minutes,
                  seconds: set.seconds,
                  repetitions: set.repetitions,
                  text: set.text
               }
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

      console.log(newExercise);

      return sendSuccessMessage("Successfully added new exercise set", formatExercise(newExercise));
   } catch (error) {
      console.error(error);

      return sendErrorMessage(
         "Failure",
         error.meta?.message,
         null,
         { system: error.meta?.message }
      );
   }
}

export async function updateExercise(
   exercise: Exercise, method: "name" | "sets"
): Promise<VitalityResponse<Exercise>> {
   try {
      if (method === "name") {
         // Update exercise name
         const name = exercise.name.trim();

         if (name.length === 0) {
            const error: string = "A name must be at least 1 character";

            return sendErrorMessage("Error", error, null, { name: [error] });
         } else if (name.length > 50) {
            const error: string = "A name must be at most 50 characters";

            return sendErrorMessage("Error", error, null, { name: [error] });
         } else {
            // Update exercise with new name
            await prisma.exercises.update({
               where: {
                  id: exercise.id
               },
               data: {
                  name: exercise.name
               }
            });

            return sendSuccessMessage("Successfully updated exercise name", null);
         }
      } else {
         // Update exercise sets
         const existingExercise = await prisma.exercises.findUnique({
            where: {
               id: exercise.id
            },
            include: {
               sets: {
                  orderBy: {
                     set_order: "asc"
                  }
               }
            }
         });

         const existingExerciseSetIdsArray: string[] = existingExercise?.sets.map((set) => set.id) || [];
         const newExerciseSetIdsArray: string[] = exercise.sets.map((set) => set.id);
         const newExerciseSetIdsSet: Set<string> = new Set(newExerciseSetIdsArray);

         // Determine IDs to remove
         const exerciseIdsToRemove: string[] = existingExerciseSetIdsArray.filter(id => !newExerciseSetIdsSet.has(id));

         // Determine sets to create or update
         const exerciseSetsToCreate = [];
         const exerciseSetsToUpdate = [];

         for (let i = 0; i < exercise.sets.length; i++) {
            const exerciseSet: ExerciseSet = {
               ...exercise.sets[i],
               set_order: i
            };

            if (exerciseSet.id === undefined || exerciseSet.id.trim() === "") {
               exerciseSetsToCreate.push(exerciseSet);
            } else {
               exerciseSetsToUpdate.push(exerciseSet);
            }
         }

         const newExercise = await prisma.exercises.update({
            where: {
               id: exercise.id
            },
            data: {
               sets: {
                  deleteMany: {
                     id: { in: exerciseIdsToRemove }
                  },
                  createMany: {
                     data: exerciseSetsToCreate
                  },
                  updateMany: exerciseSetsToUpdate
               }
            },
            include: {
               sets: true
            }
         });

         return sendSuccessMessage("Missing implementation for update exercise sets", newExercise);
      }
   } catch (error) {
      console.error(error);

      return sendErrorMessage(
         "Failure",
         error.meta?.message,
         null,
         { system: error.meta?.message }
      );
   }
}

export async function updateExercises(workoutId: string,
   exercises: Exercise[]): Promise<VitalityResponse<Exercise[]>> {
   for (const exercise of exercises) {
      const fields = exerciseSchema.safeParse(exercise);
      if (!(fields.success)) {
         return sendErrorMessage(
            "Error",
            `Invalid exercise fields(ID = ${exercise.id})`,
            null,
            fields.error.flatten().fieldErrors
         );
      }
   }
   try {
      // Fetch existing tags first for data integrity
      const existingWorkout = await prisma.workouts.findUnique({
         where: {
            id: workoutId
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
      const existingExerciseIdsArray: string[] = existingWorkout?.exercises.map((exercise) => exercise.id) ?? [];
      const newExerciseIdsArray: string[] = exercises.map((exercise) => exercise.id);
      const newExerciseIdsSet: Set<string> = new Set(newExerciseIdsArray);

      // Determine exercise's to remove and update ordering accordingly
      const exerciseIdsToRemove: string[] = existingExerciseIdsArray.filter(
         (id: string) => !(newExerciseIdsSet.has(id))
      );

      const workout = await prisma.workouts.update({
         where: { id: workoutId },
         data: {
            exercises: {
               // Update existing ordering for reorder or deletion methods
               deleteMany: {
                  id: { in: exerciseIdsToRemove }
               },
               updateMany: newExerciseIdsArray.map((id: string, index: number) => ({
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

      return sendSuccessMessage("Successfully updated workout exercises", formatWorkout(workout).exercises);
   } catch (error) {
      console.error(error);

      return sendErrorMessage(
         "Failure",
         error.meta?.message,
         null,
         { system: error.meta?.message }
      );
   }
}