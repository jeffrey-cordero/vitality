"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function useValidateAuthenticatedURL() {
   // Ensure logged in user URL's start are in form "/home/..."
   const pathname = usePathname();

   useEffect(() => {
      if (!(pathname.startsWith("/home"))) {
         window.location.reload();
      }
   });
}

export default function Layout({
   children
}: {
   children: React.ReactNode;
}) {
   useValidateAuthenticatedURL();

   return (
      <div>
         <div className = "flex flex-col">
            <div className = "flex-grow p-2">
               {children}
            </div>
         </div>
      </div>
   );
}
