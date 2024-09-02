"use client";
import { useContext } from "react";
import { AuthenticationContext } from "@/app/layout";

export default function Home(): JSX.Element {
   const { user } = useContext(AuthenticationContext);

   return (
      <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-start text-center">
         {
            user !== undefined && (
               <div>
                  <p>Welcome back {user.name}!</p>
                  <p>Username - {user.username}</p>
                  <p>Email - {user.email}</p>
               </div>
            )
         }

      </main>
   );
}