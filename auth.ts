import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { z } from "zod";
import { getUser } from "@/lib/authentication/user";

export const { auth, signIn, signOut } = NextAuth({
   ...authConfig,
   providers: [
      Credentials({
         async authorize(credentials): Promise<any> {
            const parsedCredentials = z
               .object({ username: z.string().trim(), password: z.string() })
               .safeParse(credentials);

            if (parsedCredentials.success) {
               const { username, password } = parsedCredentials.data;
               const user = await getUser(username);

               if (!(user)) {
                  return null;
               }

               const validCredentials = await bcrypt.compare(password, user.password);

               if (validCredentials) {
                  return { id: user.id, name: user.name, email: user.email };
               }
            }

            console.error("Invalid credentials");
            return null;
         }
      })
   ]
});

