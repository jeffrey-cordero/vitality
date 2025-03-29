"use client";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

import { AuthenticationContext } from "@/app/layout";
import Loading from "@/components/global/loading";

export default function NotFound(): JSX.Element {
   const { user } = useContext(AuthenticationContext);
   const router = useRouter();

   // Re-direct to the workouts page or landing page as a placeholder until additional pages are implemented
   useEffect(() => {
      setTimeout(() => {
         router.push(user?.id !== undefined ? "/home/workouts" : "/");
      }, 1000);
   }, [
      user,
      router
   ]);

   return (
      <div className = "absolute inset-0 flex min-h-screen items-center justify-center">
         <Loading />
      </div>
   );
}