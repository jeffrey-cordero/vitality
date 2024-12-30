import { expect } from "@jest/globals";
import { users as User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { fetchAttributes } from "@/lib/authentication/authorize";
import { normalizePhoneNumber } from "@/lib/authentication/shared";
import { VitalityResponse } from "@/lib/global/response";
import { deleteAccount, updateAttribute, updatePassword, updatePreference, verifyAttribute } from "@/lib/home/settings/settings";
import { INVALID_PASSWORD_MESSAGE, invalidPasswords, invalidRegistrations, root, user } from "@/tests/authentication/data";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { prismaMock } from "@/tests/singleton";

let expected: VitalityResponse<void>;

describe("Settings Tests", () => {
   beforeEach(() => {
      // @ts-ignore
      prismaMock.users.findFirst.mockImplementation(async(params) => {
         const matchesExistingUser = (user: User) => {
            // Helper method to check if a user matches based on ID or normalized attributes
            return params.where.id === user.id ||
               params.where.email_normalized === user.email_normalized ||
               params.where.username_normalized === user.username_normalized ||
               params.where.phone_normalized === user.phone_normalized;
         };

         if (matchesExistingUser(user)) {
            return user;
         } else if (matchesExistingUser(root)) {
            return root;
         } else {
            return null;
         }
      });

      // @ts-ignore
      prismaMock.users.update.mockImplementation(async(params) => {
         return params.where.id === root.id ? { ...root, ...params.data } : null;
      });
   });

   describe("Fetch Attributes", () => {
      test("Should return null if user does not exist", async() => {
         expect(await fetchAttributes(MOCK_ID)).toBeNull();
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { id: MOCK_ID }
         } as any);
      });

      test("Should fail fetching attributes when a database conflict or error occurs", async() => {
         // @ts-ignore
         prismaMock.users.findFirst.mockRejectedValue(
            new Error("Database Error")
         );

         expect(await fetchAttributes(root.id)).toEqual(null);
         expect(await fetchAttributes(MOCK_ID)).toEqual(null);
      });

      test("Should fetch attributes for existing users", async() => {
         expect(await fetchAttributes(root.id)).toEqual({
            ...root,
            // Password hash should be removed in place of asterisks
            password: "*".repeat(root.password.length)
         });
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { id: root.id }
         } as any);
      });
   });

   describe("Update Attribute", () => {
      test("Should fail to update attributes when fields are invalid", (async() => {
         // Invalid user attributes
         expected = {
            status: "Failure",
            body: {
               data: null,
               message: "Oops! Something went wrong. Try again later.",
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

      test("Should fail updating attributes when a database conflict or error occurs", async() => {
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
                        [attribute]:  [`${attribute[0].toUpperCase() + attribute.substring(1)} is already taken`]
                     }
                  }
               });
            }
         );

         // Database error
         simulateDatabaseError("users", "update", async() => await updateAttribute(root.id, "username", "new-username"));
      });

      test("Should succeed in updating attributes with valid fields", async() => {
         const verifyAttributeUpdates = async(
            attribute: string,
            value: any,
            attributeUpdates: boolean,
            verificationUpdates: boolean,
            isNormalized: boolean,
            normalizedUpdates?: boolean
         ) => {
            // Helper method to verify that a user attribute changes and if verification status changes
            expect(await updateAttribute(root.id, attribute as any, value)).toEqual({
               status: "Success",
               body: {
                  // For normalized values, data should be true if verification status changes, false if no changes, and null otherwise
                  data: isNormalized ? normalizedUpdates : attributeUpdates,
                  message: attributeUpdates ? `Updated ${attribute}` : `No updates for ${attribute}`,
                  errors: {}
               }
            });

            // @ts-ignore
            attributeUpdates && expect(prismaMock.users.update).toHaveBeenCalledWith({
               where: {
                  id: root.id
               },
               data: isNormalized ? {
                  [attribute]: value,
                  [`${attribute}_normalized`]: attribute === "phone"
                     ? normalizePhoneNumber(value) : value.trim().toLowerCase(),
                  [attribute === "email" ? "email_verified" : "phone_verified"]:
                     verificationUpdates ? false : undefined
               } : {
                  [attribute]: value
               }
            } as any);
         };

         // verifyAttributeUpdates(attribute, value, expects updates, expects verification changes, requires normalization, expects normalized updates?)

         // Update general attributes (new value, same value)
         verifyAttributeUpdates("image", "/settings/one.png", true, false, false);
         verifyAttributeUpdates("image", root.image, false, false, false);

         verifyAttributeUpdates("birthday", new Date(), true, false, false);
         verifyAttributeUpdates("birthday", root.birthday, false, false, false);

         verifyAttributeUpdates("name", "new-name", true, false, false);
         verifyAttributeUpdates("name", root.name, false, false, false);

         // Update attributes requiring normalization (same value, new non-normalized value, new value)
         verifyAttributeUpdates("username", root.username, false, false, true, false);
         verifyAttributeUpdates("username", root.username.toUpperCase(), true, false, true, null);
         verifyAttributeUpdates("username", "new-username", true, false, true, true);

         verifyAttributeUpdates("email", root.email, false, false, true, false);
         verifyAttributeUpdates("email", root.email.toUpperCase(), true, false, true, null);
         verifyAttributeUpdates("email", "new-email@gmail.com", true, true, true, true);

         verifyAttributeUpdates("phone", root.phone, false, false, true, false);
         verifyAttributeUpdates("phone", root.phone.startsWith("1") ? root.phone.substring(1) : "1" + root.phone, true, false, true, null);
         verifyAttributeUpdates("phone", "9145550004", true, true, true, true);
      });
   });

   describe("Update Password", () => {
      const oldPassword: string = "ValidPassword$1";
      const newPassword: string = "ValidPassword$2";

      test("Should fail to update password when fields are invalid", async() => {
         for (const { password, confirmPassword, errors } of invalidPasswords) {
            // Handling invalid passwords and passwords not matching
            expect(await updatePassword(root.id, password, password, confirmPassword)).toEqual({
               status: "Error",
               body: {
                  data: null,
                  message: "Invalid password fields",
                  errors: {
                     // Old password error should be present if password is invalid, not if remaining fields are mismatched
                     oldPassword: errors.password?.[0] !== INVALID_PASSWORD_MESSAGE ? undefined : errors.password,
                     newPassword: errors.password,
                     confirmPassword: errors.confirmPassword
                  }
               }
            });
         }
      });

      test("Should fail to update password when old password doesn't match or change in request", async() => {
         // Mock invalid password comparison
         bcrypt.compare.mockResolvedValue(false);

         // Invalid old password
         const password: string = "InvalidOldPassword$1";

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

      test("Should fail updating password when a database conflict or error occurs", async() => {
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

      test("Should succeed in updating password with valid fields", async() => {
         bcrypt.compare.mockResolvedValue(true);

         expect(await updatePassword(root.id, oldPassword, newPassword, newPassword)).toEqual({
            status: "Success",
            body: {
               data: true,
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
      test("Should fail verifying attributes when a database conflict or error occurs", async() => {
         // Missing user
         expect(await verifyAttribute(MOCK_ID, "phone_verified")).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "User does not exist based on user ID",
               errors: {}
            }
         });

         // Database error
         simulateDatabaseError("users", "update", async() => await verifyAttribute(root.id, "phone_verified"));
      });

      test("Should succeed in verifying attributes with valid fields", async() => {
         // Update verification status
         expect(await verifyAttribute(root.id, "email_verified")).toEqual({
            status: "Success",
            body: {
               data: true,
               message: "Successful email verification",
               errors: {}
            }
         });

         expect(await verifyAttribute(root.id, "phone_verified")).toEqual({
            status: "Success",
            body: {
               data: true,
               message: "Successful phone number verification",
               errors: {}
            }
         });

         // No updates to verification status
         expect(await verifyAttribute(user.id, "phone_verified")).toEqual({
            status: "Success",
            body: {
               data: false,
               message: "Phone number is already verified",
               errors: {}
            }
         });

         expect(await verifyAttribute(user.id, "email_verified")).toEqual({
            status: "Success",
            body: {
               data: false,
               message: "Email is already verified",
               errors: {}
            }
         });
      });
   });

   describe("Update Preferences", () => {
      test("Should fail updating preferences when a database conflict or error occurs", async() => {
         // Missing user
         expect(await updatePreference(MOCK_ID, "mail", false)).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "User does not exist based on user ID",
               errors: {}
            }
         });

         // Database error
         simulateDatabaseError("users", "update", async() => await updatePreference(root.id, "mail", !root.email_verified));
      });

      test("Should succeed in updating attributes with valid fields", async() => {
         // Updates preference status
         expect(await updatePreference(root.id, "mail", !root.email_verified)).toEqual({
            status: "Success",
            body: {
               data: true,
               message: "Updated email notification preference",
               errors: {}
            }
         });

         expect(await updatePreference(root.id, "sms", !root.phone_verified)).toEqual({
            status: "Success",
            body: {
               data: true,
               message: "Updated SMS notification preference",
               errors: {}
            }
         });

         // No updates to preferences
         expect(await updatePreference(root.id, "mail", root.email_verified)).toEqual({
            status: "Success",
            body: {
               data: false,
               message: "No changes in email notification preference",
               errors: {}
            }
         });

         expect(await updatePreference(root.id, "sms", root.email_verified)).toEqual({
            status: "Success",
            body: {
               data: false,
               message: "No changes in SMS notification preference",
               errors: {}
            }
         });
      });
   });

   describe("Delete Account", () => {
      test("Should fail to delete account for missing user", async() => {
         expect(await deleteAccount(MOCK_ID)).toEqual({
            status: "Error",
            body: {
               data: null,
               message: "User does not exist based on user ID",
               errors: {}
            }
         });
      });

      test("Should fail deleting account when a database conflict or error occurs", async() => {
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

      test("Should succeed in deleting account with valid fields", async() => {
         expect(await deleteAccount(root.id)).toEqual({
            status: "Success",
            body: {
               data: true,
               message: "Successful account deletion",
               errors: {}
            }
         });
      });
   });
});