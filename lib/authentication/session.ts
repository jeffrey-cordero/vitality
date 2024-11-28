"use server";
import { auth } from "@/auth";
import { User as NextAuthUser } from "next-auth";

export async function getServerSession(): Promise<NextAuthUser | undefined> {
   return (await auth())?.user ?? undefined;
}