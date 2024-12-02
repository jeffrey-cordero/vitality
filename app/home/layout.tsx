"use client";
import { usePathname } from "next/navigation";
import { useContext, useEffect } from "react";
import { AuthenticationContext } from "@/app/layout";

function useValidateAuthenticatedURL() {
   // Ensure logged in user URL's start are in form "/home/..."
   const pathname = usePathname();

   useEffect(() => {
      if (!pathname?.startsWith("/home")) {
         window.location.reload();
      }
   });
}

export default function Layout({ children }: { children: React.ReactNode }) {
   useValidateAuthenticatedURL();

   const { user } = useContext(AuthenticationContext);

   return <div className = "m-auto min-h-screen w-full">
      { user && children }
   </div>;
}