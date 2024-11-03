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

   const modals: HTMLCollection = document.getElementsByClassName("modal");

   console.log(modals);
  
   if (modals.length > 0) {
     document.body.classList.add("overflow-y-hidden");
     document.body.parentElement.classList.add("overflow-y-hidden");
   } else {
     document.body.classList.remove("overflow-y-hidden");
     document.body.parentElement.classList.remove("overflow-y-hidden");
   }

   return (
      <div>
         <div className = "flex flex-col">
            <div className = "flex-grow">
               {children}
            </div>
         </div>
      </div>
   );
}
