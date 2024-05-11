import Button from "@/components/global/button";
import Link from "next/link";
import { signOut } from "@/auth";
import { PowerIcon } from "@heroicons/react/24/outline";


export default function Home () {
   return (
      <main className = "animate-slideIn flex items-center justify-center">
         <div>
            <Button className = "flex h-[48px] grow items-center justify-center gap-2 my-4 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
               <Link href = "/home/feedback">Feedback</Link>
            </Button>
         </div>
         <form
            action = {async () => {
               "use server";
               await signOut();
            }}
         >
            <Button className = "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-red-600 hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
               <PowerIcon className = "w-6" />
               <div className = "hidden md:block ">Sign Out</div>
            </Button>
         </form>
      </main>
   );
}