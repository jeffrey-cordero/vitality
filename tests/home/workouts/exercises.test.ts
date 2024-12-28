import { expect } from "@jest/globals";

import { addExercise, Exercise, ExerciseEntry, getExerciseEntryOrderUpdates, getExerciseOrderUpdates, isEmptyExerciseEntry, updateExercise, updateExercises } from "@/lib/home/workouts/exercises";
import { Workout } from "@/lib/home/workouts/workouts";
import { workouts } from "@/tests/home/workouts/data";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { prismaMock } from "@/tests/singleton";

const MOCK_WORKOUTS = workouts;
const MOCK_WORKOUT: Workout = MOCK_WORKOUTS[0];
const MOCK_EXERCISE: Exercise = {
   id: "",
   exercise_order: 0,
   workout_id: MOCK_WORKOUT.id,
   name: "Name",
   entries: []
};

let workout: Workout;
let exercise: Exercise;
let exercisesByIds: { [id: string]: Exercise };
let workoutsByIds: { [id: string]: Workout };

describe("Workout Exercises Tests", () => {
   const testExerciseFieldErrors = async(method: "create" | "update") => {
      const invalidExercises = [
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? MOCK_ID : "",
               workout_id: "",
               exercise_order: -1,
               name: "      ",
               entries: []
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
               entries: []
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
               entries: [
                  {
                     id: `${MOCK_ID}$`,
                     exercise_id: "",
                     entry_order: -1
                  }
               ]
            },
            errors: method === "create" ? {} : {
               id: ["ID for entry must be in UUID format"],
               entry_order: ["Entry order must be non-negative"],
               exercise_id: ["ID for exercise must be in UUID format"]
            },
            message: method === "create" ?
               "Exercise entries must be empty" : `Invalid exercise entry fields for entry with ID \`${MOCK_ID}$\``
         },
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? "" : workout.exercises[0].id,
               exercise_order: method === "create" ? 3 : 0,
               name: "exercise",
               entries: [
                  {
                     id: "",
                     exercise_id: workout.exercises[0].id,
                     entry_order: 0
                  },
                  {
                     id: "",
                     exercise_id: workout.exercises[0].id,
                     entry_order: 1,
                     text: ""
                  }
               ]
            },
            errors: {},
            message: method === "create" ?
               "Exercise entries must be empty" : "All exercise entries must be valid and non-empty"
         }
      ];

      for (const { exercise, errors, message } of invalidExercises) {
         expect(
            method === "create" ?
               await addExercise(workout.user_id, exercise) : await updateExercise(workout.user_id, exercise, "entries")
         ).toEqual({
            status: "Error",
            body: {
               data: null,
               message: message ?? "Invalid exercise fields",
               errors: errors
            }
         });

         message === "Exercise entries must be empty" && (
            expect(exercise.entries.some(
               (entry: ExerciseEntry) => isEmptyExerciseEntry(entry))
            )
         );
      }

      // @ts-ignore
      expect(prismaMock.exercises[method]).not.toHaveBeenCalled();
   };

   const testExerciseTableErrors = async(method: "create" | "update") => {
      const invalidExercises = [
         {
            exercise: {
               ...MOCK_EXERCISE,
               id: method === "create" ? "" : workout.exercises[0].id,
               workout_id: MOCK_ID,
               exercise_order: 4,
               name: "A".repeat(50),
               entries: []
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
               await addExercise(workout.user_id, exercise) : await updateExercise(workout.user_id, exercise, "entries")
         ).toEqual(expected);
      }

      exercise = {
         ...MOCK_EXERCISE,
         id: method === "create" ? "" : MOCK_WORKOUT.exercises[0].id,
         exercise_order: method === "create" ? 3 : 0
      };

      simulateDatabaseError("exercises", method, method === "create" ?
         async() => addExercise(MOCK_ID, exercise) : async() => updateExercise(MOCK_ID, exercise, "entries"));
   };

   const applyExerciseTableMethods = async(params, method) => {
      let newExercise;

      if (method === "update") {
         newExercise = {
            ...exercisesByIds[params.where.id],
            ...params.data,
            exercise_entries: exercisesByIds[params.where.id].entries
         };

         if (params.data?.exercise_entries) {
            // Mock adding, removing, and updating exercise entry entries
            newExercise.exercise_entries = [
               ...params.data?.exercise_entries.updateMany.map((update) => ({
                  ...update.data,
                  exercise_id: params.where.id
               })),
               ...params.data?.exercise_entries.createMany.data?.map((create, index) => ({
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
            exercise_entries: []
         };
      }

      exercisesByIds[newExercise.id] = newExercise;

      return newExercise;
   };

   const applyWorkoutsTableMethods = async(params) => {
      // Mock updating/deleting workout exercise entries
      const updating = params.data?.exercises.updateMany;

      const newWorkout: Workout = {
         ...workoutsByIds[params.where.id as string],
         exercises: updating.map((update) => {
            const newExercise = {
               ...exercisesByIds[update.where.id],
               exercise_order: update.data?.exercise_order
            };

            exercisesByIds[update.where.id as string] = newExercise;

            return newExercise;
         })
      };

      const removing = params.data?.exercises.deleteMany.id.in;

      for (const exerciseID of removing) {
         delete exercisesByIds[exerciseID];
      }

      workoutsByIds[newWorkout.id] = newWorkout;

      return newWorkout;
   };

   beforeEach(() => {
      // Reset mock workout
      workout = MOCK_WORKOUT;

      // Reset mock workouts and exercises
      workoutsByIds = Object.fromEntries(MOCK_WORKOUTS.map(
         (workout) => [workout.id, workout])
      );

      exercisesByIds = Object.fromEntries(MOCK_WORKOUT.exercises.map(
         (exercise) => [exercise.id, exercise])
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
         return applyWorkoutsTableMethods(params);
      });

      // @ts-ignore
      ["create", "update"].forEach((method) => {
         prismaMock.exercises[method].mockImplementation(async(params) => {
            return applyExerciseTableMethods(params, method);
         });
      });
   });

   describe("Create exercise", () => {
      test("Should fail to create exercise when fields are invalid", async() => {
         await testExerciseFieldErrors("create");
      });

      test("Should fail to create exercise when a database conflict or error occurs", async() => {
         await testExerciseTableErrors("create");
      });

      test("Should succeed in creating exercise with valid fields", async() => {
         exercise = {
            ...MOCK_EXERCISE,
            id: "",
            workout_id: workout.id,
            exercise_order: 3,
            name: "Name",
            entries: []
         };

         expect(await addExercise(workout.user_id, exercise)).toEqual({
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
               exercise_entries: {
                  orderBy: {
                     entry_order: "asc"
                  }
               }
            }
         } as any);
      });
   });

   describe("Update exercise", () => {
      test("Should fail to update exercise when fields are invalid", async() => {
         await testExerciseFieldErrors("update");
      });

      test("Should fail to update exercise when a database conflict or error occurs", async() => {
         await testExerciseTableErrors("update");
      });

      test("Should succeed in updating exercise with valid fields", async() => {
         // Update workout exercise name
         exercise = {
            ...MOCK_WORKOUT.exercises[0],
            name: " Updated name "
         };

         expect(await updateExercise(workout.user_id, exercise, "name")).toEqual({
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
               exercise_entries: {
                  orderBy: {
                     entry_order: "asc"
                  }
               }
            }
         } as any);

         // Update workout exercise entries
         const newExerciseEntries = [
            {
               id: "",
               exercise_id: exercise.id,
               entry_order: 2,
               weight: 100,
               repetitions: 100,
               text: "text"
            },
            {
               id: "",
               exercise_id: exercise.id,
               entry_order: 3,
               hours: 1
            }
         ];

         exercise = {
            ...exercise,
            entries: [
               workout.exercises[0].entries[0],
               workout.exercises[0].entries[1],
               ...newExerciseEntries
            ]
         };

         const { creating, updating, removing, error, errors } =
            await getExerciseEntryOrderUpdates(workout.exercises[0], exercise);

         expect(removing.id.in).toEqual(
            [workout.exercises[0].entries[2].id]
         );
         expect(creating.data).toHaveLength(2);
         expect(updating).toHaveLength(2);
         expect(error).toBeNull();
         expect(errors).toBeNull();

         const expectedNewExercise = {
            ...exercise,
            name:  "Updated name",
            entries: [
               exercise.entries[0],
               exercise.entries[1],
               {
                  ...newExerciseEntries[0],
                  id: `${MOCK_ID}${0}`
               },
               {
                  ...newExerciseEntries[1],
                  id: `${MOCK_ID}${1}`
               }
            ]
         };

         expect(await updateExercise(workout.user_id, exercise, "entries")).toEqual({
            status: "Success",
            body: {
               data: expectedNewExercise,
               message: "Successfully updated exercise entries",
               errors: {}
            }
         });
         expect(prismaMock.exercises.update).toHaveBeenCalledWith({
            where: {
               id: exercise.id,
               workout_id: workout.id
            },
            data: {
               exercise_entries: {
                  deleteMany: removing,
                  updateMany: updating,
                  createMany: creating
               }
            },
            include: {
               exercise_entries: {
                  orderBy: {
                     entry_order: "asc"
                  }
               }
            }
         } as any);
      });
   });

   describe("Update exercise ordering", () => {
      test("Should fail to update exercise ordering when fields are invalid", async() => {
         // Invalid workout ID
         workout = {
            ...MOCK_WORKOUT,
            id: ""
         };

         expect(
            await updateExercises(workout.user_id, workout)
         ).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Invalid workout fields",
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
            await updateExercises(workout.user_id, workout)
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

         workout = {
            ...workout,
            id: workouts[0].id,
            user_id: workouts[0].user_id,
            exercises: []
         };

         simulateDatabaseError("workouts", "update", async() => await updateExercises(workout.user_id, workout));
      });

      test("Should fail to update exercise ordering when a database conflict or error occurs", async() => {
         // Missing workout
         workout = {
            ...MOCK_WORKOUT,
            id: MOCK_ID
         };

         expect(
            await updateExercises(workout.user_id, workout)
         ).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Workout does not exist based on workout ID",
               errors: {}
            }
         });
      });

      test("Should succeed in updating exercise ordering with valid fields", async() => {
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

         const { updating, removing } = await getExerciseOrderUpdates(
            MOCK_WORKOUT,
            workout
         );

         expect(removing.id.in).toEqual([MOCK_WORKOUT.exercises[0].id]);
         expect(updating).toHaveLength(2);
         expect(
            await updateExercises(workout.user_id, workout)
         ).toEqual({
            status: "Success",
            body: {
               data: [
                  // Valid exercise_order for all exercises
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
         // @ts-ignore
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
         } as any);
         expect(exercisesByIds[MOCK_WORKOUT.exercises[2].id].exercise_order).toBe(0);
         expect(exercisesByIds[MOCK_WORKOUT.exercises[1].id].exercise_order).toBe(1);
         expect(exercisesByIds[MOCK_WORKOUT.exercises[0].id]).toBeUndefined();
      });
   });
});