"use server";
import prisma from "@/lib/database/client";
import { Users as User } from "@prisma/client";

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