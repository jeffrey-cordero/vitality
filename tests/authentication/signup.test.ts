import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { prismaMock } from "@/singleton";
import { VitalityResponse } from "@/lib/global/response";
import { Registration, signup } from "@/lib/authentication/signup";

let registration: Registration;
let expected: VitalityResponse<Registration>;

jest.mock("bcryptjs", () => ({
   genSaltSync: jest.fn(),
   hash: jest.fn()
}));

describe("User Registration Validation", () => {
   test("Should fail when any required registration field is invalid or missing", async() => {
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
      expected.body.errors.phone = ["Valid phone number is required, if provided"];
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
      registration.name = "J".repeat(201);
      expected.body.errors.name = ["Name must be at most 200 characters"];
      await expect(signup(registration)).resolves.toEqual(expected);

      // Test username and name lengths at valid minimum lengths
      registration.username = "J_C";
      registration.name = "JC";
      expected = {
         status: "Success",
         body: {
            data: null,
            message: "Successfully registered",
            errors: {}
         }
      };
      await expect(signup(registration)).resolves.toEqual(expected);

      // Test username and name lengths at valid maximum lengths
      registration.username = "J".repeat(30);
      registration.name = "J".repeat(200);
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

      // Test invalid password and confirm password displaying the same error
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
      }
      ];

      // @ts-ignore
      // Test username already taken
      prismaMock.users.findMany.mockReturnValue(existingUsers as any);

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

      // Test email already taken
      registration.email = "test@gmail.com";
      expected.body.errors.email = ["Email already taken"];
      await expect(signup(registration)).resolves.toEqual(expected);

      // Test phone number already taken
      registration.phone = "1234567891";
      expected.body.errors.phone = ["Phone number already taken"];
      await expect(signup(registration)).resolves.toEqual(expected);

      // Test Prisma ORM search for existing users via where statement
      expect(prismaMock.users.findMany).toHaveBeenCalledWith({
         where: {
            OR: [
               { username: registration.username.trim() },
               { email: registration.email.trim() },
               { phone: registration.phone?.trim() }
            ]
         }
      });
      expect(prismaMock.users.findMany()).toHaveLength(2);

      // Remove mock users
      prismaMock.users.findMany.mockReturnValue([] as any);

      // Apply unique account username, email, and phone number parameters
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

      // Test Prisma ORM create database method for proper account registration parameters
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
   });
});
