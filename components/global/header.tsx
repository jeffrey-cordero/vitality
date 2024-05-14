"use client";
import Link from "next/link";
import Button from "@/components/global/button";
import { usePathname } from "next/navigation";

export default function Header (): JSX.Element {
   const pathname = usePathname();

   return (
      <header>
         <nav className = "border-gray-200 px-4 lg:px-6 py-2.5">
            <div className = "flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
               <a href = "/" className = "flex items-center">
                  <span className = "self-center whitespace-nowrap animate-fade-up text-primary text-center font-display text-5xl font-bold tracking-[-0.02em] opacity-1 drop-shadow-sm [text-wrap:balance] md:text-6xl md:leading-[5rem]">Vitality</span>
               </a>
               {
                  !(pathname.startsWith("/home")) && (
                     <div className = "flex items-center gap-4 lg:order-2">
                        <Link href = "login">
                           <Button id = "login-button" className = "text-black bg-slate-300 text-lg w-[7rem] h-[3rem]">
                              Log In
                           </Button>
                        </Link>

                        <Link href = "signup">
                           <Button id = "signup-button" className = "text-white bg-primary text-lg w-[7rem] h-[3rem]">
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