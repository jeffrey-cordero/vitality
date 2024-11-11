"use server";
import prisma from "@/client";
import { users as User } from "@prisma/client";
import { auth } from "@/auth";

export async function getUserByUsername(
   username: string,
   authentication: boolean,
): Promise<User | null> {
   try {
      const user = await prisma.users.findFirst({
         where: {
            username: username
         }
      });

      if (user !== null && !authentication) {
         // Remove password for non-authentication purposes
         user.password = "";
      }

      return user;
   } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch user.");
   }
}

export async function getUserByEmail(email: string, authentication: boolean): Promise<User | undefined> {
   try {
      const user = await prisma.users.findFirst({
         where: {
            email: email
         }
      });

      if (user !== null && !authentication) {
         // Remove password for non-authentication purposes
         user.password = "";
      }

      return user ?? undefined;
   } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch user.");
   }
}

export async function getServerSession(): Promise<User | undefined> {
   const result = await auth();
   return result?.user ? getUserByEmail(result.user.email, false) : undefined;
}
