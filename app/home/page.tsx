"use client";
import Main from "@/components/global/main";
import Loading from "@/components/global/loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home(): JSX.Element {
   const router = useRouter();

   useEffect(() => {
      // Re-direct to workouts page until further pages are integrated
      setTimeout(() => {
         router.push("/home/workouts");
      }, 500);
   }, [router]);

   return (
      <Main className = "mx-auto flex min-h-screen w-full flex-col items-center justify-center text-center">
         <Loading />
      </Main>
   );
}