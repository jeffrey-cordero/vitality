import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { PrismaClient, Users as User } from '@prisma/client';
import { z } from 'zod';
import bcrypt from "bcryptjs";

export async function getUser(username: string): Promise<User | null> {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    const user = await prisma.users.findFirst({
      where: {
        username: username
      }
    });

    return user; 
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  } finally {
    prisma.$disconnect();
  }
}

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
            return user;
          }
        }
        
        console.error('Invalid credentials');
        return null;
      },
    }),
  ],
});

