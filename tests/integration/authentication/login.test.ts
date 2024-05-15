import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { getUser } from "@/lib/authentication/user";
import { expect } from "@jest/globals";
import { signup } from "@/lib/authentication/signup";

/** @type {Registration} */
let payload;

/** @type {SubmissionStatus} */
let expected;

describe("User can be created and conflicts arise when attempting login with invalid credentials", () => {
   const prisma = new PrismaClient();

   beforeAll(async () => {
      await prisma.$connect();
   });;

   afterAll(async () => {
      await prisma.$disconnect();
   });

   test("Valid and invalid user credentials", async () => {
      // End to end tests will cover the implementation of authentication in @/auth.ts
      payload = {
         name: "John Doe",
         birthday: new Date("1990-01-01"),
         username: "root_integration_test",
         password: "0Password123$$AA",
         confirmPassword: "0Password123$$AA",
         email: "root.integration.test@example.com",
         phone: "1914517890"
      };

      expected = {
         state: "Success",
         response: { message: "Successfully registered", data: undefined },
         errors: {}
      };

      await expect(signup(payload)).resolves.toEqual(expected);

      // Mock login with user credentials using same logic used in @/lib/credentials/login.ts and @/auth.ts to avoid module conflicts
      const user = await getUser(payload.username.trim());
      expect(user).not.toBe(null);

      const missingUser = await getUser(payload.username.trim() + "a");
      expect(missingUser).toBe(null);

      const validCredentials = await bcrypt.compare(payload.password, user?.password);
      expect(validCredentials).toBe(true);

      // Ensure invalid passwords turn out to be invalid credentials
      let invalidCredentials = await bcrypt.compare("0Password123$$A", user?.password);
      expect(invalidCredentials).toBe(false);

      invalidCredentials = await bcrypt.compare("1Password123$$AA", user?.password);
      expect(invalidCredentials).toBe(false);
   });
});