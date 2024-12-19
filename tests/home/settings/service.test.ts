import { expect } from "@jest/globals";
import { MOCK_ID } from "@/tests/shared";
import { prismaMock } from "@/tests/singleton";
import { root } from "@/tests/authentication/data";
import { updateUserAttribute } from "@/lib/settings/service";
import { fetchUserAttributes } from "@/lib/authentication/authorize";
import { VitalityResponse } from "@/lib/global/response";

let expected: VitalityResponse<void>;

describe("Settings Tests", () => {
   beforeEach(() => {
      // @ts-ignore
      prismaMock.users.findFirst.mockImplementation(async(params) => {
         return params.where.id === root.id ? root : null;
      });

      // @ts-ignore
      prismaMock.users.update.mockImplementation(async(params) => {
         return params.where.id === root.id ? { ...root, ...params.data } : null;
      });
   });

   describe("User Attribute", () => {
      test("Fetch user attributes for existing and missing users", async() => {
         expect(await fetchUserAttributes(root.id)).toEqual({ 
            ...root, 
            password: "*".repeat(root.password.length) 
         });
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { id: root.id }
         } as any);

         expect(await fetchUserAttributes(MOCK_ID)).toEqual(null);
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { id: MOCK_ID }
         } as any);
      });

      test("Handle database errors when fetching user attributes", async() => {
         // @ts-ignore
         prismaMock.users.findFirst.mockRejectedValue(
            new Error("Database Error")
         );

         expect(await fetchUserAttributes(root.id)).toEqual(null);
         expect(await fetchUserAttributes(MOCK_ID)).toEqual(null);
      });

      test("Update attribute with errors", (async () => {
         // Invalid attributes
         expected = {
            status: 'Failure',
            body: {
              data: null,
              message: "Something went wrong. Please try again.",
              errors: { system: ["Updating user attribute must be valid"] }
            }
          }
          
         expect(await updateUserAttribute(root.id, "id", "",)).toEqual(expected);
         expect(await updateUserAttribute(root.id, "random" as any, "",)).toEqual(expected);
         expect(await updateUserAttribute(root.id, "workouts" as any, "",)).toEqual(expected);

         expected = {
            status: 'Error',
            body: {
              data: null,
              message: 'Invalid user attribute',
              errors: { email: [""] }
            }
          }

         // console.log(JSON.stringify(await updateUserAttribute(root.id, "email", "invalid.com")));
         console.log((await updateUserAttribute(root.id, "email", "invalid.com")));
      }))
   });

   describe("User Preference", () => {
      test("", async() => {

      });
   });
});