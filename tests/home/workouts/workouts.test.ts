import { expect } from "@jest/globals";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { normalizeDate } from "@/lib/authentication/shared";
import { formatDatabaseWorkout, verifyImageURL } from "@/lib/home/workouts/shared";
import { addWorkout, deleteWorkouts, fetchWorkouts, updateWorkout, Workout } from "@/lib/home/workouts/workouts";
import { root } from "@/tests/authentication/data";
import { tags, workouts } from "@/tests/home/workouts/data";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { prismaMock } from "@/tests/singleton";

const MOCK_WORKOUT = workouts[0];

let workout: Workout;
let workoutsById: Record<string, Workout>;

describe("Workouts Tests", () => {
   const testFieldErrors = async(method: "create" | "update") => {
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
               await addWorkout(root.id, workout) : await updateWorkout(root.id, workout, method)
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

      // @ts-ignore
      expect(prismaMock.workouts[method]).not.toHaveBeenCalled();
   };

   const testDatabaseErrors = async(method: "create" | "update") => {
      const invalidWorkouts = [
         {
            workout: {
               ...MOCK_WORKOUT,
               id: method === "create" ? "" : MOCK_WORKOUT.id,
               user_id: MOCK_ID,
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
               ? await addWorkout(workout.user_id, workout) : await updateWorkout(workout.user_id, workout, method)
         ).toEqual(expected);
      }

      workout = {
         ...MOCK_WORKOUT,
         id: method === "create" ? "" : MOCK_WORKOUT.id
      };

      simulateDatabaseError("workouts", method, method === "create" ?
         async() => addWorkout(root.id, workout) : async() =>  updateWorkout(root.id, workout, method)
      );
   };

   const applyWorkoutTableMethods = async(params, method) => {
      const isInvalidUser = method === "create" ?
         params.data?.user_id !== root.id : params.where.user_id !== root.id;

      if (isInvalidUser) {
         // Account for invalid user ID
         throw new PrismaClientKnownRequestError("Foreign key constraint violated", {
            code: "P2003",
            clientVersion: "5.22.0"
         });
      } else if (method === "deleteMany") {
         // Account for multiple workout deletions
         const ids = params.where.id.in.filter(
            (id: string) => workoutsById[id] !== undefined
         );

         ids.forEach(
            (id: string) => delete workoutsById[id]
         );

         return { count: ids.length };
      } else {
         // Account for single workout creation, update, or deletion
         const newWorkout = {
            ...params.data,
            workout_applied_tags: [],
            id: method === "create" ? MOCK_ID : params.where.id,
            user_id: method === "create" ? params.data?.user_id : params.where.user_id
         };

         if (method === "create") {
            // Mock creation of applied workout tags
            newWorkout.workout_applied_tags = params.data?.workout_applied_tags.create.map(
               (tag: { tag_id: string }) => ({
                  workout_id: MOCK_ID,
                  tag_id: tag.tag_id
               })
            );

            return newWorkout;
         } else if (method === "delete") {
            // Mock deletion of workout and return of existing record
            const record = { ...workoutsById[params.where.id] };
            delete workoutsById[params.data?.id];

            return record;
         } else {
            // Mock update of workout and return of updated record
            delete workoutsById[params.data?.id];

            // Mock createMany and deleteMany workout tag applications
            const existingWorkout = workoutsById[params.where.id];

            const creatingTags = new Set(
               params.data?.workout_applied_tags?.createMany.data?.map(
                  (tag: { tag_id: string }) => tag.tag_id
               )
            );

            const removingTags = new Set(
               params.data?.workout_applied_tags?.deleteMany.tag_id.in
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

            workoutsById[newWorkout.id] = newWorkout;
            return newWorkout;
         }
      }
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
            return applyWorkoutTableMethods(params, method);
         });
      });
   });

   describe("Fetch workouts", () => {
      test("Should return empty array if user does not exist", async() => {
         expect(await fetchWorkouts(MOCK_ID)).toEqual([]);
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
            },
            where: {
               user_id: MOCK_ID
            },
            orderBy: {
               date: "desc"
            }
         } as any);
      });

      test("Should fail fetching workouts when a database error occurs", async() => {
         // @ts-ignore
         prismaMock.workouts.findMany.mockRejectedValue(
            new Error("Database Error")
         );

         expect(await fetchWorkouts(root.id)).toEqual([]);
         expect(await fetchWorkouts(MOCK_ID)).toEqual([]);
      });

      test("Should fetch workouts for existing users", async() => {
         // Mock formatted workouts from database queries
         const expected = [...workouts].map(
            (workout) => formatDatabaseWorkout(workout)
         );

         expect(await fetchWorkouts(root.id)).toEqual(expected);
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
            },
            where: {
               user_id: root.id
            },
            orderBy: {
               date: "desc"
            }
         } as any);
      });
   });

   describe("Create workout", () => {
      test("Should fail to create workout when fields are invalid", async() => {
         await testFieldErrors("create");
      });

      test("Should fail creating  workout when a database conflict or error occurs", async() => {
         await testDatabaseErrors("create");
      });

      test("Should succeed in creating workout with valid fields", async() => {
         workout = {
            id: "",
            user_id: root.id,
            title: "Title",
            date: new Date("2024-11-20T13:16:23.400Z"),
            image: "https://www.obbstartersandalternators.com/images/test.png",
            description: "",
            tagIds: [
               tags[0].id,
               tags[1].id
            ],
            exercises: []
         };

         expect(await addWorkout(root.id, workout)).toEqual({
            status: "Success",
            body: {
               data: formatDatabaseWorkout({
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
         expect(normalizeDate(workout.date)).toBe("11/20/2024");
         expect(prismaMock.workouts.create).toHaveBeenCalledWith({
            data: {
               user_id: workout.user_id,
               title: workout.title.trim(),
               description: "",
               date: new Date("2024-11-20T13:16:23.400Z"),
               image: workout.image.trim(),
               workout_applied_tags: {
                  create: [
                     { tag_id: tags[0].id },
                     { tag_id: tags[1].id }
                  ]
               }
            },
            include: {
               workout_applied_tags: {
                  select: {
                     workout_id: true,
                     tag_id: true
                  }
               },
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
      });
   });

   describe("Update workout", () => {
      test("Should fail to update workout tag when fields are invalid", async() => {
         await testFieldErrors("update");
      });

      test("Should fail updating workout when a database conflict or error occurs", async() => {
         await testDatabaseErrors("update");
      });

      test("Should succeed in updating workout tag with valid fields", async() => {
         workout = {
            id: workouts[1].id,
            user_id: root.id,
            title: "Title",
            date: new Date("2024-11-20T13:16:23.400Z"),
            image: "",
            description: "",
            tagIds: [
               tags[1].id,
               tags[2].id
            ],
            exercises: []
         };

         expect(await updateWorkout(root.id, workout, "update")).toEqual({
            status: "Success",
            body: {
               data: {
                  id: workout.id,
                  user_id: root.id,
                  title: "Title",
                  date: new Date("2024-11-20T13:16:23.400Z"),
                  description: "",
                  image: "",
                  tagIds: [
                     tags[1].id,
                     tags[2].id
                  ],
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
                  select: {
                     workout_id: true,
                     tag_id: true
                  }
               },
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
      });
   });

   describe("Delete workout(s)", () => {
      test("Should fail to delete workout(s) when fields are invalid", async() => {
         // Expect same field errors for single and multiple workout deletions
         let errors = {
            status: "Error",
            body: {
               data: null,
               message: "Invalid workout fields",
               errors: {
                  user_id: ["ID for user must be in UUID format"],
                  id: ["ID for workout must be in UUID format"]
               }
            }
         };

         workout = {
            ...MOCK_WORKOUT,
            id: "",
            user_id: ""
         };

         expect(await updateWorkout(root.id, workout, "delete")).toEqual(errors);
         expect(await deleteWorkouts(workout.user_id, [workout])).toEqual(errors);

         errors = {
            status: "Error",
            body: {
               data: null,
               message: "Invalid workout fields",
               errors: {
                  user_id: undefined,
                  id: ["ID for workout must be in UUID format"]
               }
            }
         };

         workout = {
            ...MOCK_WORKOUT,
            id: ""
         };

         expect(await updateWorkout(root.id, workout, "delete")).toEqual(errors);
         expect(await deleteWorkouts(workout.user_id, [workout])).toEqual(errors);
      });

      test("Should fail deleting workout(s) when a database conflict or error occurs", async() => {
         // Missing user caught at bulk deletion
         workout = {
            ...MOCK_WORKOUT,
            id: MOCK_ID,
            user_id: MOCK_ID,
            title: "Title",
            date: new Date(),
            image: ""
         };

         expect(await deleteWorkouts(workout.user_id, [workout])).toEqual({
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

         // Missing workout caught at single deletion
         expect(await updateWorkout(root.id, workout, "delete")).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Workout does not exist based on user and/or workout ID",
               errors: {}
            }
         });
      });

      test("Should succeed in deleting workout(s) with valid fields", async() => {
         // Delete single workout
         workout = workouts[0];

         expect(await updateWorkout(root.id, workout, "delete")).toEqual({
            status: "Success",
            body: {
               // Assume existing record is returned
               data: expect.any(Object),
               message: "Successfully deleted workout",
               errors: {}
            }
         });
         expect(prismaMock.workouts.delete).toBeCalledWith({
            where: {
               id: workout.id,
               user_id: workout.user_id
            }
         });

         expect(await deleteWorkouts(workout.user_id, [workout])).toEqual({
            status: "Success",
            body: {
               data: 1,
               message: "Deleted 1 workout",
               errors: {}
            }
         });
         expect(prismaMock.workouts.deleteMany).toBeCalledWith({
            where: {
               id: {
                  in: [workout.id]
               },
               user_id: workout.user_id
            }
         });
         expect(workoutsById[workout.id]).toBeUndefined();

         // Delete multiple workouts while including missing workouts
         expect(
            await deleteWorkouts(
               workout.user_id,
               [workouts[0], workouts[1], workouts[2]],
            )
         ).toEqual({
            status: "Success",
            body: {
               data: 2,
               message: "Deleted 2 workouts",
               errors: {}
            }
         });
         expect(prismaMock.workouts.deleteMany).toBeCalledWith({
            where: {
               id: {
                  in: [workouts[0].id, workouts[1].id, workouts[2].id]
               },
               user_id: workout.user_id
            }
         });
         expect(workoutsById[workouts[1].id]).toBeUndefined();
         expect(workoutsById[workouts[2].id]).toBeUndefined();
         expect(Object.keys(workoutsById).length).toBe(0);

         // Empty workouts array
         expect(await deleteWorkouts(workout.user_id, [])).toEqual({
            status: "Success",
            body: {
               data: 0,
               message: "Deleted 0 workouts",
               errors: {}
            }
         });
         expect(prismaMock.workouts.deleteMany).toBeCalledWith({
            where: {
               id: {
                  in: []
               },
               user_id: workout.user_id
            }
         });
      });
   });
});