"use client";
import Loading from "@/components/global/loading";

export default function Home(): JSX.Element {
   window.location.replace("/home/workouts");

   return (
      <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-center text-center">
         <Loading />
      </main>
   );
}