import { expect } from "@jest/globals";
import { prismaMock } from "@/tests/singleton";
import { workouts } from "@/tests/home/workouts/data";
import { Workout } from "@/lib/home/workouts/workouts";
import { addExercise, Exercise, ExerciseSet, getExercisesUpdates, getExerciseSetUpdates, updateExercise, updateExercises } from "@/lib/home/workouts/exercises";

// Constant for valid workout
const MOCK_WORKOUTS = workouts;
const MOCK_WORKOUT: Workout = MOCK_WORKOUTS[0];
const MOCK_EXERCISE: Exercise = {
   id: "",
   workout_id: MOCK_WORKOUT.id,
   exercise_order: 0,
   name: "Name",
   sets: []
};

// Mocked data structures
let workout: Workout;
let exercise: Exercise;
let exercisesByIds: { [id: string]: Exercise };
let workoutsByIds: { [id: string]: Workout };

// Utility functions to handle database methods in mock implementations
const handleExercisesDatabaseMethods = async(params, method) => {
   let newExercise: Exercise;

   if (method === "update") {
      newExercise = {
         ...exercisesByIds[params.where.id],
         ...params.data
      };

      if (params.data.sets) {
         // Account for adding, removing, and updating mock exercise set entries
         newExercise.sets = [
            ...params.data.sets.updateMany.map((update) => ({
               ...update.data,
               exercise_id: params.where.id
            })),
            ...params.data.sets.createMany.data.map((create, index) => ({
               ...create,
               id: `Mock-ID-${index}`,
               exercise_id: params.where.id
            }))
         ];
      }
   } else {
      newExercise = {
         ...params.data,
         id: "Mock-ID",
         sets: []
      };
   }

   exercisesByIds[newExercise.id] = newExercise;

   return newExercise;
};

const handleWorkoutsDatabaseMethods = async(params) => {
   const updating = params.data.exercises.updateMany;

   const newWorkout: Workout = {
      ...workoutsByIds[params.where.id as string],
      exercises: updating.map((update) => {
         const newExercise = {
            ...exercisesByIds[update.where.id],
            exercise_order: update.data.exercise_order
         };

         exercisesByIds[update.where.id as string] = newExercise;

         return newExercise;
      })
   };

   const removing = params.data.exercises.deleteMany.id.in;

   for (const exerciseID of removing) {
      delete exercisesByIds[exerciseID];
   }

   workoutsByIds[newWorkout.id] = newWorkout;

   return newWorkout;
};

