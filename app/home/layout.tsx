"use client";
import { usePathname } from "next/navigation";

// URL issues due to next-auth redirect handler after signIn usage
function validateHomeURL (): void {
   const pathname = usePathname();

   if (!(pathname.startsWith("/home"))) {
      window.location.reload();
   }
}

export default function Layout ({
   children
}: {
   children: React.ReactNode;
}) {
   validateHomeURL();

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
