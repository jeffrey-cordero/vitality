import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { users } from "@prisma/client";
import { prismaMock } from "@/tests/singleton";
import { signup } from "@/lib/authentication/signup";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { fetchUser, authorizeServerSession } from "@/lib/authentication/authorize";
import { invalidRegistrations, root, user, VALID_REGISTRATION, invalidPasswords } from "@/tests/authentication/data";

const EXISTING_USERS = [root, user];

// Mock bcrypt password hashing methods
jest.mock("bcryptjs", () => ({
   genSaltSync: jest.fn(() => "mockedSalt"),
   hash: jest.fn((password) => `hashed${password}`),
   compare: jest.fn((one, two) => one === two)
}));

describe("Authentication Tests", () => {
   describe("Registration", () => {
      test("Register with invalid fields", async() => {
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

      test("Register with password errors", async() => {
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

      test("Handle database errors during registration", async() => {
         // @ts-ignore
         prismaMock.users.findMany.mockResolvedValue(
            EXISTING_USERS as unknown as users[]
         );

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
                  username: "root",
                  email: "user@gmail.com",
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
                  phone: "1234567891"
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

         // Remove existing mock users
         prismaMock.users.findMany.mockResolvedValue([] as unknown as users[]);

         const uniqueRegistration = {
            ...VALID_REGISTRATION,
            username: "new",
            email: "new@gmail.com",
            phone: ""
         };

         await expect(signup(uniqueRegistration)).resolves.toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Successfully registered",
               errors: {}
            }
         });
         expect(prismaMock.users.create).toHaveBeenCalled();

         simulateDatabaseError("users", "create", async() => signup(uniqueRegistration));
      });

      test("Sign up with valid fields", async() => {
         const registration = {
            ...VALID_REGISTRATION,
            username: "unique",
            email: "unique@gmail.com",
            phone: ""
         };

         await expect(signup(registration)).resolves.toEqual({
            status: "Success",
            body: {
               data: null,
               message: "Successfully registered",
               errors: {}
            }
         });
         // @ts-ignore
         expect(prismaMock.users.create).toHaveBeenCalledWith({
            data: {
               username: registration.username.trim(),
               name: registration.name.trim(),
               email: registration.email.trim(),
               password: await bcrypt.hash(
                  registration.password,
                  await bcrypt.genSaltSync(10)
               ),
               birthday: registration.birthday,
               phone: undefined
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

      test("Fetch existing and missing users", async() => {
         expect(await fetchUser(root.username)).toEqual(root);
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { username: root.username }
         } as any);

         expect(await fetchUser(MOCK_ID)).toBeNull();
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { username: MOCK_ID }
         } as any);
      });

      test("Handle database errors when fetching user", async() => {
         prismaMock.users.findFirst.mockRejectedValueOnce(
            new Error("Database connection error")
         );
         expect(await fetchUser(root.username)).toBeNull();
      });

      test("Attempt authorization with invalid credentials", async() => {
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

      test("Authorize with valid credentials", async() => {
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

      test("Handle database errors during authorization", async() => {
         prismaMock.users.findFirst.mockRejectedValueOnce(
            new Error("Database connection error")
         );

         const credentials = { username: root.username, password: root.password };

         expect(await authorizeServerSession(credentials)).toBeNull();
      });
   });
});