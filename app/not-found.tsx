"use client";
import Main from "@/components/global/main";
import Loading from "@/components/global/loading";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { AuthenticationContext } from "./layout";

export default function NotFound(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const router = useRouter();

   useEffect(() => {
      // Re-direct to workouts or landing page until further pages are implemented
      setTimeout(() => {
         router.push(user?.id !== undefined ? "/home/workouts" : "/");
      }, 1000);
   }, [router]);

   return (
      <Main className = "mx-auto flex min-h-screen w-full flex-col items-center justify-center text-center">
         <Loading />
      </Main>
   );
}