"use server";
import { PrismaClient, Users as User } from "@prisma/client";

export async function getUser(username: string): Promise<User | null> {
   const prisma = new PrismaClient();

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