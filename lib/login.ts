"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { SubmissionStatus, sendSuccessMessage, sendErrorMessage, } from "@/lib/form";

export type Credentials = {
   username: string;
   password: string;
}

export async function login (credentials: Credentials): Promise<SubmissionStatus> {
   try {
      const userCredentials = new FormData();
      userCredentials.append("username", credentials.username.trim());
      userCredentials.append("password", credentials.password);

      await signIn("credentials", userCredentials);
      return sendSuccessMessage("Successfully logged in");
   } catch (error) {
      if (error instanceof AuthError) {
         switch (error.type) {
         case "CredentialsSignin":
            return sendErrorMessage("Error", "Invalid credentials", { username : ["Invalid credentials"], password: ["Invalid credentials"] });
         default:
            return sendErrorMessage("Failure", error.message);
         }
      }
      throw error;
   }
}