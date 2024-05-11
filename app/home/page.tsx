import { signOut } from "@/auth";
import { PowerIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
   return (
      <main className="animate-slideIn flex items-center justify-center">
         <form
            action={async () => {
               'use server';
               await signOut();
            }}
         >
            <button className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-red-600 hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
               <PowerIcon className="w-6" />
               <div className="hidden md:block ">Sign Out</div>
            </button>
         </form>
      </main>
   );
}