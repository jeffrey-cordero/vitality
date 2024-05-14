import Link from "next/link";
import Button from "@/components/global/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGears } from "@fortawesome/free-solid-svg-icons";


export default function Home() {
   return (
      <main className="w-full mx-auto flex min-h-screen flex-col items-center justify-start p-4 text-center">
         <div>
            <Link href="/home/settings">
               <Button className="flex h-[48px] grow items-center justify-center gap-2 my-4 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
                  <FontAwesomeIcon icon={faGears} className="text-xl" />
                  Settings
               </Button>
            </Link>
         </div>
      </main>
   );
}