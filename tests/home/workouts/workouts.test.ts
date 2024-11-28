import { expect } from "@jest/globals";
import { root } from "@/tests/authentication/data";
import { prismaMock } from "@/tests/singleton";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { tags, workouts } from "@/tests/home/workouts/data";
import { formatWorkout, verifyImageURL } from "@/lib/home/workouts/shared";
import { addWorkout, deleteWorkouts, fetchWorkouts, updateWorkout, Workout } from "@/lib/home/workouts/workouts";

const MOCK_WORKOUT = workouts[0];

let workout: Workout;
let workoutsById: Record<string, Workout>;

describe("Workout Tracking Service", () => {
   const handleFieldErrors = async(method: "create" | "update") => {
      const invalidWorkouts = [
         {
            workout: {
               ...MOCK_WORKOUT,
               id: method === "create" ? "" : MOCK_WORKOUT.id,
               user_id: "",
               title: "",
               image: "",
               date: new Date(Date.now() + 1000 * 60 * 60 * 24),
               description: "",
               tagIds: [],
               exercises: []
            },
            errors: {
               user_id: ["ID for user must be in UUID format"],
               title: ["Title must be at least 1 character"],
               date: ["Date must not be after today"]
            }
         },
         {
            workout: {
               ...MOCK_WORKOUT,
               user_id: root.id,
               id: `${MOCK_ID}$`,
               title: "a".repeat(51),
               date: undefined,
               image: "/invalid/image.jpg"
            },
            errors: {
               id: method === "create" ?
                  ["ID for workout must be empty or undefined"] : ["ID for workout must be in UUID format"],
               title: ["Title must be at most 50 characters"],
               date: ["Date is required"],
               image: ["Image URL must be valid"]
            }
         }
      ];

      for (const { workout, errors } of invalidWorkouts) {
         expect(
            method === "create" ?
               await addWorkout(workout) : await updateWorkout(workout)
         ).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Invalid workout fields",
               errors: errors
            }
         });
         expect(verifyImageURL(workout.image)).toBe(errors.image === undefined);
      }
      
      expect(prismaMock.workouts[method]).not.toHaveBeenCalled();
   };

   const handleDatabaseErrors = async(method: "create" | "update") => {
      const invalidWorkouts = [
         {
            workout: {
               ...MOCK_WORKOUT,
               id: method === "create" ? "" : MOCK_WORKOUT.id,
               user_id: "dd29ecb7-a142-4f15-b828-6379cf4a8817",
               title: "Title",
               date: new Date(),
               image: ""
            },
            expected: {
               status: method === "create" ? "Failure" : "Error",
               body: {
                  data: null,
                  message: method === "create" ?
                     "Something went wrong. Please try again." : "Workout does not exist based on user and/or workout ID",
                  errors: method === "create" ?
                     { system: ["Foreign key constraint violated"] } : {}
               }
            }
         }
      ];

      for (const { workout, expected } of invalidWorkouts) {
         expect(
            method === "create"
               ? await addWorkout(workout) : await updateWorkout(workout)
         ).toEqual(expected);
      }

      // Simulate database error during mock database method
      workout = {
         ...MOCK_WORKOUT,
         id: method === "create" ? "" : MOCK_WORKOUT.id
      };

      simulateDatabaseError("workouts", method, method === "create" ?
         async () => addWorkout(workout) : async () =>  updateWorkout(workout)
      );
   };

   const handlePrismaMockMethods = async(params, method) => {
      const isInvalidUser = method === "create" ?
         params.data.user_id !== root.id : params.where.user_id !== root.id;

      if (isInvalidUser) {
         throw new PrismaClientKnownRequestError("Foreign key constraint violated", {
            code: "P2003",
            clientVersion: "5.22.0"
         });
      }

      if (method === "deleteMany") {
         const ids = params.where.id.in.filter(
            (id: string) => workoutsById[id] !== undefined
         );

         ids.forEach((id: string) => delete workoutsById[id]);

         return { count: ids.length };
      }

      const newWorkout = {
         ...params.data,
         workout_applied_tags: [],
         id: method === "create" ? MOCK_ID : params.where.id,
         user_id: method === "create" ? params.data.user_id : params.where.user_id
      };

      if (method === "create") {
         // Mock application of new workout tags
         newWorkout.workout_applied_tags = params.data.workout_applied_tags.create.map(
            (tag: { tag_id: string }) => ({
               workout_id: MOCK_ID,
               tag_id: tag.tag_id
            })
         );
      } else {
         delete workoutsById[params.data.id];

         if (method === "update") {
            // Mock createMany and deleteMany workout tags methods
            const existingWorkout = workoutsById[params.where.id];

            const creatingTags = new Set(
               params.data.workout_applied_tags?.createMany.data.map(
                  (tag: { tag_id: string }) => tag.tag_id
               )
            );

            const removingTags = new Set(
               params.data.workout_applied_tags?.deleteMany.tag_id.in
            );

            const existingTags = existingWorkout.tagIds.filter(
               (id: string) => !creatingTags.has(id) && !removingTags.has(id)
            );

            newWorkout.workout_applied_tags = [
               ...Array.from(existingTags).map((id: string) => ({
                  workout_id: params.where.id,
                  tag_id: id
               })),
               ...Array.from(creatingTags).map((id: string) => ({
                  workout_id: params.where.id,
                  tag_id: id
               }))
            ];
         }
      }

      if (method !== "delete") {
         workoutsById[newWorkout.id] = newWorkout;
      }

      return newWorkout;
   };

   beforeEach(() => {
      // Initialize mock workout mappings
      workoutsById = Object.fromEntries(workouts.map((workout) => [workout.id, workout]));

      // @ts-ignore
      prismaMock.workouts.findMany.mockImplementation(async(params) => {
         return params.where.user_id === root.id ? workouts : [];
      });

      // @ts-ignore
      prismaMock.workouts.findFirst.mockImplementation(async(params) => {
         return params.where.user_id === root.id
            ? workoutsById[params.where.id as string] || null : null;
      });

      // @ts-ignore
      ["create", "update", "delete", "deleteMany"].forEach((method) => {
         prismaMock.workouts[method].mockImplementation(async(params) => {
            return handlePrismaMockMethods(params, method);
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

      // @ts-ignore
      prismaMock.workouts.findMany.mockRejectedValue(
         new Error("Database Error")
      );

      expect(await fetchWorkouts(root.id)).toEqual([]);
      expect(await fetchWorkouts("Another-Missing-User-ID")).toEqual([]);
   });

   test("Create workout with field errors", async() => {
      await handleFieldErrors("create");
   });

   test("Create workout with database integrity errors", async() => {
      await handleDatabaseErrors("create");
   });

   test("Create workout", async() => {
      workout = {
         id: "",
         user_id: root.id,
         title: "Title",
         date: new Date("2024-11-20T13:16:23.400Z"),
         image: "https://www.obbstartersandalternators.com/images/test.png",
         description: "",
         tagIds: [tags[0].id, tags[1].id],
         exercises: []
      };

      expect(await addWorkout(workout)).toEqual({
         status: "Success",
         body: {
            data: formatWorkout({
               ...workout,
               id: MOCK_ID,
               workout_applied_tags: [
                  {
                     tag_id: tags[0].id,
                     workout_id: MOCK_ID
                  },
                  {
                     tag_id: tags[1].id,
                     workout_id: MOCK_ID
                  }
               ]
            }),
            message: "Added new workout",
            errors: {}
         }
      });
      expect(verifyImageURL(workout.image)).toBe(true);
      expect(prismaMock.workouts.create).toHaveBeenCalledWith({
         data: {
            user_id: workout.user_id,
            title: workout.title.trim(),
            description: "",
            date: new Date("2024-11-20T13:16:23.400Z"),
            image: workout.image.trim(),
            workout_applied_tags: {
               create: [{ tag_id: tags[0].id }, { tag_id: tags[1].id }]
            }
         },
         include: {
            workout_applied_tags: {
               select: { workout_id: true, tag_id: true }
            },
            exercises: {
               include: { sets: true },
               orderBy: { exercise_order: "asc" }
            }
         }
      });
   });

   test("Update workout with field errors", async() => {
      await handleFieldErrors("update");
   });

   test("Delete workouts with field errors", async() => {
      workout = {
         ...MOCK_WORKOUT,
         id: "",
         user_id: ""
      };

      expect(await deleteWorkouts([workout], workout.user_id)).toEqual({
         status: "Error",
         body: {
            data: null,
            message: "Invalid workout ID fields",
            errors: {
               user_id: ["ID for user must be in UUID format"],
               id: ["ID for all workouts must be in UUID format"]
            }
         }
      });

      workout = {
         ...MOCK_WORKOUT,
         id: ""
      };

      expect(await deleteWorkouts([workout], workout.user_id)).toEqual({
         status: "Error",
         body: {
            data: null,
            message: "Invalid workout ID fields",
            errors: {
               id: ["ID for all workouts must be in UUID format"]
            }
         }
      });
   });

   test("Update workout with database integrity errors", async() => {
      await handleDatabaseErrors("update");
   });

   test("Delete workouts with database integrity errors", async() => {
      workout = {
         ...MOCK_WORKOUT,
         id: workouts[0].id,
         user_id: "dd29ecb7-a142-4f15-b828-6379cf4a8817",
         title: "Title",
         date: new Date(),
         image: ""
      };

      expect(await deleteWorkouts([workout], workout.user_id)).toEqual({
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: {
               system: [
                  "Foreign key constraint violated"
               ]
            }
         }
      });
   });

   test("Update workout", async() => {
      workout = {
         id: workouts[1].id,
         user_id: root.id,
         title: "Title",
         date: new Date("2024-11-20T13:16:23.400Z"),
         image: "",
         description: "",
         tagIds: [tags[1].id, tags[2].id],
         exercises: []
      };

      expect(await updateWorkout(workout)).toEqual({
         status: "Success",
         body: {
            data: {
               id: workout.id,
               user_id: root.id,
               title: "Title",
               date: new Date("2024-11-20T13:16:23.400Z"),
               description: "",
               image: "",
               tagIds: [tags[1].id, tags[2].id],
               exercises: []
            },
            message: "Successfully updated workout",
            errors: {}
         }
      });

      expect(prismaMock.workouts.update).toHaveBeenCalledWith({
         where: {
            id: workout.id,
            user_id: workout.user_id
         },
         data: {
            title: workout.title.trim(),
            description: "",
            date: new Date("2024-11-20T13:16:23.400Z"),
            image: "",
            workout_applied_tags: {
               deleteMany: {
                  tag_id: { in: [tags[0].id] }
               },
               createMany: {
                  data: [{ tag_id: tags[2].id }]
               }
            }
         },
         include: {
            workout_applied_tags: {
               select: { workout_id: true, tag_id: true }
            },
            exercises: {
               include: { sets: true },
               orderBy: { exercise_order: "asc" }
            }
         }
      });

      simulateDatabaseError("workouts", "update", async () => updateWorkout(workout));
   });

   test("Delete workouts", async() => {
      // Delete single workout
      workout = workouts[0];

      expect(await deleteWorkouts([workout], workout.user_id)).toEqual({
         status: "Success",
         body: { data: 1, message: "Deleted 1 workout", errors: {} }
      });
      expect(prismaMock.workouts.deleteMany).toBeCalledWith({
         where: {
            id: { in: [workout.id] },
            user_id: workout.user_id
         }
      });
      expect(workoutsById[workout.id]).toBeUndefined();

      // Delete multiple workouts with missing workouts included
      expect(
         await deleteWorkouts(
            [workouts[0], workouts[1], workouts[2]],
            workout.user_id
         )
      ).toEqual({
         status: "Success",
         body: { data: 2, message: "Deleted 2 workouts", errors: {} }
      });
      expect(prismaMock.workouts.deleteMany).toBeCalledWith({
         where: {
            id: { in: [workouts[0].id, workouts[1].id, workouts[2].id] },
            user_id: workout.user_id
         }
      });
      expect(workoutsById[workouts[1].id]).toBeUndefined();
      expect(workoutsById[workouts[2].id]).toBeUndefined();
      expect(Object.keys(workoutsById).length).toBe(0);

      // Empty workouts array
      expect(await deleteWorkouts([], workout.user_id)).toEqual({
         status: "Success",
         body: { data: 0, message: "Deleted 0 workouts", errors: {} }
      });
      expect(prismaMock.workouts.deleteMany).toBeCalledWith({
         where: {
            id: { in: [] },
            user_id: workout.user_id
         }
      });

      simulateDatabaseError("workouts", "deleteMany", async ()=> deleteWorkouts([], workout.user_id))
   });
});