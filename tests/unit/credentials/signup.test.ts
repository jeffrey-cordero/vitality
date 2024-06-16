import { PrismaClient } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";
import { expect } from "@jest/globals";
import { signup } from "@/lib/authentication/signup";

jest.mock("@prisma/client", () => ({
   PrismaClient: function() {
      return mockDeep<PrismaClient>();
   }
}));

/** @type {Registration} */
let payload;

/** @type {SubmissionStatus} */
let expected;

describe("User can be created given valid fields or rejected given invalid fields in isolation", () => {
   test("Empty required user registration fields", async() => {
      // All empty fields expect for birthday
      payload = {
         name: "",
         birthday: new Date(),
         username: "",
         password: "",
         confirmPassword: "",
         email: "",
         phone: ""
      };

      expected = {
         state: "Error",
         response: { message: "Invalid user registration fields" },
         errors: {
            username: ["A username must be at least 3 characters"],
            password: [
               "A password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*#?&)"
            ],
            name: ["A name must be at least 2 characters"],
            email: ["A valid email is required"],
            phone: ["A valid phone is required if provided"]
         }
      };

      await expect(signup(payload)).resolves.toEqual(expected);
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
         response: { message: "Invalid user registration fields" },
         errors: { birthday: ["Required"], email: ["Required"] }
      };

      await expect(signup(payload)).resolves.toEqual(expected);

      // Username too long, name too short, user too old, phone number too long, but a valid main password
      payload = {
         name: "r",
         birthday: new Date("1776-07-04"),
         username: "Long Username                             Very Long",
         password: "Password$AAd123",
         confirmPassword: "Password$AAd32",
         phone: "12345629313243443243290"
      };

      expected = {
         state: "Error",
         response: { message: "Invalid user registration fields" },
         errors: {
            name: ["A name must be at least 2 characters"],
            birthday: ["A birthday must not be before 200 years ago"],
            username: ["A username must be at most 30 characters"],
            email: ["Required"],
            phone: ["A valid phone is required if provided"]
         }
      };

      await expect(signup(payload)).resolves.toEqual(expected);

      // Almost a perfect user registration fields, but passwords do not match
      payload = {
         name: "John Doe",
         birthday: new Date("1990-01-01"),
         username: "johndoe123",
         password: "0Password123$$A2A",
         confirmPassword: "0Password123$$AA",
         email: "john.doe@example.com",
         phone: "1234567890"
      };

      expected = {
         state: "Error",
         response: { message: "Invalid user registration fields" },
         errors: {
            password: ["Passwords do not match"],
            confirmPassword: ["Passwords do not match"]
         }
      };

      await expect(signup(payload)).resolves.toEqual(expected);
   });

   test("Valid registration with a variety of parameters", async() => {
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
         state: "Succes",
         response: { message: "Successfully registered", data: undefined },
         errors: {}
      };

      const response = await signup(payload);

      console.log(response);

      await expect(signup(payload)).resolves.toEqual(expected);

      payload = {
         name: "John Smith",
         birthday: new Date("2008-01-01"),
         username: "johnny123",
         password: "sm&AA1293s$$AA01",
         confirmPassword: "sm&AA1293s$$AA01",
         email: "john.smith@gmail.com",
         phone: "+1-888-555-1234"
      };

      await expect(signup(payload)).resolves.toEqual(expected);

      payload = {
         name: "Eric Smith",
         birthday: new Date("2014-12-01"),
         username: "eric192",
         password: "sm&AA1293s$$AA01",
         confirmPassword: "sm&AA1293s$$AA01",
         email: "john.doe@example.com",
         phone: "+1-212-456-7890"
      };

      await expect(signup(payload)).resolves.toEqual(expected);

      payload = {
         name: "Smith Row",
         birthday: new Date("2004-01-01"),
         username: "smithRow001",
         password: "sm&AA1293s$$AA01",
         confirmPassword: "sm&AA1293s$$AA01",
         email: "smith.row@example.com",
         phone: "1234567890"
      };

      await expect(signup(payload)).resolves.toEqual(expected);
   });
});