describe("Workout Exercises Service", () => {
   // Helper function to simulate database error situations
   const simulateDatabaseError = (table: string, method: string) => {
      // @ts-ignore
      prismaMock[table][method].mockRejectedValue(new Error("Database Error"));
   };

   // Helper function to handle validation errors for create/update/delete exercise methods
   const handleExerciseValidationErrors = async(method: "create" | "update") => {
      const invalidExercises = [
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? "Non-Empty-ID" : "",
               workout_id: "",
               exercise_order: -1,
               name: "      ",
               sets: []
            },
            errors: {
               id: method === "create" ?
                  ["ID for exercise must be empty or undefined"] : ["ID for exercise must be in UUID format"],
               workout_id: ["ID for workout must be in UUID format"],
               exercise_order: ["Exercise order must be non-negative"],
               name: ["A name must be at least 1 character."]
            }
         },
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? "" : workout.id,
               workout_id: workout.id,
               exercise_order: 4,
               name: "A".repeat(51),
               sets: []
            },
            errors: {
               name: ["A name must be at most 50 characters."]
            }
         },
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? "" : workout.exercises[0].id,
               exercise_order: method === "create" ? 3 : 0,
               sets: [
                  {
                     id: "Invalid-ID",
                     exercise_id: "",
                     set_order: -1
                  }
               ]
            },
            errors: method === "create" ? {} : {
               id: ["ID for set must be in UUID format"],
               set_order: ["Set order must be non-negative"],
               exercise_id: ["ID for exercise must be in UUID format"]
            },
            message: method === "create" ?
               "Exercise sets must be empty" : "Invalid exercise set fields for set with ID `Invalid-ID`"
         },
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? "" : workout.exercises[0].id,
               exercise_order: method === "create" ? 3 : 0,
               name: "exercise",
               sets: [
                  {
                     id: "",
                     exercise_id: workout.exercises[0].id,
                     set_order: 0
                  },
                  {
                     id: "",
                     exercise_id: workout.exercises[0].id,
                     set_order: 1,
                     text: ""
                  }
               ]
            },
            errors: {},
            message: method === "create" ?
               "Exercise sets must be empty" : "All exercise sets must be non-empty"
         }
      ];

      for (const { exercise, errors, message } of invalidExercises) {
         expect(
            method === "create" ?
               await addExercise(exercise as Exercise) : await updateExercise(exercise, "sets")
         ).toEqual({
            status: "Error",
            body: {
               data: null,
               message: message ?? "Invalid exercise fields",
               errors: errors
            }
         });
      }
      // @ts-ignore
      expect(prismaMock.exercises[method]).not.toHaveBeenCalled();
   };

   const handleExerciseDatabaseIntegrityErrors = async(method: "create" | "update") => {
      const invalidExercises = [
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? "" : workout.exercises[0].id,
               workout_id: "33b33227-56b1-4f10-844a-660b523e546c",
               exercise_order: 4,
               name: "A".repeat(50),
               sets: []
            },
            expected: {
               status: "Error",
               body: {
                  data: null,
                  message: "Workout does not exist based on workout ID",
                  errors: {}
               }
            }
         },
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? "" : "33b33227-56b1-4f10-844a-660b523e546c",
               workout_id: workout.id,
               exercise_order: 4
            },
            expected: {
               status: "Error",
               body: {
                  data: null,
                  message: method === "create" ?
                     "Exercise order must match current workout exercises length" : "Exercise does not exist based on workout and/or exercise ID",
                  errors: {}
               }
            }
         }
      ];

      for (const { exercise, expected } of invalidExercises) {
         expect(
            method === "create" ?
               await addExercise(exercise as Exercise) : await updateExercise(exercise, "sets")
         ).toEqual(expected);
      }

      // Simulate database error during mock database method
      simulateDatabaseError("exercises", method);

      exercise = {
         ...MOCK_EXERCISE,
         id: method === "create" ? "" : MOCK_WORKOUT.exercises[0].id,
         exercise_order: method === "create" ? 3 : 0
      };

      expect(
         method === "create" ?
            await addExercise(exercise as Exercise) : await updateExercise(exercise, "sets")
      ).toEqual({
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: { system: ["Database Error"] }
         }
      });
      expect(prismaMock.exercises[method]).toHaveBeenCalledTimes(1);
   };

   beforeEach(() => {
      // Initialize mock workout
      workout = MOCK_WORKOUT;

      // Initialize mock exercise and workout mappings
      exercisesByIds = Object.fromEntries(MOCK_WORKOUT.exercises.map((exercise) => [exercise.id, exercise]));

      workoutsByIds = Object.fromEntries(MOCK_WORKOUTS.map((workout) => [workout.id, workout]));

      // @ts-ignore
      prismaMock.exercises.findFirst.mockImplementation(async(params) => {
         return exercisesByIds[params.where.id as string] ?? null;
      });

      // @ts-ignore
      prismaMock.workouts.findFirst.mockImplementation(async(params) => {
         return workoutsByIds[params.where.id as string] ?? null;
      });

      // @ts-ignore
      prismaMock.workouts.update.mockImplementation(async(params) => {
         return handleWorkoutsDatabaseMethods(params);
      });

      // @ts-ignore
      ["create", "update"].forEach((method) => {
         prismaMock.exercises[method].mockImplementation(async(params) => {
            return handleExercisesDatabaseMethods(params, method);
         });
      });
   });

   test("Add exercise with field errors", async() => {
      await handleExerciseValidationErrors("create");
   });

   test("Add exercise with database integrity errors", async() => {
      await handleExerciseDatabaseIntegrityErrors("create");
   });

   test("Add exercise", async() => {
      exercise = {
         ...MOCK_EXERCISE,
         id: "",
         workout_id: workout.id,
         exercise_order: 3,
         name: "Name",
         sets: []
      };

      expect(await addExercise(exercise)).toEqual({
         status: "Success",
         body: {
            data: {
               ...exercise,
               id: "Mock-ID"
            },
            message: "Successfully added new exercise",
            errors: {}
         }
      });
      expect(prismaMock.exercises.create).toHaveBeenCalledWith({
         data: {
            workout_id: workout.id,
            name: exercise.name.trim(),
            exercise_order: 3
         },
         include: {
            sets: {
               orderBy: {
                  set_order: "asc"
               }
            }
         }
      });

      simulateDatabaseError("exercises", "create");

      expect(await addExercise(exercise)).toEqual({
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: { system: ["Database Error"] }
         }
      });
      expect(prismaMock.exercises.create).toHaveBeenCalledTimes(2);
   });

   test("Update exercise with field errors", async() => {
      await handleExerciseValidationErrors("update");
   });

   test("Update exercise with database integrity errors", async() => {
      await handleExerciseDatabaseIntegrityErrors("update");
   });

   test("Update exercise", async() => {
      // Update exercise name
      exercise = {
         ...MOCK_WORKOUT.exercises[0],
         name: "Updated name"
      };

      expect(await updateExercise(exercise, "name")).toEqual({
         status: "Success",
         body: {
            data: {
               ...exercise,
               name: exercise.name.trim()
            },
            message: "Successfully updated exercise name",
            errors: {}
         }
      });
      expect(prismaMock.exercises.update).toHaveBeenCalledWith({
         where: {
            id: exercise.id,
            workout_id: workout.id
         },
         data: {
            name: exercise.name.trim()
         },
         include: {
            sets: {
               orderBy: {
                  set_order: "asc"
               }
            }
         }
      });

      // Update exercise sets
      const newExerciseSets: ExerciseSet[] = [
         {
            id: "",
            exercise_id: exercise.id,
            set_order: 2,
            weight: 100,
            repetitions: 100,
            text: "text"
         },
         {
            id: "",
            exercise_id: exercise.id,
            set_order: 3,
            hours: 1
         }
      ];

      exercise = {
         ...exercise,
         sets: [
            workout.exercises[0].sets[0],
            workout.exercises[0].sets[1],
            ...newExerciseSets
         ]
      };

      const { creating, updating, removing, error, errors } =
         await getExerciseSetUpdates(workout.exercises[0], exercise);

      expect(removing.id.in).toEqual([workout.exercises[0].sets[2].id]);
      expect(creating.data).toHaveLength(2);
      expect(updating).toHaveLength(2);
      expect(error).toBeUndefined();
      expect(errors).toBeUndefined();

      const expectedNewExercise = {
         ...exercise,
         sets: [
            exercise.sets[0],
            exercise.sets[1],
            {
               ...newExerciseSets[0],
               id: "Mock-ID-0"
            },
            {
               ...newExerciseSets[1],
               id: "Mock-ID-1"
            }
         ]
      };

      expect(await updateExercise(exercise, "sets")).toEqual({
         status: "Success",
         body: {
            data: expectedNewExercise,
            message: "Successfully updated exercise sets",
            errors: {}
         }
      });
      expect(exercisesByIds[exercise.id]).toEqual(expectedNewExercise);
      expect(prismaMock.exercises.update).toHaveBeenCalledWith({
         where: {
            id: exercise.id,
            workout_id: workout.id
         },
         data: {
            sets: {
               deleteMany: removing,
               updateMany: updating,
               createMany: creating
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

      simulateDatabaseError("exercises", "update");

      expect(await updateExercise(exercise, "sets")).toEqual({
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: { system: ["Database Error"] }
         }
      });
      expect(prismaMock.exercises.update).toHaveBeenCalledTimes(3);
   });

   test("Update exercises with field errors", async() => {
      // Invalid workout ID
      workout = {
         ...MOCK_WORKOUT,
         id: ""
      };

      expect(
         await updateExercises(workout)
      ).toEqual({
         status: "Error",
         body: {
            data: null,
            message: "Invalid workout ID fields",
            errors: { workout_id: ["ID for workout must be in UUID format"] }
         }
      });

      // Invalid exercise fields
      workout = {
         ...workout,
         id: MOCK_WORKOUT.id,
         exercises: [
            workout.exercises[0],
            workout.exercises[1],
            {
               ...workout.exercises[2],
               id: "",
               name: "",
               exercise_order: -1
            }
         ]
      };

      expect(
         await updateExercises(workout)
      ).toEqual({
         status: "Error",
         body: {
            data: null,
            message: "Invalid exercise fields",
            errors: {
               id: ["ID for exercise must be in UUID format"],
               exercise_order: ["Exercise order must be non-negative"],
               name: ["A name must be at least 1 character."]
            }
         }
      });
   });

   test("Update exercises with database integrity errors", async() => {
      // Missing workout
      workout = {
         ...MOCK_WORKOUT,
         id: MOCK_WORKOUT.exercises[0].id
      };

      expect(
         await updateExercises(workout)
      ).toEqual({
         status: "Error",
         body: {
            data: null,
            message: "Workout does not exist based on workout ID",
            errors: {}
         }
      });
   });

   test("Update exercises", async() => {
      // Remove first exercise and swap last two exercises
      workout = {
         ...MOCK_WORKOUT,
         exercises: [
            {
               ...MOCK_WORKOUT.exercises[2],
               exercise_order: 0
            },
            {
               ...MOCK_WORKOUT.exercises[1],
               exercise_order: 10
            }
         ]
      };

      const { updating, removing } = await getExercisesUpdates(
         MOCK_WORKOUT,
         workout
      );

      expect(removing.id.in).toEqual([MOCK_WORKOUT.exercises[0].id]);
      expect(updating).toHaveLength(2);

      expect(
         await updateExercises(workout)
      ).toEqual({
         status: "Success",
         body: {
            // Ensure exercise_order for all exercises remain within 0th index range
            data: [
               {
                  ...workout.exercises[0],
                  exercise_order: 0
               },
               {
                  ...workout.exercises[1],
                  exercise_order: 1
               }
            ],
            message: "Successfully updated workout exercise ordering",
            errors: {}
         }
      });
      expect(prismaMock.workouts.update).toHaveBeenCalledWith({
         where: { id: workout.id },
         data: {
            exercises: {
               deleteMany: removing,
               updateMany: updating
            }
         },
         include: {
            exercises: {
               include: { sets: { orderBy: { set_order: "asc" } } },
               orderBy: { exercise_order: "asc" }
            }
         }
      });
      expect(exercisesByIds[MOCK_WORKOUT.exercises[2].id].exercise_order).toBe(0);
      expect(exercisesByIds[MOCK_WORKOUT.exercises[1].id].exercise_order).toBe(1);
      expect(exercisesByIds[MOCK_WORKOUT.exercises[0].id]).toBeUndefined();

      simulateDatabaseError("workouts", "update");

      expect(await updateExercises(workout)).toEqual({
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: { system: ["Database Error"] }
         }
      });
      expect(prismaMock.workouts.update).toHaveBeenCalledTimes(2);
   });
});