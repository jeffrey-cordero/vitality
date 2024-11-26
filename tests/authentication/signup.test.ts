import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { users } from "@prisma/client";
import { root, user } from "@/tests/authentication/data";
import { prismaMock } from "@/tests/singleton";
import { Registration, signup } from "@/lib/authentication/signup";

// Constants for common test mock values
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
const INVALID_PASSWORD_MESSAGE =
  "Password must contain at least 8 characters, " +
  "one uppercase letter, one lowercase letter, " +
  "one number, and one special character (@$!%*#?&)";

// Mock bcrypt password hashing methods
jest.mock("bcryptjs", () => ({
   genSaltSync: jest.fn(() => "mockedSalt"),
   hash: jest.fn((password) => `hashed${password}`)
}));

describe("User Registration Service", () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   test("Handles invalid registration fields", async() => {
      // Test registration with a mix of missing, empty, and invalid fields
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
               birthday: new Date(Date.now() + 100000 * 60 * 60 * 24)
            },
            errors: {
               birthday: ["Birthday cannot be in the future"]
            }
         },
         {
            registration: {
               ...VALID_REGISTRATION,
               username: "JC",
               name: " J "
            },
            errors: {
               username: ["Username must be at least 3 characters"],
               name: ["Name must be at least 2 characters"]
            }
         },
         {
            registration: {
               ...VALID_REGISTRATION,
               username: "JC".repeat(16),
               name: "J".repeat(201)
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

   test("Handles password validation errors", async() => {
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

   test("Handles database integrity errors", async() => {
      // @ts-ignore
      // Mock existing users in database
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

      // Test unique registration after mock removal of existing users
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

      // Simulate database error
      prismaMock.users.create.mockRejectedValueOnce(
         new Error("Database connection error")
      );

      await expect(signup(uniqueRegistration)).resolves.toEqual({
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: {
               system: ["Database connection error"]
            }
         }
      });
      expect(prismaMock.users.create).toHaveBeenCalledTimes(2);
   });

   test("Handles successful user registration", async() => {
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
      });
   });
});
