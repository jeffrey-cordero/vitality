import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { prismaMock } from "@/tests/singleton";
import { authorize, getUserByEmail, getUserByUsername } from "@/lib/authentication/authorize";
import { root, user } from "@/tests/authentication/data";

describe("User Authorization", () => {
   beforeEach(() => {
      // Mock Prisma ORM methods
      // @ts-ignore
      prismaMock.users.findFirst.mockImplementation(async(params) => {
         if (params.where.username === root.username
               || params.where.email === root.email) {
            return root;
         } else if (params.where.username === user.username
               || params.where.email === user.email) {
            return user;
         } else {
            return null;
         }
      });
   });

   test("Fetch user via username", async() => {
      // Existing users
      expect(await getUserByUsername(root.username)).toEqual(root);
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { username: "root" }
      });

      expect(await getUserByUsername(user.username)).toEqual(user);
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { username: "user" }
      });

      // Missing user
      expect(await getUserByUsername("missing")).toBeNull();
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { username: "missing" }
      });

      // Simulate database error
      prismaMock.users.findFirst.mockRejectedValueOnce(
         new Error("Database connection error")
      );

      expect(await getUserByUsername(root.username)).toBeNull();
   });

   test("Fetch user via email", async() => {
      // Existing users
      expect(await getUserByEmail(root.email)).toEqual(root);
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { email: "root@gmail.com" }
      });

      expect(await getUserByEmail(user.email)).toEqual(user);
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { email: "user@gmail.com" }
      });

      // Missing users
      expect(await getUserByEmail("missing@gmail.com")).toBeNull();
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { email: "missing@gmail.com" }
      });
      expect(
         await prismaMock.users.findFirst({
            where: { email: "missing@gmail.com" }
         })
      ).toBeNull();

      // Simulate database error
      prismaMock.users.findFirst.mockRejectedValueOnce(
         new Error("Database connection error")
      );
      expect(await getUserByEmail(root.email)).toBeNull();
   });

   test("Authorization with invalid credentials", async() => {
      // Mock password comparison
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      // Missing user or invalid fields lead to no password comparisons
      let credentials = {
         username: "",
         password: ""
      };

      expect(await authorize(credentials)).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(prismaMock.users.findFirst).not.toHaveBeenCalled();

      credentials = {
         username: "missing-user",
         password: "missing-password"
      };

      expect(await authorize(credentials)).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();

      // Existing users
      credentials = {
         username: root.username,
         password: "incorrect-Password-$123"
      };

      expect(await authorize(credentials)).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(
         credentials.password,
         root.password
      );
      expect(bcrypt.compare).toHaveBeenCalled();

      // Simulate database error
      credentials = {
         username: root.username,
         password: root.password
      };

      prismaMock.users.findFirst.mockRejectedValueOnce(
         new Error("Database connection error")
      );

      expect(await authorize(credentials)).toBeNull();
   });

   test("Authorization with valid credentials", async() => {
      // Mock password comparison
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      const credentials = {
         username: root.username,
         password: root.password
      };

      expect(await authorize(credentials)).toEqual({
         id: root.id,
         name: root.name,
         email: root.email
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
         credentials.password,
         root.password
      );
   });
});