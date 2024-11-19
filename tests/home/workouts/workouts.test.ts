import { expect } from "@jest/globals";
import { root } from "@/tests/authentication/data";
import { prismaMock } from "@/singleton";
import { VitalityResponse } from "@/lib/global/response";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { tags, workouts } from "@/tests/home/workouts/data";
import { addWorkout, fetchWorkouts, Workout } from "@/lib/home/workouts/workouts";
import { formatWorkout } from "@/lib/home/workouts/shared";

let workoutsById;
let workout: Workout;
let expected: VitalityResponse<Workout>;

const handleDatabaseConstraints = async(params, method) => {
   const isInvalidUser: boolean =
    (method === "create" && params.data.user_id !== root.id) ||
    (method !== "create" && params.where.user_id !== root.id);

   if (isInvalidUser) {
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
   }

   const newWorkout = {
      ...params.data,
      id: method === "create" ? "Mock-ID" : params.where.id,
      user_id: method === "create" ? params.data.user_id : params.where.user_id
   };

   if (method !== "create") {
      delete workoutsById[newWorkout.id];
   } else {
      // Mock application of new workout tags
      newWorkout.workout_applied_tags = params.data.workout_applied_tags.create.map((tag) => ({
         workout_id: "Mock-ID",
         tag_id: tag.tag_id
      }));
   }

   if (method !== "delete") {
      workoutsById[newWorkout.id] = newWorkout;
   }

   return newWorkout;
};

describe("Workout Tracking Validation", () => {
   beforeEach(() => {
      // Initialize mock workout mappings
      workoutsById = {
         [workouts[0].id]: workouts[0],
         [workouts[1].id]: workouts[1],
         [workouts[2].id]: workouts[2]
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

      // @ts-ignore
      ["create", "update", "delete"].forEach((method) => {
         prismaMock.workouts[method].mockImplementation(async(params) => {
            return handleDatabaseConstraints(params, method);
         });
      });
   });

   test("Fetch user workouts", async() => {
      // Mock formatted workouts from database resulting rows
      const formatted = [...workouts].map((workout) => formatWorkout(workout));

      expect(await fetchWorkouts(root.id)).toEqual(formatted);
      expect(prismaMock.workouts.findMany).toHaveBeenCalledWith({
         include: {
            workout_applied_tags: {
               select: {
                  workout_id: true,
                  tag_id: true
               }
            },
            exercises: {
               include: {
                  sets: true
               },
               orderBy: {
                  exercise_order: "asc"
               }
            }
         },
         where: {
            user_id: root.id
         },
         orderBy: {
            date: "desc"
         }
      });
      expect(await fetchWorkouts("Missing-User-ID")).toEqual([]);
      expect(prismaMock.workouts.findMany).toHaveBeenCalledWith({
         include: {
            workout_applied_tags: {
               select: {
                  workout_id: true,
                  tag_id: true
               }
            },
            exercises: {
               include: {
                  sets: true
               },
               orderBy: {
                  exercise_order: "asc"
               }
            }
         },
         where: {
            user_id: "Missing-User-ID"
         },
         orderBy: {
            date: "desc"
         }
      });

      // Simulate database error
      prismaMock.workouts.findMany.mockRejectedValue(
         new Error("Database Connection Error")
      );

      expect(await fetchWorkouts(root.id)).toEqual([]);
      expect(await fetchWorkouts("Another-Missing-User-ID")).toEqual([]);
   });

   test("Create workout with field errors", async() => {
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
   });

   test("Create workout with database integrity errors", async() => {
      // Invalid user
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
      expect(prismaMock.workouts.create).toHaveBeenCalled();
   });

   test("Create workout", async() => {
      workout = {
         id: "",
         user_id: root.id,
         title: "Title",
         date: new Date(),
         image: "https://www.obbstartersandalternators.com/images/test.png",
         description: "Description",
         tagIds: [tags[0].id, tags[1].id],
         exercises: []
      };

      expected = {
         status: "Success",
         body: {
            data: {
               ...formatWorkout({
                  ...workout,
                  id: "Mock-ID",
                  workout_applied_tags: [
                     {
                        tag_id: tags[0].id,
                        workout_id: "Mock-ID"
                     },
                     {
                        tag_id: tags[1].id,
                        workout_id: "Mock-ID"
                     }
                  ]
               })
            },
            message: "Added new workout",
            errors: {}
         }
      };

      expect(await addWorkout(workout)).toEqual(expected);
   });

   test("Update or delete workout with field errors", async() => {
      // TODO
   });

   test("Update or delete workout with database integrity errors", async() => {
      // TODO
   });

   test("Update workout", async() => {
      // TODO
   });

   test("Delete workout", async() => {
      // TODO
   });

   test("Shared Workout Methods", async() => {
      // TODO
      // verifyImageURL(), searchForTitle(), getWorkoutDate()
   });
});
