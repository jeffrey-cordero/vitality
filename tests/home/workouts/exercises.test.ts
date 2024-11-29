import { expect } from "@jest/globals";
import { prismaMock } from "@/tests/singleton";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { workouts } from "@/tests/home/workouts/data";
import { Workout } from "@/lib/home/workouts/workouts";
import { addExercise, Exercise, getExercisesUpdates, getExerciseSetUpdates, updateExercise, updateExercises } from "@/lib/home/workouts/exercises";

const MOCK_WORKOUTS = workouts;
const MOCK_WORKOUT: Workout = MOCK_WORKOUTS[0];
const MOCK_EXERCISE: Exercise = {
   id: "",
   exercise_order: 0,
   workout_id: MOCK_WORKOUT.id,
   name: "Name",
   sets: []
};

let workout: Workout;
let exercise: Exercise;
let exercisesByIds: { [id: string]: Exercise };
let workoutsByIds: { [id: string]: Workout };

describe("Workout Exercises Tests", () => {
   const handleExerciseFieldErrors = async(method: "create" | "update") => {
      const invalidExercises = [
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? MOCK_ID : "",
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
                     id: `${MOCK_ID}$`,
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
               "Exercise sets must be empty" : `Invalid exercise set fields for set with ID \`${MOCK_ID}$\``
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
               "Exercise sets must be empty" : "All exercise sets must be valid and non-empty"
         }
      ];

      for (const { exercise, errors, message } of invalidExercises) {
         expect(
            method === "create" ?
               await addExercise(exercise) : await updateExercise(exercise, "sets")
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

   const handleExerciseDatabaseErrors = async(method: "create" | "update") => {
      const invalidExercises = [
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? "" : workout.exercises[0].id,
               workout_id: MOCK_ID,
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
               id: method === "create" ? "" : MOCK_ID,
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
               await addExercise(exercise) : await updateExercise(exercise, "sets")
         ).toEqual(expected);
      }

      exercise = {
         ...MOCK_EXERCISE,
         id: method === "create" ? "" : MOCK_WORKOUT.exercises[0].id,
         exercise_order: method === "create" ? 3 : 0
      };

      simulateDatabaseError("exercises", method, method === "create" ?
         async() => addExercise(exercise) : async() => updateExercise(exercise, "sets"));
   };

   const handlePrismaMockExerciseMethods = async(params, method) => {
      let newExercise: Exercise;

      if (method === "update") {
         newExercise = {
            ...exercisesByIds[params.where.id],
            ...params.data
         };

         if (params.data.sets) {
            // Mock adding, removing, and updating exercise set entries
            newExercise.sets = [
               ...params.data.sets.updateMany.map((update) => ({
                  ...update.data,
                  exercise_id: params.where.id
               })),
               ...params.data.sets.createMany.data.map((create, index) => ({
                  ...create,
                  id: `${MOCK_ID}${index}`,
                  exercise_id: params.where.id
               }))
            ];
         }
      } else {
         newExercise = {
            ...params.data,
            id: MOCK_ID,
            sets: []
         };
      }

      exercisesByIds[newExercise.id] = newExercise;

      return newExercise;
   };

   const handlePrismaMockWorkoutMethods = async(params) => {
      // Mock updating/deleting workout exercise entries
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

   beforeEach(() => {
      // Initialize mock workout
      workout = MOCK_WORKOUT;

      // Initialize mock exercise and workout mappings
      exercisesByIds = Object.fromEntries(MOCK_WORKOUT.exercises.map(
         (exercise) => [exercise.id, exercise])
      );

      workoutsByIds = Object.fromEntries(MOCK_WORKOUTS.map(
         (workout) => [workout.id, workout])
      );

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
         return handlePrismaMockWorkoutMethods(params);
      });

      // @ts-ignore
      ["create", "update"].forEach((method) => {
         prismaMock.exercises[method].mockImplementation(async(params) => {
            return handlePrismaMockExerciseMethods(params, method);
         });
      });
   });

   describe("Add workout exercise", () => {
      test("Add workout exercise with errors", async() => {
         await handleExerciseFieldErrors("create");
      });

      test("Handle database constraints when adding workout exercise", async() => {
         await handleExerciseDatabaseErrors("create");
      });

      test("Add valid workout exercise", async() => {
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
                  id: MOCK_ID
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
         } as any);
      });
   });

   describe("Update workout exercise", () => {
      test("Update workout exercise with errors", async() => {
         await handleExerciseFieldErrors("update");
      });

      test("Handle database constraints when updating workout exercise", async() => {
         await handleExerciseDatabaseErrors("update");
      });

      test("Update valid workout exercise", async() => {
         // Update workout exercise name
         exercise = {
            ...MOCK_WORKOUT.exercises[0],
            name: " Updated name "
         };

         expect(await updateExercise(exercise, "name")).toEqual({
            status: "Success",
            body: {
               data: {
                  ...exercise,
                  name: "Updated name"
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
               name: "Updated name"
            },
            include: {
               sets: {
                  orderBy: {
                     set_order: "asc"
                  }
               }
            }
         } as any);

         // Update workout exercise sets
         const newExerciseSets = [
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

         expect(removing.id.in).toEqual(
            [workout.exercises[0].sets[2].id]
         );
         expect(creating.data).toHaveLength(2);
         expect(updating).toHaveLength(2);
         expect(error).toBeUndefined();
         expect(errors).toBeUndefined();

         const expectedNewExercise = {
            ...exercise,
            name:  "Updated name",
            sets: [
               exercise.sets[0],
               exercise.sets[1],
               {
                  ...newExerciseSets[0],
                  id: `${MOCK_ID}${0}`
               },
               {
                  ...newExerciseSets[1],
                  id: `${MOCK_ID}${1}`
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
         } as any);
      });
   });

   describe("Update overall workout exercises", () => {
      test("Update overall workout exercises with errors", async() => {
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

      test("Handle database constraints when updating overall exercises", async() => {
         // Missing workout
         workout = {
            ...MOCK_WORKOUT,
            id: MOCK_ID
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

      test("Update valid overall workout exercises", async() => {
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
         // Ensure exercise_order for all exercises remain within 0th index range
         expect(
            await updateExercises(workout)
         ).toEqual({
            status: "Success",
            body: {
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
         } as any);
         expect(exercisesByIds[MOCK_WORKOUT.exercises[2].id].exercise_order).toBe(0);
         expect(exercisesByIds[MOCK_WORKOUT.exercises[1].id].exercise_order).toBe(1);
         expect(exercisesByIds[MOCK_WORKOUT.exercises[0].id]).toBeUndefined();

         simulateDatabaseError("workouts", "update", async() => await updateExercises(workout));
      });
   });
});