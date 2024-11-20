"use client";
import Loading from "@/components/global/loading";
import { useContext } from "react";
import { AuthenticationContext } from "@/app/layout";

export default function Home(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   window.location.replace("/home/workouts");

   return (
      <main className="w-full mx-auto flex min-h-screen flex-col items-center justify-center text-center">
         <Loading />
      </main>
   );
}
