import { expect } from "@jest/globals";
import { root } from "@/tests/authentication/data";
import { prismaMock } from "@/tests/singleton";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { workout, tags } from "@/tests/home/workouts/data";
import { addWorkoutTag, fetchWorkoutTags, getAppliedWorkoutTagUpdates, Tag, updateWorkoutTag } from "@/lib/home/workouts/tags";

// Constant for valid workout tag
const VALID_WORKOUT_TAG: Tag = {
   id: "",
   user_id: root.id,
   title: "New Workout Title",
   color: "rgb(133, 76, 29)"
};

// Mocked data structures
let tag: Tag; 
let tagsByTitle: Record<string, Tag> = {};
let tagsById: Record<string, Tag> = {};

// Utility function to handle database constraints in mock implementations
const handleDatabaseConstraints = (params: any, method: string): Tag | null => {
   const isInvalidUser = method === "create" ?
      params.data.user_id !== root.id : params.where.user_id !== root.id;

   if (isInvalidUser) {
      throw new PrismaClientKnownRequestError("Foreign key constraint violated", {
         code: "P2003",
         clientVersion: "5.22.0"
      });
   }

   const newTag: Tag = {
      ...params.data,
      id: method === "create" ? "Mock-ID" : params.where.id,
      user_id: method === "create" ? params.data.user_id : params.where.user_id
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
};

describe("Workout Tags", () => {
   // Helper function to simulate database error situations
   const simulateDatabaseError = (method: string) => {
      // @ts-ignore
      prismaMock.workout_tags[method].mockRejectedValue(new Error("Database Error"));
   };

   // Helper function to handle validation errors for create/update/delete workout tag methods
   const handleValidationErrors = async(method: "create" | "update" | "delete") => {
      const invalidWorkoutTags = [
         {
            tag: {
               ...VALID_WORKOUT_TAG,
               id: method === "create" ? "" : "69b62ca8-9222-4d68-b83a-c352c3989a48",
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
               ...VALID_WORKOUT_TAG,
               id: method === "create" ? "Non-Empty-ID" : "",
               user_id: root.id,
               title: "A".repeat(31),
               color: "rgb(73, 47, 100)"
            },
            errors: {
               id: method === "create" ?
                  ["ID for workout tag must be empty or undefined"] : ["ID for workout tag must be in UUID format"],
               title: ["Title must be at most 30 characters"]
            }
         }
      ];

      for (const { tag, errors } of invalidWorkoutTags) {
         expect(
            method === "create" ? await addWorkoutTag(tag as Tag) : await updateWorkoutTag(tag as Tag, method)
         ).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Invalid workout tag fields",
               errors: errors
            }
         });
      }

      expect(prismaMock.workout_tags[method]).not.toHaveBeenCalled();
   };

   const handleDatabaseIntegrityErrors = async(method: "create" | "update" | "delete") => {
      const invalidWorkoutTags = [
         {
            tag: {
               ...VALID_WORKOUT_TAG,
               id: method === "create" ? "" : "69b62ca8-9222-4d68-b83a-c352c3989a48",
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
         }, {
            tag: {
               ...VALID_WORKOUT_TAG,
               id: method === "create" ? "" : tags[0].id,
               user_id: "550e8400-e29b-41d4-a716-446655440002"
            },
            expected: {
               status: method === "create" ? "Failure" : "Error",
               body: {
                  data: null,
                  message: method === "create" ?
                     "Something went wrong. Please try again." : "Workout tag does not exist based on user and/or tag ID",
                  errors: method === "create" ?
                     { system: ["Foreign key constraint violated"] } : { }
               }
            }
         }
      ];

      for (const { tag, expected } of invalidWorkoutTags) {
         expect(
            method === "create" ? await addWorkoutTag(tag as Tag) : await updateWorkoutTag(tag as Tag, method)
         ).toEqual(expected);
      }

      // Simulate database error during mock database method
      simulateDatabaseError(method);

      tag = {
         ...VALID_WORKOUT_TAG,
         id: method === "create" ? "" : tags[0].id
      };

      expect(
         method === "create" ? await addWorkoutTag(tag as Tag) : await updateWorkoutTag(tag as Tag, method)
      ).toEqual({
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: { system: ["Database Error"] }
         }
      });
   };

   beforeEach(() => {
      // Initialize mock tag mappings
      tagsByTitle = Object.fromEntries(tags.map(tag => [tag.title, tag]));
      tagsById = Object.fromEntries(tags.map(tag => [tag.id, tag]));

      // Mock Prisma methods
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

      ["create", "update", "delete"].forEach((method) => {
         // @ts-ignore
         prismaMock.workout_tags[method].mockImplementation(async(params) =>
            handleDatabaseConstraints(params, method)
         );
      });
   });

   test("Fetch workout tags for valid and invalid users", async() => {
      expect(await fetchWorkoutTags(root.id)).toEqual(tags);
      expect(prismaMock.workout_tags.findMany).toHaveBeenCalledWith({
         where: { user_id: root.id }
      });

      expect(await fetchWorkoutTags("Invalid-User-ID")).toEqual([]);
      expect(prismaMock.workout_tags.findMany).toHaveBeenCalledWith({
         where: { user_id: "Invalid-User-ID" }
      });

      simulateDatabaseError("findMany");
      expect(await fetchWorkoutTags(root.id)).toEqual([]);
      expect(await fetchWorkoutTags("Invalid-User-ID")).toEqual([]);
   });

   test("Create workout tag with field errors", async() => {
      await handleValidationErrors("create");
   });

   test("Create workout tag with database integrity errors", async() => {
      await handleDatabaseIntegrityErrors("create");
   });

   test("Create workout tag", async() => {
      tag = {
         ...VALID_WORKOUT_TAG,
         user_id: root.id,
         title: "New Workout Tag Title",
         color: "rgb(133, 76, 29)"
      };

      expect(await addWorkoutTag(tag)).toEqual({
         status: "Success",
         body: {
            data: {
               ...tag,
               id: "Mock-ID"
            },
            message: "Successfully added new workout tag",
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
      });
   });

   test("Update or delete workout tag with field errors", async() => {
      await handleValidationErrors("update");
      await handleValidationErrors("delete");
   });

   test("Update or delete workout tag with database integrity errors", async() => {
      await handleDatabaseIntegrityErrors("update");
      await handleDatabaseIntegrityErrors("delete");
   });

   test("Update workout tags", async() => {
      tag = {
         ...VALID_WORKOUT_TAG,
         id: tags[0].id,
         title: "Updated Workout Tag Title",
         color: "rgb(110, 54, 48)"
      };

      expect(await updateWorkoutTag(tag, "update")).toEqual({
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
      })
      ).toBeNull();
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
      });
   });

   test("Delete workout tag", async() => {
      tag = {
         ...VALID_WORKOUT_TAG,
         id: tags[0].id,
         title: "Deleting Workout Tag Title"
      };

      expect(await updateWorkoutTag(tag, "delete")).toEqual({
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
      });
   });

   test("Calculate applied workout tag updates", async() => {
      // Mock applied workout tags and workout entries
      const newTagIds = [
         "69b62ca8-9222-4d68-b83a-c352c3989a49",
         "69b62ca8-9222-4d68-b83a-c352c3989a50"
      ];

      const existingTagIds = [
         tags[0].id,
         tags[1].id
      ];

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

      const newWorkout = {
         ...workout,
         tagIds: [
            ...newTagIds,
            ...existingTagIds
         ]
      };

      expect(
         await getAppliedWorkoutTagUpdates(existingWorkout, newWorkout)
      ).toEqual({
         existing: existingTagIds,
         adding: newTagIds,
         removing: [tags[2].id]
      });
   });
});``