"use server";
import { User as NextAuthUser } from "next-auth";
import { auth, signOut as NextAuthSignOut } from "@/auth";

export async function getSession(): Promise<NextAuthUser | undefined> {
   return (await auth())?.user ?? undefined;
}

export async function endSession(): Promise<void> {
   await NextAuthSignOut({
      redirect: true
   });
}