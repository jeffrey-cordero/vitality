import { PrismaClient } from "@prisma/client";
import { expect } from "@jest/globals";
import { signup } from "@/lib/authentication/signup";

/** @type {Registration} */
let payload;

/** @type {SubmissionStatus} */
let expected;

describe("User can be created and conflicts arise when attempting registration with used unique fields", () => {
   const prisma = new PrismaClient();

   beforeAll(async() => {
      await prisma.$connect();
   });

   afterAll(async() => {
      await prisma.$disconnect();
   });

   test("Missing or incorrect user registration fields", async() => {
      // No birthday or email provided
      payload = {
         name: "John Doe",
         username: "johnDoe123",
         password: "password$AAd123",
         confirmPassword: "password$AAd3",
         phone: "1234567890"
      };

      expected = {
         state: "Error",
         body: { message: "Invalid user registration fields" },
         errors: { birthday: ["Required"], email: ["Required"] }
      };

      await expect(signup(payload)).resolves.toEqual(expected);

      // Validate that the user was not entered into the database
      let missing = await prisma.users.findUnique({
         where: {
            username: "johnDoe123"
         }
      });

      expect(missing).toBe(null);

      // Almost a perfect user registration fields, but passwords do not match
      payload = {
         name: "John Doe",
         birthday: new Date("1990-01-01"),
         username: "john123",
         password: "0Password123$$A2A",
         confirmPassword: "0Password123$$AA",
         email: "john.doe@example.com",
         phone: "1234567890"
      };

      expected = {
         state: "Error",
         body: { message: "Invalid user registration fields" },
         errors: {
            password: ["Passwords do not match"],
            confirmPassword: ["Passwords do not match"]
         }
      };

      await expect(signup(payload)).resolves.toEqual(expected);

      missing = await prisma.users.findUnique({
         where: {
            username: "john123"
         }
      });

      expect(missing).toBe(null);
   });

   test("Valid registration fields and unique field conflicts", async() => {
      payload = {
         name: "John Doe",
         birthday: new Date("1990-01-01"),
         username: "johnny123",
         password: "0Password123$$AA",
         confirmPassword: "0Password123$$AA",
         email: "john.doe@example.com",
         phone: "1234567890"
      };

      expected = {
         state: "Success",
         body: { message: "Successfully registered", data: undefined },
         errors: {}
      };

      await expect(signup(payload)).resolves.toEqual(expected);

      // Validate that the user was entered into the database
      const user = await prisma.users.findUnique({
         where: {
            username: "johnny123"
         }
      });

      expect(user).not.toBe(null);
      expect(user?.username).toBe("johnny123");
      expect(user?.phone).toBe("1234567890");
      expect(user?.email).toBe("john.doe@example.com");
      expect(user?.birthday).toEqual(new Date("1990-01-01T00:00:00.000Z"));

      // Passwords should be hashed for security measures
      expect(user?.password).not.toBe("0Password123$$AA");

      // Valid registration fields, but username already taken
      payload = {
         name: "John Smith",
         birthday: new Date("2008-01-01"),
         username: "johnny123",
         password: "sm&AA1293s$$AA01",
         confirmPassword: "sm&AA1293s$$AA01",
         email: "john.smith@gmail.com",
         phone: "+1-888-555-1234"
      };

      expected = {
         state: "Error",
         body: { message: "Internal database conflicts" },
         errors: {
            username: ["Username already taken"]
         }
      };

      await expect(signup(payload)).resolves.toEqual(expected);

      // Valid registration fields, but email already taken
      payload = {
         name: "Eric Smith",
         birthday: new Date("2014-12-01"),
         username: "eric192",
         password: "sm&AA1293s$$AA01",
         confirmPassword: "sm&AA1293s$$AA01",
         email: "john.doe@example.com",
         phone: "+1-212-456-7890"
      };

      expected = {
         state: "Error",
         body: { message: "Internal database conflicts" },
         errors: {
            email: ["Email already taken"]
         }
      };

      await expect(signup(payload)).resolves.toEqual(expected);

      // Valid registration fields, but phone number already taken
      payload = {
         name: "Smith Row",
         birthday: new Date("2004-01-01"),
         username: "smithRow001",
         password: "sm&AA1293s$$AA01",
         confirmPassword: "sm&AA1293s$$AA01",
         email: "smith.row@example.com",
         phone: "1234567890"
      };

      expected = {
         state: "Error",
         body: { message: "Internal database conflicts" },
         errors: {
            phone: ["Phone number already taken"]
         }
      };

      await expect(signup(payload)).resolves.toEqual(expected);
   });
});
