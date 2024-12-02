import Button from "@/components/global/button";
import { signOut } from "@/auth";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export default function Page() {
   return (
      <main className = "mx-auto flex min-h-screen w-full flex-col items-center justify-center text-center">
         <form
            action = {
               async() => {
                  "use server";
                  await signOut({
                     redirect: true
                  });
               }
            }
         >
            <Button
               className = "flex h-[2.4rem] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-5 text-sm font-bold text-red-600 hover:bg-sky-100 hover:text-primary md:flex-none md:justify-start"
               icon = { faRightFromBracket }
            >
               <p>Sign Out</p>
            </Button>
         </form>
      </main>
   );
}