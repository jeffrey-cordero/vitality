import { PrismaClient } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";
import { expect } from "@jest/globals";
import { addWorkout, Workout } from "@/lib/workouts/workouts";

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
         title: "Workout Test",
         date: new Date(),
         reflection: "Good workout"
      };

      expected = {
         state: "Success",
         response: { message: "Missing implementation", data: undefined },
         errors: {}
      };

      await expect(addWorkout(payload)).resolves.toEqual(expected);
   });
});