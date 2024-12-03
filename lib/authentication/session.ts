"use server";
import { auth, signOut as NextAuthSignOut } from "@/auth";
import { User as NextAuthUser } from "next-auth";

export async function getSession(): Promise<NextAuthUser | undefined> {
   return (await auth())?.user ?? undefined;
}

export async function signOut(): Promise<void> {
   await NextAuthSignOut({
      redirect: true
   });
}