import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authorizeServerSession } from "@/lib/authentication/authorize";

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
         session.user.id = token.sub;
         session.user.email = token.email;

         return session;
      },
      async authorized({ auth, request }) {
         const isLoggedIn = !!auth?.user;
         const isOnHome = request.nextUrl.pathname.startsWith("/home");

         if (isOnHome) {
            return isLoggedIn ? true : false;
         } else {
            return isLoggedIn ? Response.redirect(new URL("/home", request.nextUrl)) : true;
         }
      }
   },
   session: {
      strategy: "jwt"
   }
} satisfies NextAuthConfig;