import { expect } from "@jest/globals";
import { prismaMock } from "@/singleton";
import { workouts } from "@/tests/home/workouts/data";
import { Workout } from "@/lib/home/workouts/workouts";
import {
  addExercise,
  Exercise,
  getExerciseSetUpdates,
  updateExercise,
} from "@/lib/home/workouts/exercises";
import { VitalityResponse } from "@/lib/global/response";

let workout: Workout;
let exercise: Exercise;
let expected: VitalityResponse<Exercise | Workout>;
let exercisesByIds: { [id: string]: Exercise };

const handleExerciseDatabaseMethods = async (params, method) => {
  let newExercise = {
    id: method === "create" ? "Mock-ID" : params.where.id,
  };

  if (method === "update") {
    newExercise = {
      ...exercisesByIds[params.where.id],
      ...params.data,
    };

    if (params.data.sets) {
      // Account for adding, removing, updating exercise sets
    }
  } else {
    newExercise = {
      ...params.data,
      id: "Mock-ID",
      sets: [],
    };
  }

  return newExercise;
};

describe("Workout Tracking Validation", () => {
  beforeEach(() => {
    // Initialize mock workout
    const mockWorkout = workouts[0];
    workout = mockWorkout;

    // Initialize mock exercise mappings
    exercisesByIds = Object.fromEntries(
      mockWorkout.exercises.map((exercise) => [exercise.id, exercise])
    );

    // @ts-ignore
    prismaMock.exercises.findFirst.mockImplementation(async (params) => {
      if (
        params.where.workout_id !== mockWorkout.id ||
        !exercisesByIds[params.where.id as string]
      ) {
        return null;
      } else {
        return exercisesByIds[params.where.id as string];
      }
    });

    // @ts-ignore
    prismaMock.workouts.findFirst.mockImplementation(async (params) => {
      if (params.where.id !== mockWorkout.id) {
        return null;
      } else {
        return mockWorkout;
      }
    });

    ["create", "update"].forEach((method) => {
      // @ts-ignore
      prismaMock.exercises[method].mockImplementation(async (params) => {
        return handleExerciseDatabaseMethods(params, method);
      });
    });
  });

  test("Add exercise with field errors", async () => {
    exercise = {
      id: "Non-Empty-ID",
      workout_id: "",
      exercise_order: -1,
      name: "      ",
      sets: [],
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
          name: ["A name must be at least 1 character."],
        },
      },
    };

    expect(await addExercise(exercise)).toEqual(expected);

    exercise = {
      id: "",
      workout_id: workout.id,
      exercise_order: 4,
      name: "A".repeat(51),
      sets: [],
    };

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Invalid exercise fields",
        errors: {
          name: ["A name must be at most 50 characters."],
        },
      },
    };

    expect(await addExercise(exercise)).toEqual(expected);
    expect(prismaMock.exercises.create).not.toHaveBeenCalled();
  });

  test("Add exercise with database integrity errors", async () => {
    // Missing workout
    exercise = {
      id: "",
      workout_id: "33b33227-56b1-4f10-844a-660b523e546c",
      exercise_order: 4,
      name: "A".repeat(50),
      sets: [],
    };

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Workout does not exist based on workout ID",
        errors: {},
      },
    };

    expect(await addExercise(exercise)).toEqual(expected);

    // Adding exercise order index should be total exercises length
    exercise.workout_id = workout.id;

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Exercise order must match current workout exercises length",
        errors: {},
      },
    };

    expect(await addExercise(exercise)).toEqual(expected);
  });

  test("Add exercise", async () => {
    exercise = {
      id: "",
      workout_id: workout.id,
      exercise_order: 3,
      name: "Name",
      sets: [],
    };

    expected = {
      status: "Success",
      body: {
        data: {
          ...exercise,
          id: "Mock-ID",
        },
        message: "Successfully added new exercise",
        errors: {},
      },
    };

    expect(await addExercise(exercise)).toEqual(expected);

    // Simulate database error
    prismaMock.exercises.create.mockRejectedValue(
      new Error("Database Connection Error")
    );

    expected = {
      status: "Failure",
      body: {
        data: null,
        message: "Something went wrong. Please try again.",
        errors: { system: ["Database Connection Error"] },
      },
    };

    expect(await addExercise(exercise)).toEqual(expected);
    expect(prismaMock.exercises.create).toHaveBeenCalledTimes(2);
  });

  test("Update exercise with field errors", async () => {
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
          set_order: -1,
        },
      ],
    };

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Invalid exercise fields",
        errors: {
          id: ["ID for exercise must be in UUID format"],
          workout_id: ["ID for workout must be in UUID format"],
          name: ["A name must be at least 1 character."],
        },
      },
    };

    expect(await updateExercise(exercise, "name")).toEqual(expected);

    exercise = {
      ...exercise,
      id: workout.exercises[0].id,
      workout_id: workout.id,
      name: "B".repeat(51),
    };

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Invalid exercise fields",
        errors: { name: ["A name must be at most 50 characters."] },
      },
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
          set_order: ["Set order must be non-negative"],
        },
      },
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
          set_order: 0,
        },
        {
          id: "",
          exercise_id: workout.exercises[0].id,
          set_order: 1,
        },
      ],
    };

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "All exercise sets must be non-empty",
        errors: {},
      },
    };

    expect(await updateExercise(exercise, "sets")).toEqual(expected);
  });

  test("Update exercise with database integrity errors", async () => {
    // Missing workout
    exercise = {
      id: "33b33227-56b1-4f10-844a-660b523e546d",
      workout_id: "33b33227-56b1-4f10-844a-660b523e546c",
      exercise_order: 4,
      name: "A".repeat(50),
      sets: [],
    };

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Workout does not exist based on workout ID",
        errors: {},
      },
    };

    expect(await updateExercise(exercise, "name")).toEqual(expected);

    // Missing exercise
    exercise.workout_id = workout.id;

    expected = {
      status: "Error",
      body: {
        data: null,
        message: "Exercise does not exist based on workout and/or exercise ID",
        errors: {},
      },
    };

    expect(await updateExercise(exercise, "name")).toEqual(expected);
  });

  test("Update exercise", async () => {
    exercise = {
      ...workout.exercises[0],
      name: "NEW NAME",
    };

    expected = {
      status: "Success",
      body: {
        data: {
          ...exercisesByIds[exercise.id],
          name: "NEW NAME"
        },
        message: "Successfully updated exercise name",
        errors: {},
      },
    };

    console.log(JSON.stringify(await updateExercise(exercise, "name")));
  });
});
