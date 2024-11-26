import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { authorizeServerSession } from "./lib/authentication/authorize";

export const authConfig = {
   pages: {
      signIn: "/login"
   },
   providers: [
      Credentials({
         authorize: authorizeServerSession
      })
   ],
   callbacks: {
      async jwt({ token, user }) {
         if (user) {
            token.id = user.id;
            token.name = user.name;
            token.email = user.email;
         }

         return token;
      },
      async session({ session, token }) {
         session.user.id = token.sub as string;
         session.user.email = token.email as string;

         return session;
      },
      async authorized({ auth, request: { nextUrl } }) {
         const isLoggedIn = !!auth?.user;
         const isOnHome = nextUrl.pathname.startsWith("/home");

         if (isOnHome) {
            if (isLoggedIn) {
               return true;
            }

            return false;
         } else if (isLoggedIn) {
            return Response.redirect(new URL("/home", nextUrl));
         } else {
            return true;
         }
      }
   },
   session: {
      strategy: "jwt"
   }
} satisfies NextAuthConfig;
