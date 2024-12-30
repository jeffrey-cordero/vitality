import { expect } from "@jest/globals";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { addWorkoutTag, fetchWorkoutTags, getAppliedTagUpdates, Tag, updateWorkoutTag } from "@/lib/home/workouts/tags";
import { root } from "@/tests/authentication/data";
import { tags, workout } from "@/tests/home/workouts/data";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { prismaMock } from "@/tests/singleton";

const MOCK_WORKOUT_TAG: Tag = {
   id: "",
   user_id: root.id,
   title: "New Workout Tag Title",
   color: "rgb(133, 76, 29)"
};

let tag: Tag;
let tagsById: Record<string, Tag> = {};
let tagsByTitle: Record<string, Tag> = {};

describe("Workout Tags Tests", () => {
   const applyTagTableMethods = (params: any, method: string): Tag | null => {
      const isInvalidUser = method === "create" ? params.data?.user_id !== root.id : params.where.user_id !== root.id;

      if (isInvalidUser) {
         // Account for invalid user ID provided
         throw new PrismaClientKnownRequestError("Foreign key constraint violated", {
            code: "P2003",
            clientVersion: "5.22.0"
         });
      } else {
         // Account for successful database operation
         const newTag: Tag = {
            ...params.data,
            id: method === "create" ? MOCK_ID : params.where.id,
            user_id: method === "create" ? params.data?.user_id : params.where.user_id
         };

         if (method !== "create") {
            delete tagsByTitle[tagsById[params.where.id]?.title || ""];
            delete tagsById[params.where.id];
         }

         if (method !== "delete") {
            tagsByTitle[newTag.title] = newTag;
            tagsById[newTag.id] = newTag;
         }

         return newTag;
      }
   };

   const testFieldErrors = async(method: "create" | "update" | "delete") => {
      const invalidWorkoutTags = [
         {
            tag: {
               ...MOCK_WORKOUT_TAG,
               id: method === "create" ? "" : MOCK_ID,
               user_id: "",
               title: "",
               color: "#ffeeee"
            },
            errors: {
               user_id: ["ID for user must be in UUID format"],
               title: ["Title must be at least 3 characters"],
               color: ["Color must be one of the default options"]
            }
         },
         {
            tag: {
               ...MOCK_WORKOUT_TAG,
               id: method === "create" ? MOCK_ID : "",
               user_id: root.id,
               title: "A".repeat(31),
               color: "rgb(73, 47, 100)"
            },
            errors: {
               id: method === "create"
                  ? ["ID for workout tag must be empty or undefined"] : ["ID for workout tag must be in UUID format"],
               title: ["Title must be at most 30 characters"]
            }
         }
      ];

      for (const { tag, errors } of invalidWorkoutTags) {
         expect(method === "create" ?
            await addWorkoutTag(root.id, tag) : await updateWorkoutTag(root.id, tag, method)
         ).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Invalid workout tag fields",
               errors: errors
            }
         });
      }

      // @ts-ignore
      expect(prismaMock.workout_tags[method]).not.toHaveBeenCalled();
   };

   const testDatabaseErrors = async(method: "create" | "update" | "delete") => {
      const invalidWorkoutTags = [
         {
            tag: {
               ...MOCK_WORKOUT_TAG,
               id: method === "create" ? "" : MOCK_ID,
               title: tags[0].title
            },
            expected: {
               status: "Error",
               body: {
                  data: null,
                  message: method === "create" ?
                     "Workout tag title already exists" : "Workout tag does not exist based on user and/or tag ID",
                  errors: method === "create" ?
                     { title: ["Workout tag title already exists"] } : { }
               }
            }
         },
         {
            tag: {
               ...MOCK_WORKOUT_TAG,
               id: method === "create" ? "" : tags[0].id,
               title: tags[0].title
            },
            expected: {
               status: method === "delete" ? "Success" : "Error",
               body: {
                  // Assume tag record is return successfully for delete operation
                  data: method === "delete" ? expect.any(Object) : null,
                  message: method === "delete" ?
                     "Successfully deleted workout tag" : "Workout tag title already exists",
                  errors: method === "delete" ?
                     {} : { title: ["Workout tag title already exists"] }
               }
            }
         },
         {
            tag: {
               ...MOCK_WORKOUT_TAG,
               id: method === "create" ? "" : MOCK_ID,
               title: method === "update" ? tags[1].title : "New Workout Tag Title",
               user_id: method === "create" ? MOCK_ID : root.id
            },
            expected: {
               status: method === "create" ? "Failure" : "Error",
               body: {
                  data: null,
                  message: method === "create" ?
                     "Oops! Something went wrong. Try again later." : "Workout tag does not exist based on user and/or tag ID",
                  errors: method === "create" ?
                     { system: ["Foreign key constraint violated"] } : {}
               }
            }
         }
      ];

      for (const { tag, expected } of invalidWorkoutTags) {
         expect(method === "create" ?
            await addWorkoutTag(tag.user_id, tag) : await updateWorkoutTag(tag.user_id, tag, method)
         ).toEqual(expected);
      }

      tag = {
         ...MOCK_WORKOUT_TAG,
         id: method === "create" ? "" : tags[1].id
      };

      simulateDatabaseError("workout_tags", method, method === "create" ?
         async() => addWorkoutTag(root.id, tag) : async() => updateWorkoutTag(root.id, tag, method)
      );
   };

   beforeEach(() => {
      // Reset tag mappings
      tagsByTitle = Object.fromEntries(tags.map(tag => [tag.title, tag]));
      tagsById = Object.fromEntries(tags.map(tag => [tag.id, tag]));

      // @ts-ignore
      prismaMock.workout_tags.findMany.mockImplementation(async(params) => {
         return params.where.user_id === root.id ? tags : [];
      });

      // @ts-ignore
      prismaMock.workout_tags.findFirst.mockImplementation(async(params) => {
         if (params.where.user_id !== root.id) {
            return null;
         } else {
            return tagsByTitle[params.where.title as string] || tagsById[params.where.id as string] || null;
         }
      });

      // @ts-ignore
      ["create", "update", "delete"].forEach((method) => {
         prismaMock.workout_tags[method].mockImplementation(async(params) => {
            return applyTagTableMethods(params, method);
         });
      });
   });

   describe("Fetch workout tags", () => {
      test("Should return empty array if user does not exist", async() => {
         expect(await fetchWorkoutTags(MOCK_ID)).toEqual([]);
         expect(prismaMock.workout_tags.findMany).toHaveBeenCalledWith({
            where: { user_id: MOCK_ID }
         } as any);
      });

      test("Should fail fetching workout tags when a database error occurs", async() => {
         // @ts-ignore
         prismaMock.workout_tags.findMany.mockRejectedValue(
            new Error("Database Error")
         );
         expect(await fetchWorkoutTags(root.id)).toEqual([]);
         expect(await fetchWorkoutTags(MOCK_ID)).toEqual([]);
      });

      test("Should fetch workout tags for existing users", async() => {
         expect(await fetchWorkoutTags(root.id)).toEqual(tags);
         expect(prismaMock.workout_tags.findMany).toHaveBeenCalledWith({
            where: { user_id: root.id }
         } as any);
      });
   });

   describe("Create workout tag", () => {
      test("Should fail to create workout tag when fields are invalid", async() => {
         await testFieldErrors("create");
      });

      test("Should fail creating workout tag when a database conflict or error occurs", async() => {
         await testDatabaseErrors("create");
      });

      test("Should succeed in creating workout tag with valid fields", async() => {
         tag = {
            ...MOCK_WORKOUT_TAG,
            user_id: root.id,
            title: "  New Workout Tag Title  ",
            color: "rgb(133, 76, 29)"
         };

         expect(await addWorkoutTag(root.id, tag)).toEqual({
            status: "Success",
            body: {
               data: {
                  ...tag,
                  id: MOCK_ID,
                  title: "New Workout Tag Title"
               },
               message: "Successfully created workout tag",
               errors: {}
            }
         });
         expect(await prismaMock.workout_tags.findFirst({
            where: {
               title: tag.title.trim(),
               user_id: tag.user_id.trim()
            }
         })
         ).toEqual(
            tagsByTitle["New Workout Tag Title"]
         );
         expect(prismaMock.workout_tags.create).toHaveBeenCalledWith({
            data: {
               user_id: tag.user_id.trim(),
               title: tag.title.trim(),
               color: tag.color.trim()
            }
         } as any);
      });
   });

   describe("Update workout tag", () => {
      test("Should fail to update workout tag when fields are invalid", async() => {
         await testFieldErrors("update");
      });

      test("Should fail updating workout tag when a database conflict or error occurs", async() => {
         await testDatabaseErrors("update");
      });

      test("Should succeed in updating workout tag with valid fields", async() => {
         tag = {
            ...MOCK_WORKOUT_TAG,
            id: tags[0].id,
            title: "  Updated Workout Tag Title  ",
            color: "rgb(110, 54, 48)"
         };

         expect(await updateWorkoutTag(root.id, tag, "update")).toEqual({
            status: "Success",
            body: {
               data: {
                  title: "Updated Workout Tag Title",
                  color: "rgb(110, 54, 48)",
                  id: tags[0].id,
                  user_id: root.id
               },
               message: "Successfully updated workout tag",
               errors: {}
            }
         });
         expect(await prismaMock.workout_tags.findFirst({
            where: {
               title: tag.title.trim(),
               user_id: tag.user_id.trim()
            }
         })
         ).toEqual(
            tagsByTitle["Updated Workout Tag Title"]
         );
         expect(await prismaMock.workout_tags.findFirst({
            where: {
               title: tags[0].title,
               user_id: tag.user_id.trim()
            }
         })).toBeNull();
         expect(tagsByTitle[tags[0].title]).toBeUndefined();
         expect(prismaMock.workout_tags.update).toHaveBeenCalledWith({
            where: {
               id: tag.id,
               user_id: tag.user_id
            },
            data: {
               title: tag.title.trim(),
               color: tag.color.trim()
            }
         } as any);
      });
   });

   describe("Delete workout tag", () => {
      test("Should fail to delete workout tag when fields are invalid", async() => {
         await testFieldErrors("delete");
      });

      test("Should fail deleting workout tag when a database conflict or error occurs", async() => {
         await testDatabaseErrors("delete");
      });

      test("Should succeed in deleting workout tag with valid fields", async() => {
         tag = {
            ...MOCK_WORKOUT_TAG,
            id: tags[0].id,
            title: "  Deleting Workout Tag Title  "
         };

         expect(await updateWorkoutTag(root.id, tag, "delete")).toEqual({
            status: "Success",
            body: {
               data: {
                  id: tag.id,
                  user_id: tag.user_id
               },
               message: "Successfully deleted workout tag",
               errors: {}
            }
         });
         expect(await prismaMock.workout_tags.findFirst({
            where: {
               title: tags[0].title,
               user_id: tag.user_id.trim()
            }
         })
         ).toBeNull();
         expect(tagsByTitle[tags[0].title]).toBeUndefined();
         expect(tagsByTitle["Deleting Workout Tag Title"]).toBeUndefined();
         expect(prismaMock.workout_tags.delete).toHaveBeenCalledWith({
            where: {
               id: tag.id,
               user_id: tag.user_id
            },
            data: undefined
         } as any);
      });
   });

   describe("Applied workout tags calculations", () => {
      test("Should succeed in calculating applied workout tags", async() => {
         // Applied workout tags calculations with a mock existing workout record
         const existingWorkout = {
            ...workout,
            workout_applied_tags: [
               {
                  ...tags[0],
                  tag_id: tags[0].id
               },
               {
                  ...tags[1],
                  tag_id: tags[1].id
               },
               {
                  ...tags[2],
                  tag_id: tags[2].id
               }
            ]
         };

         const addingTagIds = [
            "69b62ca8-9222-4d68-b83a-c352c3989a49",
            "69b62ca8-9222-4d68-b83a-c352c3989a50"
         ];

         const existingTagIds = [
            tags[0].id,
            tags[1].id
         ];

         const removingTagId = [
            tags[2].id
         ];

         const newWorkout = {
            ...workout,
            tagIds: [
               ...addingTagIds,
               ...existingTagIds
            ]
         };

         expect(
            await getAppliedTagUpdates(existingWorkout, newWorkout)
         ).toEqual({
            existing: existingTagIds,
            adding: addingTagIds,
            removing: removingTagId
         });
      });
   });
});