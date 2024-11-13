"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import {
   sendErrorMessage,
   sendFailureMessage,
   VitalityResponse
} from "@/lib/global/response";
export type Credentials = {
  username: string;
  password: string;
};

export async function login(
   credentials: Credentials,
): Promise<VitalityResponse<null>> {
   try {
      const userCredentials = new FormData();
      userCredentials.append("username", credentials.username.trim());
      userCredentials.append("password", credentials.password);

      await signIn("credentials", userCredentials);
   } catch (error) {
      console.error(error);

      if (error instanceof AuthError) {
         switch (error.type) {
            case "CallbackRouteError":
            case "CredentialsSignin":
               return sendErrorMessage("Invalid credentials", {
                  username: ["Invalid credentials"],
                  password: ["Invalid credentials"]
               });
            default:
               return sendFailureMessage(error?.message);
         }
      }

      throw error;
   }
}
