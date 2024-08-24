"use server";
import { auth } from "@/auth";
import { Session } from "next-auth";

export default async function getServerSession(): Promise<Session | null> {
   return await auth();
}