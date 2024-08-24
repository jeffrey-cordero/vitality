"use server";
import prisma from "@/lib/database/client";
import { Users as User } from "@prisma/client";
import { auth } from "@/auth";

export async function getUser(username: string): Promise<User | null> {
   try {
      const user = await prisma.users.findFirst({
         where: {
            username: username
         }
      });

      return user;
   } catch (error) {
      console.error("Failed to fetch user:", error);
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

      return user ?? undefined;
   } catch (error) {
      console.error("Failed to fetch user:", error);
      throw new Error("Failed to fetch user.");
   }
}

export async function getAuthentication(): Promise<any> {
   const result = await auth();
   return result?.user ? getUserByEmail(result.user.email as string) : undefined;
}