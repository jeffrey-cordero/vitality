"use client";
import SideBar from "@/components/global/sidebar";

export default function Layout ({
   children
}: {
   children: React.ReactNode;
}) {

   return (
      <>
         <div className = "flex h-screen flex-col">
            <SideBar />
            <div className = "flex-grow p-6 md:overflow-y-auto md:p-12">
               {children}
            </div>
         </div>
      </>
   );
}
