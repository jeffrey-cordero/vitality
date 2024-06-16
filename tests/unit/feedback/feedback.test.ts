import { PrismaClient } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";

jest.mock("@prisma/client", () => ({
   PrismaClient: function() {
      return mockDeep<PrismaClient>();
   }
}));

test("Test that user feedback can be stored", async() => {

});