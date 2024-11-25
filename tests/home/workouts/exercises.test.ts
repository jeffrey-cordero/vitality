import { expect } from "@jest/globals";
import { prismaMock } from "@/tests/singleton";
import { workouts } from "@/tests/home/workouts/data";
import { Workout } from "@/lib/home/workouts/workouts";
import {
   addExercise,
   Exercise,
   ExerciseSet,
   getExerciseOrderingUpdates,
   getExerciseSetUpdates,
   updateExercise,
   updateExerciseOrderings
} from "@/lib/home/workouts/exercises";
import { VitalityResponse } from "@/lib/global/response";

let workout: Workout;
const mockWorkout: Workout = workouts[0];
let exercise: Exercise;
let expected: VitalityResponse<Exercise | Exercise[]>;
let exercisesByIds: { [id: string]: Exercise };
let workoutsByIds: { [id: string]: Workout };

const handleExerciseDatabaseMethods = async(params, method) => {
   let newExercise: Exercise;

   if (method === "update") {
      newExercise = {
         ...exercisesByIds[params.where.id],
         ...params.data
      };

      if (params.data.sets) {
      // Account for adding, removing, updating exercise sets
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

const handleWorkoutsDatabaseUpdate = async(params) => {
   const newWorkout: Workout = {
      ...workoutsByIds[params.where.id as string],
      exercises: params.data.exercises.updateMany.map((update) => {
         const newExercise = {
            ...exercisesByIds[update.where.id],
            exercise_order: update.data.exercise_order
         };

         exercisesByIds[update.where.id as string] = newExercise;

         return newExercise;
      })
   };

   for (const exerciseID of params.data.exercises.deleteMany.id.in) {
      delete exercisesByIds[exerciseID];
   }

   workoutsByIds[newWorkout.id] = newWorkout;

   return newWorkout;
};

describe("Workout Tracking Validation", () => {
   beforeEach(() => {
      // Initialize mock workout
      workout = mockWorkout;

      // Initialize mock exercise mappings
      exercisesByIds = Object.fromEntries(
         mockWorkout.exercises.map((exercise) => [exercise.id, exercise])
      );

      workoutsByIds = Object.fromEntries(
         workouts.map((workout) => [workout.id, workout])
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
         return handleWorkoutsDatabaseUpdate(params);
      });

      ["create", "update"].forEach((method) => {
      // @ts-ignore
         prismaMock.exercises[method].mockImplementation(async(params) => {
            return handleExerciseDatabaseMethods(params, method);
         });
      });
   });

   test("Add exercise with field errors", async() => {
      exercise = {
         id: "Non-Empty-ID",
         workout_id: "",
         exercise_order: -1,
         name: "      ",
         sets: []
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid exercise fields",
            errors: {
               id: ["ID for exercise must be empty or undefined"],
               workout_id: ["ID for workout must be in UUID format"],
               exercise_order: ["Exercise order must be non-negative"],
               name: ["A name must be at least 1 character."]
            }
         }
      };

      expect(await addExercise(exercise)).toEqual(expected);

      exercise = {
         id: "",
         workout_id: workout.id,
         exercise_order: 4,
         name: "A".repeat(51),
         sets: []
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid exercise fields",
            errors: {
               name: ["A name must be at most 50 characters."]
            }
         }
      };

      expect(await addExercise(exercise)).toEqual(expected);
      expect(prismaMock.exercises.create).not.toHaveBeenCalled();
   });

   test("Add exercise with database integrity errors", async() => {
      // Missing workout
      exercise = {
         id: "",
         workout_id: "33b33227-56b1-4f10-844a-660b523e546c",
         exercise_order: 4,
         name: "A".repeat(50),
         sets: []
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Workout does not exist based on workout ID",
            errors: {}
         }
      };

      expect(await addExercise(exercise)).toEqual(expected);

      // Adding exercise order index should be total exercises length
      exercise.workout_id = workout.id;

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Exercise order must match current workout exercises length",
            errors: {}
         }
      };

      expect(await addExercise(exercise)).toEqual(expected);
   });

   test("Add exercise", async() => {
      exercise = {
         id: "",
         workout_id: workout.id,
         exercise_order: 3,
         name: "Name",
         sets: []
      };

      expected = {
         status: "Success",
         body: {
            data: {
               ...exercise,
               id: "Mock-ID"
            },
            message: "Successfully added new exercise",
            errors: {}
         }
      };

      expect(await addExercise(exercise)).toEqual(expected);
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

      // Simulate database error
      prismaMock.exercises.create.mockRejectedValue(
         new Error("Database Connection Error")
      );

      expected = {
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: { system: ["Database Connection Error"] }
         }
      };

      expect(await addExercise(exercise)).toEqual(expected);
      expect(prismaMock.exercises.create).toHaveBeenCalledTimes(2);
   });

   test("Update exercise with field errors", async() => {
      // Field errors in general properties
      exercise = {
         id: "Invalid-ID",
         workout_id: "",
         exercise_order: 3,
         name: "",
         sets: [
            {
               id: "Invalid-ID",
               exercise_id: "",
               set_order: -1
            }
         ]
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid exercise fields",
            errors: {
               id: ["ID for exercise must be in UUID format"],
               workout_id: ["ID for workout must be in UUID format"],
               name: ["A name must be at least 1 character."]
            }
         }
      };

      expect(await updateExercise(exercise, "name")).toEqual(expected);

      exercise = {
         ...exercise,
         id: workout.exercises[0].id,
         workout_id: workout.id,
         name: "B".repeat(51)
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid exercise fields",
            errors: { name: ["A name must be at most 50 characters."] }
         }
      };

      expect(await updateExercise(exercise, "name")).toEqual(expected);

      // Field errors in exercise set array
      exercise.name = "AC";

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid exercise set fields for set ID Invalid-ID",
            errors: {
               id: ["ID for user must be in UUID format"],
               exercise_id: ["ID for exercise must be in UUID format"],
               set_order: ["Set order must be non-negative"]
            }
         }
      };

      expect(await updateExercise(exercise, "sets")).toEqual(expected);

      exercise = {
         id: workout.exercises[0].id,
         workout_id: workout.id,
         exercise_order: 4,
         name: "A",
         sets: [
            {
               id: "",
               exercise_id: workout.exercises[0].id,
               set_order: 0
            },
            {
               id: "",
               exercise_id: workout.exercises[0].id,
               set_order: 1
            }
         ]
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "All exercise sets must be non-empty",
            errors: {}
         }
      };

      expect(await updateExercise(exercise, "sets")).toEqual(expected);
   });

   test("Update exercise with database integrity errors", async() => {
      // Missing workout
      exercise = {
         id: "33b33227-56b1-4f10-844a-660b523e546d",
         workout_id: "33b33227-56b1-4f10-844a-660b523e546c",
         exercise_order: 4,
         name: "A".repeat(50),
         sets: []
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Workout does not exist based on workout ID",
            errors: {}
         }
      };

      expect(await updateExercise(exercise, "name")).toEqual(expected);

      // Missing exercise
      exercise.workout_id = workout.id;

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Exercise does not exist based on workout and/or exercise ID",
            errors: {}
         }
      };

      expect(await updateExercise(exercise, "name")).toEqual(expected);
   });

   test("Update exercise", async() => {
      // Update exercise name
      exercise = {
         ...mockWorkout.exercises[0],
         name: "Updated name"
      };

      expected = {
         status: "Success",
         body: {
            data: {
               ...exercise,
               name: exercise.name.trim()
            },
            message: "Successfully updated exercise name",
            errors: {}
         }
      };

      expect(await updateExercise(exercise, "name")).toEqual(expected);
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

      expected = {
         status: "Success",
         body: {
            data: expectedNewExercise,
            message: "Successfully updated exercise sets",
            errors: {}
         }
      };
      expect(await updateExercise(exercise, "sets")).toEqual(expected);
      expect(exercisesByIds[exercise.id]).toEqual(expectedNewExercise);
      expect(prismaMock.exercises.update).toHaveBeenCalledWith({
         where: {
            id: exercise.id,
            workout_id: workout.id
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

      // Simulate database error
      prismaMock.exercises.update.mockRejectedValue(
         new Error("Database Connection Error")
      );

      expected = {
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: { system: ["Database Connection Error"] }
         }
      };

      expect(await updateExercise(exercise, "sets")).toEqual(expected);
      expect(prismaMock.exercises.update).toHaveBeenCalledTimes(3);
   });

   test("Update exercise ordering with field errors", async() => {
      // Invalid workout ID
      workout = {
         ...mockWorkout,
         id: ""
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid workout ID fields",
            errors: { workout_id: ["ID for workout must be in UUID format"] }
         }
      };

      expect(
         await updateExerciseOrderings(workout.exercises, workout.id)
      ).toEqual(expected);

      // Invalid exercise fields
      workout = {
         ...workout,
         id: mockWorkout.id,
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

      expected = {
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
      };

      expect(
         await updateExerciseOrderings(workout.exercises, workout.id)
      ).toEqual(expected);
   });

   test("Update exercise ordering with database integrity errors", async() => {
      // Missing workout
      workout = {
         ...mockWorkout,
         id: mockWorkout.exercises[0].id
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Workout does not exist based on workout ID",
            errors: {}
         }
      };

      expect(
         await updateExerciseOrderings(workout.exercises, workout.id)
      ).toEqual(expected);
   });

   test("Update exercise ordering", async() => {
      // Remove first exercise and swap last two exercises
      workout = {
         ...mockWorkout,
         exercises: [
            {
               ...mockWorkout.exercises[2],
               exercise_order: 0
            },
            {
               ...mockWorkout.exercises[1],
               exercise_order: 10
            }
         ]
      };

      const { updating, removing } = await getExerciseOrderingUpdates(
         mockWorkout,
         workout.exercises
      );

      expect(removing.id.in).toEqual([mockWorkout.exercises[0].id]);
      expect(updating).toHaveLength(2);

      expected = {
         status: "Success",
         body: {
            data: [
               workout.exercises[0],
               // Ensure exercise_order remains within 0th index bound regardless of provided value
               {
                  ...workout.exercises[1],
                  exercise_order: 1
               }
            ],
            message: "Successfully updated workout exercise ordering",
            errors: {}
         }
      };

      expect(
         await updateExerciseOrderings(workout.exercises, workout.id)
      ).toEqual(expected);
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

      expect(exercisesByIds[mockWorkout.exercises[2].id].exercise_order).toBe(0);
      expect(exercisesByIds[mockWorkout.exercises[1].id].exercise_order).toBe(1);
      expect(exercisesByIds[mockWorkout.exercises[0].id]).toBeUndefined();

      // Simulate database error
      prismaMock.workouts.update.mockRejectedValue(
         new Error("Database Connection Error")
      );

      expected = {
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: { system: ["Database Connection Error"] }
         }
      };

      expect(await updateExerciseOrderings(workout.exercises, workout.id)).toEqual(expected);
      expect(prismaMock.workouts.update).toHaveBeenCalledTimes(2);
   });
});
