import { PrismaClient } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";
import { expect } from "@jest/globals";
import { addWorkout } from "@/lib/home/workouts/workouts";

jest.mock("@prisma/client", () => ({
   PrismaClient: function() {
      return mockDeep<PrismaClient>();
   }
}));

let workout;
let expected;

describe("Workout creation, updates, and deletions with validation", () => {
   test("Should fail when...", async() => {

   });
});