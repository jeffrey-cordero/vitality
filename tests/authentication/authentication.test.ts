import { expect } from "@jest/globals";
import { users } from "@prisma/client";
import bcrypt from "bcryptjs";

import { authorizeServerSession, fetchUser } from "@/lib/authentication/authorize";
import { normalizePhoneNumber } from "@/lib/authentication/shared";
import { signup } from "@/lib/authentication/signup";
import { invalidPasswords, invalidRegistrations, root, user, VALID_REGISTRATION } from "@/tests/authentication/data";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { prismaMock } from "@/tests/singleton";

const EXISTING_USERS: users[] = [root, user];

describe("Authentication Tests", () => {
   describe("Registration", () => {
      test("Should fail registration when fields are invalid", async() => {
         for (const { registration, errors } of invalidRegistrations) {
            await expect(signup(registration)).resolves.toEqual({
               status: "Error",
               body: {
                  data: null,
                  message: "Invalid user registration fields",
                  errors
               }
            });
         }
      });

      test("Should fail registration when passwords are invalid or mismatched", async() => {
         for (const { password, confirmPassword, errors } of invalidPasswords) {
            const registration = {
               ...VALID_REGISTRATION,
               password,
               confirmPassword
            };

            await expect(signup(registration)).resolves.toEqual({
               status: "Error",
               body: {
                  data: null,
                  message: "Invalid user registration fields",
                  errors: errors
               }
            });
         }
      });

      test("Should fail registration when a database conflict or error occurs", async() => {
         // @ts-ignore
         prismaMock.users.findMany.mockResolvedValue(
            EXISTING_USERS as unknown as users[]
         );

         // Normalized values for each attribute should be used for comparison
         const conflictRegistrations = [
            {
               registration: {
                  ...VALID_REGISTRATION,
                  username: "root",
                  email: "new@gmail.com",
                  phone: ""
               },
               errors: {
                  username: ["Username already taken"]
               }
            },
            {
               registration: {
                  ...VALID_REGISTRATION,
                  username: "ROOT",
                  email: "USER@gmail.com",
                  phone: ""
               },
               errors: {
                  username: ["Username already taken"],
                  email: ["Email already taken"]
               }
            },
            {
               registration: {
                  ...VALID_REGISTRATION,
                  username: "root",
                  email: "user@gmail.com",
                  phone: root.phone
               },
               errors: {
                  username: ["Username already taken"],
                  email: ["Email already taken"],
                  phone: ["Phone number already taken"]
               }
            }
         ];

         for (const { registration, errors } of conflictRegistrations) {
            await expect(signup(registration)).resolves.toEqual({
               status: "Error",
               body: {
                  data: null,
                  message: "Account registration conflicts",
                  errors: errors
               }
            });
         }

         // Remove existing mock users for database error simulation
         prismaMock.users.findMany.mockResolvedValue([] as unknown as users[]);

         const uniqueRegistration = {
            ...VALID_REGISTRATION,
            username: "new",
            email: "new@gmail.com",
            phone: ""
         };

         simulateDatabaseError("users", "create", async() => signup(uniqueRegistration));
      });

      test("Should succeed in registration with valid fields", async() => {
         const registration = {
            ...VALID_REGISTRATION,
            username: "unique",
            email: "unique@gmail.com",
            phone: "19145550004"
         };

         await expect(signup(registration)).resolves.toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Successfully registered",
               errors: {}
            }
         });

         expect(prismaMock.users.create).toHaveBeenCalledWith({
            data: {
               username: registration.username.trim(),
               username_normalized: registration.username.toLowerCase().trim(),
               name: registration.name.trim(),
               email: registration.email.trim(),
               email_normalized: registration.email.toLowerCase().trim(),
               password: await bcrypt.hash(
                  registration.password,
                  await bcrypt.genSaltSync(10)
               ),
               birthday: registration.birthday,
               phone: registration.phone.trim(),
               phone_normalized: normalizePhoneNumber(registration.phone.trim())
            }
         } as any);
      });
   });

   describe("Authorization", () => {
      beforeEach(() => {
         // @ts-ignore
         prismaMock.users.findFirst.mockImplementation(async(params) => {
            if (params.where.username === root.username || params.where.email === root.email) {
               return root;
            } else if (params.where.username === user.username || params.where.email === user.email) {
               return user;
            } else {
               return null;
            }
         });
      });

      test("Should fail to fetch user if user does not exist", async() => {
         expect(await fetchUser(MOCK_ID)).toBeNull();
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { username: MOCK_ID }
         } as any);
      });

      test("Should fail fetching user when a database error occurs", async() => {
         prismaMock.users.findFirst.mockRejectedValueOnce(
            new Error("Database connection error")
         );
         expect(await fetchUser(root.username)).toBeNull();
      });

      test("Should succeed in fetching user when user exists", async() => {
         expect(await fetchUser(root.username)).toEqual(root);
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { username: root.username }
         } as any);
      });

      test("Should fail authorization with invalid credentials", async() => {
         // Mock invalid password comparison
         bcrypt.compare.mockResolvedValue(false);

         const credentials = {
            username: root.username,
            password: "invalidPassword"
         };

         expect(await authorizeServerSession(credentials)).toBeNull();
         expect(bcrypt.compare).toHaveBeenCalledWith(
            "invalidPassword",
            root.password
         );
      });

      test("Should fail authorization when a database error occurs", async() => {
         prismaMock.users.findFirst.mockRejectedValueOnce(
            new Error("Database connection error")
         );

         const credentials = { username: root.username, password: root.password };

         expect(await authorizeServerSession(credentials)).toBeNull();
      });

      test("Should succeed in authorization with valid credentials", async() => {
         // Mock valid password comparison
         bcrypt.compare.mockResolvedValue(true);

         const credentials = { username: root.username, password: root.password };

         expect(await authorizeServerSession(credentials)).toEqual({
            id: root.id,
            name: root.name,
            email: root.email
         });
         expect(bcrypt.compare).toHaveBeenCalledWith(root.password, root.password);
      });
   });
});