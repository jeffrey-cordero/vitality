"use client";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/global/button";
import { usePathname } from "next/navigation";

export default function Header (): JSX.Element {
   const pathname = usePathname();

   return (
      <header>
         <nav className = "border-gray-200 px-4 lg:px-6 py-2.5">
            <div className = "flex flex-col sm:flex-row flex-wrap justify-center sm:justify-between items-center mx-auto max-w-screen-xl p-4">
               <Link href = "/" className = "flex items-center w-[9.5rem] sm:w-[7.5rem] h-[9.5rem] sm:h-[7.5rem]">
                  <Image
                     src = "/global/logo.png"
                     width = {429}
                     height = {360}
                     alt = "Logo"
                  />
               </Link>
               {
                  !(pathname.startsWith("/home")) && (
                     <div className = "flex items-center gap-4 lg:order-2">
                        <Link href = "login">
                           <Button id = "login-button" className = "text-black bg-slate-300 text-md w-[6rem] sm:w-[5.5rem] h-[3rem] sm:h-[2.8rem]">
                              Log In
                           </Button>
                        </Link>

                        <Link href = "signup">
                           <Button id = "signup-button" className = "text-white bg-primary text-md w-[5.8rem] h-[2.8rem]">
                              Sign Up
                           </Button>
                        </Link>
                     </div>
                  )
               }
            </div>
         </nav>
      </header>
   );
}