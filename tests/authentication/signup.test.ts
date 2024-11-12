import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { Registration, signup } from "@/lib/authentication/signup";
import { VitalityResponse } from "@/lib/global/response";
import { prismaMock } from "@/singleton";

let registration: Registration;
let expected: VitalityResponse<Registration>;

jest.mock("bcryptjs", () => ({
   genSaltSync: jest.fn(),
   hash: jest.fn()
}));

describe("User Registration Validation", () => {
   test("Should fail when any required field is invalid or missing", async() => {
      // Test empty, missing, and null fields
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

      // Test invalid phone number
      registration.phone = "27382738273971238";
      expected.body.errors.phone = [
         "Valid phone number is required, if provided"
      ];

      await expect(signup(registration)).resolves.toEqual(expected);

      // Test future birthday
      registration.birthday = new Date(Date.now() + 1000 * 60 * 60 * 24);
      expected.body.errors.birthday = ["Birthday cannot be in the future"];

      await expect(signup(registration)).resolves.toEqual(expected);
   });

   test("Should fail when name and/or username is invalid and succeed otherwise", async() => {
      // Test username too short
      registration = {
         name: "Jeffrey",
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
               username: ["Username must be at least 3 characters"]
            }
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);

      // Test username too long
      registration.username = registration.username.repeat(16);
      expected.body.errors.username = ["Username must be at most 30 characters"];

      await expect(signup(registration)).resolves.toEqual(expected);

      // Test name too short
      registration.name = " J ";
      expected.body.errors.name = ["Name must be at least 2 characters"];

      await expect(signup(registration)).resolves.toEqual(expected);

      // Test name too long
      registration.name = registration.name.repeat(201);
      expected.body.errors.name = ["Name must be at most 200 characters"];

      await expect(signup(registration)).resolves.toEqual(expected);

      // Test valid username and name lengths at minimum lengths
      registration.username = "J_C";
      registration.name = "JeC";
      expected = {
         status: "Success",
         body: {
            data: null,
            message: "Successfully registered",
            errors: {}
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);
   });

   test("Should fail when passwords are invalid or don't match and succeed otherwise", async() => {
      // Test invalid password, but valid confirm password
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

      // Test invalid password and confirm password
      registration.confirmPassword = registration.password;
      expected.body.errors.confirmPassword = expected.body.errors.password;

      await expect(signup(registration)).resolves.toEqual(expected);

      // Test valid passwords, but both passwords do not match
      registration.password = "ValidPassword1!";
      registration.confirmPassword = "ValidPassword21!";
      expected.body.errors.password = expected.body.errors.confirmPassword = [
         "Passwords do not match"
      ];

      await expect(signup(registration)).resolves.toEqual(expected);

      // Test valid matching passwords
      registration.confirmPassword = registration.password;
      expected = {
         status: "Success",
         body: {
            data: null,
            message: "Successfully registered",
            errors: {}
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);
   });

   test("Should fail when username, email, and/or phone number are already taken and succeed otherwise", async() => {
      // Mock existing users
      const existingUsers = [
         {
            id: "",
            name: "root",
            birthday: new Date(),
            username: "root",
            password:
          "$2a$10$OhiZuWf8KWsRcyVDGHQdUOkPma0pPkdM24PNZfB0vo/S/qUMo8.zS",
            email: "root@gmail.com",
            phone: "1234567890"
         },
         {
            id: "",
            name: "test",
            birthday: new Date(),
            username: "test",
            password:
          "$Vc$10$O1sZuWf8KWsRcyVDGHQdUOkPma0pPkdM24PNZfB0vo/S/qUMo8.zS",
            email: "test@gmail.com",
            phone: "1234567891"
         }
      ];
      // @ts-ignore
      prismaMock.users.findMany.mockReturnValue(existingUsers);

      // Test username already taken
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
            message: "Internal database conflicts",
            errors: {
               username: ["Username already taken"]
            }
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);

      // Test email already taken
      registration.email = "test@gmail.com";
      expected.body.errors.email = ["Email already taken"];

      await expect(signup(registration)).resolves.toEqual(expected);

      // Test phone number already taken
      registration.phone = "1234567891";
      expected.body.errors.phone = ["Phone number already taken"];

      await expect(signup(registration)).resolves.toEqual(expected);

      // Test search for existing users via where statement for username, email, and/or phone number
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

      // @ts-ignore
      expect(prismaMock.users.findMany()).toHaveLength(2);

      // Remove mock users
      prismaMock.users.findMany.mockReturnValue([] as any);

      // Apply unique account username, email, and phone number for a successful registration
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

      // Ensure user create database method was called with the proper parameters
      // @ts-ignore
      expect(prismaMock.users.create).toHaveBeenCalledWith({
         data: {
            username: registration.username.trim(),
            name: registration.name.trim(),
            email: registration.email.trim(),
            password: bcrypt.hash(registration.password, bcrypt.genSaltSync(10)),
            birthday: registration.birthday,
            phone: undefined
         }
      });

      // Test system failure during registration process
      // @ts-ignore
      prismaMock.users.create.mockRejectedValueOnce(new Error("Database connection error"));
      expected = {
         status: "Failure",
         body: {
            data: null,
            message: "Database connection error",
            errors: {
               system: ["Database connection error"]
            }
         }
      };

      await expect(signup(registration)).resolves.toEqual(expected);
   });
});