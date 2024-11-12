"use server";
import { auth } from "@/auth";
import { users as User } from "@prisma/client";
import { getUserByEmail } from "@/lib/authentication/authorize";

export async function getServerSession(): Promise<User | undefined> {
   const result = await auth();
   return result?.user ? getUserByEmail(result.user.email) : undefined;
}
