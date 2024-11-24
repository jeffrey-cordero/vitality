import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { prismaMock } from "@/tests/singleton";
import { VitalityResponse } from "@/lib/global/response";
import { Registration, signup } from "@/lib/authentication/signup";

let registration: Registration;
let expected: VitalityResponse<Registration>;

// Mock password hashing methods
jest.mock("bcryptjs", () => ({
   genSaltSync: jest.fn(() => "mocked_salt"),
   hash: jest.fn((password) => `hashed_${password}`)
}));

describe("User Registration", () => {
   test("Registration with field errors", async() => {
      // Missing, empty, and null fields
      registration = {
         name: "",
         username: "",
         birthday: null,
         phone: ""
      } as Registration;

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid user registration fields",
            errors: {
               username: ["Username must be at least 3 characters"],
               password: ["Password is required"],
               confirmPassword: ["Confirm password is required"],
               name: ["Name must be at least 2 characters"],
               email: ["Email is required"],
               birthday: ["Birthday is required"]
            }
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);

      // Invalid phone number
      registration.phone = "27382738273971238";
      expected.body.errors.phone = ["Valid phone number is required, if provided"];

      await expect(signup(registration)).resolves.toEqual(expected);

      // Future birthday
      registration.birthday = new Date(Date.now() + 1000 * 60 * 60 * 24);
      expected.body.errors.birthday = ["Birthday cannot be in the future"];

      await expect(signup(registration)).resolves.toEqual(expected);

      // Username and name too short
      registration = {
         name: " J ",
         birthday: new Date(),
         username: "JC",
         password: "ValidPassword1!",
         confirmPassword: "ValidPassword1!",
         email: "jeffrey@gmail.com",
         phone: "1234567890"
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid user registration fields",
            errors: {
               username: ["Username must be at least 3 characters"],
               name: ["Name must be at least 2 characters"]
            }
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);

      // Username and name too long
      registration.username = registration.username.repeat(16);
      expected.body.errors.username = ["Username must be at most 30 characters"];

      registration.name = "J".repeat(201);
      expected.body.errors.name = ["Name must be at most 200 characters"];

      await expect(signup(registration)).resolves.toEqual(expected);
   });

   test("Registration with password errors", async() => {
      // Weak password
      registration = {
         name: "Jeffrey",
         birthday: new Date(),
         username: "J_C",
         password: "valid?",
         confirmPassword: "ValidPassword1!",
         email: "jeffrey@gmail.com",
         phone: "1234567890"
      };

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Invalid user registration fields",
            errors: {
               password: [
                  "Password must contain at least 8 characters, " +
                  "one uppercase letter, one lowercase letter, " +
                  "one number, and one special character (@$!%*#?&)"
               ]
            }
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);

      // Both password fields displaying same error
      registration.confirmPassword = registration.password;
      expected.body.errors.confirmPassword = expected.body.errors.password;

      await expect(signup(registration)).resolves.toEqual(expected);

      // Passwords not matching
      registration.password = "ValidPassword1!";
      registration.confirmPassword = "ValidPassword21!";
      expected.body.errors.password = expected.body.errors.confirmPassword = [
         "Passwords do not match"
      ];

      await expect(signup(registration)).resolves.toEqual(expected);
   });

   test("Registration with database integrity errors", async() => {
      // Mock existing users
      const existingUsers = [{
         id: "1",
         name: "root",
         birthday: new Date(),
         username: "root",
         password: "$2a$10$OhiZuWf8KWsRcyVDGHQdUOkPma0pPkdM24PNZfB0vo/S/qUMo8.zS",
         email: "root@gmail.com",
         phone: "1234567890"
      }, {
         id: "2",
         name: "test",
         birthday: new Date(),
         username: "test",
         password: "$Vc$10$O1sZuWf8KWsRcyVDGHQdUOkPma0pPkdM24PNZfB0vo/S/qUMo8.zS",
         email: "test@gmail.com",
         phone: "1234567891"
      }];

      // @ts-ignore
      prismaMock.users.findMany.mockImplementation(async() => {
         return existingUsers as any;
      });

      // Username already taken
      registration = {
         name: "root",
         birthday: new Date(),
         username: "root",
         password: "ValidPassword1!",
         confirmPassword: "ValidPassword1!",
         email: "jeffrey@gmail.com",
         phone: "1234567892"
      } as Registration;

      expected = {
         status: "Error",
         body: {
            data: null,
            message: "Account registration conflicts",
            errors: {
               username: ["Username already taken"]
            }
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);

      // Email already taken
      registration.email = "test@gmail.com";
      expected.body.errors.email = ["Email already taken"];

      await expect(signup(registration)).resolves.toEqual(expected);

      // Phone number already taken
      registration.phone = "1234567891";
      expected.body.errors.phone = ["Phone number already taken"];

      await expect(signup(registration)).resolves.toEqual(expected);

      // @ts-ignore
      expect(prismaMock.users.findMany).toHaveBeenCalledWith({
         where: {
            OR: [
               { username: registration.username.trim() },
               { email: registration.email.trim() },
               { phone: registration.phone?.trim() }
            ]
         }
      });
      expect(await prismaMock.users.findMany({
         where: {
            OR: [
               { username: registration.username.trim() },
               { email: registration.email.trim() },
               { phone: registration.phone?.trim() }
            ]
         }
      })).toHaveLength(2);

      // Remove mock users
      // @ts-ignore
      prismaMock.users.findMany.mockImplementation(async() => {
         return [] as any;
      });

      // Unique registration parameters
      registration.username = "jeffrey";
      registration.email = "jeffrey@gmail.com";
      registration.phone = "";

      expected = {
         status: "Success",
         body: {
            data: null,
            message: "Successfully registered",
            errors: {}
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);
      expect(prismaMock.users.create).toHaveBeenCalled();

      // Simulate database error
      prismaMock.users.create.mockRejectedValueOnce(
         new Error("Database connection error")
      );

      expected = {
         status: "Failure",
         body: {
            data: null,
            message: "Something went wrong. Please try again.",
            errors: {
               system: ["Database connection error"]
            }
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);
      expect(prismaMock.users.create).toHaveBeenCalledTimes(2);
   });

   test("Successful user registration", async() => {
      registration = {
         name: "test",
         birthday: new Date(),
         username: "test",
         password: "ValidPassword1!",
         confirmPassword: "ValidPassword1!",
         email: "test@gmail.com",
         phone: "1234567899"
      } as Registration;

      expected = {
         status: "Success",
         body: {
            data: null,
            message: "Successfully registered",
            errors: {}
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);
      expect(prismaMock.users.create).toHaveBeenCalled();
      expect(prismaMock.users.create).toHaveBeenCalledWith({
         data: {
            username: registration.username.trim(),
            name: registration.name.trim(),
            email: registration.email.trim(),
            password: await bcrypt.hash(registration.password, await bcrypt.genSaltSync(10)),
            birthday: registration.birthday,
            phone: registration.phone.trim()
         }
      });
   });
});
