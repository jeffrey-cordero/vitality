"use server";
import prisma from "@/lib/database/client";
import { users as User } from "@prisma/client";
import { auth } from "@/auth";

export async function getUserByUsername(username: string, authentication: boolean): Promise<User | null> {
   try {
      const user = await prisma.users.findFirst({
         where: {
            username: username
         }
      });

      if (user !== null && !(authentication)) {
         // Remove password from the user object outside of authentication purposes
         user.password = "";
      }

      return user;
   } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch user.");
   }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
   try {
      const user = await prisma.users.findFirst({
         where: {
            email: email
         }
      });

      if (user !== null) {
         // Remove password from the user object
         user.password = "";
      }

      return user ?? undefined;
   } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch user.");
   }
}

export async function getAuthentication(): Promise<User | undefined> {
   const result = await auth();
   return result?.user ? getUserByEmail(result.user.email as string) : undefined;
}