import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { prismaMock } from "@/singleton";
import { Credentials } from "@/lib/authentication/login";
import { authorize, getUserByEmail, getUserByUsername } from "@/lib/authentication/authorize";

const root = {
   id: "1",
   name: "root",
   birthday: new Date(),
   username: "root",
   password: "$Vc$10$O1sZuWf8KWsRcyVDGHQdUOkPma0pPkdM24PNZfB0vo/S/qUMo8.zS",
   email: "root@gmail.com",
   phone: "1234567890"
};

const admin = {
   id: "2",
   name: "admin",
   birthday: new Date(),
   username: "admin",
   password: "$Ac$10$O033ZuWf8KWsRcyVDGHQdUOkPma0pPkdM24PNZfB0vo/S/qUMo8.zS",
   email: "admin@gmail.com",
   phone: "1234567891"
};

describe("User Service Validation", () => {
   beforeEach(() => {
      // @ts-ignore
      // Mock the users' database calls to return the specific users
      prismaMock.users.findFirst.mockImplementation((params) => {
         if (params.where.username === "root"
               || params.where.email === "root@gmail.com") {
            return root;
         } else if (params.where.username === "admin"
               || params.where.email === "admin@gmail.com") {
            return admin;
         } else {
            return null;
         }
      });
   });

   test("Should return corresponding user object for existing username and null otherwise", async() => {
      // Test existing users
      expect(await getUserByUsername("root")).toEqual(root);
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { username: "root" }
      });

      expect(await getUserByUsername("admin")).toEqual(admin);
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { username: "admin" }
      });

      // Test missing user
      expect(await getUserByUsername("missing")).toBeNull();
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { username: "missing" }
      });
      expect(
         prismaMock.users.findFirst({
            where: { username: "missing" }
         })
      ).toBeNull();

      // Test system failure resulting in null user
      prismaMock.users.findFirst.mockRejectedValueOnce(new Error("Database connection error"));
      expect(await getUserByUsername(root.username)).toBeNull();
   });

   test("Should return corresponding user object for existing email and null otherwise", async() => {
      // Test existing users
      expect(await getUserByEmail("root@gmail.com")).toEqual(root);
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { email: "root@gmail.com" }
      });

      expect(await getUserByEmail("admin@gmail.com")).toEqual(admin);
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { email: "admin@gmail.com" }
      });

      // Test missing user
      expect(await getUserByEmail("missing@gmail.com")).toBeNull();
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
         where: { email: "missing@gmail.com" }
      });
      expect(
         prismaMock.users.findFirst({
            where: { email: "missing@gmail.com" }
         })
      ).toBeNull();

      // Test system failure resulting in null user
      prismaMock.users.findFirst.mockRejectedValueOnce(new Error("Database connection error"));
      expect(await getUserByEmail(root.email)).toBeNull();
   });

   test("Should return corresponding authenticated user object on valid credentials and null otherwise", async() => {
      // Test invalid credential parameters
      let credentials: Credentials;

      credentials = {
         username: "",
         password: ""
      };

      expect(await authorize(credentials)).toBeNull();
      expect(prismaMock.users.findFirst).toHaveBeenCalledTimes(0);

      // Test valid credentials by mocking bcrypt.compare to always return true for password comparison
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      credentials = {
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

      credentials = {
         username: admin.username,
         password: admin.password
      };

      expect(await authorize(credentials)).toEqual({
         id: admin.id,
         name: admin.name,
         email: admin.email
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
         credentials.password,
         admin.password
      );

      // Test invalid credentials by mocking bcrypt.compare to always return true for password comparison
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      credentials = {
         username: root.username,
         password: "incorrect"
      };

      expect(await authorize(credentials)).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(
         credentials.password,
         root.password
      );
      expect(bcrypt.compare).toHaveBeenCalledTimes(3);

      // Test missing user, where password bcrypt comparison should not be used
      credentials = {
         username: "missing",
         password: "missing"
      };

      expect(await authorize(credentials)).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledTimes(3);

      // Test system failure resulting in null user
      credentials = {
         username: root.username,
         password: root.password
      };

      prismaMock.users.findFirst.mockRejectedValueOnce(new Error("Database connection error"));
      expect(await authorize(credentials)).toBeNull();
   });
});