import { expect } from "@jest/globals";
import { root } from "@/tests/authentication/data";
import { prismaMock } from "@/tests/singleton";
import { VitalityResponse } from "@/lib/global/response";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { workout, tags } from "@/tests/home/workouts/data";
import { addWorkoutTag, fetchWorkoutTags, getAppliedWorkoutTagUpdates, Tag, updateWorkoutTag } from "@/lib/home/workouts/tags";

let tagsByTitle: { [key: string]: Tag } = {};
let tagsById: { [key: string]: Tag } = {};

let tag: Tag;
let expected: VitalityResponse<Tag>;

const handleDatabaseConstraints = (params: any, method: string): Tag | null => {
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

   const newTag: Tag = {
      ...params.data,
      id: method === "create" ? "Mock-ID" : params.where.id,
      user_id: method === "create" ? params.data.user_id : params.where.user_id
   };

   if (method !== "create") {
      delete tagsByTitle[tagsById[params.where.id].title];
      delete tagsById[params.where.id];
   }

   if (method !== "delete") {
      tagsByTitle[newTag.title] = newTag;
      tagsById[newTag.id] = newTag;
   }

   return newTag;
};

describe("Workout Tags", () => {
   beforeEach(() => {
      // Initialize mock tag mappings
      tagsByTitle = Object.fromEntries(
         tags.map((tag) => [tag.title, tag])
      );

      tagsById = Object.fromEntries(
         tags.map((tag) => [tag.id, tag])
      );

      // Mock Prisma ORM methods
      // @ts-ignore
      prismaMock.workout_tags.findMany.mockImplementation(async(params) => {
         return params.where.user_id === root.id ? tags : [];
      });

      // @ts-ignore
      prismaMock.workout_tags.findFirst.mockImplementation(async(params) => {
         if (params.where.user_id !== root.id) {
            return null;
         } else if (params.where.title) {
            return (tagsByTitle[params.where.title as string] as Tag) ?? null;
         } else {
            return tagsById[params.where.id as string] ?? null;
         }
      });

      // @ts-ignore
      ["create", "update", "delete"].forEach((method) => {
         prismaMock.workout_tags[method].mockImplementation(async(params) => {
            return handleDatabaseConstraints(params, method);
         });
      });
   });

   test("Fetch user workout tags", async() => {
      expect(await fetchWorkoutTags(root.id)).toEqual(tags);
      expect(prismaMock.workout_tags.findMany).toHaveBeenCalledWith({
         where: { user_id: root.id }
      });

      expect(await fetchWorkoutTags("Invalid-User-ID")).toEqual([]);
      expect(prismaMock.workout_tags.findMany).toHaveBeenCalledWith({
         where: { user_id: "Invalid-User-ID" }
      });

      // Simulate database error
      prismaMock.workout_tags.findMany.mockRejectedValue(
         new Error("Database Connection Error")
      );

      expect(await fetchWorkoutTags(root.id)).toEqual([]);
      expect(await fetchWorkoutTags("Another-User-ID")).toEqual([]);
   });

   test("Create workout tag with field errors", async() => {
      tag = {
         id: "",
         user_id: "",
         title: "   ",
         color: "#ffeeee"
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid workout tag fields",
            errors: {
               user_id: ["ID for user must be in UUID format"],
               title: ["Title must be at least 3 characters"],
               color: ["Color must be one of the default options"]
            }
         }
      };

      expect(await addWorkoutTag(tag)).toEqual(expected);

      tag = {
         id: "Defined-ID",
         user_id: root.id,
         title: "A".repeat(31),
         color: "rgb(73, 47, 100)"
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid workout tag fields",
            errors: {
               id: ["ID for workout tag must be empty or undefined"],
               title: ["Title must be at most 30 characters"]
            }
         }
      };

      expect(await addWorkoutTag(tag)).toEqual(expected);
      expect(prismaMock.workout_tags.create).not.toHaveBeenCalled();
   });

   test("Create workout tag with database integrity errors", async() => {
      // Existing workout title
      tag = {
         ...tag,
         id: "",
         title: "Strength"
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Workout tag title already exists",
            errors: {
               title: ["Workout tag title already exists"]
            }
         }
      };

      expect(await addWorkoutTag(tag)).toEqual(expected);
      expect(prismaMock.workout_tags.findFirst).toHaveBeenCalledWith({
         where: {
            title: tag.title.trim(),
            user_id: tag.user_id.trim()
         }
      });
      expect(prismaMock.workout_tags.create).not.toHaveBeenCalled();

      // Invalid user ID
      tag = {
         ...tag,
         user_id: "550e8400-e29b-41d4-a716-446655440002"
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

      expect(await addWorkoutTag(tag)).toEqual(expected);
      expect(prismaMock.workout_tags.create).toHaveBeenCalled();

      // Simulate database error
      tag = {
         ...tag,
         user_id: root.id,
         title: "New Title"
      };

      expected = {
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: { system: ["Database Connection Error"] }
         }
      };

      prismaMock.workout_tags.create.mockRejectedValue(
         new Error("Database Connection Error")
      );

      expect(await addWorkoutTag(tag)).toEqual(expected);
      expect(prismaMock.workout_tags.create).toHaveBeenCalledTimes(2);
   });

   test("Create workout tag", async() => {
      tag = {
         id: "",
         user_id: root.id,
         title: "New Workout Title",
         color: "rgb(133, 76, 29)"
      };

      expected = {
         status: "Success",
         body: {
            data: {
               ...tag,
               id: "Mock-ID"
            },
            message: "Successfully added new workout tag",
            errors: {}
         }
      };

      expect(await addWorkoutTag(tag)).toEqual(expected);
      expect(await prismaMock.workout_tags.findFirst({
         where: {
            title: tag.title.trim(),
            user_id: tag.user_id.trim()
         }
      })
      ).toEqual(
         tagsByTitle["New Workout Title"] as any
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
      tag = {
         id: "",
         user_id: root.id,
         title: "",
         color: "#ffeeee"
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid workout tag fields",
            errors: {
               id: ["ID for workout tag must be in UUID format"],
               title: ["Title must be at least 3 characters"],
               color: ["Color must be one of the default options"]
            }
         }
      };

      expect(await updateWorkoutTag(tag, "update")).toEqual(expected);
      expect(prismaMock.workout_tags.update).not.toHaveBeenCalled();

      expect(await updateWorkoutTag(tag, "delete")).toEqual(expected);
      expect(prismaMock.workout_tags.delete).not.toHaveBeenCalled();

      tag = {
         id: tagsByTitle["Strength"].id,
         user_id: "",
         title: "A".repeat(31),
         color: "rgb(73, 47, 100)"
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid workout tag fields",
            errors: {
               title: ["Title must be at most 30 characters"],
               user_id: ["ID for user must be in UUID format"]
            }
         }
      };

      expect(await updateWorkoutTag(tag, "update")).toEqual(expected);
      expect(prismaMock.workout_tags.update).not.toHaveBeenCalled();

      expect(await updateWorkoutTag(tag, "delete")).toEqual(expected);
      expect(prismaMock.workout_tags.delete).not.toHaveBeenCalled();
   });

   test("Update or delete workout tag with database integrity errors", async() => {
      // Missing workout tag
      tag = {
         ...tagsByTitle["Strength"],
         id: "33b33227-56b1-4f10-844a-660b523e546e",
         user_id: "33b33227-56b1-4f10-844a-660b523e543e"
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Workout tag does not exist based on user and/or tag ID",
            errors: {}
         }
      };

      expect(await updateWorkoutTag(tag, "update")).toEqual(expected);
      expect(prismaMock.workout_tags.update).not.toHaveBeenCalled();

      expect(await updateWorkoutTag(tag, "delete")).toEqual(expected);
      expect(prismaMock.workout_tags.delete).not.toHaveBeenCalled();

      expect(prismaMock.workout_tags.findFirst).toHaveBeenCalledWith({
         where: {
            id: tag.id,
            user_id: tag.user_id
         }
      });

      // Simulate database error
      ["update", "delete"].forEach((method) => {
         prismaMock.workout_tags[method].mockRejectedValue(
            new Error("Database Connection Error")
         );
      });

      tag = tagsByTitle["Strength"];

      expected = {
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: {
               system: ["Database Connection Error"]
            }
         }
      };

      expect(await updateWorkoutTag(tag, "update")).toEqual(expected);
      expect(prismaMock.workout_tags.update).toHaveBeenCalled();

      expect(await updateWorkoutTag(tag, "delete")).toEqual(expected);
      expect(prismaMock.workout_tags.delete).toHaveBeenCalled();
   });

   test("Update workout tags", async() => {
      tag = {
         ...tagsByTitle["Strength"],
         title: "Strength Training",
         color: "rgb(110, 54, 48)"
      };

      expected = {
         status: "Success",
         body: {
            data: {
               title: "Strength Training",
               color: "rgb(110, 54, 48)",
               id: tagsByTitle["Strength"].id,
               user_id: root.id
            },
            message: "Successfully updated workout tag",
            errors: {}
         }
      };

      expect(await updateWorkoutTag(tag, "update")).toEqual(expected);
      expect(await prismaMock.workout_tags.findFirst({
         where: {
            title: tag.title.trim(),
            user_id: tag.user_id.trim()
         }
      })
      ).toEqual(
         tagsByTitle["Strength Training"] as any
      );
      expect(await prismaMock.workout_tags.findFirst({
         where: {
            title: "Strength",
            user_id: tag.user_id.trim()
         }
      })
      ).toBeNull();
      expect(tagsByTitle["Strength"]).toBeUndefined();
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
         ...tagsByTitle["Strength"],
         title: "New Title?"
      };

      expected = {
         status: "Success",
         body: {
            data: {
               id: "00a78cd1-1969-4403-8a83-444895e76956",
               user_id: "550e8400-e29b-41d4-a716-446655440000"
            } as Tag,
            message: "Successfully deleted workout tag",
            errors: {}
         }
      };

      expect(await updateWorkoutTag(tag, "delete")).toEqual(expected);
      expect(await prismaMock.workout_tags.findFirst({
         where: {
            title: "Strength",
            user_id: tag.user_id.trim()
         }
      })
      ).toBeNull();
      expect(tagsByTitle["Strength"]).toBeUndefined();
      expect(tagsByTitle["New Title?"]).toBeUndefined();
      expect(prismaMock.workout_tags.delete).toHaveBeenCalledWith({
         where: {
            id: tag.id,
            user_id: tag.user_id
         },
         data: undefined
      });
   });

   test("Calculate applied tag updates", async() => {
      // Mock applied workout tags and workout entries
      const newTagIds = [
         "69b62ca8-9222-4d68-b83a-c352c3989a49",
         "69b62ca8-9222-4d68-b83a-c352c3989a50"
      ];

      const existingTagIds = [
         tagsByTitle["Strength"].id,
         tagsByTitle["Running"].id
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
         removing: [tagsByTitle["Swimming"].id]
      });
   });
});