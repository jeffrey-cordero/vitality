"use client";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

import { AuthenticationContext } from "@/app/layout";
import Loading from "@/components/global/loading";
import Main from "@/components/global/main";

export default function NotFound(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const router = useRouter();

   useEffect(() => {
      setTimeout(() => {
         // Re-direct to workouts or landing page until further pages are implemented
         router.push(user?.id !== undefined ? "/home/workouts" : "/");
      }, 1000);
   }, [
      user,
      router
   ]);

   return (
      <Main className = "mx-auto flex min-h-screen w-full flex-col items-center justify-center text-center">
         <Loading />
      </Main>
   );
}