"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { FormResponse, sendSuccessMessage, sendErrorMessage } from "@/lib/global/form";

export type Credentials = {
   username: string;
   password: string;
}

export async function login(credentials: Credentials): Promise<FormResponse> {
   try {
      const userCredentials = new FormData();
      userCredentials.append("username", credentials.username.trim());
      userCredentials.append("password", credentials.password);

      await signIn("credentials", userCredentials);
   } catch (error) {
      if (error instanceof AuthError) {
         switch (error.type) {
         case "CallbackRouteError":
         case "CredentialsSignin":
            return sendErrorMessage("Error", "Invalid credentials", { username : ["Invalid credentials"], password: ["Invalid credentials"] });
         default:
            return sendErrorMessage("Failure", "Internal Server Authentication Error. Please try again later.", {});
         }
      }

      throw error;
   }

   return sendSuccessMessage("Successfully logged in");
}