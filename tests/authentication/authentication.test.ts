import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { prismaMock } from "@/tests/singleton";
import { root, user } from "@/tests/authentication/data";
import { MOCK_ID, simulateDatabaseError } from "@/tests/shared";
import { Registration, signup } from "@/lib/authentication/signup";
import { fetchUser, authorizeServerSession } from "@/lib/authentication/authorize";
import { users } from "@prisma/client";

const EXISTING_USERS = [root, user];
const VALID_REGISTRATION: Registration = {
   name: "user",
   birthday: new Date(),
   username: "user",
   password: "ValidPassword1!",
   confirmPassword: "ValidPassword1!",
   email: "user@gmail.com",
   phone: "1234567890"
};
const INVALID_PASSWORD_MESSAGE = "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (@$!%*#?&)";

// Mock bcrypt password hashing methods
jest.mock("bcryptjs", () => ({
   genSaltSync: jest.fn(() => "mockedSalt"),
   hash: jest.fn((password) => `hashed${password}`),
   compare: jest.fn((one, two) => one === two)
}));

describe("Authentication Tests", () => {
   describe("Registration", () => {
      test("Register with invalid fields", async() => {
         const invalidRegistrations = [
            {
               registration: {
                  ...VALID_REGISTRATION,
                  username: "",
                  password: "",
                  confirmPassword: "",
                  email: "",
                  name: "",
                  birthday: null,
                  phone: ""
               },
               errors: {
                  username: ["Username must be at least 3 characters"],
                  password: [INVALID_PASSWORD_MESSAGE],
                  confirmPassword: [INVALID_PASSWORD_MESSAGE],
                  name: ["Name must be at least 2 characters"],
                  email: ["Email is required"],
                  birthday: ["Birthday is required"]
               }
            },
            {
               registration: {
                  ...VALID_REGISTRATION,
                  phone: "27382738273971238"
               },
               errors: {
                  phone: ["Valid phone number is required, if provided"]
               }
            },
            {
               registration: {
                  ...VALID_REGISTRATION,
                  birthday: new Date(Date.now() + 10000 * 60 * 60 * 24)
               },
               errors: {
                  birthday: ["Birthday cannot be in the future"]
               }
            },
            {
               registration: {
                  ...VALID_REGISTRATION,
                  username: "  AB  ",
                  name: " A "
               },
               errors: {
                  username: ["Username must be at least 3 characters"],
                  name: ["Name must be at least 2 characters"]
               }
            },
            {
               registration: {
                  ...VALID_REGISTRATION,
                  username: "A".repeat(31),
                  name: "B".repeat(201)
               },
               errors: {
                  username: ["Username must be at most 30 characters"],
                  name: ["Name must be at most 200 characters"]
               }
            }
         ];

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
         const invalidRegistrations = [
            {
               password: "ValidPassword1?",
               confirmPassword: "ValidPassword?",
               errors: {
                  confirmPassword: [INVALID_PASSWORD_MESSAGE]
               }
            },
            {
               password: "ValidPassword1!",
               confirmPassword: "ValidPassword2!",
               errors: {
                  password: ["Passwords do not match"],
                  confirmPassword: ["Passwords do not match"]
               }
            }
         ];

         for (const { password, confirmPassword, errors } of invalidRegistrations) {
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