"use client";
import { useContext } from "react";
import { AuthenticationContext } from "@/app/layout";
import Loading from "@/components/global/loading";

export default function Home(): JSX.Element {
   const { user } = useContext(AuthenticationContext);

   return (
      <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-start text-center mt-6">
         {
            user !== undefined ? (
               <div>
                  <p>Welcome back {user.name}!</p>
                  <p>Username - {user.username}</p>
                  <p>Email - {user.email}</p>
               </div>
            ) : <Loading />
         }
      </main>
   );
}