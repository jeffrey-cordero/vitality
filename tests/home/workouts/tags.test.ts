import { expect } from "@jest/globals";
import { root } from "@/tests/authentication/data";
import { prismaMock } from "@/singleton";
import { addWorkoutTag, Tag } from "@/lib/home/workouts/tags";
import { VitalityResponse } from "@/lib/global/response";
import { addWorkout } from "@/lib/home/workouts/workouts";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const tags: Tag[] = [
   {
      user_id: root.id,
      id: "1d7b74f1-4469-429c-8e89-b66c8e2fa8b9",
      title: "Important",
      color: "rgb(55, 55, 55)"
   },
   {
      user_id: root.id,
      id: "2b4c8e16-6b63-4c5e-953e-65b3d96c9e5f",
      title: "Personal",
      color: "rgb(73, 47, 100)"
   },
   {
      user_id: root.id,
      id: "d7a4f42a-8c5f-4d1d-9c53-1c9b935b6f31",
      title: "Work",
      color: "rgb(133, 76, 29)"
   }
];

const tagsByTitle = {
   "Important": tags[0],
   "Personal": tags[1],
   "Work": tags[2]
};

let tag: Tag;
let expected: VitalityResponse<Tag>;

describe("Workout Tag Validation", () => {
   beforeEach(() => {
      const handleWorkoutTagConstraints = async(params, method) => {
         if (params.data.user_id !== root.id) {
            throw new PrismaClientKnownRequestError(
               "Foreign key constraint violated: `workout_tags_user_id_fkey (index)`", {
                  code: "P2003",
                  clientVersion: "5.22.0",
                  meta: {
                     modelName: 'workout_tags',
                     field_name: "workout_tags_user_id_fkey (index)",
                  }
               },
            );
         } else {
            return {
               ...params.data,
               id: method === "create" ? "New-UUID" : params.data.id
            };
         }
      };

      // @ts-ignore
      // Mock the users' database calls to return workout tags and unique tags based on title and user ID
      prismaMock.workout_tags.findMany.mockImplementation(async(params) => {
         return params.where.user_id === root.id ? tags : [];
      });

      // @ts-ignore
      prismaMock.workout_tags.findMany.mockImplementation(async(params) => {
         return params.where.user_id === root.id
         && tagsByTitle[params.where.title as string] ? 
            tagsByTitle[params.where.title as string] : null;
      });

      // Mock workout tags create, update, and delete ORM methods
      ['create', 'update', 'delete'].forEach(method => {
         // @ts-ignore
         prismaMock.workout_tags[method].mockImplementation(async (params) => {
            return handleWorkoutTagConstraints(params, method);
         });
       });
   });

   test("Should create a workout tag on unique title and valid user ID and fail otherwise ", async() => {
      // Create workout tag using unique title and valid user ID
      tag = {
         id: "",
         user_id: root.id,
         title: "Title",
         color: "rgb(133, 76, 29)"
      };

      expected = {
         status: "Success",
         body: {
            data: {
               ...tag,
               id: "New-UUID"
            },
            message: "Successfully added new workout tag",
            errors: {}
         }
      };

      expect(await addWorkoutTag(tag)).toEqual(expected);
   });
});