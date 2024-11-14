import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { authorize } from "@/lib/authentication/authorize";

export const { auth, handlers, signIn, signOut } = NextAuth({
   ...authConfig,
   providers: [
      Credentials({
         authorize
      })
   ]
});