"use server";
import { auth } from "@/auth";
import { User as NextAuthUser } from "next-auth";

export async function getSession(): Promise<NextAuthUser | undefined> {
   return (await auth())?.user ?? undefined;
}