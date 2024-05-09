import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { PrismaClient, User } from '@prisma/client';
import { z } from 'zod';
import { bcrypt } from "bcryptjs";

async function getUser(email: string): Promise<User | null> {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    const user = prisma.user.findFirst({
      where: {
        email: email
      }
    });

    return user; 
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials): Promise<any> {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!(user)) {
            return null;
          }
          
          let hashedPassword : string | null = null;

          bcrypt.hash(user.password, 10, function(error : Error, password : string) {
            if (!(error)) {
               hashedPassword = password;
            }
         });

          if (hashedPassword === null) {
            return null;
          }

          let matched : boolean = false

          bcrypt.compare(password, hashedPassword, function(error: Error, match: boolean) {
            if (!(error)) {
              matched = match;
            }
          });
 
          if (matched) {
            return user;
          }
        }
        
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});

