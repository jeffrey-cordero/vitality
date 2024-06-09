"use client";

import { usePathname } from "next/navigation";

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
   useValidateHomeURL();

   return (
      <>
         <div className = "flex flex-col mt-6">
            <div className = "flex-grow p-6 md:overflow-y-auto md:p-12">
               {children}
            </div>
         </div>
      </>
   );
}
