import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import prisma from "@/lib/prisma/client";

jest.mock("@/lib/prisma/client", () => ({
   __esModule: true,
   default: mockDeep<PrismaClient>()
}));

jest.mock("@/lib/authentication/session", () => ({
   authorizeAction: jest.fn().mockReturnValue(true)
}));

jest.mock("bcryptjs", () => ({
   genSaltSync: jest.fn(() => "mockedSalt"),
   hash: jest.fn((password) => `hashed${password}`),
   compare: jest.fn((a, b) => a === b)
}));

beforeEach(() => {
   mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;