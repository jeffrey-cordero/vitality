import bcrypt from "bcryptjs";
import { expect } from "@jest/globals";
import { prismaMock } from "@/tests/singleton";
import { root, user } from "@/tests/authentication/data";
import { fetchUser, authorizeServerSession } from "@/lib/authentication/authorize";

describe("User Authorization Service", () => {
   beforeEach(() => {
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
   });

   describe("Fetch user", () => {
      test("Fetch user with existing username", async() => {
         expect(await fetchUser(root.username)).toEqual(root);
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { username: root.username }
         });
      });

      test("Fetch user with non-existing username", async() => {
         expect(await fetchUser("missing")).toBeNull();
         expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
            where: { username: "missing" }
         });
      });

      test("Handles database errors while fetching user", async() => {
         prismaMock.users.findFirst.mockRejectedValueOnce(
            new Error("Database connection error")
         );
         expect(await fetchUser(root.username)).toBeNull();
      });
   });

   describe("Authorize user", () => {
      beforeEach(() => {
         jest.spyOn(bcrypt, "compare");
      });

      test("Attempt authorization with invalid credentials", async() => {
         // Mock invalid password comparison
         bcrypt.compare.mockResolvedValue(false);

         const credentials = {
            username: root.username,
            password: "invalidPassword"
         };

         expect(await authorizeServerSession(credentials)).toBeNull();
         expect(bcrypt.compare).toHaveBeenCalledWith(
            "invalidPassword",
            root.password
         );
      });

      test("Authorization with valid credentials", async() => {
         // Mock valid password comparison
         bcrypt.compare.mockResolvedValue(true);

         const credentials = { username: root.username, password: root.password };

         expect(await authorizeServerSession(credentials)).toEqual({
            id: root.id,
            name: root.name,
            email: root.email
         });
         expect(bcrypt.compare).toHaveBeenCalledWith(root.password, root.password);
      });

      test("Handles database errors while authorizing user", async() => {
         prismaMock.users.findFirst.mockRejectedValueOnce(
            new Error("Database connection error")
         );

         const credentials = { username: root.username, password: root.password };

         expect(await authorizeServerSession(credentials)).toBeNull();
      });
   });
});
