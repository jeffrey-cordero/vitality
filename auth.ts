import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { PrismaClient, Users as User } from '@prisma/client';
import { z } from 'zod';
import { bcrypt } from "bcryptjs";

async function getUser(email: string): Promise<User | null> {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    const user = prisma.users.findFirst({
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

        // TODO --> Use shared return messages
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!(user)) {
            return null;
          }
          
          const hashedPassword =  await bcrypt.hash(user.password, (await bcrypt.genSalt(10)));

          if (hashedPassword === null) {
            return null;
          }
 
          if (password === hashedPassword) {
            return user;
          }
        }
        
        console.error('Invalid credentials');
        return null;
      },
    }),
  ],
});

