"use client";
import Loading from "@/components/global/loading";
import { useContext } from "react";
import { AuthenticationContext } from "@/app/layout";
import Heading from "@/components/global/heading";

export default function Home(): JSX.Element {
   const { user } = useContext(AuthenticationContext);

   return (
      <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-start text-center mt-6">
         {
            user !== undefined ? (
               <Heading 
                  title = {`Welcome back!`}
                  description="Explore the Workouts page"
               />
            ) : <Loading />
         }
      </main>
   );

}