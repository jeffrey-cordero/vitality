import { expect } from "@jest/globals";
import { root } from "@/tests/authentication/data";
import { prismaMock } from "@/singleton";
import { VitalityResponse } from "@/lib/global/response";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { workouts } from "@/tests/home/workouts/data";
import {
   addWorkout,
   fetchWorkouts,
   Workout
} from "@/lib/home/workouts/workouts";
import { formatWorkout } from "@/lib/home/workouts/shared";

let workoutsById;
let workout: Workout;
let expected: VitalityResponse<Workout>;

describe("Workout Tracking Validation", () => {
   beforeEach(() => {
      // Mock workout table methods
      workoutsById = {
         [workouts[0].id]: workouts[0],
         [workouts[1].id]: workouts[1],
         [workouts[2].id]: workouts[2]
      };

      const handleDatabaseConstraints = async(params, method) => {
         if (
            (method === "create" && params.data.user_id !== root.id) ||
        (method !== "create" && params.where.user_id !== root.id)
         ) {
            // Failure to create/update/delete workout on invalid user ID
            throw new PrismaClientKnownRequestError(
               "Foreign key constraint violated: `workout_tags_user_id_fkey (index)`",
               {
                  code: "P2003",
                  clientVersion: "5.22.0",
                  meta: {
                     modelName: "workout_tags",
                     field_name: "workout_tags_user_id_fkey (index)"
                  }
               }
            );
         } else {
            // Create/update/delete workout on existing user ID
            const newWorkout = {
               ...params.data,
               id: method === "create" ? "Mock-ID" : params.where.id,
               user_id:
            method === "create" ? params.data.user_id : params.where.user_id
            };

            if (method !== "create") {
               delete workoutsById[newWorkout.id];
            }

            if (method !== "delete") {
               workoutsById[newWorkout.id] = newWorkout;
            }

            return newWorkout;
         }
      };

      // @ts-ignore
      prismaMock.workouts.findMany.mockImplementation(async(params) => {
         return params.where.user_id === root.id ? workouts : [];
      });

      // @ts-ignore
      prismaMock.workouts.findFirst.mockImplementation(async(params) => {
         if (params.where.user_id !== root.id) {
            return null;
         } else {
            return workoutsById[params.where.id as string];
         }
      });

      ["create", "update", "delete"].forEach((method) => {
      // @ts-ignore
         prismaMock.workouts[method].mockImplementation(async(params) => {
            return handleDatabaseConstraints(params, method);
         });
      });
   });

   test("Should return a list of all user workouts on an existing user ID", async() => {
      // Mock the formatted workouts after fetching from the database
      const formatted = [...workouts].map((workout) => formatWorkout(workout));

      expect(await fetchWorkouts(root.id)).toEqual(formatted);
      expect(await fetchWorkouts("Missing-User-ID")).toEqual([]);

      // Test system failure leading to empty workouts for any client
      prismaMock.workouts.findMany.mockRejectedValue(
         new Error("Database Connection Error")
      );

      expect(await fetchWorkouts(root.id)).toEqual([]);
      expect(await fetchWorkouts("Another-User-ID")).toEqual([]);
   });

   test("Should fail to create a workout on invalid properties and constraints or succeed otherwise", async() => {
      // Test missing user ID, empty title, and future date
      workout = {
         id: "",
         user_id: "",
         title: "",
         image: "",
         date: new Date(Date.now() + 1000 * 60 * 60 * 24),
         description: "",
         tagIds: [],
         exercises: []
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid workout fields",
            errors: {
               user_id: ["ID for user must be in UUID format"],
               title: ["Title must be at least 1 character"],
               date: ["Date must not be after today"]
            }
         }
      };

      expect(await addWorkout(workout)).toEqual(expected);

      // Test long title, invalid ID, missing date, and invalid image URL
      workout = {
         ...workout,
         user_id: root.id,
         id: "Invalid-ID",
         title: "a".repeat(51),
         date: undefined,
         image: "/invalid/image.jpg"
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid workout fields",
            errors: {
               id: ["ID for workout must be empty or undefined"],
               title: ["Title must be at most 50 characters"],
               date: ["Date is required"],
               image: ["Invalid URL"]
            }
         }
      };

      expect(await addWorkout(workout)).toEqual(expected);

      // Test invalid user ID failing due to database constraints
      workout = {
         ...workout,
         id: "",
         user_id: "dd29ecb7-a142-4f15-b828-6379cf4a8817",
         title: "Title",
         date: new Date(),
         image: ""
      };

      expected = {
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: {
               system: [
                  "Foreign key constraint violated: `workout_tags_user_id_fkey (index)`"
               ]
            }
         }
      };

      expect(await addWorkout(workout)).toEqual(expected);

      //  console.log(JSON.stringify(await addWorkout(workout)));
   });

   test("Should validate shared workout property and filtering methods", async() => {
      // verifyImageURL, searchForTitle, getWorkoutDate
   });
});
