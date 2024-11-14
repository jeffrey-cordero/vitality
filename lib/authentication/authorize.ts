"use server";
import bcrypt from "bcryptjs";
import prisma from "@/client";
import { z } from "zod";
import { users as User } from "@prisma/client";
import { Credentials } from "@/lib/authentication/login";

export async function getUserByUsername(
   username: string
): Promise<User | null> {
   try {
      return await prisma.users.findFirst({
         where: {
            username: username
         }
      });
   } catch (error) {
      return null;
   }
}

export async function getUserByEmail(
   email: string
): Promise<User | null> {
   try {
      return await prisma.users.findFirst({
         where: {
            email: email
         }
      });
   } catch (error) {
      return null;
   }
}

export async function authorize(credentials: Credentials): Promise<any> {
   const parsedCredentials = z
      .object({ username: z.string().trim().min(2).max(30), password: z.string().min(8) })
      .safeParse(credentials);

   if (parsedCredentials.success) {
      const { username, password } = parsedCredentials.data;
      const user = await getUserByUsername(username);

      if (!user) {
         return null;
      }

      const validCredentials = await bcrypt.compare(password, user.password);

      if (validCredentials) {
         return { id: user.id, name: user.name, email: user.email };
      }
   }

   return null;
}
