import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { prismaMock } from "@/tests/singleton";
import { root, user } from "@/tests/authentication/data";
import { authorize, getUserByEmail, getUserByUsername } from "@/lib/authentication/authorize";

const mockUsersFindFirst = () => {
   // @ts-ignore
   prismaMock.users.findFirst.mockImplementation(async(params) => {
      if (params.where.username === root.username || params.where.email === root.email) {
         return root;
      } else if (params.where.username === user.username || params.where.email === user.email) {
         return user;
      } else {
         return null;
      }
   });
};

describe("User Authorization", () => {
   // Clear and restore mocks for bcrypt
   beforeEach(() => {
      mockUsersFindFirst();
      jest.clearAllMocks();
   });

   afterEach(() => {
      jest.restoreAllMocks();
   });

   describe("Fetch user by username", () => {
      test("Should return user for existing username", async() => {
         expect(await getUserByUsername(root.username)).toEqual(root);
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { username: root.username }
         });
      });

      test("Should return null for missing username", async() => {
         expect(await getUserByUsername("missing")).toBeNull();
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { username: "missing" }
         });
      });

      test("Should handle database errors gracefully", async() => {
         prismaMock.users.findFirst.mockRejectedValueOnce(
            new Error("Database connection error")
         );
         expect(await getUserByUsername(root.username)).toBeNull();
      });
   });

   describe("Fetch user by email", () => {
      test("Should return user for existing email", async() => {
         expect(await getUserByEmail(root.email)).toEqual(root);
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { email: root.email }
         });
      });

      test("Should return null for missing email", async() => {
         expect(await getUserByEmail("missing@gmail.com")).toBeNull();
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { email: "missing@gmail.com" }
         });
      });

      test("Should handle database errors gracefully", async() => {
         prismaMock.users.findFirst.mockRejectedValueOnce(
            new Error("Database connection error")
         );
         expect(await getUserByEmail(root.email)).toBeNull();
      });
   });

   describe("Authorization", () => {
      beforeEach(() => {
         jest.spyOn(bcrypt, "compare");
      });

      test("Should return null for invalid credentials", async() => {
         // Mock invalid password comparison
         bcrypt.compare.mockResolvedValue(false);

         const credentials = {
            username: root.username,
            password: "invalidPassword"
         };

         expect(await authorize(credentials)).toBeNull();
         expect(bcrypt.compare).toHaveBeenCalledWith(
            "invalidPassword",
            root.password
         );
      });

      test("Should return user for valid credentials", async() => {
         // Mock valid password comparison
         bcrypt.compare.mockResolvedValue(true);

         const credentials = { username: root.username, password: root.password };

         expect(await authorize(credentials)).toEqual({
            id: root.id,
            name: root.name,
            email: root.email
         });
         expect(bcrypt.compare).toHaveBeenCalledWith(root.password, root.password);
      });

      test("Should handle database errors gracefully", async() => {
         prismaMock.users.findFirst.mockRejectedValueOnce(
            new Error("Database connection error")
         );

         const credentials = { username: root.username, password: root.password };

         expect(await authorize(credentials)).toBeNull();
      });
   });
});
