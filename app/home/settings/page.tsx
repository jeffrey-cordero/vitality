import Link from "next/link";
import Button from "@/components/global/button";
import { signOut } from "@/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faEnvelopeOpenText } from "@fortawesome/free-solid-svg-icons";

export default function Page() {
   // const { user } = useContext(AuthenticationContext);
   // const name = user !== undefined ? user.name : "";

   return (
      <main className = "w-full mx-auto flex min-h-screen flex-col items-center justify-start text-center">

         <Link href = "/home/feedback">
            <Button className = "flex h-[48px] grow items-center justify-center gap-2 my-4 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
               <FontAwesomeIcon icon = {faEnvelopeOpenText} className = "text-xl" />
               Feedback
            </Button>
         </Link>
         <form
            action = {async() => {
               "use server";
               await signOut();
            }}
         >
            <Button className = "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-red-600 hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
               <FontAwesomeIcon icon = {faRightFromBracket} className = "text-xl" />
               <p>Sign Out</p>
            </Button>
         </form>
      </main >
   );
}