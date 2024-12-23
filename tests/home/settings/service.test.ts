import { expect } from "@jest/globals";
import bcrypt from "bcryptjs";

import { fetchAttributes } from "@/lib/authentication/authorize";
import { VitalityResponse } from "@/lib/global/response";
import { deleteAccount, updateAttribute, updatePassword, updatePreference, verifyAttribute } from "@/lib/home/settings/service";
import { INVALID_PASSWORD_MESSAGE, invalidPasswords, invalidRegistrations, root, user } from "@/tests/authentication/data";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { prismaMock } from "@/tests/singleton";

let expected: VitalityResponse<void>;
const oldPassword: string = "ValidPassword$1";
const newPassword: string = "ValidPassword$2";

describe("Settings Tests", () => {
   beforeEach(() => {
      // @ts-ignore
      prismaMock.users.findFirst.mockImplementation(async(params) => {
         if (params.where.id === user.id || params.where.email === user.email
               || params.where.username === user.username || params.where.phone === user.phone) {
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

   describe("Fetch Attributes", () => {
      test("Fetch user attributes for existing and missing users", async() => {
         expect(await fetchAttributes(root.id)).toEqual({
            ...root,
            password: "*".repeat(root.password.length)
         });
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { id: root.id }
         } as any);

         expect(await fetchAttributes(MOCK_ID)).toEqual(null);
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { id: MOCK_ID }
         } as any);
      });

      test("Handle database errors when fetching user attributes", async() => {
         // @ts-ignore
         prismaMock.users.findFirst.mockRejectedValue(
            new Error("Database Error")
         );

         expect(await fetchAttributes(root.id)).toEqual(null);
         expect(await fetchAttributes(MOCK_ID)).toEqual(null);
      });
   });

   describe("Update Attribute", () => {
      test("Update attribute with errors", (async() => {
         // Invalid attributes
         expected = {
            status: "Failure",
            body: {
               data: null,
               message: "Something went wrong. Please try again.",
               errors: {
                  system: ["Updating user attribute must be valid"]
               }
            }
         };

         expect(await updateAttribute(root.id, "id", "",)).toEqual(expected);
         expect(await updateAttribute(root.id, "random" as any, "",)).toEqual(expected);
         expect(await updateAttribute(root.id, "workouts" as any, "",)).toEqual(expected);

         // Invalid fields
         for (const { registration, errors } of invalidRegistrations) {
            const attributes = Object.keys(registration);

            for (const attribute of attributes) {
               if (attribute === "confirmPassword" || !errors[attribute]) continue;

               expect(await updateAttribute(root.id, attribute as any, registration[attribute])).toEqual({
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

      test("Handle database constraints when updating attributes", async() => {
         // Missing user
         expect(await updateAttribute(MOCK_ID, "birthday", new Date())).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "User does not exist based on user ID",
               errors: {}
            }
         });

         // Unique user attributes already being taken
         ["username", "email", "phone"].forEach(
            async(attribute: string) =>  {
               expect(await updateAttribute(root.id, attribute as any, user[attribute])).toEqual({
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

         // Database error
         simulateDatabaseError("users", "update", async() => await updateAttribute(root.id, "username", "new-username"));
      });

      test("Update user attributes", async() => {
         const verifyAttributeUpdates = async(
            attribute: string,
            value: any,
            email_verified: boolean,
            phone_verified: boolean,
            changes: boolean
         ) => {
            // Helper method to verify that a user attribute changes or remains untouched
            expect(await updateAttribute(root.id, attribute as any, value)).toEqual({
               status: "Success",
               body: {
                  data: null,
                  message: changes ? `Updated ${attribute}` : `No updates for ${attribute}`,
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
         verifyAttributeUpdates("image", "/workouts/cardio.png", undefined, undefined, true);
         verifyAttributeUpdates("birthday", new Date(), undefined, undefined, true);
         verifyAttributeUpdates("name", "new-name", undefined, undefined, true);

         // Update verification-based attributes, which may change verification status
         verifyAttributeUpdates("email", "new-email@gmail.com", false, undefined, true);
         verifyAttributeUpdates("email", root.email, undefined, undefined, false);

         verifyAttributeUpdates("phone", "1234567892", undefined, false, true);
         verifyAttributeUpdates("phone", root.phone, undefined, undefined, false);
      });
   });

   describe("Update Password", () => {
      test("Update password with field errors", async() => {
         for (const { password, confirmPassword, errors } of invalidPasswords) {
            // Handling invalid passwords and passwords not matching
            expect(await updatePassword(root.id, password, password, confirmPassword)).toEqual({
               status: "Error",
               body: {
                  data: null,
                  message: "Invalid password fields",
                  errors: {
                     oldPassword: errors.password?.[0] !== INVALID_PASSWORD_MESSAGE ? undefined : errors.password,
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

         // Invalid old password
         const password: string = "ValidPassword$1";

         expect(await updatePassword(root.id, password, password, password)).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "Invalid password fields",
               errors: {
                  oldPassword: ["Old password does not match"]
               }
            }
         });

         // No changes in password value
         bcrypt.compare.mockResolvedValue(true);

         expect(await updatePassword(root.id, password, password, password)).toEqual({
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

      test("Handle database constraints when updating password", async() => {
         // Missing user
         expect(await updatePassword(MOCK_ID, oldPassword, newPassword, newPassword)).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "User does not exist based on user ID",
               errors: {}
            }
         });

         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: {
               id: MOCK_ID
            },
            select: {
               password: true
            }
         } as any);

         // Database error
         bcrypt.compare.mockResolvedValue(true);
         simulateDatabaseError("users", "update", async() => await updatePassword(root.id, oldPassword, newPassword, newPassword));
      });

      test("Update password", async() => {
         bcrypt.compare.mockResolvedValue(true);

         expect(await updatePassword(root.id, oldPassword, newPassword, newPassword)).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Updated password",
               errors: {}
            }
         });

         expect(prismaMock.users.update).toHaveBeenCalledWith({
            where: {
               id: root.id
            },
            data: {
               password: await bcrypt.hash(newPassword, await bcrypt.genSaltSync(10))
            }
         });
      });
   });

   describe("Verify Attribute", () => {
      test("Verify attribute for missing users", async() => {
         expect(await verifyAttribute(MOCK_ID, "phone_verified")).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "User does not exist based on user ID",
               errors: {}
            }
         });
      });

      test("Handle database constraints when verifying attributes", async() => {
         simulateDatabaseError("users", "update", async() => await verifyAttribute(root.id, "phone_verified"));
      });

      test("Verify attributes", async() => {
         // Update verification status
         expect(await verifyAttribute(root.id, "email_verified")).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Successful email verification",
               errors: {}
            }
         });

         expect(await verifyAttribute(root.id, "phone_verified")).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Successful phone number verification",
               errors: {}
            }
         });

         // No updates to verification status
         expect(await verifyAttribute(user.id, "phone_verified")).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Phone number is already verified",
               errors: {}
            }
         });

         expect(await verifyAttribute(user.id, "email_verified")).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Email is already verified",
               errors: {}
            }
         });
      });
   });

   describe("Update Preferences", () => {
      test("Update preferences for missing users", async() => {
         expect(await updatePreference(MOCK_ID, "mail", false)).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "User does not exist based on user ID",
               errors: {}
            }
         });
      });

      test("Handle database constraints when updating preferences", async() => {
         simulateDatabaseError("users", "update", async() => await updatePreference(root.id, "mail", !root.email_verified));
      });

      test("Update preferences", async() => {
         // Updates preference
         expect(await updatePreference(root.id, "mail", !root.email_verified)).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Updated email notification preference",
               errors: {}
            }
         });

         expect(await updatePreference(root.id, "sms", !root.phone_verified)).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Updated SMS notification preference",
               errors: {}
            }
         });

         // No updates to preferences
         expect(await updatePreference(root.id, "mail", root.email_verified)).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "No changes in email notification preference",
               errors: {}
            }
         });

         expect(await updatePreference(root.id, "sms", root.email_verified)).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "No changes in SMS notification preference",
               errors: {}
            }
         });
      });
   });

   describe("Delete Account", () => {
      test("Delete account for missing user", async() => {
         expect(await deleteAccount(MOCK_ID)).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "User does not exist based on user ID",
               errors: {}
            }
         });
      });

      test("Handle database constraints when deleting account", async() => {
         // @ts-ignore
         prismaMock.users.findFirst.mockRejectedValueOnce(
            new Error("Database Error")
         );

         expect(await deleteAccount(root.id)).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "User does not exist based on user ID",
               errors: {}
            }
         });

         simulateDatabaseError("users", "delete", async() => await deleteAccount(root.id));
      });

      test("Delete account", async() => {
         expect(await deleteAccount(root.id)).toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Successful account deletion",
               errors: {}
            }
         });
      });
   });
});