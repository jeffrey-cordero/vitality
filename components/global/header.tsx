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
            <div className = "flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
               <Link href = "/" className = "flex items-center">
                  <Image
                     src = "/global/logo.png"
                     width = {100}
                     height = {100}
                     alt = "Logo"
                  />
               </Link>
               {
                  !(pathname.startsWith("/home")) && (
                     <div className = "flex items-center gap-4 lg:order-2">
                        <Link href = "login">
                           <Button id = "login-button" className = "text-black bg-slate-300 text-md w-[5.5rem] h-[2.8rem]">
                              Log In
                           </Button>
                        </Link>

                        <Link href = "signup">
                           <Button id = "signup-button" className = "text-white bg-primary text-md w-[5.5rem] h-[2.8rem]">
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