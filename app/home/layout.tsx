"use client";
import { usePathname } from "next/navigation";
import { useContext, useEffect } from "react";
import { AuthenticationContext } from "../layout";

function useValidateHomeURL(): void {
   const pathname = usePathname();

   if (!(pathname.startsWith("/home"))) {
      window.location.reload();
   }
}

export default function Layout({
   children
}: {
   children: React.ReactNode;
}) {
   const { user } = useContext(AuthenticationContext);

   useValidateHomeURL();

   useEffect(() => {
      // TODO - Fix undefined user on server start
      const timeout = setTimeout(() => {
         if (user === undefined) {
            window.location.reload();
         }
      }, 5000);

      // Clear timeout
      return () => clearTimeout(timeout);
   }, [user]);
   
   return (
      <>
         <div className = "flex flex-col">
            <div className = "flex-grow p-2">
               {children}
            </div>
         </div>
      </>
   );
}
