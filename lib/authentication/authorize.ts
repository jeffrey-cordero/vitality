"use server";
import { users as User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { Credentials } from "@/lib/authentication/login";
import prisma from "@/lib/prisma/client";

export async function fetchAttributes(id: string): Promise<User | null> {
   try {
      const user = await prisma.users.findFirst({
         where: {
            id: id
         }
      });

      // Remove password hash value for data integrity if a user is found
      return user !== null ? { ...user, password: "*".repeat(user.password.length) } : null;
   } catch (error) {
      return null;
   }
}

export async function fetchUser(username: string): Promise<User | null> {
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

export async function authorizeServerSession(credentials: Credentials): Promise<any> {
   const parsedCredentials = z
      .object({ username: z.string().trim().min(2).max(30), password: z.string().min(8) })
      .safeParse(credentials);

   if (parsedCredentials.success) {
      const { username, password } = parsedCredentials.data;
      const user = await fetchUser(username);

      if (!user) {
         return null;
      }

      const validCredentials = await bcrypt.compare(password, user.password);

      if (validCredentials) {
         return {
            id: user.id,
            name: user.name,
            email: user.email
         };
      }
   }

   return null;
}