import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { prismaMock } from "@/tests/singleton";
import { invalidPasswords, invalidRegistrations, root, user } from "@/tests/authentication/data";
import { updateUserAttribute, updateUserPassword } from "@/lib/settings/service";
import { fetchUserAttributes } from "@/lib/authentication/authorize";
import { VitalityResponse } from "@/lib/global/response";

let expected: VitalityResponse<void>;

jest.mock("bcryptjs", () => ({
   genSaltSync: jest.fn(() => "mockedSalt"),
   hash: jest.fn((password) => `hashed${password}`),
   compare: jest.fn((one, two) => one === two)
}));

describe("Settings Tests", () => {
   beforeEach(() => {
      // @ts-ignore
      prismaMock.users.findFirst.mockImplementation(async(params) => {
         if (params.where.email === user.email || params.where.username === user.username || params.where.phone === user.phone) {
            return user;
         } else {
            return params.where.id === root.id ? root : null;
         }
      });

      // @ts-ignore
      prismaMock.users.update.mockImplementation(async(params) => {
         return params.where.id === root.id ? { ...root, ...params.data } : null;
      });
   });

   describe("Attributes", () => {
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

      test("Update attribute with errors", (async() => {
         // Invalid attributes types
         expected = {
            status: "Failure",
            body: {
               data: null,
               message: "Something went wrong. Please try again.",
               errors: { system: ["Updating user attribute must be valid"] }
            }
         };

         expect(await updateUserAttribute(root.id, "id", "",)).toEqual(expected);
         expect(await updateUserAttribute(root.id, "random" as any, "",)).toEqual(expected);
         expect(await updateUserAttribute(root.id, "workouts" as any, "",)).toEqual(expected);

         expected = {
            status: "Error",
            body: {
               data: null,
               message: "Invalid user attribute",
               errors: { email: [""] }
            }
         };

         // Invalid attribute values
         for (const { registration, errors } of invalidRegistrations) {
            const attributes = Object.keys(registration);

            for (const attribute of attributes) {
               if (attribute === "confirmPassword" || !errors[attribute]) continue;

               expect(await updateUserAttribute(root.id, attribute as any, registration[attribute])).toEqual({
                  status: "Error",
                  body: {
                     data: null,
                     message: "Invalid user attribute",
                     errors: {
                        [attribute]: errors[attribute]
                     }
                  }
               });
            }
         }
      }));

      test("Handle database constraints when updating attribute", async() => {
         // Taken username, email, and phone number
         ["username", "email", "phone"].forEach(
            async(attribute: string) =>  {
               expect(await updateUserAttribute(root.id, attribute as any, user[attribute])).toEqual({
                  status: "Error",
                  body: {
                     data: null,
                     message: "Account attribute conflicts",
                     errors: {
                        [attribute]:  [`${attribute[0].toUpperCase() + attribute.substring(1)} already taken`]
                     }
                  }
               });

               expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
                  where: {
                     [attribute]: user[attribute],
                     NOT: {
                        id: root.id
                     }
                  }
               } as any);
            }
         );

         simulateDatabaseError("users", "update", async() => await updateUserAttribute(root.id, "username", "new-username"));
      });

      test("Update user attribute", async() => {
         const verifyAttributeUpdates = async(
            attribute: string,
            value: any,
            email_verified: boolean,
            phone_verified: boolean,
            changes: boolean
         ) => {
            expect(await updateUserAttribute(root.id, attribute as any, value)).toEqual({
               status: "Success",
               body: {
                  data: null,
                  message: changes ? `Updated ${attribute}` : "No updates",
                  errors: {}
               }
            });

            // @ts-ignore
            changes && expect(prismaMock.users.update).toHaveBeenCalledWith({
               where: {
                  id: root.id
               },
               data: {
                  email_verified: email_verified,
                  phone_verified: phone_verified,
                  [attribute]: value
               }
            } as any);
         };

         // Update general non-verification attributes
         verifyAttributeUpdates("username", "new-username", undefined, undefined, true);
         verifyAttributeUpdates("birthday", new Date(), undefined, undefined, true);
         verifyAttributeUpdates("name", "new-name", undefined, undefined, true);

         // Update to new email, leading to false email verification variable
         verifyAttributeUpdates("email", "new-email@gmail.com", false, undefined, true);

         // Update to existing email, leading to no changes in email verification variable
         verifyAttributeUpdates("email", root.email, undefined, undefined, false);

         // Update to new phone, leading to false phone verification variable
         verifyAttributeUpdates("phone", "1234567892", undefined, false, true);

         // Update to existing phone, leading to no changes phone verification variable
         verifyAttributeUpdates("phone", root.phone, undefined, undefined, false);
      });
   });

   describe("Password", () => {
      test("Update password with field errors", async() => {
         for (const { password, confirmPassword, errors } of invalidPasswords) {
            expect(await updateUserPassword(root.id, password, password, confirmPassword)).toEqual({
               status: "Error",
               body: {
                  data: null,
                  message: "Invalid password fields",
                  errors: {
                     oldPassword: errors.password && errors.confirmPassword ? undefined : errors.password,
                     newPassword: errors.password,
                     confirmPassword: errors.confirmPassword
                  }
               }
            });
         }
      });

      test("Update password with comparison errors", async() => {
         // Mock invalid password comparison
         bcrypt.compare.mockResolvedValue(false);

         // Old password not matching
         const password: string = "ValidPassword$1";

         expect(await updateUserPassword(root.id, password, password, password)).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Invalid password fields",
               errors: {
                  oldPassword: ["Old password does not match"]
               }
            }
         });

         // Old password matching
         bcrypt.compare.mockResolvedValue(true);
         
         expect(await updateUserPassword(root.id, password, password, password)).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Invalid password fields",
               errors: {
                  newPassword: ["New password must not match old password"]
               }
            }
         });

         expect(prismaMock.users.findFirst).toHaveBeenNthCalledWith(2, {
            where: {
               id: root.id
            },
            select: {
               password: true
            }
         } as any);
      });

      test("Update password with comparison errors", async() => {
         // Mock valid password comparison for successful password update
         bcrypt.compare.mockResolvedValue(true);
         const password: string = "ValidPassword$1";

         console.log(JSON.stringify(await updateUserPassword(root.id, password, password, password)))
      })
   });

   describe("Preferences", () => {
      test("", async() => {

      });
   });

   describe("Actions", () => {
      test("", async() => {

      });
   });
});